import { GameStateManager, GameStates, IGameState } from "./GameStates";
import { ReturnMainMenuButton } from "./EndScreen";
import { ctx } from "../components/index";
import { TEXT_PADDING, BUTTON_HOVER_COLOR } from "./Constants";
import { UserManager } from "../UI/UserManager";

export class Instructions implements IGameState
{
	name: GameStates;
	canvas: HTMLCanvasElement;
	returnMenuButton: ReturnMainMenuButton;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;

	constructor(canvas: HTMLCanvasElement)
	{
		this.name = GameStates.INSTRUCTIONS;
		this.canvas = canvas;

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
		UserManager.drawCurUser();
		
		// Draw info box
		const boxPadding = 70;
		const boxW = this.canvas.width - 2 * boxPadding;
		const boxH = this.canvas.height - 2 * boxPadding;
		ctx.fillStyle = BUTTON_HOVER_COLOR;
		ctx.fillRect(boxPadding, boxPadding, boxW, boxH);

		// Draw header
		const headerText = 'GAME INSTRUCTIONS';
		ctx.font = '50px arial';
		ctx.fillStyle = 'black';
		const headerX = (this.canvas.width / 2) - (ctx.measureText(headerText).width / 2);
		const headerY = boxPadding + 60 + 10; // 60 = font size, 10 = small margin
		ctx.fillText(headerText, headerX, headerY);

		// Draw info text
		const infoTextArr = this.getInstructionText();
		ctx.font = '28px arial';
		ctx.fillStyle = 'black';
		let infoX: number, infoY: number;
		let lineCount = 1;
		let lineHeight = 32;

		for (const line of infoTextArr)
		{
			infoX = (this.canvas.width / 2) - (ctx.measureText(line).width / 2);
			infoY = headerY + 20 + lineHeight * lineCount; // 20 = font size
			ctx.fillText(line, infoX, infoY);
			lineCount++;
		}

		this.returnMenuButton.draw(ctx);
	}

	getInstructionText(): string []
	{
		let lines: string [] = [
			"These are the instructions.",
			"They will be updated later =)",
		];

		return lines;
	}

}