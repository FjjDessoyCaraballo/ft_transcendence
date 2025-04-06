// src/routes/users.js
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

async function userRoutes(fastify, options) {
  // Register the DB plugin if not already done
  if (!fastify.db) {
    fastify.register(require('../plugins/db'), { 
      dbPath: fastify.config.dbPath 
    });
  }

  // GET all users
  fastify.get('/', async (request, reply) => {
    const users = fastify.db.prepare('SELECT id, username, email FROM users').all();
    return users;
  });

  // GET user by ID
  fastify.get('/:id', async (request, reply) => {
    const user = fastify.db.prepare('SELECT id, username, email FROM users WHERE id = ?')
      .get(request.params.id);
    
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }
    
    return user;
  });

  // POST create new user
  fastify.post('/', async (request, reply) => {
    const { username, email, password } = request.body;
    
    // Validate input
    if (!username || !email || !password) {
      reply.code(400);
      return { error: 'Username, email and password are required' };
    }
    
    try {
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Insert the user
      const result = fastify.db.prepare(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      ).run(username, email, hashedPassword);
      
      reply.code(201);
      return { id: result.lastInsertRowid, username, email };
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

  // More routes for login, update user, etc.
}

module.exports = userRoutes;