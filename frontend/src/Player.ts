import { PLAYER_SIZE, PLAYER_SPEED, GRAVITY, JUMP_POWER, BULLET_SPEED, FIRE_COOLDOWN, HEALTH_WIDTH, HEALT_HEIGHT} from "./constants";
import { Projectile } from "./Projectiles";
import { gameArea } from "./Environment";
import { CollisionShape, collType } from "./CollisionShape";
import { Platform, PlatformDir } from "./Platform";
import { Health } from "./Health";
import { User, UserManager } from "./UserManager";

export class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
	velocity: { x: number, y: number };
	direction: string;
	isOnGround: boolean;
	projectiles: Projectile[];
	lastFired: number;
    cooldownTime: number;
	cShape: CollisionShape;
	cShapeSize : number;
	cShapeOffset : number;
	health: Health;
	userData: User | null;

	onPlatform?: Platform;

    constructor(x: number, y: number, color: string, user: User) {
        this.x = x;
        this.y = y;
		this.color = color;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
		this.velocity = { x: 0, y: 0 };
		this.direction = 'right';
		this.isOnGround = true;
		this.projectiles = [];
		this.lastFired = 0;
		this.cooldownTime = FIRE_COOLDOWN;

		this.cShapeSize = PLAYER_SIZE - 4;
		this.cShapeOffset = 2;
		this.cShape = new CollisionShape(this.x + this.cShapeOffset, this.y + this.cShapeOffset, this.cShapeSize, this.cShapeSize, collType.PLAYER, this);
		this.health = new Health();
		this.userData = user;
    }

    move(keys: { [key: string]: boolean }, deltaTime: number) {

		if (this.onPlatform && !keys['a'] && !keys['d'])
		{
			this.x += this.onPlatform.velocity.x * deltaTime;
			this.y += this.onPlatform.velocity.y * deltaTime;

			if (this.y != this.onPlatform.y - PLAYER_SIZE)
				this.y = this.onPlatform.y - PLAYER_SIZE;
		}
		else if (this.onPlatform && this.onPlatform.dir === PlatformDir.UP_DOWN)
		{
			this.x += this.velocity.x * deltaTime;
			this.y += this.onPlatform.velocity.y * deltaTime;

			if (this.y != this.onPlatform.y - PLAYER_SIZE)
				this.y = this.onPlatform.y - PLAYER_SIZE;
		}
		else
		{
			this.x += this.velocity.x * deltaTime;
			this.y += this.velocity.y * deltaTime;
		}

		if (!this.isOnGround){
			this.velocity.y += GRAVITY * deltaTime;
		}

		this.checkGroundCollision();
		this.checkWallCollision();
		this.checkPlatformDrop();
		this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
    }

	checkGroundCollision(){
		if (this.y >= gameArea.maxY - this.height)
		{
			this.isOnGround = true;
			this.y = gameArea.maxY - this.height;
			this.velocity.y = 0;
			this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
		}
	}

	checkWallCollision(){
		if (this.x <= gameArea.minX)
		{
			this.x = gameArea.minX;
			this.velocity.x = 0;
		}
		else if (this.x >= gameArea.maxX - this.width)
		{
			this.x = gameArea.maxX - this.width;
			this.velocity.x = 0;
		}
		this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
	}

	checkPlatformDrop(){
		if (!this.onPlatform)
			return ;

		if (this.x > this.onPlatform.x + this.onPlatform.width
			|| this.x + this.width < this.onPlatform.x
		)
		{
			this.isOnGround = false;
			this.onPlatform = undefined;
		}
	}

	resolveCollision(obj: CollisionShape, type: collType, prevPointY: number, curPointY: number){
		// Player corner points, starting top-left, in clockwise order
		let playerPoints: { x: number, y: number }[] = [
			{ x: this.x, y: this.y },
			{ x: this.x + this.width, y: this.y },
			{ x: this.x + this.width, y: this.y + this.height },
			{ x: this.x, y: this.y + this.height }
		];

		if (type === collType.FALL)
		{
			this.y = obj.y - PLAYER_SIZE;
			this.velocity.y = 0;
			this.isOnGround = true;
			this.onPlatform = obj.master;
		}
		else if (this.velocity.y > 0 && obj.type === collType.PLATFORM)
		{
			if (obj.isPointInShape(playerPoints[2]) || obj.isPointInShape(playerPoints[3])) // Player going down && either of the lower points is in the obj
			{
				this.y = obj.y - PLAYER_SIZE;
				this.velocity.y = 0;
				this.isOnGround = true;
				this.onPlatform = obj.master;
			}
			else if (obj.isPointInShape(playerPoints[0]) || obj.isPointInShape(playerPoints[1]))
			{
				if (obj.checkFallCollision(obj, prevPointY + PLAYER_SIZE, curPointY + PLAYER_SIZE))
				{
					this.y = obj.y - PLAYER_SIZE;
					this.velocity.y = 0;
					this.isOnGround = true;
					this.onPlatform = obj.master;
				}
			}
		}

		this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
	}

	checkKeyEvents(keys: { [key: string]: boolean }) {
		this.velocity.x = 0;

        if (keys['w'] && this.isOnGround) {
            this.velocity.y = JUMP_POWER;
			this.isOnGround = false;
			this.onPlatform = undefined;
        }
        if (keys['a']) {
            this.velocity.x = -PLAYER_SPEED;
			this.direction = 'left';
        }
        if (keys['d']) {
            this.velocity.x = PLAYER_SPEED;
			this.direction = 'right';
        }
		if (keys[' '] && this.canFire()) {
            this.fireProjectile();
        }
	}

	canFire(): boolean {
        const currentTime = Date.now();
        return currentTime - this.lastFired >= this.cooldownTime;
    }

	fireProjectile() {
		let bulletSpeed = BULLET_SPEED;

		if (this.direction === 'left')
			bulletSpeed *= -1;

        const projectileVelocity = { x: bulletSpeed, y: 0 };
        const projectile = new Projectile(this.x + this.width / 2, this.y + this.height / 2, projectileVelocity);
        this.projectiles.push(projectile);
		this.lastFired = Date.now();
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

		let offsetX = this.x + PLAYER_SIZE / 2 - HEALTH_WIDTH / 2;
		let offsetY = this.y - HEALT_HEIGHT - 10; // random 10 :D
		this.health.draw(ctx, offsetX, offsetY);

        for (const projectile of this.projectiles) {
            projectile.draw(ctx);
        }

//		this.cShape.draw(ctx); // --> For debug
    }
}