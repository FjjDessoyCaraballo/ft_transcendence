import { GameStates, IGameState } from "../game/GameStates";
import { Button } from "./Button";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR, LIGHT_PURPLE } from "../game/Constants";
import { global_stateManager } from "./GameCanvas";
import { UserHUB } from "./UserHUB";
import { UserManager, User } from "./UserManager";
import { GameType, UserHubState } from "./Types";
import { drawCenteredText, StartScreen } from "../game/StartScreen";
import { MatchIntro } from "../game/MatchIntro";
import { TFunction } from 'i18next';
import { getLoggedInUserData } from "../services/userService";

// BUTTONS

export class SingleGameButton extends Button
{
	private gameType: GameType;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, gameType: GameType, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
		this.gameType = gameType;
		this.canvas = canvas;
		this.ctx = ctx;
		this.t = t;
	}

	clickAction(): void {
		global_stateManager.changeState(new UserHUB(this.canvas, this.ctx, UserHubState.SINGLE_GAME, this.gameType, this.t));
	}
}

export class StartTournamentButton extends Button
{
	private gameType: GameType;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, gameType: GameType, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
		this.gameType = gameType;
		this.canvas = canvas;
		this.ctx = ctx;
		this.t = t;
	}

	clickAction(): void {
		global_stateManager.changeState(new UserHUB(this.canvas, this.ctx, UserHubState.TOURNAMENT, this.gameType, this.t));
	}
}

export class ChangeGameBtn extends Button
{
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
		this.canvas = canvas;
		this.ctx = ctx;
		this.t = t;
	}

	clickAction(): void {
		global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
	}
}

export class PongAiBtn extends Button
{
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	t: TFunction;
	loggedInUserData: User | null;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
		this.canvas = canvas;
		this.ctx = ctx;
		this.loggedInUserData = null;
		this.t = t;
	}

	addUserData(user: User)
	{
		this.loggedInUserData = user;
	}

	clickAction(): void {

		if (this.loggedInUserData)
			global_stateManager.changeState(new MatchIntro(this.canvas, this.ctx, GameType.PONG_AI, false, this.t));
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
	t: TFunction;
	loggedInUserData: User | null;
	isDataReady: boolean;
	showLoadingText: boolean;
	isLoggedIn: boolean = false;
	mouseMoveBound: (event: MouseEvent) => void;
	mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, gameType: GameType, t: TFunction)
	{		
		this.name = GameStates.MAIN_MENU;
		this.canvas = canvas;
		this.ctx = ctx;
		this.opponent = null;
		this.gameType = gameType;
		this.t = t;
		this.isDataReady = false;
		this.showLoadingText = false;
		this.loggedInUserData = null;

		ctx.font = '40px arial' // GLOBAL USE OF CTX!!

		// Define buttons
		let text1 = 'play_single_game';
		const button1X = (canvas.width / 2) - (ctx.measureText(t('play_single_game')).width / 2) - TEXT_PADDING;
		let text2 = 'start_tournament';
		const button2X = (canvas.width / 2) - (ctx.measureText(t('start_tournament')).width / 2) - TEXT_PADDING;
		let text3 = 'play_ai';
		const button3X = (canvas.width / 2) - (ctx.measureText(t('play_ai')).width / 2) - TEXT_PADDING;

		const buttonYCenter = (canvas.height / 2) - 20 - TEXT_PADDING; // 20 == 40px / 2
		const button1Y = buttonYCenter - 60;
		const button2Y = buttonYCenter + 30;
		const button3Y = buttonYCenter + 120;

		// Define instruction button
		ctx.font = '30px arial' // GLOBAL USE OF CTX!!
		let instructText = 'change_game';
		const instructX = (canvas.width / 2) - (ctx.measureText(t('change_game')).width / 2) - TEXT_PADDING;
		const instructY = canvas.height - 100;

		this.singleGameButton = new SingleGameButton(this.canvas, this.ctx, button1X, button1Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text1, 'white', '40px', 'arial', this.gameType, this.t);
		this.startTournamentButton = new StartTournamentButton(this.canvas, this.ctx, button2X, button2Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text2, 'white', '40px', 'arial', this.gameType, this.t);
		this.pongAiBtn = new PongAiBtn(this.canvas, this.ctx, button3X, button3Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text3, 'white', '40px', 'arial', this.t);
		this.changeGameBtn = new ChangeGameBtn(this.canvas, this.ctx, instructX, instructY, '#b0332a', '#780202', instructText, 'white', '30px', 'arial', this.t);

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
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
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

		UserManager.drawCurUser(this.canvas, ctx, this.loggedInUserData, this.t);

		drawCenteredText(this.canvas, this.ctx, this.t('you_are_playing'), '40px arial', 'white', 200);

		if (this.gameType === GameType.BLOCK_BATTLE)
			drawCenteredText(this.canvas, this.ctx, 'Block Battle', '40px impact', LIGHT_PURPLE, 250);
		else
			drawCenteredText(this.canvas, this.ctx, 'Pong', '40px impact', LIGHT_PURPLE, 250);


		this.singleGameButton.draw(ctx, this.t);
		this.startTournamentButton.draw(ctx, this.t);
		this.changeGameBtn.draw(ctx, this.t);

		if (this.gameType === GameType.PONG)
			this.pongAiBtn.draw(ctx, this.t);
	}
	
}