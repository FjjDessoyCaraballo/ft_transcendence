import React, { useRef, useEffect, useState } from 'react';
import { GameStateManager, GameStates } from '../game/GameStates';
import { StartScreen } from '../game/StartScreen';
import { WALL_THICKNESS, FLOOR_THICKNESS } from '../game/Constants';
import { User } from './UserManager';

export const global_stateManager = new GameStateManager();

export const global_gameArea = {
  minX: WALL_THICKNESS,
  maxX: 1200 - WALL_THICKNESS,
  maxY: 800 - FLOOR_THICKNESS,
};

interface GameCanvasProps {
  onCanvasLogOut: () => void;
  isLoggedIn: boolean;
}

// Instructions popup component
const Instructions: React.FC = () => {
  return (
    <div className="mt-8 w-full max-w-4xl min-w-[600px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-purple-300 shadow-lg">
      <div className="space-y-8">
        {/* Pong Instructions */}
        <div>
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">🏓 Pong Instructions</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>🕹️ Use Q / A (Player 1) or O / K (Player 2) to move your paddle up and down.</p>
            <p>⚽ Hit the ball past your opponent’s paddle to earn a point.</p>
            <p>🏆 First to 5 points wins the game!</p>
          </div>
        </div>

        {/* Block Battle Instructions */}
        <div>
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">⚔️ Block Battle Instructions</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>🧱 Block Battle is a 1v1 platform combat game with two paths to victory:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>💰 <strong>Collect 5 coins</strong> before your opponent.</li>
              <li>💥 <strong>Reduce your opponent's health to 0</strong>.</li>
            </ul>
            <p>🔫 At the start of each match, choose <strong>2 weapons</strong> to use in battle.</p>
            <p>🎮 Use movement, jumping, shooting, and weapon switching to outplay your opponent.</p>

            <div className="mt-4">
              <h3 className="text-xl font-semibold text-center">🎮 Controls</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="font-semibold">Player 1:</span> W (Jump), A (Left), D (Right), E (Fire), S (Switch Weapon)
                </div>
                <div>
                  <span className="font-semibold">Player 2:</span> I (Jump), J (Left), L (Right), U (Fire), K (Switch Weapon)
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// COMPONENT
export const GameCanvas: React.FC<GameCanvasProps> = ({ isLoggedIn, onCanvasLogOut }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevTimestampRef = useRef<number>(0);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    global_stateManager.changeState(new StartScreen(canvas, ctx));

    const gameLoop = (timestamp: number) => {
      const deltaTime = (timestamp - prevTimestampRef.current) / 1000;
      prevTimestampRef.current = timestamp;

      global_stateManager.update(deltaTime);

      if (
        global_stateManager.getStateName() === GameStates.START_SCREEN &&
        !global_stateManager.getLoggedInStatus() &&
        isLoggedIn
      ) {
        console.log('Game loop onStartScreenLoginFail');
        onCanvasLogOut();
        global_stateManager.setLoggedInStatus(true);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      global_stateManager.render(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    let animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoggedIn]);

  return (
  <div className="pt-8 mb-8 w-full">
    <div className="grid grid-cols-[1fr_auto_1fr] items-start w-full">
      {/* Left spacer */}
      <div />

      {/* Centered Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          id="gameCanvas"
          width="1200"
          height="800"
          className="border-2 border-[#FFFFF0] max-w-full max-h-[80vh] bg-black"
        />

        {/* Popup Overlay */}
        {showInstructions && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-10">
            <div className="relative z-20 max-h-[80vh] overflow-y-auto p-2 bg-white shadow-lg">
				<Instructions />
				<button
					onClick={() => setShowInstructions(false)}
					className="absolute top-2 right-2 text-purple-800 font-bold text-xl bg-white rounded-full px-3 py-1 shadow hover:bg-purple-100"
				>
					✖
				</button>
			</div>
          </div>
        )}
    </div>

      {/* Instructions Button */}
      <div className="ml-4 mt-2">
        <button
		onClick={() => setShowInstructions(prev => !prev)}
		className="buttonsStyle"
		>
			{showInstructions ? 'Close Instructions' : 'Game Instructions'}
		</button>
      </div>
    </div>
  </div>
);

};

