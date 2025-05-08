import { Player } from "./Player";
import { PLAYER_SPEED, PLAYER_SIZE, GRAVITY, JUMP_POWER, HEALTH_WIDTH, HEALT_HEIGHT, BB_RIGHT_2, BB_LEFT_2, BB_UP_2, BB_SHOOT_2 } from "./Constants";
import { PlatformDir } from "./Platform";
import { User } from "../UI/UserManager";
import { canvas } from "../components/Canvas";

export class Player2 extends Player {

    constructor(x: number, y: number, color: string, user: User) {
        super(x, y, color, user);
		this.direction = 'left';
    }

	move(keys: { [key: string]: boolean }, deltaTime: number) {
	
			if (this.onPlatform && !keys[BB_LEFT_2] && !keys[BB_RIGHT_2])
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

			if (!this.isOnGround) {
				this.velocity.y += GRAVITY * deltaTime;
			}
	
			this.checkGroundCollision();
			this.checkWallCollision();
			this.checkPlatformDrop();
			this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
		}

    checkKeyEvents(keys: { [key: string]: boolean }) {
        this.velocity.x = 0;

        if (keys[BB_UP_2] && this.isOnGround) { 
            this.velocity.y = JUMP_POWER;
            this.isOnGround = false;
            this.onPlatform = undefined;
        }
        if (keys[BB_LEFT_2]) { 
            this.velocity.x = -PLAYER_SPEED;
            this.direction = 'left';
        }
        if (keys[BB_RIGHT_2]) { 
            this.velocity.x = PLAYER_SPEED;
            this.direction = 'right';
        }
        if (keys[BB_SHOOT_2] && this.canFire()) { 
            this.fireProjectile();
        }

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