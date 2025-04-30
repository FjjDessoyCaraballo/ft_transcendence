import { GameStates, IGameState } from "./GameStates";
import { Button } from "./Button";
import { stateManager, canvas, ctx } from "./components/index";
import { MainMenu } from "./MainMenu";
import { TEXT_PADDING } from "./constants";
import { UserManager, User } from "./UserManager";
import { InGame } from "./InGame";


export class MatchIntro implements IGameState
{
	name: GameStates;
	player1: User;
	player2: User;
	p1IsReady: boolean;
	p2IsReady: boolean;
	keys: { [key: string]: boolean };
	canvas: HTMLCanvasElement;
	KeyDownBound: (event: KeyboardEvent) => void;
	KeyUpBound: (event: KeyboardEvent) => void;

	constructor(canvas: HTMLCanvasElement, player1: User, player2: User)
	{
		this.name = GameStates.MATCH_INTRO;

		this.canvas = canvas;
		this.player1 = player1;
		this.player2 = player2;
		this.keys = {}; // Maybe in enter() ?
		this.p1IsReady = false;
		this.p2IsReady = false;

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
		if (this.keys[' '])
			this.p1IsReady = true;

		if (this.keys['u'])
			this.p2IsReady = true;

		if (this.p1IsReady && this.p2IsReady)
			stateManager.changeState(new InGame(this.canvas, this.player1, this.player2));
	}

	render(ctx: CanvasRenderingContext2D)
	{
		const p1FillColor = this.p1IsReady ? 'green' : 'red';
		const p2FillColor = this.p2IsReady ? 'green' : 'red';

		// Add the expected ranking point diff here

		const header = "GAME IS ABOUT TO START!";
		ctx.font = '70px Impact';
		ctx.fillStyle = '#0a42ab';
		const headerX = (this.canvas.width / 2) - (ctx.measureText(header).width / 2);
		ctx.fillText(header, headerX, 100);

		const info = "(press the shoot key when you are ready to play)";
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const infoX = (this.canvas.width / 2) - (ctx.measureText(info).width / 2);
		ctx.fillText(info, infoX, 140);

		const p1Text = this.player1.username;
		ctx.font = '55px arial';
		ctx.fillStyle = p1FillColor;
		const p1X = 100;
		ctx.fillText(p1Text, p1X, 440);

		const p1Rank = `(${this.player1.rankingPoint.toFixed(2)})`;
		const halfOfP1Text = ctx.measureText(p1Text).width / 2;
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const rank1X = p1X + halfOfP1Text - ctx.measureText(p1Rank).width / 2;
		ctx.fillText(p1Rank, rank1X, 480);

		ctx.font = '60px arial';
		ctx.fillStyle = 'white';
		ctx.fillText('VS', (this.canvas.width / 2) - (ctx.measureText('VS').width / 2), 440);

		const p2Text = this.player2.username;
		ctx.font = '55px arial';
		ctx.fillStyle = p2FillColor;
		const p2X = this.canvas.width - ctx.measureText(p2Text).width - 100;
		ctx.fillText(p2Text, p2X, 440);

		const p2Rank = `(${this.player2.rankingPoint.toFixed(2)})`;
		const halfOfP2Text = ctx.measureText(p2Text).width / 2;
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const rank2X = p2X + halfOfP2Text - ctx.measureText(p2Rank).width / 2;
		ctx.fillText(p2Rank, rank2X, 480);

	}

}