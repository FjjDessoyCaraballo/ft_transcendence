import '../styles/main.css';
import '../styles/gdpr-popup.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameStateManager } from '../game/GameStates'; 
import { StartScreen } from '../game/StartScreen';
import { setupLogin } from '../UI/TEST_logIn_register';
import { GDPRPopup } from '../UI/GDPRPopup'
import { canvas, ctx } from "../components/Canvas";



export const stateManager = new GameStateManager();

export let curUser: string | null = null;
export function updateCurUser(newUser: string | null) { curUser = newUser; }

let prevTimeStamp = 0;

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

// GDPR WINDOW

const gdprContainer = document.createElement('div');
gdprContainer.id = 'gdpr-container';
document.body.appendChild(gdprContainer);

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
	</React.StrictMode>
);