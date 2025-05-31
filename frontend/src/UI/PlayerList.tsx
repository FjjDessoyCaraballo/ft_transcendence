import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from "./UserManager";
import { getAllUsers, getLoggedInUserData } from '../services/userService';
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest as acceptRequest,
  rejectFriendRequest,
  removeFriend
} from '../services/friendService';

// Extend the User interface with friendshipStatus for UI logic
interface ExtendedUser extends User {
  friendshipStatus: 'none' | 'friend' | 'pending_sent' | 'pending_received';
}

interface PlayerListProp {
  isLoggedIn: boolean;
}


export const PlayerList: React.FC<PlayerListProp> = ( {isLoggedIn} ) => {
  // State to store the list of players, loading state, and error messages
  const [players, setPlayers] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggedInUserData, setLoggedInUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // URL base for fetching user avatars
  const backendBaseUrl = 'https://localhost:3443';

  // Fetch all user data and friendship statuses
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // API requests for users and friendship data
        const [allUsers, friendsList, pendingRequests, sentRequests] = await Promise.all([
          getAllUsers(),
          getFriends().catch(() => []),              // Get accepted friends
          getPendingRequests().catch(() => []),      // Get friend requests received
          getSentRequests().catch(() => [])          // Get friend requests sent
        ]);

		// Get loggedInUser

		const newLoggedInUserData = await getLoggedInUserData();
		setLoggedInUser(newLoggedInUserData);

        // Create sets of user IDs for fast lookup
        const friendIds = new Set(friendsList.map(friend => friend.id));
        const pendingReceivedIds = new Set(pendingRequests.map(request => request.id));
        const pendingSentIds = new Set(sentRequests.map(request => request.id));

        // Add friendship status to users
        const extendedUsers: ExtendedUser[] = allUsers.map((user) => {
          let status: ExtendedUser['friendshipStatus'] = 'none';

          if (friendIds.has(user.id)) {
            status = 'friend';
          } else if (pendingReceivedIds.has(user.id)) {
            status = 'pending_received';
          } else if (pendingSentIds.has(user.id)) {
            status = 'pending_sent';
          }

          return {
            ...user,
            friendshipStatus: status,
          };
        });

        setPlayers(extendedUsers); // Update state
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load players.');
		setLoggedInUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  // Handle sending a friend request
  const handleSendFriendRequest = async (userId: number) => {
    try {
      await sendFriendRequest(userId);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === userId
            ? { ...player, friendshipStatus: 'pending_sent' }
            : player
        )
      );
    } catch (error) {
      console.error('Failed to send friend request:', error);
      setError('Failed to send friend request.');
    }
  };

  // Accept an incoming friend request
  const handleAcceptFriendRequest = async (userId: number) => {
    try {
      await acceptRequest(userId);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === userId
            ? { ...player, friendshipStatus: 'friend' }
            : player
        )
      );
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      setError('Failed to accept friend request.');
    }
  };

  // Reject an incoming friend request
  const handleRejectFriendRequest = async (userId: number) => {
    try {
      await rejectFriendRequest(userId);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === userId
            ? { ...player, friendshipStatus: 'none' }
            : player
        )
      );
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      setError('Failed to reject friend request.');
    }
  };

  // Remove an existing friend
  const handleRemoveFriend = async (userId: number) => {
    try {
      await removeFriend(userId);
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player.id === userId
            ? { ...player, friendshipStatus: 'none' }
            : player
        )
      );
    } catch (error) {
      console.error('Failed to remove friend:', error);
      setError('Failed to remove friend.');
    }
  };

  // Renders the appropriate button based on the friendship status
  const getFriendActionButton = (player: ExtendedUser) => {
    const isLoggedInUser = player.username === loggedInUserData?.username;

    if (isLoggedInUser) return null;

    switch (player.friendshipStatus) {
      case 'friend':
        return (
          <button
            onClick={() => handleRemoveFriend(player.id)}
            className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
          >
            ✖️ Unfriend
          </button>
        );
      case 'pending_received':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAcceptFriendRequest(player.id)}
              className="px-3 py-2 rounded-md bg-green-500 hover:bg-green-600 text-white"
            >
              ✅ Accept
            </button>
            <button
              onClick={() => handleRejectFriendRequest(player.id)}
              className="px-3 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
            >
              ❌ Reject
            </button>
          </div>
        );
      case 'pending_sent':
        return (
          <button
            disabled
            className="px-4 py-2 min-w-max whitespace-nowrap rounded-md bg-yellow-500 text-white cursor-not-allowed"
          >
            ⏳ Request Sent
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleSendFriendRequest(player.id)}
            className="px-4 py-2 min-w-max whitespace-nowrap rounded-md bg-purple-500 hover:bg-purple-700 text-white"
          >
            ➕ Add Friend
          </button>
        );
    }
  };

  // Separate friend requests from the rest of the list
  const pendingRequests = players.filter(player => player.friendshipStatus === 'pending_received');
  const nonPendingPlayers = players.filter(player => player.friendshipStatus !== 'pending_received');

  // Show loading state
  if (isLoading) {
    return (
		<div className="max-w-screen-xl mx-auto my-6 p-4 bg-[#F3E8FF] border border-[#6B21A8] rounded-lg shadow-md text-[#6B21A8] font-mono font-bold text-center text-lg">
			Loading players...
		</div>	) 
  }

  // Show error if any occurred
  if (error) {
    return (
		<div className="max-w-screen-xl mx-auto my-6 p-4 bg-[#F3E8FF] border border-[#6B21A8] rounded-lg shadow-md text-[#6B21A8] font-mono font-bold text-center text-lg">
			{error} <br/> This might be because of connection issues, so please log out and try to log in again!
		</div>
	)
  }

  // Main component return
  return (
    <>
      {/* Display pending friend requests if any */}
      {pendingRequests.length > 0 && (
        <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 mt-8 p-6 rounded-xl border border-yellow-300 bg-yellow-50 shadow-md">
          <h2 className="titles text-yellow-700 mb-4 text-xl">📬 Friend Requests</h2>
          <div className="flex flex-wrap gap-4">
            {pendingRequests.map((player) => (
              <div key={player.id} className="flex items-center gap-4 p-3 bg-white border border-yellow-300 rounded-lg shadow-sm">
                <img
                  src={`${backendBaseUrl}${player.avatar_url}`}
                  alt={`${player.username}'s avatar`}
                  className="w-16 h-auto object-contain"
                />
                <span className="font-mono text-md text-yellow-800">{player.username}</span>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => handleAcceptFriendRequest(player.id)}
                    className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectFriendRequest(player.id)}
                    className="px-3 py-1 rounded-md bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display all players (excluding pending requests) */}
      <div className="p-6 w-full flex flex-col items-center">
        <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-md">
          <h2 className="titles text-[#6B21A8] mb-6 text-2xl">🧑‍🤝‍🧑 Hi {loggedInUserData?.username}! Welcome to the Player Hub!</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...nonPendingPlayers]
              .sort((a, b) => (a.username === loggedInUserData?.username ? -1 : b.username === loggedInUserData?.username ? 1 : 0))
              .map((player) => {
                const isLoggedInUser = player.username === loggedInUserData?.username;

                return (
                  <div
                    key={player.id}
                    className={`flex flex-col items-center p-4 rounded-lg shadow-sm hover:scale-[1.02] transition-transform ${
                      isLoggedInUser
                        ? 'bg-gradient-to-br from-purple-100 via-white to-purple-50 border-2 border-indigo-500 shadow-lg shadow-indigo-300'
                        : player.friendshipStatus === 'friend'
                        ? 'bg-gradient-to-br from-green-50 via-white to-green-50 border border-green-300'
                        : 'bg-white border border-[#4B0082]'
                    }`}
                  >
                    <img
                      src={`${backendBaseUrl}${player.avatar_url}`}
                      alt={`${player.username}'s avatar`}
                      className="w-24 h-24 object-contain rounded-full bg-white border border-gray-300 p-1"
                    />
                    <h3 className="font-mono text-xl text-[#4B0082] font-bold">
                      {isLoggedInUser ? 'You' : player.username}
                      {player.friendshipStatus === 'friend' && ' 👥'}
                    </h3>
                    <p className="texts mb-4 text-sm">🏓 Pong games played: <strong>{player.games_played_pong}</strong></p>
                    <p className="texts mb-4 text-sm">🟩 Block Battle games played: <strong>{player.games_played_blockbattle}</strong></p>

                    <div className="flex gap-2 mt-auto">
                      {getFriendActionButton(player)}
                      {(isLoggedInUser || player.friendshipStatus === 'friend') && (
                        <button
                          onClick={() => navigate(`/dashboard/${player.username}`)}
                          className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-700 text-white"
                        >
                          More Stats
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};
