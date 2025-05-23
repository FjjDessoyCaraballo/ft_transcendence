const { authenticate } = require('../middleware/auth');
const { validateFriendship } = require('../middleware/friendValidation');
const socketManager = require('../utils/socketManager');

async function gameRoutes(fastify, options) {
  // Middleware to check authentication
  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Authentication required' });
    }
  };

  // Get all matches
  fastify.get('/matches', async (request, reply) => {
    const matches = fastify.db.prepare(`
      SELECT m.*, 
             u1.username as player1_name, 
             u2.username as player2_name,
             u3.username as winner_name
      FROM matches m
      JOIN users u1 ON m.player1_id = u1.id
      JOIN users u2 ON m.player2_id = u2.id
      LEFT JOIN users u3 ON m.winner_id = u3.id
      ORDER BY m.date DESC
      LIMIT 100
    `).all();
    
    return { matches };
  });

  // Get match by ID
  fastify.get('/match/:id', async (request, reply) => {
    const matchId = request.params.id;

    // Get basic match data
    const match = fastify.db.prepare(`
      SELECT m.*, 
             u1.username as player1_name, 
             u2.username as player2_name,
             u3.username as winner_name
      FROM matches m
      JOIN users u1 ON m.player1_id = u1.id
      JOIN users u2 ON m.player2_id = u2.id
      LEFT JOIN users u3 ON m.winner_id = u3.id
      WHERE m.id = ?
    `).get(matchId);

    if (!match) {
      reply.code(404);
      return { error: 'Match not found' };
    }

    // Get game-specific stats based on game type
    let gameStats = null;
    if (match.game_type === 'pong') {
      gameStats = fastify.db.prepare(`
        SELECT * FROM pong_match_stats WHERE match_id = ?
      `).get(matchId);
    } else if (match.game_type === 'blockbattle') {
      gameStats = fastify.db.prepare(`
        SELECT * FROM blockbattle_match_stats WHERE match_id = ?
      `).get(matchId);
    }

    return { match, gameStats };
  });

  // Get matches by player ID
  fastify.get('/matches/player/:playerId', async (request, reply) => {
    const playerId = request.params.playerId;

    const matches = fastify.db.prepare(`
      SELECT m.*, 
             u1.username as player1_name, 
             u2.username as player2_name,
             u3.username as winner_name
      FROM matches m
      JOIN users u1 ON m.player1_id = u1.id
      JOIN users u2 ON m.player2_id = u2.id
      LEFT JOIN users u3 ON m.winner_id = u3.id
      WHERE m.player1_id = ? OR m.player2_id = ?
      ORDER BY m.date DESC
      LIMIT 50
    `).all(playerId, playerId);

    return { matches };
  });

  // Get matches for current user
  fastify.get('/my-matches', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;

    const matches = fastify.db.prepare(`
      SELECT m.*, 
             u1.username as player1_name, 
             u2.username as player2_name,
             u3.username as winner_name,
             CASE 
               WHEN m.player1_id = ? THEN 1
               ELSE 2
             END as player_perspective
      FROM matches m
      JOIN users u1 ON m.player1_id = u1.id
      JOIN users u2 ON m.player2_id = u2.id
      LEFT JOIN users u3 ON m.winner_id = u3.id
      WHERE m.player1_id = ? OR m.player2_id = ?
      ORDER BY m.date DESC
      LIMIT 50
    `).all(userId, userId, userId);

    return { matches };
  });

  // Record a new match result
  fastify.post('/record-match', { preHandler: authenticate }, async (request, reply) => {
    const { 
      player1_id, 
      player2_id, 
      winner_id, 
      game_duration, 
      game_type,
      game_stats,
      p1_new_ranking_points,
      p2_new_ranking_points
    } = request.body;

    // Validate input
    if (!player1_id || !player2_id || !game_type) {
      reply.code(400);
      return { error: 'Required match data missing' };
    }

    try {
      // Start a transaction
      const transaction = fastify.db.transaction(() => {
        // Get player ranking points before update
        const player1 = fastify.db.prepare(`
          SELECT ranking_points FROM users WHERE id = ?
        `).get(player1_id);
        
        const player2 = fastify.db.prepare(`
          SELECT ranking_points FROM users WHERE id = ?
        `).get(player2_id);
        
        if (!player1 || !player2) {
          throw new Error('One or both players not found');
        }

        // Insert match record
        const matchResult = fastify.db.prepare(`
          INSERT INTO matches (
            player1_id, player2_id, 
            p1_ranking_points, p2_ranking_points,
            p1_new_ranking_points, p2_new_ranking_points,
            winner_id, game_duration, game_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          player1_id, 
          player2_id, 
          player1.ranking_points,
          player2.ranking_points,
          p1_new_ranking_points || player1.ranking_points,
          p2_new_ranking_points || player2.ranking_points,
          winner_id || null,
          game_duration || null,
          game_type
        );

        const matchId = matchResult.lastInsertRowid;

        // Update player statistics
        if (winner_id) {
          // Determine winner and loser IDs
          const winnerId = winner_id;
          const loserId = winner_id === player1_id ? player2_id : player1_id;

          // Update winner stats
          if (game_type === 'pong') {
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_pong = games_played_pong + 1,
                  wins_pong = wins_pong + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              winnerId === player1_id ? p1_new_ranking_points : p2_new_ranking_points,
              winnerId
            );
          } else if (game_type === 'blockbattle') {
            // Similar update for blockbattle
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_blockbattle = games_played_blockbattle + 1,
                  wins_blockbattle = wins_blockbattle + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              winnerId === player1_id ? p1_new_ranking_points : p2_new_ranking_points,
              winnerId
            );
          }

          // Update loser stats
          if (game_type === 'pong') {
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_pong = games_played_pong + 1,
                  losses_pong = losses_pong + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              loserId === player1_id ? p1_new_ranking_points : p2_new_ranking_points,
              loserId
            );
          } else if (game_type === 'blockbattle') {
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_blockbattle = games_played_blockbattle + 1,
                  losses_blockbattle = losses_blockbattle + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              loserId === player1_id ? p1_new_ranking_points : p2_new_ranking_points,
              loserId
            );
          }
        }

        // Insert game-specific stats
        if (game_type === 'pong' && game_stats) {
          fastify.db.prepare(`
            INSERT INTO pong_match_stats (
              match_id, longest_rally, avg_rally, player1_points, player2_points
            ) VALUES (?, ?, ?, ?, ?)
          `).run(
            matchId,
            game_stats.longest_rally || 0,
            game_stats.avg_rally || 0,
            game_stats.player1_points || 0,
            game_stats.player2_points || 0
          );
        } else if (game_type === 'blockbattle' && game_stats) {
          fastify.db.prepare(`
            INSERT INTO blockbattle_match_stats (
              match_id, win_method,
              player1_weapon1, player1_weapon2, player1_damage_taken, player1_damage_done,
              player1_coins_collected, player1_shots_fired,
              player2_weapon1, player2_weapon2, player2_damage_taken, player2_damage_done,
              player2_coins_collected, player2_shots_fired
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            matchId,
            game_stats.win_method || null,
            game_stats.player1_weapon1 || null,
            game_stats.player1_weapon2 || null,
            game_stats.player1_damage_taken || 0,
            game_stats.player1_damage_done || 0,
            game_stats.player1_coins_collected || 0,
            game_stats.player1_shots_fired || 0,
            game_stats.player2_weapon1 || null,
            game_stats.player2_weapon2 || null,
            game_stats.player2_damage_taken || 0,
            game_stats.player2_damage_done || 0,
            game_stats.player2_coins_collected || 0,
            game_stats.player2_shots_fired || 0
          );
        }

        return matchId;
      });

      // Execute transaction
      const matchId = transaction();
      
      return { 
        success: true, 
        message: 'Match recorded successfully', 
        matchId: matchId 
      };
    } catch (err) {
      fastify.log.error(err);
      reply.code(500);
      return { error: 'Failed to record match', message: err.message };
    }
  });

  // Game invitation endpoint
  fastify.post('/invite/:friendId', { preHandler: [authenticate, validateFriendship] }, async (request, reply) => {
    const userId = request.user.id;
    const friendId = parseInt(request.params.friendId);

    // Emit game invitation
    const friendSocket = socketManager.getSocket(friendId);
    if (friendSocket) {
      friendSocket.emit('game_invitation', {
        from: userId,
        username: request.user.username,
      });
      return { success: true, message: 'Game invitation sent' };
    }

    reply.code(404);
    return { error: 'User is not online' };
  });
}

module.exports = gameRoutes;