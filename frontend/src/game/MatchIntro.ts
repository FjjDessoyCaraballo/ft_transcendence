import { GameStates, IGameState } from "./GameStates";
import { stateManager } from "../components/index";
import { User } from "../UI/UserManager";
import { BlockBattle } from "./BlockBattle";
import { TournamentPlayer } from "./Tournament";
import { GameType } from "../UI/Types";
import { Pong } from "./pong/Pong";
import { drawCenteredText, drawText } from "./StartScreen";
import { BB_SHOOT_1, BB_SHOOT_2, PONG_UP_1, PONG_UP_2, DEEP_PURPLE } from "./Constants";


export class MatchIntro implements IGameState
{
	name: GameStates;
	player1: User;
	player2: User;
	tournamentData1: TournamentPlayer | null;
	tournamentData2: TournamentPlayer | null;
	isStateReady: boolean;
	p1IsReady: boolean;
	p2IsReady: boolean;
	keys: { [key: string]: boolean };
	canvas: HTMLCanvasElement;
	gameType: GameType;
	KeyDownBound: (event: KeyboardEvent) => void;
	KeyUpBound: (event: KeyboardEvent) => void;

	constructor(canvas: HTMLCanvasElement, player1: User, player2: User | null, tData1: TournamentPlayer | null, tData2: TournamentPlayer | null, type: GameType)
	{
		this.name = GameStates.MATCH_INTRO;

		// We should create a user in the DB for AI computer. Then we could track it's win/lose stats etc :D
		if (!player2)
		{
			player2 = {
				username: 'Computer',
				password: '',
				wins: 0,
				losses: 0,
				rankingPoint: 9999,
			};
		}

		this.canvas = canvas;
		this.player1 = player1;
		this.player2 = player2;
		this.keys = {}; // Maybe in enter() ?
		this.gameType = type;
		this.p1IsReady = false;
		if (this.gameType === GameType.PONG_AI)
			this.p2IsReady = true;
		else
			this.p2IsReady = false;
		this.tournamentData1 = tData1;
		this.tournamentData2 = tData2;
		this.isStateReady = false;

		this.KeyDownBound = (event: KeyboardEvent) => this.keyDownCallback(event);
		this.KeyUpBound = (event: KeyboardEvent) => this.keyUpCallback(event);

	}

	keyDownCallback(event: KeyboardEvent)
	{
		this.keys[event.key] = true;
	}

	keyUpCallback(event: KeyboardEvent)
	{
		this.keys[event.key] = false;
	}

	enter()
	{
		document.addEventListener('keydown', this.KeyDownBound);
		document.addEventListener('keyup', this.KeyUpBound);
	}

	exit()
	{
		document.removeEventListener('keydown', this.KeyDownBound);
		document.removeEventListener('keyup', this.KeyUpBound);
	}

	update(deltaTime: number)
	{
		if (this.keys[BB_SHOOT_1] && this.gameType === GameType.BLOCK_BATTLE)
			this.p1IsReady = true;
		else if (this.keys[PONG_UP_1] && (this.gameType === GameType.PONG || this.gameType === GameType.PONG_AI))
			this.p1IsReady = true;

		if (this.keys[BB_SHOOT_2] && this.gameType === GameType.BLOCK_BATTLE)
			this.p2IsReady = true;
		else if (this.keys[PONG_UP_2] && this.gameType === GameType.PONG)
			this.p2IsReady = true;

		if (this.p1IsReady && this.p2IsReady)
		{
			if (!this.tournamentData1)
			{
				if (this.gameType === GameType.BLOCK_BATTLE)
					stateManager.changeState(new BlockBattle(this.canvas, this.player1, this.player2, null, null));
				else if (this.gameType === GameType.PONG)
					stateManager.changeState(new Pong(this.player1, this.player2, null, null, 'playing'));
				else if (this.gameType === GameType.PONG_AI)
					stateManager.changeState(new Pong(this.player1, this.player2, null, null, 'ai'));
			}
			else
				this.isStateReady = true;
		}
	}

	render(ctx: CanvasRenderingContext2D)
	{
		const p1FillColor = this.p1IsReady ? 'green' : 'red';
		const p2FillColor = this.p2IsReady ? 'green' : 'red';

		// Add the expected ranking point diff here...?

		drawCenteredText("GAME IS ABOUT TO START!", '70px Impact', DEEP_PURPLE, 100);

		let infoText = '';
		if (this.gameType != GameType.BLOCK_BATTLE)
		{
			infoText = `Press the up key (${this.player1.username}: '${PONG_UP_1}' / ${this.player2.username}: '${PONG_UP_2}') when you are ready to play`;
		}
		else
			infoText = `Press the shoot key (${this.player1.username}: '${BB_SHOOT_1}' / ${this.player2.username}: '${BB_SHOOT_2}') when you are ready to play`;
		drawCenteredText(infoText, '30px arial', 'white', 150);

		let p1Text = this.player1.username;
		let p1X = 140;
		drawText(p1Text, '55px arial', p1FillColor, p1X, 440);

		let p1Rank;
		if (!this.tournamentData1)
			p1Rank = `Ranking points: ${this.player1.rankingPoint.toFixed(2)}`;
		else
		{
			p1Rank = `Place: ${this.tournamentData1.place}
			Points: ${this.tournamentData1.tournamentPoints}`;
		}
		const halfOfP1Text = ctx.measureText(p1Text).width / 2;
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const rank1X = p1X + halfOfP1Text - ctx.measureText(p1Rank).width / 2;
		ctx.fillText(p1Rank, rank1X, 480);

		drawCenteredText('VS', '60px arial', 'white', 440);

		const p2Text = this.player2.username;
		const p2X = this.canvas.width - ctx.measureText(p2Text).width - 140;
		drawText(p2Text, '55px arial', p2FillColor, p2X, 440);

		let p2Rank;
		if (!this.tournamentData2)
			p2Rank = `Ranking points: ${this.player2.rankingPoint.toFixed(2)}`;
		else
		{
			p2Rank = `Place: ${this.tournamentData2.place}
			Points: ${this.tournamentData2.tournamentPoints}`;
		}
		const halfOfP2Text = ctx.measureText(p2Text).width / 2;
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const rank2X = p2X + halfOfP2Text - ctx.measureText(p2Rank).width / 2;
		ctx.fillText(p2Rank, rank2X, 480);

	}

}