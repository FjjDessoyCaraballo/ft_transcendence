import { GameStates, IGameState } from "./GameStates";
import { Button } from "../UI/Button";
import { global_stateManager } from "../UI/GameCanvas";
import { MainMenu } from "../UI/MainMenu";
import { TEXT_PADDING } from "./Constants";
import { User, UserManager } from "../UI/UserManager";
import { TournamentPlayer } from "./Tournament";
import { GameType } from "../UI/Types";
import { drawCenteredText } from "./StartScreen";
import { TFunction } from 'i18next';

export class ReturnMainMenuButton extends Button
{
	private gameType: GameType;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, gameType: GameType, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
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
	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		
	}
}


export class EndScreen implements IGameState
{
	name: GameStates;
	winner: User;
	loser: User;
	tournamentData1: TournamentPlayer | null;
	tournamentData2: TournamentPlayer | null;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	returnMenuButton: ReturnMainMenuButton;
	returnToTournamentBtn: ReturnToTournamentBtn;
	isStateReady: boolean;
	savingDataToDB: boolean;
	gameType: GameType;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement,ctx: CanvasRenderingContext2D, winner: User, loser: User, tData1: TournamentPlayer | null, tData2: TournamentPlayer | null, gameType: GameType, t: TFunction)
	{
		this.name = GameStates.END_SCREEN;

		this.canvas = canvas;
		this.ctx = ctx;
		this.winner = winner;
		this.loser = loser;
		this.tournamentData1 = tData1;
		this.tournamentData2 = tData2;
		this.isStateReady = false;
		this.gameType = gameType;
		this.savingDataToDB = false;
		this.t = t;

		let text1 = 'RETURN TO MENU';
		ctx.font = '40px arial' // GLOBAL USE OF CTX!!
		const buttonX1 = (canvas.width / 2) - (ctx.measureText(text1).width / 2) - TEXT_PADDING;
		const buttonY1 = (canvas.height / 2) + 200 - TEXT_PADDING;

		let text2 = 'RETURN TO TOURNAMENT';
		const buttonX2 = (canvas.width / 2) - (ctx.measureText(text2).width / 2) - TEXT_PADDING;
		const buttonY2 = (canvas.height / 2) - TEXT_PADDING;

		this.returnMenuButton = new ReturnMainMenuButton(canvas, ctx, buttonX1, buttonY1, 'red', '#780202', text1, 'white', '40px', 'arial', this.gameType, this.t);
		this.returnToTournamentBtn = new ReturnToTournamentBtn(ctx, buttonX2, buttonY2, 'red', '#780202', text2, 'white', '40px', 'arial');

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();

		if (!this.tournamentData1 && this.gameType !== GameType.PONG_AI)
			this.saveUserDataToDB();
	}

	mouseMoveCallback(event: MouseEvent)
	{
		const rect = this.canvas.getBoundingClientRect();
		
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		const x = (event.clientX - rect.left) * scaleX;
		const y = (event.clientY - rect.top) * scaleY;

		if (!this.tournamentData1)
			this.returnMenuButton.checkMouse(x, y);
		else
			this.returnToTournamentBtn.checkMouse(x, y);

	}

	mouseClickCallback()
	{
		if (!this.tournamentData1)
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

	async saveUserDataToDB()
	{
		this.savingDataToDB = true;

		try {
			await UserManager.updateUserStats(this.winner, this.loser, this.gameType);
		} catch {

			// Is this enough? Or do we need more error handling...?
			alert('User data saving failed');
			console.log('User data saving failed');
		}

		this.savingDataToDB = false;

	}

	update(deltaTime: number)
	{
	}

	render(ctx: CanvasRenderingContext2D)
	{
		const text = this.winner.username + ' wins the game!';
		drawCenteredText(this.canvas, this.ctx, text, '40px arial', '#1cc706', 200);

		if (this.gameType === GameType.PONG_AI)
		{
			if (this.winner.username === 'Computer')
				drawCenteredText(this.canvas, this.ctx, 'Computers will rule the world... yikes!!', '30px arial', 'white', 300);
			else
				drawCenteredText(this.canvas, this.ctx, 'Great job, humans ROCK!!', '30px arial', 'white', 300);

		}
		else if (!this.tournamentData1)
		{
			const winnerRankText = `The new rank of ${this.winner.username} is ${this.winner.ranking_points.toFixed(2)}.`;
			drawCenteredText(this.canvas, this.ctx, winnerRankText, '30px arial', 'white', 300);
			
			const loserRankText = `The new rank of ${this.loser.username} is ${this.loser.ranking_points.toFixed(2)}.`;
			drawCenteredText(this.canvas, this.ctx, loserRankText, '30px arial', 'white', 340);
		}

		if (!this.tournamentData1 && !this.savingDataToDB)
			this.returnMenuButton.draw(ctx);
		else if (!this.savingDataToDB)
			this.returnToTournamentBtn.draw(ctx);
		else
			drawCenteredText(this.canvas, this.ctx, 'Sending data to backend, please wait', '30px arial', 'white', this.canvas.height - 100);


	}

}