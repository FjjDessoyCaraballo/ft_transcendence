import React, { useState, useEffect } from 'react';
import { User } from "./UserManager";
import { getAllUsers } from '../services/userService';
import { global_curUser } from './GameCanvas';
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest as acceptRequest,
  rejectFriendRequest,
  removeFriend
} from '../services/friendService';

interface ExtendedUser extends User {
  friendshipStatus: 'none' | 'friend' | 'pending_sent' | 'pending_received';
}

interface PlayerListProps {
  onShowDashboard: () => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({ onShowDashboard }) => {
  const [players, setPlayers] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendBaseUrl = 'https://localhost:3443';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [allUsers, friendsList, pendingRequests] = await Promise.all([
          getAllUsers(),
          getFriends().catch(() => []),
          getPendingRequests().catch(() => [])
        ]);

        console.log('All users:', allUsers);
        console.log('Friends list:', friendsList);
        console.log('Pending requests raw:', pendingRequests);

        const friendIds = new Set(friendsList.map(friend => friend.id));

        // Try logging a sample of what pendingRequests look like
        if (pendingRequests.length > 0) {
          console.log('Sample pending request:', pendingRequests[0]);
        }

        // Check if pendingRequests contains users or user objects inside another object
        let pendingReceivedIds = new Set<number>();
        try {
          pendingReceivedIds = new Set(pendingRequests.map(request => request.id));
        } catch (e) {
          console.error('Error parsing pending request IDs. Structure may be invalid.', e);
        }

        const extendedUsers: ExtendedUser[] = allUsers.map((user) => {
          let status: ExtendedUser['friendshipStatus'] = 'none';

          if (friendIds.has(user.id)) {
            status = 'friend';
          } else if (pendingReceivedIds.has(user.id)) {
            status = 'pending_received';
          }

          return {
            ...user,
            friendshipStatus: status,
          };
        });

        console.log('Extended users:', extendedUsers);

        setPlayers(extendedUsers);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load players. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendFriendRequest = async (userId: number) => {
    console.log('Sending friend request to userId:', userId);
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
      setError('Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptFriendRequest = async (userId: number) => {
    console.log('Accepting friend request from userId:', userId);
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
      setError('Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectFriendRequest = async (userId: number) => {
    console.log('Rejecting friend request from userId:', userId);
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
      setError('Failed to reject friend request. Please try again.');
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    console.log('Removing friend userId:', userId);
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
      setError('Failed to remove friend. Please try again.');
    }
  };

  const getFriendActionButton = (player: ExtendedUser) => {
    const isLoggedInUser = player.username === global_curUser;

    if (isLoggedInUser) return null;

    switch (player.friendshipStatus) {
      case 'friend':
        return (
          <button
            onClick={() => handleRemoveFriend(player.id)}
            className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
          >
            ✖️ Remove Friend
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
            className="px-4 py-2 rounded-md bg-yellow-500 text-white cursor-not-allowed"
          >
            ⏳ Request Sent
          </button>
        );
      default:
        return (
          <button
            onClick={() => handleSendFriendRequest(player.id)}
            className="px-4 py-2 rounded-md bg-purple-500 hover:bg-purple-700 text-white"
          >
            ➕ Add Friend
          </button>
        );
    }
  };

  const pendingRequests = players.filter(player => player.friendshipStatus === 'pending_received');
  const nonPendingPlayers = players.filter(player => player.friendshipStatus !== 'pending_received');

  console.log('Pending requests filtered for top section:', pendingRequests);

  if (isLoading) {
    return <div className="p-6 w-full flex justify-center">Loading players...</div>;
  }

  if (error) {
    return <div className="p-6 w-full flex justify-center text-red-500">{error}</div>;
  }

  return (
    <>
      {pendingRequests.length > 0 && (
        <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 p-6 rounded-xl border border-yellow-300 bg-yellow-50 shadow-md">
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

      <div className="p-6 w-full flex flex-col items-center">
        <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-md">
          <h2 className="titles text-[#6B21A8] mb-6 text-2xl">🧑‍🤝‍🧑 Hi {global_curUser}! Welcome to the Player Hub!</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...nonPendingPlayers]
            .sort((a, b) => (a.username === global_curUser ? -1 : b.username === global_curUser ? 1 : 0))
            .map((player) => {

              const isLoggedInUser = player.username === global_curUser;

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
                    className="w-32 object-contain mb-4"
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
                        onClick={onShowDashboard}
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
