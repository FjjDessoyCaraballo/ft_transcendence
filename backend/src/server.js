// Import required packages
const fastify = require('fastify')({ logger: true });
const config = require('../config');

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: config.corsOrigin,
  credentials: true
});

fastify.register(require('@fastify/jwt'), {
  secret: config.jwtSecret
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/'
});

// Add a simple route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();