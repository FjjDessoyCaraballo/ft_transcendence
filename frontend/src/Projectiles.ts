import { CollisionShape, collType } from "./CollisionShape";
import { WALL_THICKNESS, FLOOR_THICKNESS } from "./constants";

export class Projectile {
    x: number;
    y: number;
    width: number;
    height: number;
    velocity: { x: number, y: number };
    color: string;
	cShape: CollisionShape;
	isValid: boolean;

    constructor(x: number, y: number, velocity: { x: number, y: number }) {
        this.x = x;
        this.y = y;

        this.velocity = velocity;
        this.width = 10; // Add to constants?
        this.height = 5; // Add to constants?
        this.color = 'red';
		this.cShape = new CollisionShape(x, y, this.width, this.height, collType.BULLET, this);
		this.isValid = true;
    }

    update(canvas: HTMLCanvasElement, deltaTime: number) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

		this.cShape.move(this.x, this.y);

		if (this.x <= WALL_THICKNESS || this.x >= canvas.width - WALL_THICKNESS - this.width || 
			this.y <= 0 || this.y >= canvas.height - FLOOR_THICKNESS - this.width)
		{
			this.isValid = false;
		}
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
