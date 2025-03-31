import { PLATFORM_THICKNESS, PLATFORM_SPEED } from "./constants";
import { gameArea } from "./Environment";
import { CollisionShape, collType} from "./CollisionShape";

export enum PlatformDir{
	UP_DOWN,
	LEFT_RIGHT,
	STILL
};

export class Platform {
	x: number;
	y: number;
	orig_x: number;
	orig_y: number;
	width: number;
	height: number;
	color: string; // TEST
	velocity: { x: number, y: number };
	dir: PlatformDir;
	range: number;
	cShape: CollisionShape;

	constructor(x: number, y: number, width: number, dir: PlatformDir, range: number) {
		this.x = x;
		this.y = y;
		this.orig_x = x;
		this.orig_y = y;
		this.color = 'orange';
		this.width = width;
		this.height = PLATFORM_THICKNESS;
		this.dir = dir;
		this.range = range;
		
		if (dir == PlatformDir.UP_DOWN)
			this.velocity = { x: 0, y: -PLATFORM_SPEED };
		else if (dir == PlatformDir.LEFT_RIGHT)
			this.velocity = { x: -PLATFORM_SPEED, y: 0 };
		else
			this.velocity = { x: 0, y: 0 };

		this.cShape = new CollisionShape(this.x, this.y, this.width, this.height, collType.PLATFORM, this);

	}

	move(deltaTime: number) {
		this.x += this.velocity.x * deltaTime;
		this.y += this.velocity.y * deltaTime;

		if (this.y >= gameArea.maxY - this.height)
		{
			this.y = gameArea.maxY - this.height;
			this.velocity.y = -PLATFORM_SPEED;
		}
		else if (this.x <= gameArea.minX)
		{
			this.x = gameArea.minX;
			this.velocity.x = PLATFORM_SPEED;
		}
		else if (this.x >= gameArea.maxX - this.width)
		{
			this.x = gameArea.maxX - this.width;
			this.velocity.x = -PLATFORM_SPEED;
		}

		if (this.y > this.orig_y + this.range)
			this.velocity.y = -PLATFORM_SPEED;
		else if (this.y < this.orig_y - this.range)
			this.velocity.y = PLATFORM_SPEED;
		else if (this.x > this.orig_x + this.range)
			this.velocity.x = -PLATFORM_SPEED;
		else if (this.x < this.orig_x - this.range)
			this.velocity.x = PLATFORM_SPEED;

		this.cShape.move(this.x, this.y);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);

//		this.cShape.draw(ctx); // --> For debug
	}
}
