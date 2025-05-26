import { Button } from "../UI/Button";
import { global_stateManager } from "../UI/GameCanvas";
import { MainMenu } from "../UI/MainMenu";
import { GameStates, IGameState, } from "./GameStates";
import { DEEP_PURPLE, PURPLE, TEXT_PADDING } from "./Constants";
import { UserManager, User } from "../UI/UserManager";
import { GameType } from "../UI/Types";
import { getLoggedInUserData } from "../services/userService";


// GENERAL HELPER FUNCTIONS
export function drawCenteredText(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, text: string, font: string, color: string, y: number)
{
	ctx.font = font;
	ctx.fillStyle = color;
	const x = (canvas.width / 2) - (ctx.measureText(text).width / 2);
	ctx.fillText(text, x, y);
}

export function drawText(ctx: CanvasRenderingContext2D, text: string, font: string, color: string, x: number, y: number)
{
	ctx.font = font;
	ctx.fillStyle = color;
	ctx.fillText(text, x, y);
}


// BUTTONS
export class PongBtn extends Button
{
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.canvas = canvas;
		this.ctx = ctx;
	}

	clickAction(): void {
		global_stateManager.changeState(new MainMenu(this.canvas, this.ctx, GameType.PONG));
	}
}

export class BlockBattleBtn extends Button
{
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.canvas = canvas;
		this.ctx = ctx;
	}

	clickAction(): void {
		global_stateManager.changeState(new MainMenu(this.canvas, this.ctx, GameType.BLOCK_BATTLE));
	}
}


// START SCREEN
export class StartScreen implements IGameState
{
	name: GameStates;
	pongBtn: PongBtn;
	blockBattleBtn: BlockBattleBtn;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	loggedInUserData: User | null;
	isDataReady: boolean;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D)
	{
		this.name = GameStates.START_SCREEN;
		this.canvas = canvas;
		this.ctx = ctx;
		this.isDataReady = false;
		this.loggedInUserData = null;

		const pongText = 'PONG';
		ctx.font = '50px arial';
		const pongX = (canvas.width / 2) - (ctx.measureText(pongText).width / 2) - TEXT_PADDING;
		const pongY = 470;
		this.pongBtn = new PongBtn(this.canvas, this.ctx, pongX, pongY, DEEP_PURPLE, PURPLE, pongText, 'white', '50px', 'arial');

		const bbText = 'BLOCK BATTLE';
		const bbX = (canvas.width / 2) - (ctx.measureText(bbText).width / 2) - TEXT_PADDING;
		const bbY = 570;
		this.blockBattleBtn = new BlockBattleBtn(this.canvas, this.ctx, bbX, bbY, DEEP_PURPLE, PURPLE, bbText, 'white', '50px', 'arial');

		this.fetchLoggedInUserData();

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();
	}

	async fetchLoggedInUserData()
	{
		try
		{
			this.loggedInUserData = await getLoggedInUserData();
			if (!this.loggedInUserData)
				console.log("START SCREEN: No user is logged in, so the game cannot be played");
			else
				this.isDataReady = true;
		}
		catch {
			console.log("START SCREEN: No user is logged in, so the game cannot be played");
			this.loggedInUserData = null;
			this.isDataReady = false;
		}
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
		UserManager.drawCurUser(this.canvas, ctx, this.loggedInUserData);
		
		drawCenteredText(this.canvas, this.ctx, 'Welcome, gamer!', '140px Impact', DEEP_PURPLE, 240);

		if (!this.isDataReady)
			drawCenteredText(this.canvas, this.ctx, 'Please log in to play the game', '50px arial', 'white', this.canvas.height / 2 + 100);
		else
		{
			drawCenteredText(this.canvas, this.ctx, 'Please choose the game you want to play', '40px arial', 'white', 390);

			this.pongBtn.draw(ctx);
			this.blockBattleBtn.draw(ctx);
		}
	}

}