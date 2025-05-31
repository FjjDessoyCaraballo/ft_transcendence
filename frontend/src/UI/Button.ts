import { TEXT_PADDING } from "../game/Constants";
import { TFunction } from 'i18next';

export abstract class Button
{
	x: number;
	y: number;
	width: number;
	height: number;
	boxColor: string;
	hoverColor: string;
	textKey: string;
	textColor: string;
	textSize: string;
	font: string;
	isHover: boolean;
	t: TFunction;

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, textKey: string, textColor: string, textSize: string, font: string, t: TFunction)
	{
		this.x = x;
		this.y = y;
		this.boxColor = boxColor;
		this.hoverColor = hoverColor;
		this.textKey = textKey;
		this.textColor = textColor;
		this.textSize = textSize;
		this.font = font;
		this.isHover = false;
		this.t = t;

		ctx.font = textSize + ' ' + font;
		const textMetrics = ctx.measureText(this.t(this.textKey));
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


	draw(ctx: CanvasRenderingContext2D, t: TFunction) // may have to pass canvas into here too...
	{
		//ctx.font = this.textSize + ' ' + this.font;
		const translatedText = t(this.textKey);
		/*const textMetrics1 = ctx.measureText(translatedText);
		this.width = textMetrics1.width + 2 * TEXT_PADDING;
		this.x = 600 - (ctx.measureText(translatedText).width / 2) - TEXT_PADDING; //magic number 600 is canvas width / 2*/
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
		const textX = (this.x + this.width / 2) - (ctx.measureText(translatedText).width / 2)
		const textY = (this.y + this.height / 2) + (fontSize / 2) - TEXT_PADDING;

		ctx.fillText(translatedText, textX, textY);

	}
}