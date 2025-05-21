import { CollisionShape, collType } from "./CollisionShape";
import { WALL_THICKNESS, FLOOR_THICKNESS } from "./Constants";
import { Platform, PlatformDir } from "./Platform";

export class Projectile {
    x: number;
    y: number;
    width: number;
    height: number;
    velocity: { x: number, y: number };
    color: string;
	cShape: CollisionShape;
	isValid: boolean;
	creationTime: number = Date.now(); // ms
	onPlatform: Platform | null = null;

    constructor(x: number, y: number, velocity: { x: number, y: number }, color: string, width: number, height: number, platform: Platform | null) {
        this.x = x;
        this.y = y;

        this.velocity = velocity;
        this.width = width;
        this.height = height;
        this.color = color;
		this.cShape = new CollisionShape(x, y, this.width, this.height, collType.BULLET, this);
		this.isValid = true;
		this.onPlatform = platform;
    }

    update(canvas: HTMLCanvasElement, deltaTime: number, isMine: boolean) {

		if (isMine && !this.onPlatform)
			return ;
		else if (this.onPlatform)
		{
			if (this.onPlatform.dir === PlatformDir.UP_DOWN)
				this.y = this.onPlatform.y - this.height;

			this.x += this.onPlatform.velocity.x * deltaTime;

			this.cShape.move(this.x, this.y);
			return ;
		}

        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

		this.cShape.move(this.x, this.y);

		if (this.x <= WALL_THICKNESS || this.x >= canvas.width - WALL_THICKNESS - this.width || 
			this.y <= 0 || this.y >= canvas.height - FLOOR_THICKNESS - this.height)
		{
			this.isValid = false;
		}
    }

    draw(ctx: CanvasRenderingContext2D, playerColor: string | null) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

		if (playerColor)
		{
			ctx.fillStyle = playerColor;
			const boxSize = 8;
			const pColorBoxX = this.x + this.width / 2 - boxSize / 2;
			const pColorBoxY = this.y + this.height / 2 - boxSize / 2;
			ctx.fillRect(pColorBoxX, pColorBoxY, boxSize, boxSize);
		}
    }
}
