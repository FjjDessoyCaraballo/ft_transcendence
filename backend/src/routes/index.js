async function routes(fastify, options) {
	// Register all route files here
	fastify.register(require('./users'), { prefix: '/api/users' });
	fastify.register(require('./games'), { prefix: '/api/games' });
	
	// Add a simple root route
	fastify.get('/', async (request, reply) => {
	  return { status: 'API is running' };
	});
  }
  
  module.exports = routes;