import '../styles/main.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameStateManager } from '../Game/GameStates'; 
import { StartScreen } from '../Game/StartScreen';
import { setupLogin } from '../UI/TEST_logIn_register';
import { GDPRPopup } from '../UI/GDPRPopup'
import { Header } from '../UI/Header'

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

// GDPR WINDOW

const gdprContainer = document.createElement('div');
const headerContainer = document.createElement('header');
gdprContainer.id = 'gdpr-container';
headerContainer.id = 'header-container';
document.body.appendChild(gdprContainer);
document.body.appendChild(headerContainer);

// RENDER

const root = ReactDOM.createRoot(gdprContainer);
root.render(
	<React.StrictMode>
		<GDPRPopup
			onAccept={() => console.log('GDPR accepted')}
			onDecline={() => {
				console.log('GDPR declined');
				alert('You must accept the GDPR terms to use this application.')
			}}
			/>
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

	const deltaTime = (timeStamp - prevTimeStamp) / 1000; // convert from ms to seconds
	prevTimeStamp = timeStamp;

	updateGame(deltaTime);

	renderGame();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

