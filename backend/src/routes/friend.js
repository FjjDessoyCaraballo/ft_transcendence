const FriendRepository = require('../repositories/friendRepository');

async function friendRoutes(fastify, options) {
  const friendRepo = new FriendRepository(fastify.db);
  
  // Middleware to check authentication
  const authenticate = async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Authentication required' });
    }
  };

  // Get all friends
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const friends = friendRepo.getFriends(userId);
    return { friends };
  });

  // Get pending friend requests
  fastify.get('/requests', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const requests = friendRepo.getPendingRequests(userId);
    return { requests };
  });

  // Send friend request
  fastify.post('/request/:friendId', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const friendId = parseInt(request.params.friendId);

    if (userId === friendId) {
      reply.code(400);
      return { error: 'Cannot add yourself as a friend' };
    }

    try {
      // Check if user exists
      const friend = fastify.db.prepare('SELECT id FROM users WHERE id = ?').get(friendId);
      if (!friend) {
        reply.code(404);
        return { error: 'User not found' };
      }

      // Check if already friends
      if (friendRepo.areFriends(userId, friendId)) {
        reply.code(409);
        return { error: 'Already friends' };
      }

      // Send request
      friendRepo.sendRequest(userId, friendId);

      // Emit notification to the target user
      const friendSocket = fastify.io.sockets.get(friendId);
      if (friendSocket) {
        friendSocket.emit('friend_request_received', {
          from: userId,
          username: request.user.username,
        });
      }

      return { success: true, message: 'Friend request sent' };
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        reply.code(409);
        return { error: 'Friend request already exists' };
      }

      fastify.log.error(err);
      reply.code(500);
      return { error: 'Internal server error' };
    }
  });

  // Accept friend request
  fastify.put('/accept/:friendId', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const friendId = parseInt(request.params.friendId);

    const result = friendRepo.acceptRequest(userId, friendId);

    if (result.changes === 0) {
      reply.code(404);
      return { error: 'No pending request from this user' };
    }

    // Emit notification to the requester
    const requesterSocket = fastify.io.sockets.get(friendId);
    if (requesterSocket) {
      requesterSocket.emit('friend_request_accepted', {
        from: userId,
        username: request.user.username,
      });
    }

    return { success: true, message: 'Friend request accepted' };
  });

  // Reject friend request
  fastify.put('/reject/:friendId', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const friendId = parseInt(request.params.friendId);
    
    const result = friendRepo.rejectRequest(userId, friendId);
    
    if (result.changes === 0) {
      reply.code(404);
      return { error: 'No pending request from this user' };
    }
    
    return { success: true, message: 'Friend request rejected' };
  });

  // Remove friend
  fastify.delete('/:friendId', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const friendId = parseInt(request.params.friendId);
    
    friendRepo.removeFriend(userId, friendId);

    // Notify the friend about the removal
    const friendSocket = fastify.io.sockets.get(friendId);
    if (friendSocket) {
      friendSocket.emit('friend_removed', {
        from: userId,
        username: request.user.username,
      });
    }

    return { success: true, message: 'Friend removed' };
  });
  
  fastify.get('/search', { preHandler: authenticate }, async (request, reply) => {
	const query = request.query.q;
	if (!query || query.length < 3) {
	  reply.code(400);
	  return { error: 'Search query must be at least 3 characters' };
	}
	
	const users = fastify.db.prepare(`
	  SELECT id, username, elo_rank 
	  FROM users 
	  WHERE username LIKE ? AND id != ? AND deleted_at IS NULL
	  LIMIT 20
	`).all(`%${query}%`, request.user.id);
	
	return { users };
  });

  // Get online friends
  fastify.get('/online', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const friends = friendRepo.getFriends(userId);
    const socketManager = require('../utils/socketManager');
    
    const onlineFriends = friends
      .filter(friend => socketManager.isUserOnline(friend.id))
      .map(friend => ({
        id: friend.id,
        username: friend.username,
        elo_rank: friend.elo_rank
      }));
    
    return { onlineFriends };
  });
}

module.exports = friendRoutes;