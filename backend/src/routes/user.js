const { hashPassword, comparePassword } = require('../utils/passwords');
const { sanitizeInput, isIntegerString, validateUsername } = require('../utils/inputSanitizer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const { globalObj, globalTournamentObj } = require('./sharedObjects');


const uploadTracker = new Map();

async function userRoutes(fastify, options) {
  
    // Valid language options
  const validWeapons = ['Pistol', 'Bazooka', 'Land Mine'];
  const validLanguages = ['en', 'fi', 'pt'];
  
  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Authentication required' });
    }
  };

  // Ensure avatar directory exists
  const avatarDir = path.join(__dirname, '..', 'public', 'avatars');
  try {
    await mkdir(avatarDir, { recursive: true });
  } catch (err) {
    fastify.log.error(`Error creating avatar directory: ${err.message}`);
  }


  // CHECK if we have logged in user (based on JWT token)
  fastify.get('/is-logged-in', { preHandler: authenticate }, async (request, reply) => {
    return {status: 'OK'};
  });


  // GET all users with statistics
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const users = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             pref_lang
      FROM users
      WHERE deleted_at IS NULL
    `).all();
    return users;
  });


// GET logged in user info
fastify.get('/logged-in-user-data', { preHandler: authenticate }, async (request, reply) => {

	const user = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             pref_lang, created_at, updated_at
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(request.user.id);
    
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    return user;
});

// GET user's preferred language
fastify.get('/language', { preHandler: authenticate }, async (request, reply) => {
  const userId = request.user.id;
  
  const user = fastify.db.prepare(`
    SELECT pref_lang
    FROM users 
    WHERE id = ? AND deleted_at IS NULL
  `).get(userId);
  
  if (!user) {
    reply.code(404);
    return { error: 'User not found' };
  }
  
  return { language: user.pref_lang };
});

// Update user's preferred language
fastify.put('/language', { preHandler: authenticate }, async (request, reply) => {
  const userId = request.user.id;
  const { language } = request.body;
  
  try {
    if (!language) {
      reply.code(400);
      return { error: 'Language is required' };
    }
    
	let sanitizeResult = sanitizeInput(language, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    if (!validLanguages.includes(language)) {
      reply.code(400);
      return { error: `Language must be one of: ${validLanguages.join(', ')}` };
    }
    
    const result = fastify.db.prepare(`
      UPDATE users 
      SET pref_lang = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND deleted_at IS NULL
    `).run(language, userId);
    
    if (result.changes === 0) {
      reply.code(404);
      return { error: 'User not found or no changes made' };
    }
    
    return { success: true, language };
  } catch (err) {
    fastify.log.error(err);
    reply.code(500);
    return { error: 'Internal server error' };
  }
});

// GET current opponent's user info
fastify.get('/opponent-data', { preHandler: authenticate }, async (request, reply) => {

	if (!globalObj.opponentData) {
      reply.code(404);
      return { error: 'Opponent data not found' };
    }

    return globalObj.opponentData;
});

// GET user by ID
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {

	let sanitizeResult = sanitizeInput(request.params.id, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.id)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    const user = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             pref_lang, created_at, updated_at
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(request.params.id);
    
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    return user;
  });

  // GET user name & rank by ID
  fastify.get('/name-and-rank/:id', { preHandler: authenticate }, async (request, reply) => {


	let sanitizeResult = sanitizeInput(request.params.id, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.id)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}


    const user = fastify.db.prepare(`
      SELECT username, avatar_url, ranking_points
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(request.params.id);
    
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    return user;
  });

  // GET user by USERNAME
  fastify.get('/by-username/:username', { preHandler: authenticate }, async (request, reply) => {

	let sanitizeResult = sanitizeInput(request.params.username, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    const user = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             pref_lang, created_at, updated_at
      FROM users 
      WHERE username = ? AND deleted_at IS NULL
    `).get(request.params.username);
    
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    return user;
  });

  // Register new user
  fastify.post('/register', async (request, reply) => {
    const { username, password, language } = request.body;
    
    if (!username || !password) {
      reply.code(400);
      return { error: 'Username and password are required' };
    }
    
    const validationResult = validateUsername(username);
    if (!validationResult.isValid) {
      reply.code(400);
      return { error: validationResult.message };
    }

    if (!password.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)) {
      reply.code(400);
      return { error: 'password too weak'}
    }
    

    let userLanguage = 'en';
    if (language) {

		let sanitizeResult = sanitizeInput(language, true);
		if (!sanitizeResult.isValid) {
			reply.code(400);
			return { error: 'Request parameters contain invalid characters' };
		}

		if (!validLanguages.includes(language)) {
			reply.code(400);
			return { error: `Language must be one of: ${validLanguages.join(', ')}` };
		}
		userLanguage = language;
    }
    
    try {
      const hashedPassword = await hashPassword(password);
      
      const avatarUrl = '/public/avatars/bee.png';

      const sanitizedUsername = validationResult.sanitized;
      
      const result = fastify.db.prepare(`
        INSERT INTO users (
          username, password, avatar_url, pref_lang
        ) VALUES (?, ?, ?, ?)
      `).run(username, hashedPassword, avatarUrl, userLanguage);
      
      reply.code(201);
      return { 
        id: result.lastInsertRowid, 
        username: sanitizedUsername, 
        avatar_url: avatarUrl,
        ranking_points: 1000,
        games_played_pong: 0,
        wins_pong: 0,
        losses_pong: 0,
        games_played_blockbattle: 0,
        wins_blockbattle: 0,
        losses_blockbattle: 0,
        tournaments_played: 0,
        tournaments_won: 0,
        tournament_points: 0,
        pref_lang: userLanguage
      };
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        reply.code(409);
        return { error: 'Username already exists' };
      }
      
      fastify.log.error(err);
      reply.code(500);
      return { error: 'Internal server error' };
    }
  });

  // Verify opponent
  fastify.post('/verify-opponent', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body;

	let sanitizeResult = sanitizeInput(username, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

	sanitizeResult = sanitizeInput(password, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    // Validate input
    if (!username || !password) {
      reply.code(400);
      return { error: 'Username and password are required' };
    }
    
    // Find user by username
    const user = fastify.db.prepare(`
      SELECT * FROM users WHERE username = ? AND deleted_at IS NULL
    `).get(username);
    
    if (!user) {
      reply.code(401);
      return { error: 'Invalid username or password' };
    }
    
    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      reply.code(401);
      return { error: 'Invalid username or password' };
    }
    
    globalObj.opponentData = {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        ranking_points: user.ranking_points,
        games_played_pong: user.games_played_pong,
        wins_pong: user.wins_pong,
        losses_pong: user.losses_pong,
        games_played_blockbattle: user.games_played_blockbattle,
        wins_blockbattle: user.wins_blockbattle,
        losses_blockbattle: user.losses_blockbattle,
        tournaments_played: user.tournaments_played,
        tournaments_won: user.tournaments_won,
        tournament_points: user.tournament_points,
        pref_lang: user.pref_lang
      }
    
    return {status: 'OK'};
  });

  // Start new tournament
	fastify.get('/start-new-tournament', { preHandler: authenticate }, async (request, reply) => {

	globalTournamentObj.tournamentArr.length = 0;
	globalTournamentObj.matchCounter = 0;
	globalTournamentObj.gameType = '';

	const user = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             pref_lang, created_at, updated_at
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(request.user.id);
    
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }

	const tournamentPlayer = {
		tournamentId: 0,
		user: user,
		place: 1,
		tournamentPoints: 0,
		coinsCollected: 0,
		pongPointsScored: 0,
		isWinner: false,
		bbWeapons: []
	};

	globalTournamentObj.tournamentArr.push(tournamentPlayer);

    return {status: 'OK'};
});

	// End tournament helper function
	function findWinner(gameType)
	{
		const playerArr = globalTournamentObj.tournamentArr;

		// Sort players based on points
		if (gameType === 'blockbattle')
		{
			playerArr.sort((a, b) => {
				if (b.tournamentPoints !== a.tournamentPoints)
					return b.tournamentPoints - a.tournamentPoints;
				return b.coinsCollected - a.coinsCollected;
			})
		}
		else if (gameType === 'pong')
		{
			playerArr.sort((a, b) => {
				if (b.tournamentPoints !== a.tournamentPoints)
					return b.tournamentPoints - a.tournamentPoints;
				return b.pongPointsScored - a.pongPointsScored;
			})
		}

		const winnerArr = [];

		winnerArr.push(playerArr[0]);

		if (playerArr[0].tournamentPoints === playerArr[1].tournamentPoints
			&& playerArr[0].coinsCollected === playerArr[1].coinsCollected
			&& playerArr[0].pongPointsScored === playerArr[1].pongPointsScored)
		{
			for (let i = 1; i < 4; i++)
			{
				if (playerArr[i].tournamentPoints === playerArr[0].tournamentPoints
					&& playerArr[i].coinsCollected === playerArr[0].coinsCollected
					&& playerArr[i].pongPointsScored === playerArr[0].pongPointsScored)
					winnerArr.push(playerArr[i]);
			}
		}

		return winnerArr;

	}

	// End tournament
	fastify.get('/end-tournament', { preHandler: authenticate }, async (request, reply) => {

		// Validate tournament state
		if (globalTournamentObj.tournamentArr.length !== 4 || globalTournamentObj.matchCounter !== 6) {
			reply.code(400);
			return { error: 'Tournament data error' };
		}

		const winnerArr = findWinner(globalTournamentObj.gameType);
		if (!winnerArr || winnerArr.length === 0) {
			reply.code(400);
			return { error: 'Tournament data error; no winner found' };
		}

		try {

			const transaction = fastify.db.transaction(() => {
				for (let i = 0; i < 4; i++) {
				const userId = globalTournamentObj.tournamentArr[i].user.id;
				const points = globalTournamentObj.tournamentArr[i].tournamentPoints;

				fastify.db.prepare(`
					UPDATE users 
					SET tournaments_played = tournaments_played + 1,
						tournament_points = tournament_points + ?,
						updated_at = CURRENT_TIMESTAMP
					WHERE id = ?
				`).run(points, userId);

				if (winnerArr.some(p => p.user.id === userId)) {
					fastify.db.prepare(`
					UPDATE users 
					SET tournaments_won = tournaments_won + 1
					WHERE id = ?
					`).run(userId);
				}
				}
			});

			transaction(); // Execute the batched transaction

		} catch (err) {
			fastify.log.error(err);
			reply.code(500);
			return { error: 'Failed to end tournament', message: err.message };
		}

		return winnerArr;
	});


  // Verify tournament player
  fastify.post('/verify-tournament-player', { preHandler: authenticate }, async (request, reply) => {
    const { username, password } = request.body;

	let sanitizeResult = sanitizeInput(username, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

	sanitizeResult = sanitizeInput(password, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

	if (globalTournamentObj.tournamentArr.length === 4) {
      reply.code(400);
      return { error: 'Tournament already full' };
    }
    
    // Validate input
    if (!username || !password) {
      reply.code(400);
      return { error: 'Username and password are required' };
    }
    
    // Find user by username
    const user = fastify.db.prepare(`
      SELECT * FROM users WHERE username = ? AND deleted_at IS NULL
    `).get(username);
    
    if (!user) {
      reply.code(401);
      return { error: 'Invalid username or password' };
    }
    
    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      reply.code(401);
      return { error: 'Invalid username or password' };
    }
    
	const opponentData = {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        ranking_points: user.ranking_points,
        games_played_pong: user.games_played_pong,
        wins_pong: user.wins_pong,
        losses_pong: user.losses_pong,
        games_played_blockbattle: user.games_played_blockbattle,
        wins_blockbattle: user.wins_blockbattle,
        losses_blockbattle: user.losses_blockbattle,
        tournaments_played: user.tournaments_played,
        tournaments_won: user.tournaments_won,
        tournament_points: user.tournament_points,
        pref_lang: user.pref_lang
      }

	const tournamentPlayer = {
		tournamentId: globalTournamentObj.tournamentArr.length,
		user: opponentData,
		place: globalTournamentObj.tournamentArr.length + 1,
		tournamentPoints: 0,
		coinsCollected: 0,
		pongPointsScored: 0,
		isWinner: false,
		bbWeapons: []
	};

	globalTournamentObj.tournamentArr.push(tournamentPlayer);
    
	return globalTournamentObj.tournamentArr;
	
  });

  	// Remove tournament player
  fastify.post('/remove-tournament-player', { preHandler: authenticate }, async (request, reply) => {
    const playerId = request.body;

	let sanitizeResult = sanitizeInput(playerId, false);
	if (!sanitizeResult.isValid || !isIntegerString(playerId)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

	if (globalTournamentObj.tournamentArr.length === 0) {
      reply.code(400);
      return { error: 'Tournament already empty' };
    }
    
   const idx = globalTournamentObj.tournamentArr.findIndex(p => p.user.id === playerId);

   if (idx === -1) {
      reply.code(400);
      return { error: 'User not found in tournament' };
    }

	globalTournamentObj.tournamentArr.splice(idx, 1);
    
	return globalTournamentObj.tournamentArr;
	
  });

  // Save weapon data
  fastify.post('/save-weapon-data', { preHandler: authenticate }, async (request, reply) => {

	const { p1Weapons, p2Weapons} = request.body;

	let sanitizeResult = sanitizeInput(p1Weapons[0].name, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}
	sanitizeResult = sanitizeInput(p1Weapons[1].name, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}
	sanitizeResult = sanitizeInput(p2Weapons[0].name, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}
	sanitizeResult = sanitizeInput(p2Weapons[1].name, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}


	if (globalTournamentObj.tournamentArr.length === 0) {
      reply.code(400);
      return { error: 'Tournament array empty' };
    }

	if (!validWeapons.includes(p1Weapons[0].name) || !validWeapons.includes(p1Weapons[1].name)
	 || !validWeapons.includes(p2Weapons[0].name) || !validWeapons.includes(p2Weapons[1].name)) {
      reply.code(400);
      return { error: 'Bad weapon data; weapon name is nod valid' };
    }

    
	const p1Idx = globalTournamentObj.gameOrder[globalTournamentObj.matchCounter][0];
	const p2Idx = globalTournamentObj.gameOrder[globalTournamentObj.matchCounter][1];

	globalTournamentObj.tournamentArr[p1Idx].bbWeapons = p1Weapons;
	globalTournamentObj.tournamentArr[p2Idx].bbWeapons = p2Weapons;
    
	return { status: 'OK' };
	
  });

  	// GET tournament players
	fastify.get('/tournament-players', { preHandler: authenticate }, async (request, reply) => {

	if (globalTournamentObj.tournamentArr.length != 4) {
      reply.code(400);
      return { error: 'Tournament data error; wrong amount of participants' };
    }

    return globalTournamentObj.tournamentArr;
	});

	// GET next tournament game data
	fastify.get('/next-tournament-game-data', { preHandler: authenticate }, async (request, reply) => {

	if (globalTournamentObj.tournamentArr.length != 4) {
      reply.code(400);
      return { error: 'Tournament data error; wrong amount of participants' };
    }

	const responseArr = [];
	const player1Idx = globalTournamentObj.gameOrder[globalTournamentObj.matchCounter][0];
	const player2Idx = globalTournamentObj.gameOrder[globalTournamentObj.matchCounter][1];

	responseArr.push(globalTournamentObj.tournamentArr[player1Idx]);
	responseArr.push(globalTournamentObj.tournamentArr[player2Idx]);

    return responseArr;
	});

  	// Check tournament status
	fastify.get('/check-tournament-status', { preHandler: authenticate }, async (request, reply) => {

	if (globalTournamentObj.tournamentArr.length < 4) {
      reply.code(400);
      return { error: 'Tournament players still missing' };
    }
	
	if (globalTournamentObj.tournamentArr.length > 4) {
      reply.code(400);
      return { error: 'Tournament data error; too many players!' };
    }

    return {status: 'OK'};
});

  // Login
  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const { username, password } = request.body;
    
	let sanitizeResult = sanitizeInput(username, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}
	sanitizeResult = sanitizeInput(password, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    if (!username || !password) {
      reply.code(400);
      return { error: 'Username and password are required' };
    }
    
    const user = fastify.db.prepare(`
      SELECT * FROM users WHERE username = ? AND deleted_at IS NULL
    `).get(username);
    
    if (!user) {
      reply.code(401);
      return { error: 'Invalid username or password' };
    }
    
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      reply.code(401);
      return { error: 'Invalid username or password' };
    }
    
    // Generate JWT token
    const token = fastify.jwt.sign({
      id: user.id,
      username: user.username
    });

	// Just in case, initialize all global backend game variables
	global.opponentData = null;
	globalTournamentObj.gameType = '';
	globalTournamentObj.matchCounter = 0;
	globalTournamentObj.tournamentArr.length = 0;
    
    return { 
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        ranking_points: user.ranking_points,
        games_played_pong: user.games_played_pong,
        wins_pong: user.wins_pong,
        losses_pong: user.losses_pong,
        games_played_blockbattle: user.games_played_blockbattle,
        wins_blockbattle: user.wins_blockbattle,
        losses_blockbattle: user.losses_blockbattle,
        tournaments_played: user.tournaments_played,
        tournaments_won: user.tournaments_won,
        tournament_points: user.tournament_points,
        pref_lang: user.pref_lang
      }
    };
  });

  // Update user profile
  fastify.put('/profile', { preHandler: authenticate }, async (request, reply) => {
	
    const userId = request.user.id;
    const { username } = request.body;
    
	let sanitizeResult = sanitizeInput(username, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    try {
      if (!username) {
        reply.code(400);
        return { error: 'Username is required' };
      }
      
      const validationResult = validateUsername(username);
      if (!validationResult.isValid) {
        reply.code(400);
        return { error: validationResult.message };
      }
      
      const sanitizedUsername = validationResult.sanitized;
      
      const result = fastify.db.prepare(`
        UPDATE users 
        SET username = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND deleted_at IS NULL
      `).run(sanitizedUsername, userId);
      
      if (result.changes === 0) {
        reply.code(404);
        return { error: 'User not found or no changes made' };
      }
      
      const updatedUser = fastify.db.prepare(`
        SELECT id, username, avatar_url, ranking_points,
               games_played_pong, wins_pong, losses_pong,
               games_played_blockbattle, wins_blockbattle, losses_blockbattle,
               tournaments_played, tournaments_won, tournament_points
        FROM users 
        WHERE id = ? AND deleted_at IS NULL
      `).get(userId);
      
      return updatedUser;
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        reply.code(409);
        return { error: 'Username already exists' };
      }
      
      fastify.log.error(err);
      reply.code(500);
      return { error: 'Internal server error' };
    }
  });

  // Change password
  fastify.put('/password', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    const { currentPassword, newPassword } = request.body;

	let sanitizeResult = sanitizeInput(currentPassword, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}
	sanitizeResult = sanitizeInput(newPassword, true);
	if (!sanitizeResult.isValid) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}
    
    if (!currentPassword || !newPassword) {
      reply.code(400);
      return { error: 'Current password and new password are required' };
    }
    
    if (!newPassword.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)) {
      reply.code(400);
      return { error: 'password too weak'}
    }

    // Get current user with password
    const user = fastify.db.prepare(`
      SELECT password FROM users WHERE id = ? AND deleted_at IS NULL
    `).get(userId);
    
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    // Verify current password
    const passwordMatch = await comparePassword(currentPassword, user.password);
    if (!passwordMatch) {
      reply.code(401);
      return { error: 'Current password is incorrect' };
    }
    
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    fastify.db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND deleted_at IS NULL
    `).run(hashedPassword, userId);
    
    return { success: true, message: 'Password updated successfully' };
  });

  // Upload avatar
  fastify.post('/avatar', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 2,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
	const now = Date.now();
	const lastUpload = uploadTracker.get(userId);
	const UPLOAD_COOLDOWN = 60 * 1000; // 1 minute cooldown
	
	if (lastUpload && (now - lastUpload) < UPLOAD_COOLDOWN) {
		reply.code(429);
		return { error: 'Please wait before uploading another avatar' };
	}

	if (!request.body || !request.body.avatar || !request.body.avatar.data) {
	reply.code(400);
	return { error: 'Avatar image is required' };
	}
	
	if (request.body.avatar.size > 2 * 1024 * 1024) {
	reply.code(400);
	return { error: 'File size exceeds 2MB' };
	}

    try {
    // Get old avatar for cleanup
    const oldUser = fastify.db.prepare(`
      SELECT avatar_url FROM users WHERE id = ? AND deleted_at IS NULL
    `).get(userId);
    
    // Decode base64 image
    const imageData = Buffer.from(request.body.avatar.data, 'base64');
    const filename = `avatar_${userId}_${Date.now()}.png`;
    const filePath = path.join(avatarDir, filename);
    
    // Save the file
    await writeFile(filePath, imageData);
    
    // Update avatar URL in database
    const avatarUrl = `/public/avatars/${filename}`;
    
    fastify.db.prepare(`
      UPDATE users 
      SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND deleted_at IS NULL
    `).run(avatarUrl, userId);
    
    // Clean up old avatar file
    if (oldUser && oldUser.avatar_url && oldUser.avatar_url !== '/public/avatars/bee.png') {
      const oldFileName = path.basename(oldUser.avatar_url);
      const oldFilePath = path.join(avatarDir, oldFileName);
      try {
        const fs = require('fs').promises;
        await fs.unlink(oldFilePath);
        fastify.log.info(`Deleted old avatar: ${oldFileName}`);
      } catch (cleanupErr) {
        fastify.log.warn(`Failed to delete old avatar: ${cleanupErr.message}`);
      }
    }

	uploadTracker.set(userId, now);
    
    return { avatar_url: avatarUrl };
  } catch (err) {
    fastify.log.error(err);
    reply.code(500);
    return { error: 'Failed to save avatar' };
  }
});

  // Get user statistics
  fastify.get('/stats', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    
    const stats = fastify.db.prepare(`
      SELECT ranking_points, tournaments_played, tournaments_won, tournament_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(userId);
    
    if (!stats) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    return stats;
  });

  // Get user's match history
  fastify.get('/match-history', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    
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
    `).all(userId, userId);
    
    return { matches };
  });

  // Get user's friends
  fastify.get('/friends', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    
    const friends = fastify.db.prepare(`
      SELECT u.id, u.username, u.avatar_url, u.ranking_points
      FROM users u
      JOIN friends f ON (f.friend_id = u.id AND f.user_id = ?)
                     OR (f.user_id = u.id AND f.friend_id = ?)
      WHERE f.status = 'accepted' AND u.deleted_at IS NULL
    `).all(userId, userId);
    
    return { friends };
  });


  // GDPR - Export user data
  fastify.get('/export-data', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '5 minutes'
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    
    // Get user data
    const userData = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             pref_lang, created_at, updated_at
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(userId);
    
    if (!userData) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    // Get match history
    const matches = fastify.db.prepare(`
      SELECT * FROM matches 
      WHERE player1_id = ? OR player2_id = ?
      ORDER BY date DESC
    `).all(userId, userId);
    
    // Get friends
    const friends = fastify.db.prepare(`
      SELECT u.id, u.username
      FROM users u
      JOIN friends f ON (f.friend_id = u.id AND f.user_id = ?)
                     OR (f.user_id = u.id AND f.friend_id = ?)
      WHERE f.status = 'accepted'
    `).all(userId, userId);
    
    // Compile all data
    const exportData = {
      user: userData,
      matches: matches,
      friends: friends
    };
    
    return exportData;
  });

  // GDPR - Delete account (soft delete)
  fastify.delete('/account', { 
    preHandler: authenticate,
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const userId = request.user.id;
    
    // Perform soft delete
    fastify.db.prepare(`
      UPDATE users 
      SET deleted_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND deleted_at IS NULL
    `).run(userId);
    
    return { success: true, message: 'Account has been scheduled for deletion' };
  });
}

module.exports = userRoutes;