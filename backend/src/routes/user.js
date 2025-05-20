// src/routes/user.js
const { hashPassword, comparePassword } = require('../utils/passwords');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

async function userRoutes(fastify, options) {
  // Middleware to check authentication
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

  // GET all users with statistics
  fastify.get('/', async (request, reply) => {
    const users = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points
      FROM users
      WHERE deleted_at IS NULL
    `).all();
    return users;
  });

  // GET user by USERNAME
  fastify.get('/:username', async (request, reply) => {

    const user = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             created_at, updated_at
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
    const { username, password } = request.body;
    
    // Validate input
    if (!username || !password) {
      reply.code(400);
      return { error: 'Username and password are required' };
    }

    if (!password.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)) {
      reply.code(400);
      return { error: 'password too weak'}
    }
    
    try {
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Default avatar
      const avatarUrl = '/public/avatars/bee.png';
      
      // Insert the user with default values
      const result = fastify.db.prepare(`
        INSERT INTO users (
          username, password, avatar_url
        ) VALUES (?, ?, ?)
      `).run(username, hashedPassword, avatarUrl);
      
      reply.code(201);
      return { 
        id: result.lastInsertRowid, 
        username, 
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
        tournament_points: 0
      };
    } catch (err) {
      // Handle duplicate username
      if (err.message.includes('UNIQUE constraint failed')) {
        reply.code(409);
        return { error: 'Username already exists' };
      }
      
      fastify.log.error(err);
      reply.code(500);
      return { error: 'Internal server error' };
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;
    
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
    
    // Generate JWT token
    const token = fastify.jwt.sign({
      id: user.id,
      username: user.username
    });
    
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
        tournament_points: user.tournament_points
      }
    };
  });

  // Update user profile
  fastify.put('/profile', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const { username } = request.body;
    
    try {
      if (!username) {
        reply.code(400);
        return { error: 'Username is required' };
      }
      
      // Update the user
      const result = fastify.db.prepare(`
        UPDATE users 
        SET username = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND deleted_at IS NULL
      `).run(username, userId);
      
      if (result.changes === 0) {
        reply.code(404);
        return { error: 'User not found or no changes made' };
      }
      
      // Fetch updated user data
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
      // Handle duplicate username
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
  fastify.put('/password', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const { currentPassword, newPassword } = request.body;
    
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
    
    // Hash new password
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
  fastify.post('/avatar', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    
    if (!request.body || !request.body.avatar || !request.body.avatar.data) {
      reply.code(400);
      return { error: 'Avatar image is required' };
    }
    
    if (request.body.avatar.size > 2 * 1024 * 1024) {
      reply.code(400);
      return { error: 'File size exceeds 2MB' };
    }

    try {
      // Decode base64 image
      const imageData = Buffer.from(request.body.avatar.data, 'base64');
      
      // Generate filename
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

  // Update rankings after a match (for internal use)
  fastify.post('/update-stats', async (request, reply) => {

    const { winner, loser, gameTypeString } = request.body;
    
    if (!winner || !loser || !gameTypeString) {
      reply.code(400);
      return { error: 'Missing required parameters' };
    }
    
    const transaction = fastify.db.transaction(() => {
      // Update game stats
      if (gameTypeString === 'pong') {

        fastify.db.prepare(`
          UPDATE users 
          SET games_played_pong = ?,
              wins_pong = ?,
              losses_pong = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(winner.games_played_pong, winner.wins_pong, winner.losses_pong, winner.id);

		fastify.db.prepare(`
          UPDATE users 
          SET games_played_pong = ?,
              wins_pong = ?,
              losses_pong = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(loser.games_played_pong, loser.wins_pong, loser.losses_pong, loser.id);

      } else if (gameTypeString === 'blockbattle') {

        fastify.db.prepare(`
          UPDATE users 
          SET games_played_blockbattle = ?,
              wins_blockbattle = ?,
              losses_blockbattle = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(winner.games_played_blockbattle, winner.wins_blockbattle, winner.losses_blockbattle, winner.id);

		fastify.db.prepare(`
          UPDATE users 
          SET games_played_blockbattle = ?,
              wins_blockbattle = ?,
              losses_blockbattle = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(loser.games_played_blockbattle, loser.wins_blockbattle, loser.losses_blockbattle, loser.id);

      }
      
      // Update ranking points
      fastify.db.prepare(`
        UPDATE users 
        SET ranking_points = ?
        WHERE id = ?
      `).run(winner.ranking_points, winner.id);

	  fastify.db.prepare(`
        UPDATE users 
        SET ranking_points = ?
        WHERE id = ?
      `).run(loser.ranking_points, loser.id);

    });
    
    transaction();
    
    return { success: true };
  });

  // GDPR - Export user data
  fastify.get('/export-data', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    
    // Get user data
    const userData = fastify.db.prepare(`
      SELECT id, username, avatar_url, ranking_points,
             games_played_pong, wins_pong, losses_pong,
             games_played_blockbattle, wins_blockbattle, losses_blockbattle,
             tournaments_played, tournaments_won, tournament_points,
             created_at, updated_at
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
  fastify.delete('/account', { preHandler: authenticate }, async (request, reply) => {
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