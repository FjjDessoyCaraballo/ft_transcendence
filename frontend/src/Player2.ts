import { Player } from "./Player.js";
import { PLAYER_SPEED, PLAYER_SIZE, GRAVITY, JUMP_POWER } from "./constants.js";
import { PlatformDir } from "./Platform.js";
import { User } from "./UserManager.js";

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
}