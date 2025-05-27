const { globalObj } = require('./sharedObjects');
const { authenticate } = require('../middleware/auth');
const { validateFriendship } = require('../middleware/friendValidation');
const socketManager = require('../utils/socketManager');

// Adding ELO ranking calculator to backend

class RankingHandler {
    static K = 50;

    // Calculate expected score (probability of winning)
    static expectedScore(playerRating, opponentRating) {
        return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    }

    // Returns the new ranking points if player1 wins or loses
    static getPlayerRankEffects(player1, player2) {
        const playerExpected = this.expectedScore(player1.ranking_points, player2.ranking_points);

        const winEffect = player1.ranking_points + this.K * (1 - playerExpected);
        const loseEffect = player1.ranking_points + this.K * (0 - playerExpected);

        return [winEffect, loseEffect];
    }

    // Updates both players' ranking points based on result
    static updateRanking(winner, loser) {
        const winnerExpected = this.expectedScore(winner.ranking_points, loser.ranking_points);
        const loserExpected = 1 - winnerExpected;

        winner.ranking_points = winner.ranking_points + this.K * (1 - winnerExpected);
        loser.ranking_points = loser.ranking_points + this.K * (0 - loserExpected);
    }
}

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
      ORDER BY m.date ASC
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

  /*
  	interface bbMatchData {
	date: Date;
	game_type: string;
	startTime: number;
	player1_id: number;
	player1_rank: number;
	player2_id: number;
	player2_rank: number;
	game_duration: number; // in seconds
	winner_id: number;
	win_method: string; // KO or Coins
	player1_weapon1: string;
	player1_weapon2: string;
	player1_damage_taken: number;
	player1_damage_done: number;
	player1_coins_collected: number;
	player1_shots_fired: number;
	player2_weapon1: string;
	player2_weapon2: string;
	player2_damage_taken: number;
	player2_damage_done: number;
	player2_coins_collected: number;
	player2_shots_fired: number;	
}
  */

  	// Helper function for /record-match
	function validateMatchData(matchData)
	{
		if (matchData.game_type !== 'pong' && matchData.game_type !== 'blockbattle')
			return false;

		// Date and start time can be also checked here... but are they really that important?

		if (matchData.game_type === 'pong')
		{
			if (matchData.game_duration < 0 || matchData.game_duration > 1200) // game lasted over 20 minutes
				return false;
			if (matchData.longest_rally < 0 || matchData.longest_rally > 100)
				return false;
			if (matchData.avg_rally < 0 || matchData.avg_rally > 100)
				return false;
			if (matchData.player1_points < 0 || matchData.player1_points > 5)
				return false;
			if (matchData.player2_points < 0 || matchData.player2_points > 5)
				return false;
		}
		else
		{
			const weaponOptions = ['Pistol', 'Bazooka', 'Land Mine'];

			if (matchData.game_duration < 0 || matchData.game_duration > 1200) // game lasted over 20 minutes
				return false;
			if (matchData.win_method !== 'KO' && matchData.win_method !== 'Coins')
				return false;
			if (!weaponOptions.includes(matchData.player1_weapon1) || !weaponOptions.includes(matchData.player1_weapon2)
			|| !weaponOptions.includes(matchData.player2_weapon1) || !weaponOptions.includes(matchData.player2_weapon2))
				return false;
			if (matchData.player1_damage_taken < 0 || matchData.player1_damage_taken > 100
				|| matchData.player1_damage_done < 0 || matchData.player1_damage_done > 100
				|| matchData.player2_damage_taken < 0 || matchData.player2_damage_taken > 100
				|| matchData.player2_damage_done < 0 || matchData.player2_damage_done > 100
			)
				return false;
			if (matchData.player1_coins_collected < 0 || matchData.player1_coins_collected > 5
				|| matchData.player2_coins_collected < 0 || matchData.player1_coins_collected > 5
			)
				return false;
			if (matchData.player1_shots_fired < 0 || matchData.player1_shots_fired > 500
				|| matchData.player2_shots_fired < 0 || matchData.player2_shots_fired > 500
			)
				return false;
		}

		return true;
	}

  // Record a new match result
  fastify.post('/record-match', { preHandler: authenticate }, async (request, reply) => {
    const { 
      player1,
	  player2,
	  matchData
    } = request.body;

    // Validate users
    if ((player1.id !== request.user.id && player2.id !== request.user.id)
	|| (player1.id !== globalObj.opponentData.id && player2.id !== globalObj.opponentData.id)
	|| player1.id === player2.id
	|| (matchData.winner_id !== player1.id && matchData.winner_id !== player2.id)) {
      reply.code(400);
      return { error: 'Bad user data; are you cheating...?' };
    }

	// Validate match data
	if (!validateMatchData(matchData)) {
      reply.code(400);
      return { error: 'Bad match data; are you cheating...?' };
    }

	globalObj.opponentData = null; // Reset opponent from backend


    try {
      // Start a transaction
      const transaction = fastify.db.transaction(() => {

    	// Get player ranking points before update
        const p1StartRankRow = fastify.db.prepare(`
          SELECT ranking_points FROM users WHERE id = ?
        `).get(player1.id);
        
        const p2StartRankRow = fastify.db.prepare(`
          SELECT ranking_points FROM users WHERE id = ?
        `).get(player2.id);
        
        if (!p1StartRankRow || !p2StartRankRow) {
          throw new Error('One or both players not found');
        }

		const p1StartRank = p1StartRankRow.ranking_points;
		const p2StartRank = p2StartRankRow.ranking_points;


		if (matchData.winner_id === player1.id)
			RankingHandler.updateRanking(player1, player2);
		else
			RankingHandler.updateRanking(player2, player1);

        // Insert match record
        const matchResult = fastify.db.prepare(`
          INSERT INTO matches (
            player1_id, player2_id, 
            p1_ranking_points, p2_ranking_points,
            p1_new_ranking_points, p2_new_ranking_points,
            winner_id, game_duration, game_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          player1.id, 
          player2.id, 
          p1StartRank,
          p2StartRank,
          player1.ranking_points,
          player2.ranking_points,
          matchData.winner_id,
          matchData.game_duration,
          matchData.game_type
        );

        const matchId = matchResult.lastInsertRowid;

        // Update player statistics
        if (player1 && player2 && matchData) {
          // Determine winner and loser IDs
          const winnerId = matchData.winner_id;
          const loserId = winnerId === player1.id ? player2.id : player1.id;

          // Update winner stats
          if (matchData.game_type === 'pong') {
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_pong = games_played_pong + 1,
                  wins_pong = wins_pong + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              winnerId === player1.id ? player1.ranking_points : player2.ranking_points,
              winnerId
            );
          } else if (matchData.game_type === 'blockbattle') {
            // Similar update for blockbattle
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_blockbattle = games_played_blockbattle + 1,
                  wins_blockbattle = wins_blockbattle + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              winnerId === player1.id ? player1.ranking_points : player2.ranking_points,
              winnerId
            );
          }

          // Update loser stats
          if (matchData.game_type === 'pong') {
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_pong = games_played_pong + 1,
                  losses_pong = losses_pong + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              loserId === player1.id ? player1.ranking_points : player2.ranking_points,
              loserId
            );
          } else if (matchData.game_type === 'blockbattle') {
            fastify.db.prepare(`
              UPDATE users 
              SET games_played_blockbattle = games_played_blockbattle + 1,
                  losses_blockbattle = losses_blockbattle + 1,
                  ranking_points = ?,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(
              loserId === player1.id ? player1.ranking_points : player2.ranking_points,
              loserId
            );
          }
        }

        // Insert game-specific stats
        if (matchData.game_type === 'pong') {
          fastify.db.prepare(`
            INSERT INTO pong_match_stats (
              match_id, longest_rally, avg_rally, player1_points, player2_points
            ) VALUES (?, ?, ?, ?, ?)
          `).run(
            matchId,
            matchData.longest_rally || 0, // CHECK THESE!
            matchData.avg_rally || 0,  // CHECK THESE!
            matchData.player1_points || 0,  // CHECK THESE!
            matchData.player2_points || 0  // CHECK THESE!
          );
        } else if (matchData.game_type === 'blockbattle') {
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
            matchData.win_method || null,
            matchData.player1_weapon1 || null,
            matchData.player1_weapon2 || null,
            matchData.player1_damage_taken || 0,
            matchData.player1_damage_done || 0,
            matchData.player1_coins_collected || 0,
            matchData.player1_shots_fired || 0,
            matchData.player2_weapon1 || null,
            matchData.player2_weapon2 || null,
            matchData.player2_damage_taken || 0,
            matchData.player2_damage_done || 0,
            matchData.player2_coins_collected || 0,
            matchData.player2_shots_fired || 0
          );
        }

 		return matchId;
      });

      // Execute transaction
      const matchId = transaction();
      
      return { 
        success: true, 
        message: 'Match recorded successfully', 
		player1: player1,
		player2: player2,
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