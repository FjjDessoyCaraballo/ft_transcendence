import { GameStates, IGameState, } from "./GameStates";
import { TEXT_PADDING } from "./Constants";
import { User } from "../UI/UserManager";
import { ReturnMainMenuButton } from "./EndScreen";
import { BlockBattle } from "./BlockBattle";
import { Button } from "../UI/Button";
import { MatchIntro } from "./MatchIntro";
import { EndScreen } from "./EndScreen";
import { GameType } from "../UI/Types";
import { Pong } from "./pong/Pong";
import { drawCenteredText, StartScreen } from "./StartScreen";
import { Weapon } from "./Weapons";
import { endTournamentAPI, getTournamentEndScreenData, getTournamentPlayers } from "../services/userService";
import { global_stateManager } from "../UI/GameCanvas";
import { TFunction } from 'i18next';

export interface TournamentPlayer
{
	tournamentId: number;
	user: User;
	tournamentPoints: number;
	place: number;
	coinsCollected: number;
	pongPointsScored: number;
	isWinner: boolean;
	bbWeapons: Weapon [];
}

export class NextGameBtn extends Button
{
	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
	}

	clickAction(): void 
	{
	}
}

export class Tournament implements IGameState
{
	name: GameStates;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	playerArr: TournamentPlayer [];
	curState: MatchIntro | BlockBattle | Pong | EndScreen | null;
	matchCounter: number;
	isFinished: boolean;
	tournamentWinner: TournamentPlayer [];
	returnMenuButton: ReturnMainMenuButton;
	nextGameBtn: NextGameBtn;
	gameType: GameType;
	isDataReady: boolean;
	showLoadingText: boolean;
	isSettingEndScreen: boolean;
	isEndingTournament: boolean = false;
	isLoggedIn: boolean = false;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, type: GameType, t: TFunction)
	{
		this.name = GameStates.TOURNAMENT;
		this.canvas = canvas;
		this.ctx = ctx;
		this.playerArr = [];
		this.curState = null;
		this.matchCounter = 0;
		this.isFinished = false;
		this.tournamentWinner = [];
		this.gameType = type;
		this.isDataReady = false;
		this.showLoadingText = false;
		this.isSettingEndScreen = false;
		this.t = t;

		let text1 = 'exit_tournament'; // Add a warning here that all tournament data will be lost
		ctx.font = '25px arial' // GLOBAL USE OF CTX!!
		const button1X = 20;
		const button1Y = 20;
		this.returnMenuButton = new ReturnMainMenuButton(this.canvas, this.ctx, button1X, button1Y, 'red', '#780202', text1, 'white', '25px', 'arial', this.gameType, this.t);

		let text2 = 'next_game';
		ctx.font = '35px arial' // GLOBAL USE OF CTX!!
		const button2X = (canvas.width / 2) - (ctx.measureText(t('next_game')).width / 2) - TEXT_PADDING;
		const button2Y = (canvas.height / 2) - 20 - TEXT_PADDING + 240;
		this.nextGameBtn = new NextGameBtn(this.ctx, button2X, button2Y, 'green', '#054d19', text2, 'white', '35px', 'arial', t);

		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

		this.fetchTournamentData();

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();
	}

	async fetchTournamentData()
	{
		try
		{
			this.playerArr = await getTournamentPlayers();
			if (!this.playerArr || this.playerArr.length === 0)
			{
				console.log("TOURNAMENT: User data fetch failed");
				return ;
			}

			this.isDataReady = true;
		}
		catch (error) {
			alert(`${this.t('data_fail')} ${error}`);
			console.log("TOURNAMENT: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
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

		this.returnMenuButton.checkMouse(x, y);

		if (!this.isFinished)
			this.nextGameBtn.checkMouse(x, y);
	}

	mouseClickCallback()
	{
		this.returnMenuButton.checkClick();
		
		if (!this.isFinished && this.nextGameBtn.checkClick())
		{
			this.curState = new MatchIntro(this.canvas, this.ctx, this.gameType, true, this.t);
			this.curState.enter();
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

	async setupEndScreen()
	{
		this.isSettingEndScreen = true;
		this.isDataReady = false;
		this.showLoadingText = false;
		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

		try {

			const endScreenData = await getTournamentEndScreenData();

			const winner = endScreenData.winner;
			const loser = endScreenData.loser;
			this.playerArr = endScreenData.playerArr; // update player arr for tournament after every game
			this.matchCounter = endScreenData.matchCount;
			if (this.matchCounter === 6)
				this.isFinished = true;


			this.curState = new EndScreen(this.canvas, this.ctx, winner.user.id, loser.user.id, this.gameType, true, null, this.t);
			this.curState.enter();

			// Sort players based on points
			if (this.gameType === GameType.BLOCK_BATTLE)
			{
				this.playerArr.sort((a, b) => {
					if (b.tournamentPoints !== a.tournamentPoints)
						return b.tournamentPoints - a.tournamentPoints;
					return b.coinsCollected - a.coinsCollected;
				})
			}
			else if (this.gameType === GameType.PONG)
			{
				this.playerArr.sort((a, b) => {
					if (b.tournamentPoints !== a.tournamentPoints)
						return b.tournamentPoints - a.tournamentPoints;
					return b.pongPointsScored - a.pongPointsScored;
				})
			}

			this.isDataReady = true;
			this.isSettingEndScreen = false;

		} catch (error) {

			alert(`${this.t('data_fail')} ${error}`);
			console.log("TOURNAMENT: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.isDataReady = false;

		}

	}

	async endTournament()
	{
		this.isEndingTournament = true;
		this.isDataReady = false;
		this.showLoadingText = false;
		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

		try {

			const winnerArr = await endTournamentAPI();

			this.tournamentWinner = winnerArr;
			this.isDataReady = true;
			this.isEndingTournament = false;

		} catch (error) {

			alert(`${this.t('data_fail')} ${error}`);
			console.log("TOURNAMENT: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.isDataReady = false;

		}

	}

	update(deltaTime: number)
	{
		if (this.curState)
		{
			this.curState.update(deltaTime);
			if (this.curState.isStateReady)
			{
				this.curState.exit();
				
				if (this.curState.name === GameStates.MATCH_INTRO)
				{	
					if (this.gameType === GameType.BLOCK_BATTLE)
						this.curState = new BlockBattle(this.canvas, this.ctx, [], [], true, this.t);
					else if (this.gameType === GameType.PONG)
						this.curState = new Pong(this.canvas, this.ctx, null, 'playing', true, this.t);

					this.curState.enter();
				}
				else if ((this.curState.name === GameStates.BLOCK_BATTLE || this.curState.name === GameStates.PONG))
				{
					if (!this.isSettingEndScreen)
						this.setupEndScreen() // need this.t here??
				}
				else
				{
					this.curState = null;
					if (this.isFinished && !this.isEndingTournament)
					{
						this.endTournament();
					}
				}
			}
		}
	}

	drawScoreBoard(ctx: CanvasRenderingContext2D)
	{
		const colW = 300;
		const colH = 80;
		let x = this.canvas.width / 2 - colW * 1.5;
		let y = 170;
		const padding = 45;

		// Draw background
		ctx.fillStyle = '#5e7291';
		ctx.fillRect(x, y, 3 * colW, 5 * colH);

		ctx.fillStyle = '#2b3442';
		ctx.fillRect(x, y, 3 * colW, colH);
		ctx.fillRect(x, y, colW, 5 * colH);

		// Draw first row (names of columns)
		ctx.strokeStyle = '#0a42ab';
		ctx.lineWidth = 4;
		ctx.strokeRect(x, y, colW, colH);

		ctx.font = '40px Impact';
		ctx.fillStyle = 'white';
		const usernameText = this.t('username');
		const usernameX = x + (colW / 2) - (ctx.measureText(usernameText).width / 2);
		ctx.fillText(usernameText, usernameX, y + padding + 5);

		ctx.strokeRect(x + colW, y, colW, colH);
		const pointsText = this.t('points_caps');
		const pointsX = x + colW + (colW / 2) - (ctx.measureText(pointsText).width / 2);
		ctx.fillText(pointsText, pointsX, y + padding + 5);

		ctx.strokeRect(x + colW * 2, y, colW, colH);
		let coinText = '';
		if (this.gameType === GameType.BLOCK_BATTLE)
			coinText = this.t('coins');
		else if (this.gameType === GameType.PONG)
			coinText = this.t('pong_score');
		const coinX = x + (colW * 2) + (colW / 2) - (ctx.measureText(coinText).width / 2);
		ctx.fillText(coinText, coinX, y + padding + 5);

		y += colH;

		// Draw player info
		for (let i = 0; i < 4; i++)
		{
			const player = this.playerArr[i];
			player.place = i + 1;

			ctx.strokeStyle = '#0a42ab';
			ctx.lineWidth = 4;
			ctx.strokeRect(x, y, colW, colH);

			ctx.font = '30px arial';
			ctx.fillStyle = 'white';
			const text = player.place + '. ' + player.user.username;
			const playerX = x + (colW / 2) - (ctx.measureText(text).width / 2);
			ctx.fillText(text, playerX, y + padding);

			ctx.strokeRect(x + colW, y, colW, colH);
			ctx.fillStyle = 'white';
			const scoreText = player.tournamentPoints.toString();
			const scoreX = x + colW + (colW / 2) - (ctx.measureText(scoreText).width / 2);
			ctx.fillText(scoreText, scoreX, y + padding);

			ctx.strokeRect(x + colW * 2, y, colW, colH);
			let coinText = '';
			if (this.gameType === GameType.BLOCK_BATTLE)
				coinText = player.coinsCollected.toString();
			else if (this.gameType === GameType.PONG)
				coinText = player.pongPointsScored.toString();
			const coinX = x + colW * 2 + (colW / 2) - (ctx.measureText(coinText).width / 2);
			ctx.fillText(coinText, coinX, y + padding);

			y += colH;
		}
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


		if (!this.curState)
		{
			// Draw Header & Score Board
			drawCenteredText(this.canvas, this.ctx, this.t('score_board'), '50px Impact', 'white', 100);
			this.drawScoreBoard(ctx);
	
			// Draw Return button
			this.returnMenuButton.draw(ctx, this.t, 0);
			let exitWarning;
			if (!this.isFinished)
				exitWarning = this.t('lose_progress');
			else
				exitWarning = this.t('safe_exit')
			ctx.font = '20px arial';
			ctx.fillStyle = 'white';
			const warningX = this.returnMenuButton.x;
			const warningY = this.returnMenuButton.y + this.returnMenuButton.height + 20;
			ctx.fillText(exitWarning, warningX, warningY);

			// Draw Next game button || Winner announcement
			if (!this.isFinished)
			{
				this.nextGameBtn.draw(ctx, this.t, 0);

				const nextGameNum = `${this.t('game_no')}${(this.matchCounter + 1).toString()}/6`;
				const gameNumY = this.nextGameBtn.y + this.nextGameBtn.height + 50;
				drawCenteredText(this.canvas, this.ctx, nextGameNum, '30px arial', 'white', gameNumY);

	/*			const id1 = GameOrder[this.matchCounter][0];
				const id2 = GameOrder[this.matchCounter][1];
				const player1 = this.playerArr.find(player => player.id === id1);
				const player2 = this.playerArr.find(player => player.id === id2);
				let playerInfo = '';
				if (player1 && player2)
					playerInfo = `(${player1.user.username} vs ${player2.user.username})`;
				const playerInfoY = gameNumY + 26;
				drawCenteredText(this.canvas, this.ctx, playerInfo, '25px arial', 'red', playerInfoY); */

			}
			else
			{
				let y = (this.canvas.height / 2) - 20 - TEXT_PADDING + 270;

				drawCenteredText(this.canvas, this.ctx, this.t('tournament_winner'), '50px Impact', 'green', y);
				y += 40

				for (const player of this.tournamentWinner)
				{

					drawCenteredText(this.canvas, this.ctx, player.user.username, '30px arial', 'white', y);
					y += 40;
				}
			}
		}
		else
		{
			this.curState.render(ctx);
		}

	}

}