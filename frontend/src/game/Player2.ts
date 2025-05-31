import { Player } from "./Player";
import { PLAYER_SPEED, PLAYER_SIZE, GRAVITY, JUMP_POWER, HEALTH_WIDTH, HEALT_HEIGHT, BB_RIGHT_2, BB_LEFT_2, BB_UP_2, BB_SHOOT_2, BB_CHANGE_WEAPON_2 } from "./Constants";
import { PlatformDir } from "./Platform";
import { User } from "../UI/UserManager";
import { Weapon } from "./Weapons";
import { bbMatchData } from "./BlockBattle";

export class Player2 extends Player {

    constructor(x: number, y: number, color: string, user: User, weapon1: Weapon, weapon2: Weapon) {
        super(x, y, color, user, weapon1, weapon2);
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

    checkKeyEvents(keys: { [key: string]: boolean }, statsObj: bbMatchData) {
        this.velocity.x = 0;

        if (keys[BB_UP_2] && this.isOnGround) { 
            this.velocity.y = JUMP_POWER;
            this.isOnGround = false;
            this.onPlatform = null;
        }
        if (keys[BB_LEFT_2]) { 
            this.velocity.x = -PLAYER_SPEED;
            this.direction = 'left';
        }
        if (keys[BB_RIGHT_2]) { 
            this.velocity.x = PLAYER_SPEED;
            this.direction = 'right';
        }
        if (keys[BB_SHOOT_2]) { 
			if (this.curWeapon.shoot(this.x, this.y, this.direction, this.isOnGround, this.onPlatform))
				statsObj.player2_shots_fired++;
        }
		if (keys[BB_CHANGE_WEAPON_2] && !this.weaponIsChanging){
			if (this.curWeapon.name === this.weapons[0].name)
				this.curWeapon = this.weapons[1];
			else
				this.curWeapon = this.weapons[0];

			this.weaponIsChanging = true;
		}
		if (!keys[BB_CHANGE_WEAPON_2] && this.weaponIsChanging)
			this.weaponIsChanging = false;

    }

	draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

		let offsetX = this.x + PLAYER_SIZE / 2 - HEALTH_WIDTH / 2;
		let offsetY = this.y - HEALT_HEIGHT - 10; // random 10 :D
		this.health.draw(ctx, offsetX, offsetY);

       	if (this.weapons[0].name === 'Land Mine')
        	this.weapons[0].draw(ctx, this.color);
		else
        	this.weapons[0].draw(ctx, null);

		if (this.weapons[1].name === 'Land Mine')
        	this.weapons[1].draw(ctx, this.color);
		else
        	this.weapons[1].draw(ctx, null);

//		this.cShape.draw(ctx); // --> For debug
    }
}