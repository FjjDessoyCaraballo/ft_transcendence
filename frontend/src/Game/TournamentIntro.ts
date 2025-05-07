import { GameStates, IGameState } from "./GameStates";
import { ReturnMainMenuButton } from "./EndScreen";
import { ctx, canvas } from "../components/Canvas";
import { TEXT_PADDING, BUTTON_HOVER_COLOR } from "./Constants";
import { UserManager } from "../UI/UserManager";
import { Button } from "../UI/Button";
import { stateManager } from "../components";
import { UserHUB } from "../UI/UserHUB";
import { GameType, UserHubState } from "../UI/Types";


export class PongTournamentBtn extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new UserHUB(canvas, UserHubState.TOURNAMENT, GameType.PONG));
	}
}

export class BBTournamentBtn extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
		stateManager.changeState(new UserHUB(canvas, UserHubState.TOURNAMENT, GameType.BLOCK_BATTLE));
	}
}




export class TournamenIntro implements IGameState
{
	name: GameStates;
	returnMenuButton: ReturnMainMenuButton;
	PongBtn: PongTournamentBtn;
	BlockBattleBtn: BBTournamentBtn;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor()
	{
		this.name = GameStates.TOURNAMENT_INTRO;

		let pongText = 'PONG';
		ctx.font = '35px arial' // GLOBAL USE OF CTX!!
		const pongX = (canvas.width / 2) - (ctx.measureText(pongText).width / 2) - TEXT_PADDING;
		const pongY = 350;
		this.PongBtn = new PongTournamentBtn(pongX, pongY, 'red', '#780202', pongText, 'white', '35px', 'arial');

		let bbText = 'BLOCK BATTLE';
		const bbX = (canvas.width / 2) - (ctx.measureText(bbText).width / 2) - TEXT_PADDING;
		const bbY = 420;
		this.BlockBattleBtn = new BBTournamentBtn(bbX, bbY, '#0426bd', '#023075', bbText, 'white', '35px', 'arial');

		let text = 'RETURN TO MENU';
		ctx.font = '25px arial' // GLOBAL USE OF CTX!!
		const buttonX = (canvas.width / 2) - (ctx.measureText(text).width / 2) - TEXT_PADDING;
		const buttonY = (canvas.height / 2) - 20 - TEXT_PADDING + 370;
		this.returnMenuButton = new ReturnMainMenuButton(buttonX, buttonY, 'red', '#780202', text, 'white', '25px', 'arial');


		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();
	}

	mouseMoveCallback(event: MouseEvent)
	{
		const rect = canvas.getBoundingClientRect();
		
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const x = (event.clientX - rect.left) * scaleX;
		const y = (event.clientY - rect.top) * scaleY;

		this.PongBtn.checkMouse(x, y);
		this.BlockBattleBtn.checkMouse(x, y);
		this.returnMenuButton.checkMouse(x, y);
	}

	mouseClickCallback()
	{		
		this.PongBtn.checkClick();
		this.BlockBattleBtn.checkClick();
		this.returnMenuButton.checkClick();
	}

	enter()
	{
		canvas.addEventListener('mousemove', this.mouseMoveBound);
		canvas.addEventListener('click', this.mouseClickBound);
	}

	exit()
	{
		canvas.removeEventListener('mousemove', this.mouseMoveBound);
		canvas.removeEventListener('click', this.mouseClickBound);
	}

	update(deltaTime: number)
	{
	}

	render(ctx: CanvasRenderingContext2D)
	{
		UserManager.drawCurUser();
		
		// Draw header
		const headerText = 'WELCOME TO TOURNAMENT MODE';
		ctx.font = '50px Impact';
		ctx.fillStyle = 'green';
		const headerX = (canvas.width / 2) - (ctx.measureText(headerText).width / 2);
		const headerY = 150;
		ctx.fillText(headerText, headerX, headerY);

		const infoText = 'Please choose the game type for your tournament';
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const infoX = (canvas.width / 2) - (ctx.measureText(infoText).width / 2);
		const infoY = 300;
		ctx.fillText(infoText, infoX, infoY);

		this.PongBtn.draw(ctx);
		this.BlockBattleBtn.draw(ctx);
		this.returnMenuButton.draw(ctx);
	}

	

}