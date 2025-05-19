import React, { useState, useEffect } from 'react';
import { User } from "./UserManager";
import { getAllUsers } from '../services/userService';

interface ExtendedUser extends User {
  friendshipStatus: 'none' | 'pending' | 'accepted';
  //avatarUrl: string;
}

interface PlayerListProps {
    onShowDashboard: () => void;
}
  
export const PlayerList: React.FC<PlayerListProps> = ({ onShowDashboard }) => {
    const [players, setPlayers] = useState<ExtendedUser[]>([]);

    useEffect(() => {
    const fetchPlayers = async () => {
        try {
            const fetchedUsers = await getAllUsers();

            const extendedUsers: ExtendedUser[] = fetchedUsers.map((user) => ({
                ...user,
                friendshipStatus: 'none',
                //avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`,
            }));

            setPlayers(extendedUsers);
        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
     };

      fetchPlayers();
    }, []);

    const toggleFriend = (username: string) => {
      setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
              player.username === username
                  ? {
                        ...player,
                        friendshipStatus:
                            player.friendshipStatus === 'none'
                                ? 'pending'
                                : player.friendshipStatus === 'pending'
                                ? 'accepted'
                                : 'none',
                    }
                  : player
          )
      );
    };

    const acceptFriendRequest = (username: string) => {
      setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
              player.username === username
                  ? { ...player, friendshipStatus: 'accepted' }
                  : player
          )
      );
    };
  

    const loggedInUserString = typeof window !== 'undefined' ? localStorage.getItem('LoggedIn') : null;
    const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : null;
    const pendingRequests = players.filter(player => player.friendshipStatus === 'pending');


    return (
      <>
        {pendingRequests.length > 0 && (
          <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 p-6 rounded-xl border border-yellow-300 bg-yellow-50 shadow-md">
            <h2 className="titles text-yellow-700 mb-4 text-xl">📬 Friend Requests</h2>
            <div className="flex flex-wrap gap-4">
              {pendingRequests.map((player) => (
                <div key={player.username} className="flex items-center gap-4 p-3 bg-white border border-yellow-300 rounded-lg shadow-sm">
                  <img
                    src={player.avatar_url}
                    alt={`${player.username}'s avatar`}
                    className="w-12 h-12 rounded-full border-2 border-yellow-300 shadow-md"
                  />
                  <span className="font-mono text-md text-yellow-800">{player.username}</span>
                  <button
                    onClick={() => acceptFriendRequest(player.username)}
                    className="ml-auto px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
    
        <div className="p-6 w-full flex flex-col items-center">
          <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-md">
            <h2 className="titles text-[#6B21A8] mb-6 text-2xl">🧑‍🤝‍🧑 Hi {loggedInUser}! Welcome to the Player Hub!</h2>
    
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => {
                const isLoggedInUser = player.username === loggedInUser;
    
                return (
                  <div
                    key={player.username}
                    className={`flex flex-col items-center p-4 rounded-lg shadow-sm hover:scale-[1.02] transition-transform ${
                      isLoggedInUser 
                        ? 'bg-gradient-to-br from-purple-100 via-white to-purple-50 border-2 border-indigo-500 shadow-lg shadow-indigo-300'
                        : 'bg-white border border-[#4B0082]'
                    }`}
                  >
                    <img
                      src={player.avatar_url}
                      alt={`${player.username}'s avatar`}
                      className="w-24 h-24 rounded-full mb-4 border-2 border-purple-300 shadow-md"
                    />
                    <h3 className="font-mono text-xl text-[#4B0082] font-bold">
                      {isLoggedInUser ? 'You' : player.username}
                    </h3>
                    <p className="texts mb-4 text-sm">🏓 Pong games played: <strong>{player.games_played_pong}</strong></p>
                    <p className="texts mb-4 text-sm">🟩 Block Battle games played: <strong>{player.games_played_blockbattle}</strong></p>
    
                    <div className="flex gap-2 mt-auto">
                      {!isLoggedInUser && (
                        <button
                          onClick={() => toggleFriend(player.username)}
                          className={`px-4 py-2 rounded-md text-white ${
                            player.friendshipStatus === 'accepted'
                              ? 'bg-green-500 hover:bg-green-600'
                              : player.friendshipStatus === 'pending'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-purple-500 hover:bg-purple-700'
                          }`}
                        >
                          {player.friendshipStatus === 'accepted'
                            ? '✔️ Friend'
                            : player.friendshipStatus === 'pending'
                            ? '⏳ Pending'
                            : '➕ Friend'}
                        </button>
                      )}
                      <button
                        onClick={onShowDashboard}
                        className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-700 text-white"
                      >
                        More Stats
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  }