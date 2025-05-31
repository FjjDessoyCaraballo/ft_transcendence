const { escapeHtml } = require('../utils/inputSanitizer');

async function responseSerializerPlugin(fastify, options) {
  // Function to recursively sanitize object properties
  function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = escapeHtml(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  // Add a hook that runs right before the response is serialized
  fastify.addHook('preSerialization', (request, reply, payload, done) => {
    if (!payload || typeof payload !== 'object') return done(null, payload);
    
    const sanitizedPayload = sanitizeObject(payload);
    done(null, sanitizedPayload);
  });
}

module.exports = responseSerializerPlugin;