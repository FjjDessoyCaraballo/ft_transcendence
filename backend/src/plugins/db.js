const fastifyPlugin = require('fastify-plugin');
const sqlite3 = require('better-sqlite3');

async function dbConnector(fastify, options) {
  const db = sqlite3(options.dbPath);
  
  // Create a decorator to make the db available in routes
  fastify.decorate('db', db);
  
  // Close the database connection when the server is shutting down
  fastify.addHook('onClose', (instance, done) => {
    if (instance.db) {
      instance.db.close();
    }
    done();
  });
}

module.exports = fastifyPlugin(dbConnector);