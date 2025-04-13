class FriendRepository {
	constructor(db) {
	  this.db = db;
	}
  
	// Send friend request
	sendRequest(userId, friendId) {
	  return this.db.prepare(`
		INSERT INTO friendships (user_id, friend_id, status)
		VALUES (?, ?, 'pending')
	  `).run(userId, friendId);
	}
  
	// Accept friend request
	acceptRequest(userId, friendId) {
	  return this.db.prepare(`
		UPDATE friendships
		SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
		WHERE friend_id = ? AND user_id = ? AND status = 'pending'
	  `).run(userId, friendId);
	}
  
	// Reject friend request
	rejectRequest(userId, friendId) {
	  return this.db.prepare(`
		UPDATE friendships
		SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
		WHERE friend_id = ? AND user_id = ? AND status = 'pending'
	  `).run(userId, friendId);
	}
  
	// Remove friendship
	removeFriend(userId, friendId) {
	  const stmt1 = this.db.prepare(`
		DELETE FROM friendships
		WHERE user_id = ? AND friend_id = ? AND status = 'accepted'
	  `);
	  
	  const stmt2 = this.db.prepare(`
		DELETE FROM friendships
		WHERE friend_id = ? AND user_id = ? AND status = 'accepted'
	  `);
	  
	  // Use transaction to ensure both directions are removed
	  const removeTransaction = this.db.transaction(() => {
		stmt1.run(userId, friendId);
		stmt2.run(userId, friendId);
	  });
	  
	  return removeTransaction();
	}
  
	// Get all friends for a user
	getFriends(userId) {
	  return this.db.prepare(`
		SELECT u.id, u.username, u.elo_rank, f.created_at as friends_since
		FROM users u
		JOIN friendships f ON f.friend_id = u.id
		WHERE f.user_id = ? AND f.status = 'accepted'
		UNION
		SELECT u.id, u.username, u.elo_rank, f.created_at as friends_since
		FROM users u
		JOIN friendships f ON f.user_id = u.id
		WHERE f.friend_id = ? AND f.status = 'accepted'
	  `).all(userId, userId);
	}
  
	// Get pending friend requests (received)
	getPendingRequests(userId) {
	  return this.db.prepare(`
		SELECT u.id, u.username, f.created_at as requested_at
		FROM users u
		JOIN friendships f ON f.user_id = u.id
		WHERE f.friend_id = ? AND f.status = 'pending'
	  `).all(userId);
	}
  
	// Check if users are friends
	areFriends(userId, friendId) {
	  const result = this.db.prepare(`
		SELECT COUNT(*) as count FROM friendships
		WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
		AND status = 'accepted'
	  `).get(userId, friendId, friendId, userId);
	  
	  return result.count > 0;
	}
  }
  
  module.exports = FriendRepository;