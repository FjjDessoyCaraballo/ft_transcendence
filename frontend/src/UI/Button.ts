import { ctx } from "../components/Canvas"; // is this bad...? Using global variable?
import { TEXT_PADDING } from "../game/Constants";

export abstract class Button
{
	x: number;
	y: number;
	width: number;
	height: number;
	boxColor: string;
	hoverColor: string;
	text: string;
	textColor: string;
	textSize: string;
	font: string;
	isHover: boolean;

	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		this.x = x;
		this.y = y;
		this.boxColor = boxColor;
		this.hoverColor = hoverColor;
		this.text = text;
		this.textColor = textColor;
		this.textSize = textSize;
		this.font = font;
		this.isHover = false;

		ctx.font = textSize + ' ' + font;
		const textMetrics = ctx.measureText(this.text);
		this.width = textMetrics.width + 2 * TEXT_PADDING;
		this.height = parseInt(textSize) + 2 * TEXT_PADDING;
	}

	abstract clickAction(): void;


	checkMouse(mouseX: number, mouseY: number)
	{
		if (mouseX > this.x && mouseX < this.x + this.width
			&& mouseY > this.y && mouseY < this.y + this.height
		)
		{
			this.isHover = true;
		}
		else
			this.isHover = false;

	}

	checkClick(): boolean
	{
		if (!this.isHover)
			return false;
		else
		{
			this.clickAction();
			return true;
		}
	}


	draw(ctx: CanvasRenderingContext2D)
	{
		let color;

		if (this.isHover)
			color = this.hoverColor;
		else
			color = this.boxColor;

		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = this.textColor;
		ctx.font = this.textSize + ' ' + this.font;

		let fontSize: number = parseInt(this.textSize);
		const textX = (this.x + this.width / 2) - (ctx.measureText(this.text).width / 2)
		const textY = (this.y + this.height / 2) + (fontSize / 2) - TEXT_PADDING;

		ctx.fillText(this.text, textX, textY);

	}


}