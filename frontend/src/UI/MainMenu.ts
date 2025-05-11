import { GameStates, IGameState } from "../game/GameStates";
import { Button } from "./Button";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR, LIGHT_PURPLE } from "../game/Constants";
import { stateManager, curUser } from "../components/index"; // canvas again globally used... is it bad?
import { canvas, ctx } from "../components/Canvas";
import { UserHUB } from "./UserHUB";
import { UserManager, User } from "./UserManager";
import { GameType, UserHubState } from "./Types";
import { drawCenteredText, StartScreen } from "../game/StartScreen";
import { MatchIntro } from "../game/MatchIntro";


// BUTTONS

export class SingleGameButton extends Button
{
	private gameType: GameType;

	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, gameType: GameType)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.gameType = gameType;
	}

	clickAction(): void {
		stateManager.changeState(new UserHUB(canvas, UserHubState.SINGLE_GAME, this.gameType));
	}
}

export class StartTournamentButton extends Button
{
	private gameType: GameType;

	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, gameType: GameType)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.gameType = gameType;
	}

	clickAction(): void {
		stateManager.changeState(new UserHUB(canvas, UserHubState.TOURNAMENT, this.gameType));
	}
}

export class ChangeGameBtn extends Button
{

	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new StartScreen(canvas));
	}
}

export class PongAiBtn extends Button
{

	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {

		if (curUser)
		{
			const curUserData = localStorage.getItem(curUser);
			if (curUserData)
			{
				const curUserObj = JSON.parse(curUserData);
				stateManager.changeState(new MatchIntro(canvas, curUserObj, null, null, null, GameType.PONG_AI));
			}
		}

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
	opponent: User | null;
	gameType: GameType;
	mouseMoveBound: (event: MouseEvent) => void;
	mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement, gameType: GameType)
	{		
		this.name = GameStates.MAIN_MENU;
		this.canvas = canvas;
		this.opponent = null;
		this.gameType = gameType;

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

		this.singleGameButton = new SingleGameButton(button1X, button1Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text1, 'white', '40px', 'arial', this.gameType);
		this.startTournamentButton = new StartTournamentButton(button2X, button2Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text2, 'white', '40px', 'arial', this.gameType);
		this.pongAiBtn = new PongAiBtn(button3X, button3Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text3, 'white', '40px', 'arial');
		this.changeGameBtn = new ChangeGameBtn(instructX, instructY, '#b0332a', '#780202', instructText, 'white', '30px', 'arial');

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
		UserManager.drawCurUser();

		drawCenteredText('You are playing:', '40px arial', 'white', 200);

		if (this.gameType === GameType.BLOCK_BATTLE)
			drawCenteredText('Block Battle', '40px impact', LIGHT_PURPLE, 250);
		else
			drawCenteredText('Pong', '40px impact', LIGHT_PURPLE, 250);


		this.singleGameButton.draw(ctx);
		this.startTournamentButton.draw(ctx);
		this.changeGameBtn.draw(ctx);

		if (this.gameType === GameType.PONG)
			this.pongAiBtn.draw(ctx);
	}
	
}