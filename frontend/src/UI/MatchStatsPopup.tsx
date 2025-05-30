// MatchStatsPopup.tsx
import React from 'react';
import { MatchData } from './UserManager';
import { useTranslation } from 'react-i18next';

interface MatchStatsPopupProps {
  match: MatchData;
  onClose: () => void;
}

const MatchStatsPopup: React.FC<MatchStatsPopupProps> = ({ match, onClose }) => {
  const { t } = useTranslation('dashboard');
  const isWinner = match.winner_id === 0;  // Assuming user ID is 0 for the test user

  // For Pong match
  const pongStats = match.game_data && 'longest_rally' in match.game_data ? (
	<div className="bg-purple-100 p-4 rounded-lg shadow-sm">      
		<p><strong>{t('longest_rally')}</strong> {match.game_data.longest_rally}s 🏓</p>
		<p><strong>{t('average_rally')}</strong>  {match.game_data.avg_rally}s 🏓</p>
		<p><strong>{t('player')} 1 {t('points')}:</strong>  {match.game_data.player1_points} 🏓</p>
		<p><strong>{t('player')} 2 {t('points')}:</strong>  {match.game_data.player2_points} 🏓</p>
    </div>
  ) : null;

  // For Blockbattle match
  const bbStats = match.game_data && 'win_method' in match.game_data ? (
    <div className="flex space-x-12">
      {/* Player 1 Column */}
      <div className="flex flex-col w-1/2 space-y-4">
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm">
          <h4 className="font-bold text-lg text-purple-700">{t('player')} 1 {t('info')}</h4>
          <p><strong>{t('weapon')} 1:</strong> {match.game_data.player1_weapon1} ⚔️</p>
          <p><strong>{t('weapon')} 2:</strong> {match.game_data.player1_weapon2} 🛡️</p>
          <p><strong>{t('damage_done')}</strong> {match.game_data.player1_damage_done} 💥</p>
          <p><strong>{t('damage_taken')}</strong> {match.game_data.player1_damage_taken} ⚡</p>
          <p><strong>{t('coins_collected')}</strong> {match.game_data.player1_coins_collected} 🪙</p>
        </div>
      </div>

      {/* Player 2 Column */}
      <div className="flex flex-col w-1/2 space-y-4">
        <div className="bg-purple-100 p-4 rounded-lg shadow-sm">
          <h4 className="font-bold text-lg text-purple-700">{t('player')} 2 {t('info')}</h4>
          <p><strong>{t('weapon')} 1:</strong> {match.game_data.player2_weapon1} ⚔️</p>
          <p><strong>{t('weapon')} 2:</strong> {match.game_data.player2_weapon2} 🛡️</p>
          <p><strong>{t('damage_done')}</strong> {match.game_data.player2_damage_done} 💥</p>
          <p><strong>{t('damage_taken')}</strong> {match.game_data.player2_damage_taken} ⚡</p>
          <p><strong>{t('coins_collected')}</strong> {match.game_data.player2_coins_collected} 🪙</p>
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
				<h2 className="text-2xl font-semibold text-purple-700">{t('match_details')}</h2>
				<div className="flex justify-center space-x-6 text-black">
				<p><strong>{t('game_type')}</strong><br/> {match.game_type.toUpperCase()} 🎮</p>
				<p><strong>{t('match_date')}</strong><br/> {new Date(match.date).toLocaleDateString()} 📅</p>
				<p><strong>{t('duration')}</strong><br/> {match.game_duration}s ⏱</p>
				{'win_method' in match.game_data && (
					<p><strong>{t('win_method')}</strong><br/> {match.game_data.win_method} 🏆</p>
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
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};


export default MatchStatsPopup;
