import React, { useState, useEffect } from 'react';
import { User, UserManager } from "./UserManager";

interface ExtendedUser extends User {
    isFriend: boolean;
    avatarUrl: string;
}

interface PlayerListProps {
    onShowDashboard: () => void;
}
  
export const PlayerList: React.FC<PlayerListProps> = ({ onShowDashboard }) => {
    const [players, setPlayers] = useState<ExtendedUser[]>([]);

    useEffect(() => {
        const fetchedUsers = UserManager.getAllUserData();
        const extendedUsers: ExtendedUser[] = fetchedUsers.map((user) => ({
            ...user,
            isFriend: false, // Initialize friendship status
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`, // Generate avatar
        }));
        setPlayers(extendedUsers);
    }, []);

    const toggleFriend = (username: string) => {
        setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
            player.username === username ? { ...player, isFriend: !player.isFriend } : player
        )
        );
    };

  return (
    <div className="p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-md">
        <h2 className="titles text-[#6B21A8] mb-6 text-2xl">🧑‍🤝‍🧑 All Registered Players</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div
              key={player.username}
              className="flex flex-col items-center p-4 rounded-lg shadow-sm bg-white border border-[#4B0082] hover:scale-[1.02] transition-transform"
            >
              <img
                src={player.avatarUrl}
                alt={`${player.username}'s avatar`}
                className="w-24 h-24 rounded-full mb-4 border-2 border-purple-300 shadow-md"
              />
              <h3 className="font-mono text-lg text-[#4B0082]">{player.username}</h3>
              <p className="texts mb-4">🎮 Wins / Losses: <strong>{player.wins} / {player.losses}</strong></p>
              <p className="texts mb-4">🏆 Ranking Points: <strong>{player.rankingPoint}</strong></p>

              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => toggleFriend(player.username)}
                  className={`px-4 py-2 rounded-md text-white ${
                    player.isFriend ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-700'
                  }`}
                >
                  {player.isFriend ? '✔️ Friend' : '➕ Friend'}
                </button>
                <button
                    onClick={onShowDashboard}
                    className="px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-700 text-white"
                    >
                    More Stats
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
