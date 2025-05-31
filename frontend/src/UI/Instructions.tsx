import React from 'react';
import { useTranslation } from 'react-i18next';

export const Instructions: React.FC = () => {
  const { t } = useTranslation('instructions');
  return (
    <div className="mt-8 w-full max-w-4xl min-w-[600px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-purple-300 shadow-lg">
      <div className="space-y-8">

        <div>
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">🏓{t('pong')}</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>🕹️{t('controls')}</p>
            <p>⚽{t('hit_ball')}</p>
            <p>🏆{t('how_to_win')}</p>
          </div>
        </div>

        <div>
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">🟩{t('block_battle')}</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>To be continued!</p>
          </div>
        </div>

      </div>
    </div>
  );
};
