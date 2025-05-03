// src/routes/user.js
const { hashPassword, comparePassword } = require('../utils/passwords');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

async function userRoutes(fastify, options) {
  // Register the DB plugin if not already done
  if (!fastify.db) {
    fastify.register(require('../plugins/db'), { 
      dbPath: fastify.config.dbPath 
    });
  }

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

  // GET all users
  fastify.get('/', async (request, reply) => {
    const users = fastify.db.prepare(`
      SELECT id, username, email, avatar_url, games_won, games_lost, elo_rank 
      FROM users
      WHERE deleted_at IS NULL
    `).all();
    return users;
  });

  // GET user by ID
  fastify.get('/:id', async (request, reply) => {
    const user = fastify.db.prepare(`
      SELECT id, username, email, avatar_url, games_won, games_lost, elo_rank 
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(request.params.id);
    
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
    
    try {
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Default avatar
      const avatarUrl = '/public/avatar/bee.png';
      
      // Insert the user with additional fields
      const result = fastify.db.prepare(`
        INSERT INTO users (
          username, password, avatar_url, 
          games_won, games_lost, elo_rank
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(username, hashedPassword, avatarUrl, 0, 0, 1000);
      
      reply.code(201);
      return { 
        id: result.lastInsertRowid, 
        username, 
        avatar_url: avatarUrl,
        games_won: 0,
        games_lost: 0,
        elo_rank: 1000
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
    const { password } = request.body;
    
    // Validate input
    if ( !password) {
      reply.code(400);
      return { error: 'Email and password are required' };
    }
    
    // Find user by email
    const user = fastify.db.prepare(`
      SELECT id, username, email, password, avatar_url, games_won, games_lost, elo_rank 
      FROM users 
      WHERE email = ? AND deleted_at IS NULL
    `).get(email);
    
    if (!user) {
      reply.code(401);
      return { error: 'Invalid email or password' };
    }
    
    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      reply.code(401);
      return { error: 'Invalid email or password' };
    }
    
    // Generate JWT token
    const token = fastify.jwt.sign({
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    return { 
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        games_won: user.games_won,
        games_lost: user.games_lost,
        elo_rank: user.elo_rank
      }
    };
  });

  // Update user profile
  fastify.put('/profile', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const { username, email } = request.body;
    
    try {
      // Start building the SQL query and parameters
      let setClause = [];
      let params = [];
      
      if (username) {
        setClause.push('username = ?');
        params.push(username);
      }
      
      if (email) {
        setClause.push('email = ?');
        params.push(email);
      }
      
      
      if (setClause.length === 0) {
        reply.code(400);
        return { error: 'No fields to update' };
      }
      
      // Add the WHERE clause parameter
      params.push(userId);
      
      // Update the user
      const result = fastify.db.prepare(`
        UPDATE users 
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND deleted_at IS NULL
      `).run(...params);
      
      if (result.changes === 0) {
        reply.code(404);
        return { error: 'User not found or no changes made' };
      }
      
      // Fetch updated user data
      const updatedUser = fastify.db.prepare(`
        SELECT id, username, email, avatar_url, games_won, games_lost, elo_rank 
        FROM users 
        WHERE id = ? AND deleted_at IS NULL
      `).get(userId);
      
      return updatedUser;
    } catch (err) {
      // Handle duplicate username/email
      if (err.message.includes('UNIQUE constraint failed')) {
        reply.code(409);
        return { error: 'Username or email already exists' };
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
      SELECT games_played, games_won, games_lost, elo_rank 
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(userId);
    
    if (!stats) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    return stats;
  });

  // GDPR - Export user data
  fastify.get('/export-data', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    
    // Get user data
    const userData = fastify.db.prepare(`
      SELECT id, username, email, avatar_url, games_played, 
             games_won, games_lost, elo_rank, created_at, updated_at 
      FROM users 
      WHERE id = ? AND deleted_at IS NULL
    `).get(userId);
    
    if (!userData) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    // Get game history
    const gameHistory = fastify.db.prepare(`
      SELECT * FROM games 
      WHERE player1_id = ? OR player2_id = ?
      ORDER BY created_at DESC
    `).all(userId, userId);
    
    // Get friend list
    const friends = fastify.db.prepare(`
      SELECT u.id, u.username
      FROM users u
      JOIN friendships f ON f.friend_id = u.id
      WHERE f.user_id = ? AND f.status = 'accepted'
      UNION
      SELECT u.id, u.username
      FROM users u
      JOIN friendships f ON f.user_id = u.id
      WHERE f.friend_id = ? AND f.status = 'accepted'
    `).all(userId, userId);
    
    // Compile all data
    const exportData = {
      user: userData,
      games: gameHistory,
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