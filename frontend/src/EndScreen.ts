import { GameStates, IGameState } from "./GameStates.js";
import { Button } from "./Button.js";
import { stateManager, canvas, ctx } from "./index.js";
import { MainMenu } from "./MainMenu.js";
import { TEXT_PADDING } from "./constants.js";
import { UserManager, User } from "./UserManager.js";

export class ReturnMainMenuButton extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		
		stateManager.changeState(new MainMenu(canvas));

	}
}


export class EndScreen implements IGameState
{
	name: GameStates;
	winner: User;
	loser: User;
	canvas: HTMLCanvasElement;
	returnMenuButton: ReturnMainMenuButton;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement, winner: User, loser: User)
	{
		this.name = GameStates.END_SCREEN;

		this.canvas = canvas;
		this.winner = winner;
		this.loser = loser;

		let text = 'RETURN TO MENU';
		ctx.font = '40px arial' // GLOBAL USE OF CTX!!
		const buttonX = (canvas.width / 2) - (ctx.measureText(text).width / 2) - TEXT_PADDING;
		const buttonY = (canvas.height / 2) + 200 - TEXT_PADDING;

		this.returnMenuButton = new ReturnMainMenuButton(buttonX, buttonY, 'red', '#780202', text, 'white', '40px', 'arial');

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();

		UserManager.updateUserStats(winner, loser);
	}

	mouseMoveCallback(event: MouseEvent)
	{
		const rect = this.canvas.getBoundingClientRect();
		
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		const x = (event.clientX - rect.left) * scaleX;
		const y = (event.clientY - rect.top) * scaleY;

		this.returnMenuButton.checkMouse(x, y);
	}

	mouseClickCallback()
	{
		this.returnMenuButton.checkClick();
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
		const text = this.winner.username + ' wins the game!';
		ctx.font = '40px arial';
		ctx.fillStyle = '#1cc706';
		const textX = (this.canvas.width / 2) - (ctx.measureText(text).width / 2);
		ctx.fillText(text, textX, 200);

		const winnerRankText = `The new rank of ${this.winner.username} is ${this.winner.rankingPoint.toFixed(2)}.`;
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const ranking1X = (this.canvas.width / 2) - (ctx.measureText(winnerRankText).width / 2);
		ctx.fillText(winnerRankText, ranking1X, 300);

		const loserRankText = `The new rank of ${this.loser.username} is ${this.loser.rankingPoint.toFixed(2)}.`;
		const ranking2X = (this.canvas.width / 2) - (ctx.measureText(loserRankText).width / 2);
		ctx.fillText(loserRankText, ranking2X, 340);

		this.returnMenuButton.draw(ctx);
	}

}