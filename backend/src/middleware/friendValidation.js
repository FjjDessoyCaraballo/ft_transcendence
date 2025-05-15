const FriendRepository = require('../repositories/friendRepository');

async function validateFriendship(request, reply) {
  const userId = request.user.id;
  const friendId = parseInt(request.params.friendId);

  const friendRepo = new FriendRepository(request.server.db);

  if (!friendRepo.areFriends(userId, friendId)) {
    reply.code(403);
    return { error: 'You are not friends with this user' };
  }
}

module.exports = { validateFriendship };