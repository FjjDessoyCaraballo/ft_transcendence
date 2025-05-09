import { MAX_HEALTH, HEALTH_WIDTH, HEALT_HEIGHT } from "./Constants";

export class Health
{
	amount: number;
	color: string;

	constructor()
	{
		this.amount = MAX_HEALTH;
		this.color = 'green';
	}

	addHealth(addition: number)
	{
		this.amount += addition;

		if (this.amount <= MAX_HEALTH * 0.333)
			this.color = 'red';
		else if (this.amount <= MAX_HEALTH * 0.666)
			this.color = 'yellow';
		else
			this.color = 'green';

		if (this.amount > MAX_HEALTH)
			this.amount = MAX_HEALTH;
	}

	takeDmg(damage: number)
	{
		this.amount -= damage;

		if (this.amount <= MAX_HEALTH * 0.333)
			this.color = 'red';
		else if (this.amount <= MAX_HEALTH * 0.666)
			this.color = 'yellow';
		else
			this.color = 'green';

		if (this.amount < 0)
			this.amount = 0;
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number)
	{
		let borderWidth = 4;
		let width = HEALTH_WIDTH;
		let height = HEALT_HEIGHT;
		let healthWidth = (HEALTH_WIDTH / MAX_HEALTH) * this.amount;

		// Borders (4 px per side)
		ctx.fillStyle = 'white';
		ctx.fillRect(x - borderWidth, y - borderWidth, width + borderWidth * 2, height + borderWidth * 2);

		// Background
		ctx.fillStyle = 'black';
		ctx.fillRect(x, y, width, height);

		// Health
		ctx.fillStyle = this.color;
		ctx.fillRect(x, y, healthWidth, height);

	}

}