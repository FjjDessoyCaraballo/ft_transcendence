const path = require('path');
const fs = require('fs');
const config = require('../config');
const socketManager = require('./utils/socketManager');
const FriendRepository = require('./repositories/friendRepository');
let friendRepo;
const fastify = require('fastify')({
	logger: true,
  bodyLimit: 5 * 1024 * 1024,
	https: {
	  key: fs.readFileSync('/app/certs/key.pem'),
	  cert: fs.readFileSync('/app/certs/cert.pem')
	}
  });

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: 'https://localhost:9000',
  credentials: true
});

fastify.register(require('@fastify/jwt'), {
  secret: config.jwtSecret
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/public/'
});

// Register database plugin
fastify.register(require('./plugins/db'), {
  dbPath: config.dbPath
});

// Register response serializer plugin to prevent XSS in responses
fastify.register(require('./plugins/responseSerializer'));

// Add security headers
fastify.addHook('onRequest', (request, reply, done) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'");
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  reply.header('Referrer-Policy', 'no-referrer-when-downgrade');
  done();
});

// Initialize repositories after DB is ready
fastify.addHook('onReady', async () => {
  friendRepo = new FriendRepository(fastify.db);
});

// Socket.IO setup
fastify.register(require('fastify-socket.io'), {
  cors: {
    origin: 'https://localhost:9000',
    credentials: true
  }
});

// Socket.IO handlers
fastify.ready().then(() => {
  const io = fastify.io;

  io.use(async (socket, next) => {
    try {
      // Verify JWT token from handshake
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = fastify.jwt.verify(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id;

    socketManager.addConnection(userId, socket);

    const friends = friendRepo.getFriends(userId);

    friends.forEach(friend => {
      const friendSocket = socketManager.getSocket(friend.id);
      if (friendSocket) {
        friendSocket.emit('friend_online', {
          userId,
          username: socket.user.username
        });
      }
    });

    const onlineFriends = friends
      .filter(friend => socketManager.isUserOnline(friend.id))
      .map(friend => ({ id: friend.id, username: friend.username }));

    socket.emit('online_friends', onlineFriends);


    socket.on('disconnect', () => {
      const disconnectedUserId = socketManager.removeConnection(socket.id);

      if (disconnectedUserId) {
        // Notify friends that user is offline
        friends.forEach(friend => {
          const friendSocket = socketManager.getSocket(friend.id);
          if (friendSocket) {
            friendSocket.emit('friend_offline', {
              userId: disconnectedUserId
            });
          }
        });
      }
    });

    // Handle game invitations
    socket.on('game_invite', (data) => {
      const targetUserId = data.friendId;
      const friendSocket = socketManager.getSocket(targetUserId);

      if (friendSocket) {
        friendSocket.emit('game_invitation', {
          from: userId,
          username: socket.user.username
        });
      } else {
        socket.emit('invitation_failed', {
          message: 'User is not online'
        });
      }
    });
  });
});
// register ratelimit
fastify.register(require('./plugins/rateLimit'))
// Register routes
fastify.register(require('./routes'));


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
