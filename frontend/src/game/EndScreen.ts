import { GameStates, IGameState } from "./GameStates";
import { Button } from "../UI/Button";
import { global_stateManager } from "../UI/GameCanvas";
import { MainMenu } from "../UI/MainMenu";
import { TEXT_PADDING } from "./Constants";
import { User, UserManager } from "../UI/UserManager";
import { TournamentPlayer } from "./Tournament";
import { GameType } from "../UI/Types";
import { drawCenteredText, StartScreen } from "./StartScreen";
import { getEndScreenData } from "../services/userService";
import { TFunction } from 'i18next';

export class ReturnMainMenuButton extends Button
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
		
		if (this.gameType === GameType.PONG_AI)
			this.gameType = GameType.PONG;
		global_stateManager.changeState(new MainMenu(this.canvas, this.ctx, this.gameType, this.t));

	}
}

class ReturnToTournamentBtn extends Button
{
	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
	}

	clickAction(): void {
		
	}
}


export class EndScreen implements IGameState
{
	name: GameStates;
	winner: User | null;
	loser: User | null;
	AIData: User | null;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	returnMenuButton: ReturnMainMenuButton;
	returnToTournamentBtn: ReturnToTournamentBtn;
	isStateReady: boolean;
	gameType: GameType;
	isDataReady: boolean;
	isTournament: boolean;
	isLoggedIn: boolean = false;
	showLoadingText: boolean;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D, winnerId: number, loserId: number, gameType: GameType, isTournament: boolean, AIData: User | null, t: TFunction)
	{
		this.name = GameStates.END_SCREEN;

		this.canvas = canvas;
		this.ctx = ctx;
		this.winner = null;
		this.loser = null;
		this.isStateReady = false;
		this.gameType = gameType;
		this.isDataReady = false;
		this.showLoadingText = false;
		this.isTournament = isTournament;
		this.AIData = AIData;
		this.t = t;

		let text1 = 'return_to_menu';
		ctx.font = '40px arial' // GLOBAL USE OF CTX!!
		const buttonX1 = (canvas.width / 2) - (ctx.measureText(t('return_to_menu')).width / 2) - TEXT_PADDING;
		const buttonY1 = (canvas.height / 2) + 200 - TEXT_PADDING;

		let text2 = 'return_to_tournament';
		const buttonX2 = (canvas.width / 2) - (ctx.measureText(t('return_to_tournament')).width / 2) - TEXT_PADDING;
		const buttonY2 = (canvas.height / 2) - TEXT_PADDING;

		this.returnMenuButton = new ReturnMainMenuButton(canvas, ctx, buttonX1, buttonY1, 'red', '#780202', text1, 'white', '40px', 'arial', this.gameType, this.t);
		this.returnToTournamentBtn = new ReturnToTournamentBtn(ctx, buttonX2, buttonY2, 'red', '#780202', text2, 'white', '40px', 'arial', t);

		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

		this.fetchPlayerData(winnerId, loserId);

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();

	}

	async fetchPlayerData(winnerId: number, loserId: number)
	{
		try
		{
			if (winnerId != -1)
				this.winner = await getEndScreenData(winnerId);
			else
				this.winner = this.AIData;

			if (loserId != -1)
				this.loser = await getEndScreenData(loserId);
			else
				this.loser = this.AIData;

			this.isDataReady = true;
		}
		catch (error) {
			alert(`User data fetch failed, returning to main menu! ${error}`)
			console.log("END SCREEN: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.isDataReady = false;
		}
	}

	mouseMoveCallback(event: MouseEvent)
	{
		const rect = this.canvas.getBoundingClientRect();
		
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		const x = (event.clientX - rect.left) * scaleX;
		const y = (event.clientY - rect.top) * scaleY;

		if (!this.isTournament)
			this.returnMenuButton.checkMouse(x, y);
		else
			this.returnToTournamentBtn.checkMouse(x, y);

	}

	mouseClickCallback()
	{
		if (!this.isTournament)
			this.returnMenuButton.checkClick();
		else
		{
			if (this.returnToTournamentBtn.checkClick())
				this.isStateReady = true;
		}
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

		if (!this.winner || !this.loser)
			return ;

		const text = this.winner.username + ' wins the game!';
		drawCenteredText(this.canvas, this.ctx, text, '40px arial', '#1cc706', 200);

		if (this.gameType === GameType.PONG_AI)
		{
			if (this.winner.username === 'Computer')
				drawCenteredText(this.canvas, this.ctx, 'Computers will rule the world... yikes!!', '30px arial', 'white', 300);
			else
				drawCenteredText(this.canvas, this.ctx, 'Great job, humans ROCK!!', '30px arial', 'white', 300);

		}
		else if (!this.isTournament)
		{
			const winnerRankText = `The new rank of ${this.winner.username} is ${this.winner.ranking_points.toFixed(2)}.`;
			drawCenteredText(this.canvas, this.ctx, winnerRankText, '30px arial', 'white', 300);
			
			const loserRankText = `The new rank of ${this.loser.username} is ${this.loser.ranking_points.toFixed(2)}.`;
			drawCenteredText(this.canvas, this.ctx, loserRankText, '30px arial', 'white', 340);
		}

		if (!this.isTournament)
			this.returnMenuButton.draw(ctx, this.t);
		else
			this.returnToTournamentBtn.draw(ctx, this.t);


	}

}