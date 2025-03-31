import { BULLET_DMG } from "./constants.js";


export enum collType
{
	PLAYER,
	PLATFORM,
	FALL,
	BULLET,
	NON
}

export class CollisionShape
{
	x: number;
	y: number;
	width: number;
	height: number;
	color: string;
	type: collType;
	master: any;

	constructor(x: number, y: number, width: number, height: number, type: collType, master: any) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = 'red';
		this.type = type;
		this.master = master;
	}

	move(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

	checkCollision(obj: CollisionShape, prevPoint: { x: number, y: number }): collType
	{
		if ((this.x > obj.x && this.x < obj.x + obj.width)
		|| (this.x + this.width > obj.x && this.x + this.width < obj.x + obj.width))
		{
			if (obj.y > prevPoint.y + this.height && obj.y < this.y + this.height)
			{
				return collType.FALL;
			}
		}
		if (this.x + this.width < obj.x ||
            this.x > obj.x + obj.width ||
            this.y + this.height < obj.y ||
            this.y > obj.y + obj.height)
        {
			// This statement checks if this object is completely to the left, right, above or below of the other object
            return collType.NON;
        }

        return collType.PLATFORM;
	}

	checkFallCollision(obj: CollisionShape, prevPointY: number, curPointY: number): boolean
	{
		if (obj.y > prevPointY && obj.y < curPointY)
			return true;
		else
			return false;
	}

	checkBulletCollision(obj: CollisionShape): boolean
	{
		if (this.x + this.width < obj.x ||
            this.x > obj.x + obj.width ||
            this.y + this.height < obj.y ||
            this.y > obj.y + obj.height)
        {
			// This statement checks if this object is completely to the left, right, above or below of the other object
            return false;
        }
		if (obj.type != collType.PLAYER || this.type != collType.BULLET)
			return false;

		// The 'obj' has to be of type PLAYER and this has to be of type BULLET
		obj.master.health.takeDmg(BULLET_DMG);
		this.master.isValid = false;

		return true;
	}

	isPointInShape(point: { x: number, y: number}): boolean
	{
		if (point.x > this.x && point.x < this.x + this.width
			&& point.y > this.y && point.y < this.y + this.height
		)
			return true;
		else
			return false;
	}
}