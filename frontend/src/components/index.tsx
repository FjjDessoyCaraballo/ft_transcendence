import '../styles/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameStateManager } from '../game/GameStates'; 
import { StartScreen } from '../game/StartScreen';
import { Header } from '../UI/Header'
import { canvas, ctx } from './Canvas'

export const stateManager = new GameStateManager();

export let curUser: string | null = null;
export function updateCurUser(newUser: string | null) { curUser = newUser; }

let prevTimeStamp = 0;

stateManager.changeState(new StartScreen(canvas));

const headerContainer = document.createElement('header');
headerContainer.id = 'header-container';
document.body.appendChild(headerContainer);

// RENDER

const root = ReactDOM.createRoot(headerContainer);
root.render(
	<React.StrictMode>
		<Header onClick={() => console.log('Header clicked')} />
	</React.StrictMode>
);

function updateGame(deltaTime: number) {
	stateManager.update(deltaTime);
}

function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	stateManager.render(ctx);
}

// MAIN LOOP
function gameLoop(timeStamp: number) {

	const deltaTime = (timeStamp - prevTimeStamp) / 1000;
	prevTimeStamp = timeStamp;
	
	updateGame(deltaTime);
	renderGame();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

