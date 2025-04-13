const path = require('path');
const fastify = require('fastify')({ logger: true });
const config = require('../config');
const socketManager = require('./utils/socketManager');
const FriendRepository = require('./repositories/friendRepository');
let friendRepo;

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

// Register database plugin
fastify.register(require('./plugins/db'), { 
  dbPath: config.dbPath 
});

// Initialize repositories after DB is ready
fastify.addHook('onReady', async () => {
  friendRepo = new FriendRepository(fastify.db);
});

// Socket.IO setup
fastify.register(require('@fastify/socket.io'), {
  cors: {
    origin: config.corsOrigin,
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
    
    // Add user to online users
    socketManager.addConnection(userId, socket);
    
    // Get user's friends
    const friends = friendRepo.getFriends(userId);
    
    // Notify friends that user is online
    friends.forEach(friend => {
      const friendSocket = socketManager.getSocket(friend.id);
      if (friendSocket) {
        friendSocket.emit('friend_online', {
          userId,
          username: socket.user.username
        });
      }
    });
    
    // Send list of online friends to the user
    const onlineFriends = friends
      .filter(friend => socketManager.isUserOnline(friend.id))
      .map(friend => ({ id: friend.id, username: friend.username }));
    
    socket.emit('online_friends', onlineFriends);
    
    // Handle disconnection
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