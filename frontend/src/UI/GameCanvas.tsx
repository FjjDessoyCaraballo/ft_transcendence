import React, { useRef, useEffect } from 'react';
import { GameStateManager, GameStates } from '../game/GameStates';
import { StartScreen } from '../game/StartScreen';
import { WALL_THICKNESS, FLOOR_THICKNESS } from '../game/Constants';
import { User } from './UserManager';
import { useTranslation } from 'react-i18next';

// GLOBAL GAME VARIABLES
export let global_curUser: string | null = null;
export function updateCurUser(newUser: string | null) {
  global_curUser = newUser;
}

export let global_allUserDataArr: User[] = [];
export function updateAllUserDataArr(newData: User[]) {
  global_allUserDataArr = newData;
}

// JUST A TEST until localHost is completely removed
if (localStorage.getItem('logged-in') === 'true' && global_curUser === null)
	localStorage.setItem('logged-in', 'false');

export const global_stateManager = new GameStateManager();

export const global_gameArea = {
			minX: WALL_THICKNESS,
			maxX: 1200 - WALL_THICKNESS,
			maxY: 800 - FLOOR_THICKNESS
		};


// COMPONENT
export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevTimestampRef = useRef<number>(0);
  const { t } = useTranslation();


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start screen
    global_stateManager.changeState(new StartScreen(canvas, ctx, t));

    const gameLoop = (timestamp: number) => {
      const deltaTime = (timestamp - prevTimestampRef.current) / 1000;
      prevTimestampRef.current = timestamp;

      if (!global_curUser && global_stateManager.getStateName() !== GameStates.START_SCREEN) {
        global_stateManager.changeState(new StartScreen(canvas, ctx, t));
      }

      global_stateManager.update(deltaTime);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      global_stateManager.render(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    let animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId); // ✅ cleanup

  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="gameCanvas"
      width="1200"
      height="800"
    />
  );
};
