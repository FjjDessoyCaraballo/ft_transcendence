import { ctx } from "../components/Canvas"; // Sort of weird to use this globally here to pass it to InGame...
import { GameStates, IGameState, } from "../Game/GameStates";
import { TEXT_PADDING } from "../Game/Constants";
import { User } from "./UserManager";
import { ReturnMainMenuButton } from "../Game/EndScreen";


export class Tournament implements IGameState
{
	name: GameStates;
	canvas: HTMLCanvasElement;
	playerArr: User [];
	returnMenuButton: ReturnMainMenuButton;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement, players: User[])
	{
		this.name = GameStates.TOURNAMENT;
		this.canvas = canvas;
		this.playerArr = players;

		let text1 = 'RETURN TO MENU';
		ctx.font = '25px arial' // GLOBAL USE OF CTX!!
		const button1X = (canvas.width / 2) - (ctx.measureText(text1).width / 2) - TEXT_PADDING;
		const button1Y = (canvas.height / 2) - 20 - TEXT_PADDING + 370;

		this.returnMenuButton = new ReturnMainMenuButton(button1X, button1Y, 'red', '#780202', text1, 'white', '25px', 'arial');

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();
	}

	mouseMoveCallback(event: MouseEvent)
	{
		const rect = this.canvas.getBoundingClientRect();
		
		// Calculate the scaling factor based on the CSS size and the canvas resolution
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		// Calculate the mouse position relative to the canvas, adjusting for scaling
		const x = (event.clientX - rect.left) * scaleX;
		const y = (event.clientY - rect.top) * scaleY;

		this.returnMenuButton.checkMouse(x, y);

	}

	mouseClickCallback()
	{
		this.returnMenuButton.checkClick();
	}

	enter()
	{
		this.canvas.addEventListener('mousemove', this.mouseMoveBound);
		this.canvas.addEventListener('click', this.mouseClickBound);
	}

	exit()
	{
		this.canvas.removeEventListener('mousemove', this.mouseMoveBound);
		this.canvas.removeEventListener('click', this.mouseClickBound);
	}

	update(deltaTime: number)
	{
	}

	drawScoreBoard(ctx: CanvasRenderingContext2D)
	{
		const colW = 200;
		const colH = 100;
		let x = this.canvas.width / 2 - colW;
		let y = 200;
		const padding = 50;

		for (const player of this.playerArr)
		{
			ctx.strokeStyle = '#0a42ab';
			ctx.lineWidth = 4;
			ctx.strokeRect(x, y, colW, colH);

			ctx.font = '30px arial';
			ctx.fillStyle = 'green';
			const text = player.username;
			const playerX = x + (colW / 2) - (ctx.measureText(text).width / 2);
			const playerY = y + padding;
			ctx.fillText(text, playerX, playerY);

			ctx.strokeRect(x + colW, y, colW, colH);
			ctx.fillStyle = 'white';
			const scoreText = '0';
			const scoreX = x + colW + (colW / 2) - (ctx.measureText(scoreText).width / 2);
			const scoreY = y + padding;
			ctx.fillText(scoreText, scoreX, scoreY);

			y += colH;
		}


	}

	render(ctx: CanvasRenderingContext2D)
	{
		const headerText = "SCORE BOARD";
		ctx.font = '50px arial';
		ctx.fillStyle = 'white';
		const headerX = (this.canvas.width / 2) - (ctx.measureText(headerText).width / 2);
		ctx.fillText(headerText, headerX, 140);

		this.drawScoreBoard(ctx);

		this.returnMenuButton.draw(ctx);
	}

}