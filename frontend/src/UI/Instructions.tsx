import React from 'react';

export const Instructions: React.FC = () => {
  return (
    <div className="w-full max-w-4xl min-w-[600px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-purple-300 shadow-lg">
      <div className="space-y-8">

        <div>
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">🏓 Pong Instructions</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>🕹️ Use Q / A (Player 1) or O / K (Player 2) to move your paddle up and down.</p>
            <p>⚽ Hit the ball past your opponent’s paddle to earn a point.</p>
            <p>🏆 First to 5 points wins the game!</p>
          </div>
        </div>

        <div>
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">🟩 Block Battle Instructions</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>To be continued!</p>
          </div>
        </div>

      </div>
    </div>
  );
};
