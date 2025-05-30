import { GameStates, IGameState } from "../game/GameStates";
import { Button } from "./Button";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR, LIGHT_PURPLE } from "../game/Constants";
import { global_stateManager } from "./GameCanvas";
import { UserHUB } from "./UserHUB";
import { UserManager, User } from "./UserManager";
import { GameType, UserHubState } from "./Types";
import { drawCenteredText, StartScreen } from "../game/StartScreen";
import { MatchIntro } from "../game/MatchIntro";
import { getLoggedInUserData } from "../services/userService";

// BUTTONS

export class SingleGameButton extends Button
{
	private gameType: GameType;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, gameType: GameType)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.gameType = gameType;
		this.canvas = canvas;
		this.ctx = ctx;
	}

	clickAction(): void {
		global_stateManager.changeState(new UserHUB(this.canvas, this.ctx, UserHubState.SINGLE_GAME, this.gameType));
	}
}

export class StartTournamentButton extends Button
{
	private gameType: GameType;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, gameType: GameType)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.gameType = gameType;
		this.canvas = canvas;
		this.ctx = ctx;
	}

	clickAction(): void {
		global_stateManager.changeState(new UserHUB(this.canvas, this.ctx, UserHubState.TOURNAMENT, this.gameType));
	}
}

export class ChangeGameBtn extends Button
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
		global_stateManager.changeState(new StartScreen(this.canvas, this.ctx));
	}
}

export class PongAiBtn extends Button
{
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	loggedInUserData: User | null;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.canvas = canvas;
		this.ctx = ctx;
		this.loggedInUserData = null;
	}

	addUserData(user: User)
	{
		this.loggedInUserData = user;
	}

	clickAction(): void {

		if (this.loggedInUserData)
			global_stateManager.changeState(new MatchIntro(this.canvas, this.ctx, GameType.PONG_AI, false));
		else
			alert('User data error, please try again or log out and in again');

	}
}


// STATE CLASS

export class MainMenu implements IGameState
{
	name: GameStates;
	singleGameButton: SingleGameButton;
	startTournamentButton: StartTournamentButton;
	pongAiBtn: PongAiBtn;
	changeGameBtn: ChangeGameBtn;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	opponent: User | null;
	gameType: GameType;
	loggedInUserData: User | null;
	isDataReady: boolean;
	showLoadingText: boolean;
	isLoggedIn: boolean = false;
	mouseMoveBound: (event: MouseEvent) => void;
	mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, gameType: GameType)
	{		
		this.name = GameStates.MAIN_MENU;
		this.canvas = canvas;
		this.ctx = ctx;
		this.opponent = null;
		this.gameType = gameType;
		this.isDataReady = false;
		this.showLoadingText = false;
		this.loggedInUserData = null;

		ctx.font = '40px arial' // GLOBAL USE OF CTX!!

		// Define buttons
		let text1 = 'PLAY SINGLE GAME';
		const button1X = (canvas.width / 2) - (ctx.measureText(text1).width / 2) - TEXT_PADDING;
		let text2 = 'START TOURNAMENT';
		const button2X = (canvas.width / 2) - (ctx.measureText(text2).width / 2) - TEXT_PADDING;
		let text3 = 'PLAY PONG WITH AI';
		const button3X = (canvas.width / 2) - (ctx.measureText(text3).width / 2) - TEXT_PADDING;

		const buttonYCenter = (canvas.height / 2) - 20 - TEXT_PADDING; // 20 == 40px / 2
		const button1Y = buttonYCenter - 60;
		const button2Y = buttonYCenter + 30;
		const button3Y = buttonYCenter + 120;

		// Define instruction button
		ctx.font = '30px arial' // GLOBAL USE OF CTX!!
		let instructText = 'CHANGE GAME';
		const instructX = (canvas.width / 2) - (ctx.measureText(instructText).width / 2) - TEXT_PADDING;
		const instructY = canvas.height - 100;

		this.singleGameButton = new SingleGameButton(this.canvas, this.ctx, button1X, button1Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text1, 'white', '40px', 'arial', this.gameType);
		this.startTournamentButton = new StartTournamentButton(this.canvas, this.ctx, button2X, button2Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text2, 'white', '40px', 'arial', this.gameType);
		this.pongAiBtn = new PongAiBtn(this.canvas, this.ctx, button3X, button3Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text3, 'white', '40px', 'arial');
		this.changeGameBtn = new ChangeGameBtn(this.canvas, this.ctx, instructX, instructY, '#b0332a', '#780202', instructText, 'white', '30px', 'arial');

		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

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
				console.log("MAIN MENU: User data fetch failed.");
			else
			{
				this.isDataReady = true;
				this.pongAiBtn.addUserData(this.loggedInUserData);
			}
		}
		catch (error) {
			alert(`User data fetch failed, returning to main menu! ${error}`)
			console.log("MAIN MENU: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx));
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

		this.singleGameButton.checkMouse(x, y);
		this.startTournamentButton.checkMouse(x, y);
		this.changeGameBtn.checkMouse(x, y);

		if (this.gameType === GameType.PONG)
			this.pongAiBtn.checkMouse(x, y);
	}

	mouseClickCallback()
	{
		this.singleGameButton.checkClick();
		this.startTournamentButton.checkClick();
		this.changeGameBtn.checkClick();

		if (this.gameType === GameType.PONG)
			this.pongAiBtn.checkClick();
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

		if (!this.isDataReady)
		{
			if (!this.showLoadingText)
				return ;

			const loadingHeader = 'Fetching user data, please wait.';
			drawCenteredText(this.canvas, this.ctx, loadingHeader, '50px arial', 'white', this.canvas.height / 2);
			const loadingInfo = 'If this takes more than 10 seconds, please try to log out and in again.';
			drawCenteredText(this.canvas, this.ctx, loadingInfo, '30px arial', 'white', this.canvas.height / 2 + 50);
			return ;
		}

		UserManager.drawCurUser(this.canvas, ctx, this.loggedInUserData);

		drawCenteredText(this.canvas, this.ctx, 'You are playing:', '40px arial', 'white', 200);

		if (this.gameType === GameType.BLOCK_BATTLE)
			drawCenteredText(this.canvas, this.ctx, 'Block Battle', '40px impact', LIGHT_PURPLE, 250);
		else
			drawCenteredText(this.canvas, this.ctx, 'Pong', '40px impact', LIGHT_PURPLE, 250);


		this.singleGameButton.draw(ctx);
		this.startTournamentButton.draw(ctx);
		this.changeGameBtn.draw(ctx);

		if (this.gameType === GameType.PONG)
			this.pongAiBtn.draw(ctx);
	}
	
}