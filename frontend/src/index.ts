import { GameStateManager } from './GameStates.js'; 
import { StartScreen } from './StartScreen.js';
import { setupLogin } from './TEST_logIn_register.js';

const canvas: HTMLCanvasElement = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
export const stateManager = new GameStateManager();

export let curUser: string | null = null;
export function updateCurUser(newUser: string | null) { curUser = newUser; }

let prevTimeStamp = 0;

export { canvas }; // To ensure correct init order
export { ctx }; // To ensure correct init order

stateManager.changeState(new StartScreen(canvas));
setupLogin();


function updateGame(deltaTime: number) {

	stateManager.update(deltaTime);

}

function renderGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

	stateManager.render(ctx);

}


// MAIN LOOP

function gameLoop(timeStamp: number) {

	const deltaTime = (timeStamp - prevTimeStamp) / 1000; // convert from ms to seconds
	prevTimeStamp = timeStamp;

	updateGame(deltaTime);

	renderGame();

    requestAnimationFrame(gameLoop);
}


requestAnimationFrame(gameLoop);
