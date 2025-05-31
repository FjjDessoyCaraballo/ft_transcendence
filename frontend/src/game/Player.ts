import { PLAYER_SIZE, PLAYER_SPEED, GRAVITY, JUMP_POWER, HEALTH_WIDTH, HEALT_HEIGHT, BB_LEFT_1, BB_RIGHT_1, BB_UP_1, BB_SHOOT_1, BB_CHANGE_WEAPON_1} from "./Constants";
import { CollisionShape, collType } from "./CollisionShape";
import { Platform, PlatformDir } from "./Platform";
import { Health } from "./Health";
import { User } from "../UI/UserManager";
import { global_gameArea } from "../UI/GameCanvas";
import { Weapon } from "./Weapons";
import { bbMatchData } from "./BlockBattle";

export class Player {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
	velocity: { x: number, y: number };
	direction: string;
	isOnGround: boolean;
	weapons: [Weapon, Weapon];
	curWeapon: Weapon;
	lastFired: number;
	cShape: CollisionShape;
	cShapeSize : number;
	cShapeOffset : number;
	health: Health;
	isDead: boolean;
	hasWon: boolean;
	weaponIsChanging: boolean;
	coinCount: number;
	userData: User | null;
	onPlatform: Platform | null;

    constructor(x: number, y: number, color: string, user: User, weapon1: Weapon, weapon2: Weapon) {
        this.x = x;
        this.y = y;
		this.color = color;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
		this.velocity = { x: 0, y: 0 };
		this.direction = 'right';
		this.isOnGround = true;
		this.weaponIsChanging = false;
		this.weapons = [weapon1, weapon2];
		this.curWeapon = weapon1;
		this.lastFired = 0;

		this.cShapeSize = PLAYER_SIZE - 4;
		this.cShapeOffset = 2;
		this.cShape = new CollisionShape(this.x + this.cShapeOffset, this.y + this.cShapeOffset, this.cShapeSize, this.cShapeSize, collType.PLAYER, this);
		this.health = new Health();
		this.isDead = false;
		this.coinCount = 0;
		this.hasWon = false;
		this.userData = user;
		this.onPlatform = null;
    }

    move(keys: { [key: string]: boolean }, deltaTime: number) {

		if (this.onPlatform && !keys[BB_LEFT_1] && !keys[BB_RIGHT_1])
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
		if (this.y >= global_gameArea.maxY - this.height)
		{
			this.isOnGround = true;
			this.y = global_gameArea.maxY - this.height;
			this.velocity.y = 0;
			this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
		}
	}

	checkWallCollision(){
		if (this.x <= global_gameArea.minX)
		{
			this.x = global_gameArea.minX;
			this.velocity.x = 0;
		}
		else if (this.x >= global_gameArea.maxX - this.width)
		{
			this.x = global_gameArea.maxX - this.width;
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
			this.onPlatform = null;
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

	checkKeyEvents(keys: { [key: string]: boolean }, statsObj: bbMatchData) {
		this.velocity.x = 0;

        if (keys[BB_UP_1] && this.isOnGround) {
            this.velocity.y = JUMP_POWER;
			this.isOnGround = false;
			this.onPlatform = null;
        }
        if (keys[BB_LEFT_1]) {
            this.velocity.x = -PLAYER_SPEED;
			this.direction = 'left';
        }
        if (keys[BB_RIGHT_1]) {
            this.velocity.x = PLAYER_SPEED;
			this.direction = 'right';
        }

		if (keys[BB_SHOOT_1]) {
			if (this.curWeapon.shoot(this.x, this.y, this.direction, this.isOnGround, this.onPlatform))
				statsObj.player1_shots_fired++;
        }
		
		if (keys[BB_CHANGE_WEAPON_1] && !this.weaponIsChanging){
			if (this.curWeapon.name === this.weapons[0].name)
				this.curWeapon = this.weapons[1];
			else
				this.curWeapon = this.weapons[0];

			this.weaponIsChanging = true;
		}
		if (!keys[BB_CHANGE_WEAPON_1] && this.weaponIsChanging)
			this.weaponIsChanging = false;

	}

	updateWeapons(canvas: HTMLCanvasElement, deltaTime: number, enemy: Player)
	{
		this.weapons[0].update(canvas, deltaTime, enemy);
		this.weapons[1].update(canvas, deltaTime, enemy);
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