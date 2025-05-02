import { Button } from "../UI/Button";
import { stateManager, curUser } from "../components/index";
import { MainMenu } from "../UI/MainMenu";
import { canvas, ctx } from "../components/index"; // Sort of weird to use this globally here to pass it to InGame...
import { GameStates, IGameState, } from "./GameStates";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR, LOGIN_CHECK_KEY } from "./Constants";
import { UserManager } from "../UI/UserManager";

export class StartButton extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {

		if (!curUser)
			alert("You have to first log in to play this game!");
		else
			stateManager.changeState(new MainMenu(canvas));

	}
}

export class StartScreen implements IGameState
{
	name: GameStates;
	startButton: StartButton;
	canvas: HTMLCanvasElement;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement)
	{
		this.name = GameStates.START_SCREEN;

		let text = 'START GAME';
		ctx.font = '50px arial' // GLOBAL USE OF CTX!!
		const buttonX = (canvas.width / 2) - (ctx.measureText(text).width / 2) - TEXT_PADDING;
		const buttonY = (canvas.height / 2) + 100;

		this.startButton = new StartButton(buttonX, buttonY, BUTTON_COLOR, BUTTON_HOVER_COLOR, text, 'white', '50px', 'arial');
		this.canvas = canvas;

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

		this.startButton.checkMouse(x, y);
	}

	mouseClickCallback()
	{
		this.startButton.checkClick();
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

	render(ctx: CanvasRenderingContext2D)
	{
		UserManager.drawCurUser();
		
		let mainTitle = 'Block Wars';
		ctx.font = '140px Impact';
		ctx.fillStyle = '#0a42ab';
		const titleX = (this.canvas.width / 2) - (ctx.measureText(mainTitle).width / 2);
		const titleY = this.canvas.height / 2 - 30;
		ctx.fillText(mainTitle, titleX, titleY);

		if (!curUser)
		{
			let infoText = 'Please log in to play the game';
			ctx.font = '50px arial';
			ctx.fillStyle = 'white';
			const infoX = (this.canvas.width / 2) - (ctx.measureText(infoText).width / 2);
			const infoY = this.canvas.height / 2 + 100;
			ctx.fillText(infoText, infoX, infoY);
		}
		else
			this.startButton.draw(ctx);
	}

}