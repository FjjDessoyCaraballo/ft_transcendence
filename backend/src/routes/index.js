async function routes(fastify, options) {
	fastify.register(require('./user'), { prefix: '/api/users' });
	fastify.register(require('./game'), { prefix: '/api/games' });
	fastify.register(require('./friend'), { prefix: '/api/friends' });
	
	fastify.get('/', async (request, reply) => {
	  return { status: 'API is running' };
	});
  }
  
  module.exports = routes;