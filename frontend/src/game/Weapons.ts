import { BAZOOKA_BULLET_SPEED, BAZOOKA_COOLDOWN, BAZOOKA_DMG, PISTOL_BULLET_SPEED, PISTOL_COOLDOWN, PISTOL_DMG, PLAYER_SIZE } from "./Constants";
import { Player } from "./Player";
import { Projectile } from "./Projectiles";


export abstract class Weapon
{
	abstract name: string;
	abstract cooldown: number;
	abstract damage: number;
	abstract projSpeed: number;
	abstract projColor: string;
	abstract projW: number;
	abstract projH: number;
	
	projectileArr: Projectile[] = [];
	lastFired: number = 0;
	
	canFire(): boolean {
        const currentTime = Date.now();
        return currentTime - this.lastFired >= this.cooldown;
    }

	shoot(x: number, y: number, direction: string)
	{
		if (!this.canFire())
			return ;

		let velocity = {x: this.projSpeed, y: 0};

		if (direction === 'left')
			velocity.x *= -1;

		const startX = x + PLAYER_SIZE / 2 - this.projW / 2;
		const startY = y + PLAYER_SIZE / 2 - this.projH / 2;

		this.projectileArr.push(new Projectile(startX, startY, velocity, this.projColor, this.projW, this.projH));
		this.lastFired = Date.now();

	}

	update(canvas: HTMLCanvasElement, deltaTime: number, enemy: Player)
	{
		for (const projectile of this.projectileArr)
		{
			projectile.update(canvas, deltaTime);
			projectile.cShape.checkBulletCollision(enemy.cShape, this.damage);
		}
		this.projectileArr = this.projectileArr.filter(projectile => projectile.isValid);
	}

	draw(ctx: CanvasRenderingContext2D)
	{
		for (const projectile of this.projectileArr)
			projectile.draw(ctx);
	}
}


export class Pistol extends Weapon
{
	name: string = 'Pistol';
	cooldown: number = PISTOL_COOLDOWN;
	damage: number = PISTOL_DMG;
	projSpeed: number = PISTOL_BULLET_SPEED;
	projColor: string = 'red';
	projW: number = 10;
	projH: number = 5;

}


export class Bazooka extends Weapon
{
	name: string = 'Bazooka';
	cooldown: number = BAZOOKA_COOLDOWN;
	damage: number = BAZOOKA_DMG;
	projSpeed: number = BAZOOKA_BULLET_SPEED;
	projColor: string = 'purple';
	projW: number = 30;
	projH: number = 10;

}