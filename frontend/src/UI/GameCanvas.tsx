import React, { useRef, useEffect, useState } from 'react';
import PasswordModal from './PasswordModal';
import { GameStateManager, GameStates } from '../game/GameStates';
import { StartScreen } from '../game/StartScreen';
import { WALL_THICKNESS, FLOOR_THICKNESS } from '../game/Constants';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation('instructions');
  return (
    <div className="mt-8 w-full max-w-4xl min-w-[600px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-purple-300 shadow-lg">
      <div className="space-y-8">

        {/* Pong Instructions */}
        <div className="bg-white/80 p-6 rounded-lg shadow-md border border-purple-200">
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">🏓{t('pong')}</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>🕹️{t('controls_pong')}</p>
            <p>⚽{t('hit_ball')}</p>
            <p>🏆{t('how_to_win')}</p>
          </div>
        </div>

        {/* Block Battle Instructions */}
        <div className="bg-white/80 p-6 rounded-lg shadow-md border border-purple-200">
          <h2 className="text-[#6B21A8] text-2xl font-bold mb-4 text-center">⚔️{t('block_battle')}</h2>
          <div className="space-y-4 text-[#4B0082] font-medium text-lg">
            <p>🧱 {t('block_battle_desc')}</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>💰 <strong>{t('collect_5_coins')}</strong> {t('before_opponent')}</li>
              <li>💥 <strong>{t('reduce_health')}</strong>.</li>
            </ul>
            <p>🔫 {t('at_start')} <strong>{t('2_weapons')}</strong> {t('to_use')}</p>
            <p>🎮 {t('use_movement')}</p>

            <div className="mt-4">
              <h3 className="text-xl font-semibold text-center">🎮 {t('controls')}</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="font-semibold">{t('player_1')}</span> {t('controls_1')}
                </div>
                <div>
                  <span className="font-semibold">{t('player_2')}</span> {t('controls_2')}
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
	const { t } = useTranslation('game');

	// Password modal state
	const [passwordModalVisible, setPasswordModalVisible] = useState(false);
	const [opponentName, setOpponentName] = useState('');
	const passwordSubmitRef = useRef<(password: string) => void>(() => {});
	const passwordCancelRef = useRef<() => void>(() => {});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		global_stateManager.changeState(new StartScreen(canvas, ctx, t));

		const gameLoop = (timestamp: number) => {
			const deltaTime = (timestamp - prevTimestampRef.current) / 1000;
			prevTimestampRef.current = timestamp;

			global_stateManager.update(deltaTime);

			if (
				global_stateManager.getStateName() === GameStates.START_SCREEN &&
				!global_stateManager.getLoggedInStatus() &&
				isLoggedIn
			) {
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

	// Expose modal trigger to game logic
	useEffect(() => {
		(window as any).showPasswordModal = (
			name: string,
			onSubmit: (password: string) => void,
			onCancel: () => void
		) => {
			setOpponentName(name);
			passwordSubmitRef.current = onSubmit;
			passwordCancelRef.current = onCancel;
			setPasswordModalVisible(true);
		};
	}, []);

	const handlePasswordSubmit = (password: string) => {
		setPasswordModalVisible(false);
		passwordSubmitRef.current(password);
	};

	const handlePasswordCancel = () => {
		setPasswordModalVisible(false);
		passwordCancelRef.current();
	};

	return (
		<div className="pt-8 mb-8 w-full">
			<div className="grid grid-cols-[1fr_auto_1fr] items-start w-full">
				<div />
				<div className="relative">
					<canvas
						ref={canvasRef}
						id="gameCanvas"
						width="1200"
						height="800"
						className="border-2 border-[#FFFFF0] max-w-full max-h-[80vh] bg-black"
					/>

					{/* Password Modal */}
					<PasswordModal
						opponentName={opponentName}
						visible={passwordModalVisible}
						onSubmit={handlePasswordSubmit}
						onCancel={handlePasswordCancel}
					/>

					{/* Instructions Popup */}
					{showInstructions && (
						<div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-10">
							<div className="relative z-20 max-h-[80vh] overflow-y-auto p-2 bg-white shadow-lg">
								<Instructions />
							</div>
						</div>
					)}
				</div>

				{/* Instructions Button */}
				<div className="ml-0 mt-0">
					<button
						onClick={() => setShowInstructions((prev) => !prev)}
						className="buttonsStyle"
					>
						{showInstructions ? t('close_instructions') : t('game_instructions')}
					</button>
				</div>
			</div>
		</div>
	);
};