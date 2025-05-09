async function routes(fastify, options) {
	// Register all route files here
	fastify.register(require('./user'), { prefix: '/api/users' });
	fastify.register(require('./game'), { prefix: '/api/games' });
	fastify.register(require('./friend'), { prefix: '/api/friends' });
	
	// Add a simple root route
	fastify.get('/', async (request, reply) => {
	  return { status: 'API is running' };
	});
  }
  
  module.exports = routes;