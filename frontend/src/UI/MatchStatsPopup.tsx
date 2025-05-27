// MatchStatsPopup.tsx
import React from 'react';
import { MatchData } from './UserManager';

// Dynamic emoji assignment
const weaponEmojiMap: Record<string, string> = {
  Pistol: '🔫',
  Bazooka: '🚀',
  'Land Mine': '💣'
};

function getWeaponEmoji(weapon: string): string {
  return weaponEmojiMap[weapon] || '❓';
}

// React prop info
interface MatchStatsPopupProps {
  match: MatchData;
  onClose: () => void;
}

const MatchStatsPopup: React.FC<MatchStatsPopupProps> = ({ match, onClose }) => {

  // For Pong match
  const pongStats = match.game_data && 'longest_rally' in match.game_data ? (
	<div className="bg-purple-100 p-4 rounded-lg shadow-sm">      
		<p><strong>Longest Rally:</strong> {match.game_data.longest_rally}s 🏓</p>
		<p><strong>Average Rally:</strong>  {match.game_data.avg_rally.toFixed(2)}s 🏓</p>
		<p><strong>Player 1 Points:</strong>  {match.game_data.player1_points} 🏓</p>
		<p><strong>Player 2 Points:</strong>  {match.game_data.player2_points} 🏓</p>
    </div>
  ) : null;

  // For Blockbattle match
  const bbStats = match.game_data && 'win_method' in match.game_data ? (
    <div className="flex space-x-12">
      {/* Player 1 Column */}
      <div className="flex flex-col w-1/2 space-y-4">
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm">
          <h4 className="font-bold text-lg text-purple-700">{match.player1_name}</h4>
          <p><strong>Weapon 1:</strong> {match.game_data.player1_weapon1} {getWeaponEmoji(match.game_data.player1_weapon1)}</p>
          <p><strong>Weapon 2:</strong> {match.game_data.player1_weapon2} {getWeaponEmoji(match.game_data.player1_weapon2)}</p>
          <p><strong>Damage Done:</strong> {match.game_data.player1_damage_done} 💥</p>
          <p><strong>Damage Taken:</strong> {match.game_data.player1_damage_taken} ⚡</p>
          <p><strong>Coins Collected:</strong> {match.game_data.player1_coins_collected} 🪙</p>
        </div>
      </div>

      {/* Player 2 Column */}
      <div className="flex flex-col w-1/2 space-y-4">
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm">
          <h4 className="font-bold text-lg text-purple-700">{match.player2_name}</h4>
          <p><strong>Weapon 1:</strong> {match.game_data.player2_weapon1} {getWeaponEmoji(match.game_data.player2_weapon1)}</p>
          <p><strong>Weapon 2:</strong> {match.game_data.player2_weapon2} {getWeaponEmoji(match.game_data.player2_weapon2)}</p>
          <p><strong>Damage Done:</strong> {match.game_data.player2_damage_done} 💥</p>
          <p><strong>Damage Taken:</strong> {match.game_data.player2_damage_taken} ⚡</p>
          <p><strong>Coins Collected:</strong> {match.game_data.player2_coins_collected} 🪙</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        {/* Header with Game Type, Match Date, Duration, and Win Method */}
        <div className="flex flex-col items-center mb-6">
			<div className="flex flex-col text-center space-y-1 bg-purple-200 p-4 rounded-lg shadow-sm">
				<h2 className="text-2xl font-semibold text-purple-700">Match Details</h2>
				<div className="flex justify-center space-x-6 text-black">
				<p><strong>Game Type:</strong><br/> {match.game_type.toUpperCase()} 🎮</p>
				<p><strong>Match Date:</strong><br/> {new Date(match.date).toLocaleDateString()} 📅</p>
				<p><strong>Duration:</strong><br/> {match.game_duration.toFixed(2)}s ⏱</p>
				{'win_method' in match.game_data && (
					<p><strong>Win Method:</strong><br/> {match.game_data.win_method} 🏆</p>
				)}           
				</div>
			</div>
        </div>

        {/* BlockBattle Stats - Player 1 vs Player 2 */}
		{pongStats}
        {bbStats}

        {/* Close Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default MatchStatsPopup;
