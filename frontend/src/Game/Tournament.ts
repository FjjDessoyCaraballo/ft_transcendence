import { ctx } from "../components/Canvas";
import { GameStates, IGameState, } from "./GameStates";
import { TEXT_PADDING } from "./Constants";
import { User } from "../UI/UserManager";
import { ReturnMainMenuButton } from "./EndScreen";
import { InGame } from "./InGame";
import { Button } from "../UI/Button";
import { MatchIntro } from "./MatchIntro";
import { EndScreen } from "./EndScreen";

export interface TournamentPlayer
{
	id: number;
	user: User;
	tournamentPoints: number;
	place: number;
	coinsCollected: number;
	isWinner: boolean;
}

const GameOrder: [number, number][] = [
	[0, 1],
	[2, 3],
	[0, 2],
	[1, 3],
	[3, 0],
	[2, 1]
];


export class NextGameBtn extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void 
	{
	}
}

export class Tournament implements IGameState
{
	name: GameStates;
	canvas: HTMLCanvasElement;
	playerArr: TournamentPlayer [];
	curMatch: MatchIntro | InGame | EndScreen | null;
	matchCounter: number;
	isFinished: boolean;
	tournamentWinner: TournamentPlayer [];
	returnMenuButton: ReturnMainMenuButton;
	nextGameBtn: NextGameBtn;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement, players: User[])
	{
		this.name = GameStates.TOURNAMENT;
		this.canvas = canvas;
		this.playerArr = [];
		this.curMatch = null;
		this.matchCounter = 0;
		this.isFinished = false;
		this.tournamentWinner = [];

		// Create TournamentPlayer array
		for (let i = 0; i < 4; i++)
		{
			let tournamentObj: TournamentPlayer = {
				id: i,
				user: players[i],
				place: 0,
				tournamentPoints: 0,
				coinsCollected: 0,
				isWinner: false
			};

			this.playerArr.push(tournamentObj);
		}

		let text1 = 'EXIT TOURNAMENT'; // Add a warning here that all tournament data will be lost
		ctx.font = '25px arial' // GLOBAL USE OF CTX!!
		const button1X = 20;
		const button1Y = 20;
		this.returnMenuButton = new ReturnMainMenuButton(button1X, button1Y, 'red', '#780202', text1, 'white', '25px', 'arial');

		let text2 = 'NEXT GAME';
		ctx.font = '35px arial' // GLOBAL USE OF CTX!!
		const button2X = (canvas.width / 2) - (ctx.measureText(text2).width / 2) - TEXT_PADDING;
		const button2Y = (canvas.height / 2) - 20 - TEXT_PADDING + 270;
		this.nextGameBtn = new NextGameBtn(button2X, button2Y, 'green', '#054d19', text2, 'white', '35px', 'arial');

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

		this.returnMenuButton.checkMouse(x, y);

		if (!this.isFinished)
			this.nextGameBtn.checkMouse(x, y);
	}

	mouseClickCallback()
	{
		this.returnMenuButton.checkClick();
		
		if (!this.isFinished && this.nextGameBtn.checkClick())
		{
			const id1 = GameOrder[this.matchCounter][0];
			const id2 = GameOrder[this.matchCounter][1];
			const player1 = this.playerArr.find(player => player.id === id1);
			const player2 = this.playerArr.find(player => player.id === id2);

			if (player1 && player2)
			{
				this.curMatch = new MatchIntro(this.canvas, player1.user, player2.user, player1, player2);
				this.curMatch.enter();
			}
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
		if (this.curMatch)
		{
			this.curMatch.update(deltaTime);
			if (this.curMatch.isStateReady)
			{
				const id1 = GameOrder[this.matchCounter][0];
				const id2 = GameOrder[this.matchCounter][1];
				const player1 = this.playerArr.find(player => player.id === id1);
				const player2 = this.playerArr.find(player => player.id === id2);
				this.curMatch.exit();
				
				if (this.curMatch.name === GameStates.MATCH_INTRO && player1 && player2)
				{	
					this.curMatch = new InGame(this.canvas, player1.user, player2.user, player1, player2);
					this.curMatch.enter();
				}
				else if (this.curMatch.name === GameStates.IN_GAME && player1 && player2)
				{
					const winner = player1.isWinner ? player1 : player2;
					const loser = player1.isWinner ? player2 : player1;

					this.curMatch = new EndScreen(this.canvas, winner.user, loser.user, winner, loser);
					this.curMatch.enter();
					player1.isWinner = false;
					player2.isWinner = false;

					this.playerArr.sort((a, b) => {
						if (b.tournamentPoints !== a.tournamentPoints)
							return b.tournamentPoints - a.tournamentPoints;
						return b.coinsCollected - a.coinsCollected;
					})
				}
				else
				{
					this.curMatch = null;
					this.matchCounter++;
					if (this.matchCounter === 6)
					{
						this.isFinished = true;
						this.findWinner();
					}
				}
			}
		}
	}

	findWinner(): void
	{
		this.playerArr.sort((a, b) => {
			if (b.tournamentPoints !== a.tournamentPoints)
				return b.tournamentPoints - a.tournamentPoints;
			return b.coinsCollected - a.coinsCollected;
		})

		this.tournamentWinner.push(this.playerArr[0]);

		if (this.playerArr[0].tournamentPoints === this.playerArr[1].tournamentPoints
			&& this.playerArr[0].coinsCollected === this.playerArr[1].coinsCollected)
		{
			for (let i = 1; i < 4; i++)
			{
				if (this.playerArr[i].tournamentPoints === this.playerArr[0].tournamentPoints
					&& this.playerArr[i].coinsCollected === this.playerArr[0].coinsCollected)
					this.tournamentWinner.push(this.playerArr[i]);
			}
		}
	}

	drawScoreBoard(ctx: CanvasRenderingContext2D)
	{
		const colW = 200;
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
		const usernameText = 'USERNAME';
		const usernameX = x + (colW / 2) - (ctx.measureText(usernameText).width / 2);
		ctx.fillText(usernameText, usernameX, y + padding + 5);

		ctx.strokeRect(x + colW, y, colW, colH);
		const pointsText = 'POINTS';
		const pointsX = x + colW + (colW / 2) - (ctx.measureText(pointsText).width / 2);
		ctx.fillText(pointsText, pointsX, y + padding + 5);

		ctx.strokeRect(x + colW * 2, y, colW, colH);
		const coinText = 'COINS';
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
			const coinText = player.coinsCollected.toString();
			const coinX = x + colW * 2 + (colW / 2) - (ctx.measureText(coinText).width / 2);
			ctx.fillText(coinText, coinX, y + padding);

			y += colH;
		}
	}

	render(ctx: CanvasRenderingContext2D)
	{

		if (!this.curMatch)
		{
			// Draw header
			const headerText = "SCORE BOARD";
			ctx.font = '50px Impact';
			ctx.fillStyle = 'white';
			const headerX = (this.canvas.width / 2) - (ctx.measureText(headerText).width / 2);
			ctx.fillText(headerText, headerX, 100);
			
			this.drawScoreBoard(ctx);
	
			// Draw Return button
			this.returnMenuButton.draw(ctx);
			let exitWarning;
			if (!this.isFinished)
				exitWarning = `(Exit now == lose tournament progress)`;
			else
				exitWarning = '(You can now safely exit the tournament)';
			ctx.font = '20px arial';
			ctx.fillStyle = 'white';
			const warningX = this.returnMenuButton.x;
			const warningY = this.returnMenuButton.y + this.returnMenuButton.height + 20;
			ctx.fillText(exitWarning, warningX, warningY);

			// Draw Next game button || Winner announcement
			if (!this.isFinished)
			{
				this.nextGameBtn.draw(ctx);
				const nextGameNum = `Game no. ${(this.matchCounter + 1).toString()}/6`;
				ctx.font = '25px arial';
				ctx.fillStyle = 'white';
				const gameNumX = this.nextGameBtn.x;
				const gameNumY = this.nextGameBtn.y + this.nextGameBtn.height + 20;
				ctx.fillText(nextGameNum, gameNumX, gameNumY);
			}
			else
			{
				const headerText = "TOURNAMENT WINNER(s):";
				ctx.font = '50px Impact';
				ctx.fillStyle = 'green';
				const headerX = (this.canvas.width / 2) - (ctx.measureText(headerText).width / 2);
				let y = (this.canvas.height / 2) - 20 - TEXT_PADDING + 270;
				ctx.fillText(headerText, headerX, y);
				y += 40

				for (const player of this.tournamentWinner)
				{
					const playerText = player.user.username;
					ctx.font = '30px arial';
					ctx.fillStyle = 'white';
					const playerX = (this.canvas.width / 2) - (ctx.measureText(playerText).width / 2);
					ctx.fillText(playerText, playerX, y);

					y += 40;
				}
			}
		}
		else
		{
			this.curMatch.render(ctx);
		}

	}

}