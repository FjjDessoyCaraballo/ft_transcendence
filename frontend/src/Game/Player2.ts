import { Player } from "./Player";
import { PLAYER_SPEED, PLAYER_SIZE, GRAVITY, JUMP_POWER, HEALTH_WIDTH, HEALT_HEIGHT } from "./Constants";
import { PlatformDir } from "./Platform";
import { User } from "../UI/UserManager";

export class Player2 extends Player {

    constructor(x: number, y: number, color: string, user: User) {
        super(x, y, color, user);
		this.direction = 'left';
    }

	move(keys: { [key: string]: boolean }, deltaTime: number) {
	
			if (this.onPlatform && !keys['j'] && !keys['l'])
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

        if (keys['i'] && this.isOnGround) { 
            this.velocity.y = JUMP_POWER;
            this.isOnGround = false;
            this.onPlatform = undefined;
        }
        if (keys['j']) { 
            this.velocity.x = -PLAYER_SPEED;
            this.direction = 'left';
        }
        if (keys['l']) { 
            this.velocity.x = PLAYER_SPEED;
            this.direction = 'right';
        }
        if (keys['u'] && this.canFire()) { 
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

		// Should coin count be like this on the front layer...?

		ctx.font = '30px arial';
		const coinText = `${this.coinCount}`;
	//	ctx.fillText(coinText, this.canvas, 40); 
	// NOT DONE !!

//		this.cShape.draw(ctx); // --> For debug
	}
}