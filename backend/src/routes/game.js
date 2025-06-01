const { globalObj, globalTournamentObj } = require('./sharedObjects');
const { authenticate } = require('../middleware/auth');
const { validateFriendship } = require('../middleware/friendValidation');
const { sanitizeInput, isDecimalString, isIntegerString } = require('../utils/inputSanitizer');
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
  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Authentication required' });
    }
  };

  // Get all matches
  fastify.get('/matches', { preHandler: authenticate }, async (request, reply) => {
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
  fastify.get('/match/:id', { preHandler: authenticate }, async (request, reply) => {
    
	const sanitizeResult = sanitizeInput(request.params.id, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.id)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

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

  // Get matches based on plaayer ID
  fastify.get('/matches/player/:playerId', { preHandler: authenticate }, async (request, reply) => {

	const sanitizeResult = sanitizeInput(request.params.playerId, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.playerId)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

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

  // Get logged in user matches
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


  	// Helper functions for /record-match
	function validateMatchData(matchData)
	{
		let sanitizeResult = sanitizeInput(matchData.game_type, true);
		if (!sanitizeResult.isValid) 
			return false;
		sanitizeResult = sanitizeInput(matchData.game_duration, false);
		if (!sanitizeResult.isValid) 
			return false;
		sanitizeResult = sanitizeInput(matchData.winner_id, false);
		if (!sanitizeResult.isValid) 
			return false;

		if (matchData.game_type !== 'pong' && matchData.game_type !== 'blockbattle')
			return false;


		if (matchData.game_type === 'pong')
		{
			sanitizeResult = sanitizeInput(matchData.longest_rally, false);
			if (!sanitizeResult.isValid || !isDecimalString(matchData.longest_rally)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.avg_rally, false);
			if (!sanitizeResult.isValid || !isDecimalString(matchData.avg_rally)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player1_points, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player1_points)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player2_points, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player2_points)) 
				return false;

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

			sanitizeResult = sanitizeInput(matchData.win_method, true);
			if (!sanitizeResult.isValid) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player1_weapon1, true);
			if (!sanitizeResult.isValid) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player1_weapon2, true);
			if (!sanitizeResult.isValid) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player1_damage_taken, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player1_damage_taken)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player1_damage_done, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player1_damage_done)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player1_coins_collected, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player1_coins_collected)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player1_shots_fired, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player1_shots_fired)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player2_weapon1, true);
			if (!sanitizeResult.isValid) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player2_weapon2, true);
			if (!sanitizeResult.isValid) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player2_damage_taken, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player2_damage_taken)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player2_damage_done, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player2_damage_done)) 
				return false;
			sanitizeResult = sanitizeInput(matchData.player2_coins_collected, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player2_coins_collected))
				return false;
			sanitizeResult = sanitizeInput(matchData.player2_shots_fired, false);
			if (!sanitizeResult.isValid || !isIntegerString(matchData.player2_shots_fired)) 
				return false;

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

	function sanitizeTournamentUserData(userData)
	{


		// Validate user data (related to Tournamen player)
		sanitizeResult = sanitizeInput(userData.id, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.id)) 
			return false;
		sanitizeResult = sanitizeInput(userData.username, true);
		if (!sanitizeResult.isValid) 
			return false;
		sanitizeResult = sanitizeInput(userData.ranking_points, false);
		if (!sanitizeResult.isValid || !isDecimalString(userData.ranking_points)) 
			return false;
		sanitizeResult = sanitizeInput(userData.avatar_url, true);
		if (!sanitizeResult.isValid) 
			return false;
		sanitizeResult = sanitizeInput(userData.games_played_pong, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.games_played_pong)) 
			return false;
		sanitizeResult = sanitizeInput(userData.wins_pong, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.wins_pong)) 
			return false;
		sanitizeResult = sanitizeInput(userData.losses_pong, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.losses_pong)) 
			return false;
		sanitizeResult = sanitizeInput(userData.games_played_blockbattle, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.games_played_blockbattle)) 
			return false;
		sanitizeResult = sanitizeInput(userData.wins_blockbattle, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.wins_blockbattle)) 
			return false;
		sanitizeResult = sanitizeInput(userData.losses_blockbattle, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.losses_blockbattle)) 
			return false;
		sanitizeResult = sanitizeInput(userData.tournaments_played, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.tournaments_played)) 
			return false;
		sanitizeResult = sanitizeInput(userData.tournaments_won, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.tournaments_won)) 
			return false;
		sanitizeResult = sanitizeInput(userData.tournament_points, false);
		if (!sanitizeResult.isValid || !isIntegerString(userData.tournament_points)) 
			return false;

		if (userData.created_at)
		{
			sanitizeResult = sanitizeInput(userData.created_at, true);
			if (!sanitizeResult.isValid) 
				return false;
		}

		if (userData.updated_at)
		{
			sanitizeResult = sanitizeInput(userData.updated_at, true);
			if (!sanitizeResult.isValid) 
				return false;
		}

		if (userData.deleted_at)
		{
			sanitizeResult = sanitizeInput(userData.deleted_at, true);
			if (!sanitizeResult.isValid) 
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


	// Sanitize user data
	if (!sanitizeTournamentUserData(player1) || !sanitizeTournamentUserData(player2)) {
		reply.code(400);
		return { error: 'Request body contains invalid characters or bad data' };
	}



    // Validate users data
    if ((player1.id !== request.user.id && player2.id !== request.user.id)
	|| (player1.id !== globalObj.opponentData.id && player2.id !== globalObj.opponentData.id)
	|| player1.id === player2.id
	|| (matchData.winner_id !== player1.id && matchData.winner_id !== player2.id)) {

		globalObj.opponentData = null; // Reset opponent from backend
		reply.code(400);
		return { error: 'Bad user data; are you cheating...?' };
    }


	globalObj.opponentData = null; // Reset opponent from backend

	// Validate match data
	if (!validateMatchData(matchData)) {
		reply.code(400);
		return { error: 'Bad match data; are you cheating...?' };
    }


    try {
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
		player1.ranking_points = p1StartRank; // making sure user ranking matches the databae data
		player2.ranking_points = p2StartRank;


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

  // Record a new match result
  fastify.post('/record-tournament-match', { preHandler: authenticate }, async (request, reply) => {
    const { 
      player1,
	  player2,
	  matchData
    } = request.body;

	let sanitizeResult = sanitizeInput(player1.id, false);
	if (!sanitizeResult.isValid || !isIntegerString(player1.id)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}
	sanitizeResult = sanitizeInput(player2.id, false);
	if (!sanitizeResult.isValid || !isIntegerString(player2.id)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

	const player1TournamentObj = globalTournamentObj.tournamentArr.find(p => p.user.id === player1.id);
	const player2TournamentObj = globalTournamentObj.tournamentArr.find(p => p.user.id === player2.id);

    // Validate users
    if (!player1TournamentObj || !player2TournamentObj || player1.id === player2.id
	|| (matchData.winner_id !== player1.id && matchData.winner_id !== player2.id)) {

		globalTournamentObj.tournamentArr.length = 0; // Reset tournament arr from backend
		globalTournamentObj.matchCounter = 0;
		globalTournamentObj.gameType = '';
		reply.code(400);
		return { error: 'Bad user data; are you cheating...?' };
    }

	// Validate match data
	if (!validateMatchData(matchData)) {
		globalTournamentObj.tournamentArr.length = 0; // Reset tournament arr from backend
		globalTournamentObj.matchCounter = 0;
		globalTournamentObj.gameType = '';
		reply.code(400);
		return { error: 'Bad match data; are you cheating...?' };
    }

	if (matchData.game_type === 'blockbattle')
	{
		globalTournamentObj.gameType = 'blockbattle';
		if (matchData.winner_id === player2.id)
		{
			player2TournamentObj.tournamentPoints++;
			player2TournamentObj.coinsCollected += matchData.player2_coins_collected;
			player1TournamentObj.coinsCollected += matchData.player1_coins_collected;
			player2TournamentObj.isWinner = true;
		}
		else
		{
			player1TournamentObj.tournamentPoints++;
			player2TournamentObj.coinsCollected += matchData.player2_coins_collected;
			player1TournamentObj.coinsCollected += matchData.player1_coins_collected;
			player1TournamentObj.isWinner = true;
		}

	}
	else if (matchData.game_type === 'pong')
	{
		globalTournamentObj.gameType = 'pong';
		if (matchData.winner_id === player2.id)
		{
			player2TournamentObj.tournamentPoints++;
			player2TournamentObj.pongPointsScored += matchData.player2_points;
			player1TournamentObj.pongPointsScored += matchData.player1_points;
			player2TournamentObj.isWinner = true;
		}
		else
		{
			player1TournamentObj.tournamentPoints++;
			player2TournamentObj.pongPointsScored += matchData.player2_points;
			player1TournamentObj.pongPointsScored += matchData.player1_points;
			player1TournamentObj.isWinner = true;
		}

	}
      
    return {status: 'OK'};
  });


  // Get tournament end screen data
fastify.get('/get-tournament-end-screen-data', { preHandler: authenticate }, async (request, reply) => {

	const player1Idx = globalTournamentObj.gameOrder[globalTournamentObj.matchCounter][0];
	const player2Idx = globalTournamentObj.gameOrder[globalTournamentObj.matchCounter][1];

	const player1Obj = globalTournamentObj.tournamentArr[player1Idx];
	const player2Obj = globalTournamentObj.tournamentArr[player2Idx];

	if (!player1Obj.isWinner && !player2Obj.isWinner) {
		globalTournamentObj.tournamentArr.length = 0; // Reset tournament arr from backend
		globalTournamentObj.matchCounter = 0;
		globalTournamentObj.gameType = '';
		reply.code(400);
		return { error: 'Tournament data error; no winner found!' };
    }

	const winner = player1Obj.isWinner ? player1Obj : player2Obj;
	const loser = player1Obj.isWinner ? player2Obj : player1Obj;

	player1Obj.isWinner = false;
	player2Obj.isWinner = false;
	player1Obj.bbWeapons.length = 0;
	player2Obj.bbWeapons.length = 0;
	globalTournamentObj.matchCounter++;

	return ({winner: winner, loser: loser, playerArr: globalTournamentObj.tournamentArr, matchCount: globalTournamentObj.matchCounter});

})

  // Game invitation endpoint
  fastify.post('/invite/:friendId', { preHandler: [authenticate, validateFriendship] }, async (request, reply) => {
    const userId = request.user.id;

	sanitizeResult = sanitizeInput(request.params.friendId, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.friendId)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

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