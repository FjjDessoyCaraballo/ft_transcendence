import { BAZOOKA_BULLET_SPEED, BAZOOKA_COOLDOWN, BAZOOKA_DMG, MINE_BULLET_SPEED, MINE_COOLDOWN, MINE_DMG, MINE_LIFESPAN, PISTOL_BULLET_SPEED, PISTOL_COOLDOWN, PISTOL_DMG, PLAYER_SIZE } from "./Constants";
import { Platform } from "./Platform";
import { Player } from "./Player";
import { Projectile } from "./Projectiles";


export abstract class Weapon
{
	abstract name: string;
	abstract description: string;
	abstract cooldown: number;
	abstract damage: number;
	abstract projSpeed: number;
	abstract projColor: string;
	abstract projW: number;
	abstract projH: number;
	abstract clone(): Weapon;
	
	projectileArr: Projectile[] = [];
	lastFired: number = 0;

	canFire(): boolean {
        const currentTime = Date.now();
        return currentTime - this.lastFired >= this.cooldown;
    }

	shoot(x: number, y: number, direction: string, isOnGround: boolean, playerPlatform: Platform | null) : boolean
	{
		if (!this.canFire())
			return false;
		if (this.name === 'Land Mine' && !isOnGround)
			return false;

		let velocity = {x: this.projSpeed, y: 0};

		if (direction === 'left')
			velocity.x *= -1;

		let startX = x + PLAYER_SIZE / 2 - this.projW / 2;
		let startY = y + PLAYER_SIZE / 2 - this.projH / 2;
		let platform: Platform | null = null;

		if (this.name === 'Land Mine')
		{
			startY = y + PLAYER_SIZE - this.projH;
			if (playerPlatform)
				platform = playerPlatform;
		}


		this.projectileArr.push(new Projectile(startX, startY, velocity, this.projColor, this.projW, this.projH, platform));
		this.lastFired = Date.now();

		return true;
	}

	update(canvas: HTMLCanvasElement, deltaTime: number, enemy: Player)
	{
		for (const projectile of this.projectileArr)
		{
			projectile.update(canvas, deltaTime, this.name === 'Land Mine');
			projectile.cShape.checkBulletCollision(enemy.cShape, this.damage);
			if (this.name === 'Land Mine')
			{
				if (Date.now() - projectile.creationTime >= MINE_LIFESPAN)
					projectile.isValid = false;
			}
		}
		this.projectileArr = this.projectileArr.filter(projectile => projectile.isValid);
	}

	draw(ctx: CanvasRenderingContext2D, playerColor: string | null)
	{
		for (const projectile of this.projectileArr)
			projectile.draw(ctx, playerColor);
	}
}


export class Pistol extends Weapon
{
	name: string = 'Pistol';
	description: string = 'A handy basic weapon';
	cooldown: number = PISTOL_COOLDOWN;
	damage: number = PISTOL_DMG;
	projSpeed: number = PISTOL_BULLET_SPEED;
	projColor: string = 'red';
	projW: number = 10;
	projH: number = 5;

	clone(): Pistol
	{
		return new Pistol();
	}

}


export class Bazooka extends Weapon
{
	name: string = 'Bazooka';
	description: string = 'Very powerful, but kinda slow';
	cooldown: number = BAZOOKA_COOLDOWN;
	damage: number = BAZOOKA_DMG;
	projSpeed: number = BAZOOKA_BULLET_SPEED;
	projColor: string = 'purple';
	projW: number = 30;
	projH: number = 10;

	clone(): Bazooka
	{
		return new Bazooka();
	}

}

export class LandMine extends Weapon
{
	name: string = 'Land Mine';
	description: string = 'Will detonate if you step on it!';
	cooldown: number = MINE_COOLDOWN;
	damage: number = MINE_DMG;
	projSpeed: number = MINE_BULLET_SPEED;
	projColor: string = 'blue';
	projW: number = 20;
	projH: number = 20;

	clone(): LandMine
	{
		return new LandMine();
	}

}