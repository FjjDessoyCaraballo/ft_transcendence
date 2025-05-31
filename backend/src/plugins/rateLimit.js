const fp = require('fastify-plugin');

async function rateLimitPlugin(fastify, options) {
  // Check if @fastify/rate-limit is installed
  try {
    await fastify.register(require('@fastify/rate-limit'), {
      global: true,  // Apply globally to all routes by default
      max: 100,      // Default limit (requests per time window)
      timeWindow: '1 minute',
      
      // Use consistent identifiers even behind proxies
      keyGenerator: (request) => {
        // For authenticated users, use user ID
        if (request.user && request.user.id) {
          return `user:${request.user.id}`;
        }
        // For unauthenticated users, use IP address
        return request.ip;
      },
      
      // Customize error response
      errorResponseBuilder: (request, context) => {
        return {
          statusCode: 429,
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${context.after}`,
          limit: context.max,
          remaining: context.remaining,
          reset: context.reset
        };
      },
      
      // Add headers to responses
      addHeaders: {
        'x-ratelimit-limit': true,
        'x-ratelimit-remaining': true,
        'x-ratelimit-reset': true
      }
    });
    
    // Log rate limit events
    fastify.addHook('onRequest', (request, reply, done) => {
      if (request.rateLimit && request.rateLimit.remaining <= 3) {
        request.log.warn({
          path: request.url,
          method: request.method,
          remainingRequests: request.rateLimit.remaining,
          ip: request.ip
        }, 'Rate limit almost reached');
      }
      done();
    });
    
    fastify.log.info('Rate limit plugin registered successfully');
  } catch (err) {
    fastify.log.error({ err }, 'Failed to register rate limit plugin');
  }
}

module.exports = fp(rateLimitPlugin);