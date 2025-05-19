import { CollisionShape, collType } from "./CollisionShape";
import { WALL_THICKNESS, FLOOR_THICKNESS } from "./Constants";

export class Projectile {
    x: number;
    y: number;
    width: number;
    height: number;
    velocity: { x: number, y: number };
    color: string;
	cShape: CollisionShape;
	isValid: boolean;

    constructor(x: number, y: number, velocity: { x: number, y: number }, color: string, width: number, height: number) {
        this.x = x;
        this.y = y;

        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.color = color;
		this.cShape = new CollisionShape(x, y, this.width, this.height, collType.BULLET, this);
		this.isValid = true;
    }

    update(canvas: HTMLCanvasElement, deltaTime: number) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

		this.cShape.move(this.x, this.y);

		if (this.x <= WALL_THICKNESS || this.x >= canvas.width - WALL_THICKNESS - this.width || 
			this.y <= 0 || this.y >= canvas.height - FLOOR_THICKNESS - this.height)
		{
			this.isValid = false;
		}
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
