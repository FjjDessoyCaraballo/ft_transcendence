import React, { useRef, useEffect } from 'react';
import { GameStateManager, GameStates } from '../game/GameStates';
import { StartScreen } from '../game/StartScreen';
import { WALL_THICKNESS, FLOOR_THICKNESS } from '../game/Constants';
import { User } from './UserManager';

export const global_stateManager = new GameStateManager();

// Maybe move this inside classes...?
export const global_gameArea = {
			minX: WALL_THICKNESS,
			maxX: 1200 - WALL_THICKNESS,
			maxY: 800 - FLOOR_THICKNESS
		};


interface GameCanvasProps {
  isLoggedIn: boolean;
}


// COMPONENT
export const GameCanvas: React.FC<GameCanvasProps> = ({ isLoggedIn }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevTimestampRef = useRef<number>(0);

  console.log('GameCanvas isLoggedIn: ', isLoggedIn);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start screen
    global_stateManager.changeState(new StartScreen(canvas, ctx));

    const gameLoop = (timestamp: number) => {
      const deltaTime = (timestamp - prevTimestampRef.current) / 1000;
      prevTimestampRef.current = timestamp;

      global_stateManager.update(deltaTime);

	  if (global_stateManager.getStateName() === GameStates.START_SCREEN 
	  && !global_stateManager.getLoggedInStatus() && isLoggedIn)
	  {
		console.log('Game loop onStartScreenLoginFail');
	//	onStartScreenLoginFail();
		global_stateManager.setLoggedInStatus(true); // Seems counter intuitive, but prevents unnecessary extra runs of this error handling in the future =)
	  }


      ctx.clearRect(0, 0, canvas.width, canvas.height);
      global_stateManager.render(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    let animationFrameId = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationFrameId); // ✅ cleanup

  }, [isLoggedIn]);

  return (
	<div className="pt-8 mb-8 flex justify-center">
		<canvas
			ref={canvasRef}
			id="gameCanvas"
			width="1200"
			height="800"
			className="border-2 border-[#FFFFF0] max-w-full max-h-[80vh] bg-black"
		/>
	</div>

  );
};
