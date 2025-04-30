import { GameStates, IGameState } from "./GameStates";
import { Button } from "./Button";
import { stateManager, canvas, ctx, curUser } from "./components/index"; // canvas again globally used... is it bad?
import { InGame } from "./InGame";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR } from "./constants";
import { Instructions } from "./Instructions";
import { UserHUB } from "./UserHUB";
import { UserManager, User } from "./UserManager";

// BUTTONS

export class SingleGameButton extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new UserHUB(canvas)); // opponent will be chosen through UserHUB
	}
}

export class InstructionsButton extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new Instructions(canvas));
	}
}

export class UserHubButton extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new UserHUB(canvas));
	}
}


// STATE CLASS

export class MainMenu implements IGameState
{
	name: GameStates;
	singleGameButton: SingleGameButton;
	instructionButton: InstructionsButton;
	userHubButton: UserHubButton;
	canvas: HTMLCanvasElement;
	opponent: User | null;
	mouseMoveBound: (event: MouseEvent) => void;
	mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement)
	{		
		this.name = GameStates.MAIN_MENU;
		this.canvas = canvas;
		this.opponent = null;

		ctx.font = '40px arial' // GLOBAL USE OF CTX!!

		let text1 = 'PLAY SINGLE GAME';
		const button1X = (canvas.width / 2) - (ctx.measureText(text1).width / 2) - TEXT_PADDING;
		let text2 = 'USER HUB';
		const button2X = (canvas.width / 2) - (ctx.measureText(text2).width / 2) - TEXT_PADDING;

		const buttonYCenter = (canvas.height / 2) - 20 - TEXT_PADDING; // 20 == 40px / 2
		const button1Y = buttonYCenter - 60;
		const button2Y = buttonYCenter + 30;

		ctx.font = '30px arial' // GLOBAL USE OF CTX!!
		let text3 = 'INSTRUCTIONS';
		const button3X = (canvas.width / 2) - (ctx.measureText(text3).width / 2) - TEXT_PADDING;
		const button3Y = 600;

		this.singleGameButton = new SingleGameButton(button1X, button1Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text1, 'white', '40px', 'arial');
		this.userHubButton = new UserHubButton(button2X, button2Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text2, 'white', '40px', 'arial');
		this.instructionButton = new InstructionsButton(button3X, button3Y, '#b0332a', '#780202', text3, 'white', '30px', 'arial');

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

		this.singleGameButton.checkMouse(x, y);
		this.instructionButton.checkMouse(x, y);
		this.userHubButton.checkMouse(x, y);
	}

	mouseClickCallback()
	{
		this.singleGameButton.checkClick();
		this.instructionButton.checkClick();
		this.userHubButton.checkClick();

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
		this.singleGameButton.draw(ctx);
		this.instructionButton.draw(ctx);
		this.userHubButton.draw(ctx);
	}

}