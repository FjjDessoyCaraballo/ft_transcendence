const { validateFriendship } = require('../middleware/friendValidation');

fastify.post('/invite/:friendId', { preHandler: [authenticate, validateFriendship] }, async (request, reply) => {
  const userId = request.user.id;
  const friendId = parseInt(request.params.friendId);

  // Emit game invitation
  const friendSocket = fastify.io.sockets.get(friendId);
  if (friendSocket) {
    friendSocket.emit('game_invitation', {
      from: userId,
      username: request.user.username,
    });
    return { success: true, message: 'Game invitation sent' };
  }

  reply.code(404);
  return { error: 'User is not online' };
});