import { Button } from "../UI/Button";
import { stateManager, curUser } from "../components/index";
import { MainMenu } from "../UI/MainMenu";
import { canvas, ctx } from "../components/Canvas"; // Sort of weird to use this globally here to pass it to BlockBattle...
import { GameStates, IGameState, } from "./GameStates";
import { TEXT_PADDING } from "./Constants";
import { UserManager } from "../UI/UserManager";
import { GameType } from "../UI/Types";


// GENERAL HELPER FUNCTIONS
export function drawCenteredText(text: string, font: string, color: string, y: number)
{
	ctx.font = font;
	ctx.fillStyle = color;
	const x = (canvas.width / 2) - (ctx.measureText(text).width / 2);
	ctx.fillText(text, x, y);
}

export function drawText(text: string, font: string, color: string, x: number, y: number)
{
	ctx.font = font;
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}


// BUTTONS
export class PongBtn extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new MainMenu(canvas, GameType.PONG));
	}
}

export class BlockBattleBtn extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new MainMenu(canvas, GameType.BLOCK_BATTLE));
	}
}


// START SCREEN
export class StartScreen implements IGameState
{
	name: GameStates;
	pongBtn: PongBtn;
	blockBattleBtn: BlockBattleBtn;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement)
	{
		this.name = GameStates.START_SCREEN;

		const pongText = 'PONG';
		ctx.font = '50px arial';
		const pongX = (canvas.width / 2) - (ctx.measureText(pongText).width / 2) - TEXT_PADDING;
		const pongY = 470;
		this.pongBtn = new PongBtn(pongX, pongY, '#0426bd', '#023075', pongText, 'white', '50px', 'arial');

		const bbText = 'BLOCK BATTLE';
		const bbX = (canvas.width / 2) - (ctx.measureText(bbText).width / 2) - TEXT_PADDING;
		const bbY = 570;
		this.blockBattleBtn = new BlockBattleBtn(bbX, bbY, '#0426bd', '#023075', bbText, 'white', '50px', 'arial');

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();
	}

	mouseMoveCallback(event: MouseEvent)
	{
		const rect = canvas.getBoundingClientRect();
		
		// Calculate the scaling factor based on the CSS size and the canvas resolution
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		// Calculate the mouse position relative to the canvas, adjusting for scaling
		const x = (event.clientX - rect.left) * scaleX;
		const y = (event.clientY - rect.top) * scaleY;

		this.pongBtn.checkMouse(x, y);
		this.blockBattleBtn.checkMouse(x, y);
	}

	mouseClickCallback()
	{
		this.pongBtn.checkClick();
		this.blockBattleBtn.checkClick();
	}

	enter()
	{
		canvas.addEventListener('mousemove', this.mouseMoveBound);
		canvas.addEventListener('click', this.mouseClickBound);
	}

	exit()
	{
		canvas.removeEventListener('mousemove', this.mouseMoveBound);
		canvas.removeEventListener('click', this.mouseClickBound);
	}

	update(deltaTime: number)
	{

	}

	render(ctx: CanvasRenderingContext2D)
	{
		UserManager.drawCurUser();
		
		drawCenteredText('Welcome, gamer!', '140px Impact', '#0a42ab', 240);

		if (!curUser)
			drawCenteredText('Please log in to play the game', '50px arial', 'white', canvas.height / 2 + 100);
		else
		{
			drawCenteredText('Please choose the game you want to play', '40px arial', 'white', 390);

			this.pongBtn.draw(ctx);
			this.blockBattleBtn.draw(ctx);
		}
	}

}