const FriendRepository = require('../repositories/friendRepository');
const socketManager = require('../utils/socketManager');
const { sanitizeInput, isIntegerString } = require('../utils/inputSanitizer');


async function friendRoutes(fastify, options) {
  const friendRepo = new FriendRepository(fastify.db);
  
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

  // Get pending received friend requests
  fastify.get('/requests', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const requests = friendRepo.getPendingRequests(userId);
    return { requests };
  });

  // Get pending sent friend requests
  fastify.get('/sent-requests', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;
    const sentRequests = friendRepo.getSentRequests(userId);
    return { sentRequests };
  });


  // Send friend request
  fastify.post('/request/:friendId', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;

	const result = sanitizeInput(request.params.friendId, true);
	if (!result.isValid || !isIntegerString(request.params.friendId)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}


    const friendId = parseInt(request.params.friendId);

    if (userId === friendId) {
      reply.code(400);
      return { error: 'Cannot add yourself as a friend' };
    }

    try {
      const friend = fastify.db.prepare('SELECT id FROM users WHERE id = ?').get(friendId);
      if (!friend) {
        reply.code(404);
        return { error: 'User not found' };
      }

      if (friendRepo.areFriends(userId, friendId)) {
        reply.code(409);
        return { error: 'Already friends' };
      }

      friendRepo.sendRequest(userId, friendId);

      const friendSocket = socketManager.getSocket(friendId);
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

	const sanitizeResult = sanitizeInput(request.params.friendId, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.friendId)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    const friendId = parseInt(request.params.friendId);

    const result = friendRepo.acceptRequest(userId, friendId);

    if (result.changes === 0) {
      reply.code(404);
      return { error: 'No pending request from this user' };
    }

    // Emit notification to the requester
    const requesterSocket = socketManager.getSocket(friendId);
    if (requesterSocket) {
      requesterSocket.emit('friend_request_accepted', {
        from: userId,
        username: request.user.username,
      });
    }

    return { success: true, message: 'Friend request accepted' };
  });

  // Reject friend request (deletes the request)
  fastify.put('/reject/:friendId', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;

	const sanitizeResult = sanitizeInput(request.params.friendId, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.friendId)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    const friendId = parseInt(request.params.friendId);
    
    const result = friendRepo.rejectRequest(userId, friendId);
    
    if (result.changes === 0) {
      reply.code(404);
      return { error: 'No pending request from this user' };
    }
    
    return { success: true, message: 'Friend request rejected and deleted' };
  });

  // Remove friend
  fastify.delete('/:friendId', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user.id;

	const sanitizeResult = sanitizeInput(request.params.friendId, true);
	if (!sanitizeResult.isValid || !isIntegerString(request.params.friendId)) {
		reply.code(400);
		return { error: 'Request parameters contain invalid characters' };
	}

    const friendId = parseInt(request.params.friendId);
    
    friendRepo.removeFriend(userId, friendId);

    // Notify the friend about the removal
    const friendSocket = socketManager.getSocket(friendId);
    if (friendSocket) {
      friendSocket.emit('friend_removed', {
        from: userId,
        username: request.user.username,
      });
    }

    return { success: true, message: 'Friend removed' };
  });

 
}

module.exports = friendRoutes;