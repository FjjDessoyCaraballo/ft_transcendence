import { apiRequest } from './Api';
import { User } from '../UI/UserManager';

interface FriendResponse {
  success: boolean;
  message: string;
}

interface FriendRequestResponse {
  from: number;
  username: string;
}

/**
 * Get all friends of the current user.
 */
export const getFriends = async (): Promise<User[]> => {
  try {
    console.log('GET FRIENDS');
    const response = await apiRequest('/friends');
    return response.friends;
  } catch (error) {
    throw new Error('Failed to fetch friends list.');
  }
};

/**
 * Get pending friend requests.
 */
export const getPendingRequests = async (): Promise<User[]> => {
  try {
    console.log('GET PENDING REQUESTS');
    const response = await apiRequest('/friends/requests');
    return response.requests;
  } catch (error) {
    throw new Error('Failed to fetch pending friend requests.');
  }
};

/**
 * Get friend requests sent by the current user (pending).
 */
export const getSentRequests = async (): Promise<User[]> => {
  try {
    console.log('GET SENT FRIEND REQUESTS');
    const response = await apiRequest('/friends/sent-requests');
    return response.sentRequests;
  } catch (error) {
    throw new Error('Failed to fetch sent friend requests.');
  }
};


/**
 * Send a friend request to another user.
 * 
 * @param friendId The ID of the user to send a request to.
 */
export const sendFriendRequest = async (friendId: number): Promise<FriendResponse> => {
  try {
    console.log('SEND FRIEND REQUEST');
    return await apiRequest(`/friends/request/${friendId}`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId: friendId })
    });
  } catch (error) {
    throw new Error('Failed to send friend request.');
  }
};

/**
 * Accept a pending friend request.
 * 
 * @param friendId The ID of the user whose request you are accepting.
 */
export const acceptFriendRequest = async (friendId: number): Promise<FriendResponse> => {
  try {
    console.log('ACCEPT FRIEND REQUEST');
    return await apiRequest(`/friends/accept/${friendId}`, {
      method: 'PUT',
      body: JSON.stringify({ targetUserId: friendId })
    });
  } catch (error) {
    throw new Error('Failed to accept friend request.');
  }
};

/**
 * Reject a pending friend request.
 * 
 * @param friendId The ID of the user whose request you are rejecting.
 */
export const rejectFriendRequest = async (friendId: number): Promise<FriendResponse> => {
  try {
    console.log('REJECT FRIEND REQUEST');
    return await apiRequest(`/friends/reject/${friendId}`, {
      method: 'PUT',
      body: JSON.stringify({ targetUserId: friendId })
    });
  } catch (error) {
    throw new Error('Failed to reject friend request.');
  }
};

/**
 * Remove a friend from the current user's friends list.
 * 
 * @param friendId The ID of the friend to remove.
 */
export const removeFriend = async (friendId: number): Promise<FriendResponse> => {
  try {
    console.log('REMOVE FRIEND');
    return await apiRequest(`/friends/${friendId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    throw new Error('Failed to remove friend.');
  }
};


// //DO WE NEED THESE?
// /**
//  * Search for users to add as friends.
//  * 
//  * @param query The username search query.
//  */
// export const searchUsers = async (query: string): Promise<User[]> => {
//   if (query.length < 3) {
//     throw new Error('Search query must be at least 3 characters long.');
//   }

//   try {
//     const response = await apiRequest(`/friends/search?q=${encodeURIComponent(query)}`);
//     return response.users;
//   } catch (error) {
//     throw new Error('Failed to search for users.');
//   }
// };

// /**
//  * Get all online friends of the current user.
//  */
// export const getOnlineFriends = async (): Promise<User[]> => {
//   try {
//     const response = await apiRequest('/friends/online');
//     return response.onlineFriends;
//   } catch (error) {
//     throw new Error('Failed to fetch online friends.');
//   }
// };
