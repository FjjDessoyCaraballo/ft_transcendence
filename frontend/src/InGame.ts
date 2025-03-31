import { Player } from './Player';
import { Player2 } from './Player2';
import { Platform, PlatformDir } from './Platform';
import { collType } from './CollisionShape';
import { drawGround, drawWalls} from './Environment';
import { stateManager } from './index';
import { GameStates, IGameState } from './GameStates';
import { EndScreen } from './EndScreen';
import { User, UserManager } from './UserManager';

export class InGame implements IGameState
{
	name: GameStates
	player1: Player;
	player2: Player2;
	keys: { [key: string]: boolean };
	platforms: Platform[];
	canvas: HTMLCanvasElement;
	KeyDownBound: (event: KeyboardEvent) => void;
	KeyUpBound: (event: KeyboardEvent) => void;

	constructor(canvas: HTMLCanvasElement, user1: User, user2: User)
	{
		this.name = GameStates.IN_GAME;
		
		// Check that if players have same color, use some default ones
		
		this.player1 = new Player(100, 745, user1.color, user1); // Maybe in enter() ?
		this.player2 = new Player2(1100, 745, user2.color, user2); // Maybe in enter() ?
		this.keys = {}; // Maybe in enter() ?

		this.platforms = [
			new Platform(800, 600, 80, PlatformDir.UP_DOWN, 200),
			new Platform(300, 600, 80, PlatformDir.UP_DOWN, 200),
			new Platform(600, 200, 50, PlatformDir.STILL, 100),
			new Platform(500, 700, 200, PlatformDir.STILL, 100), // mid long
			new Platform(600, 300, 100, PlatformDir.LEFT_RIGHT, 200)
		]

		this.canvas = canvas;

		this.KeyDownBound = (event: KeyboardEvent) => this.keyDownCallback(event);
		this.KeyUpBound = (event: KeyboardEvent) => this.keyUpCallback(event);
	}

	keyDownCallback(event: KeyboardEvent)
	{
		this.keys[event.key] = true;
	}

	keyUpCallback(event: KeyboardEvent)
	{
		this.keys[event.key] = false;
	}

	enter()
	{
		document.addEventListener('keydown', this.KeyDownBound);
		document.addEventListener('keyup', this.KeyUpBound);
	}

	exit()
	{
		document.removeEventListener('keydown', this.KeyDownBound);
		document.removeEventListener('keyup', this.KeyUpBound);
	}

	update(deltaTime: number)
	{

		for (const platform of this.platforms) {
				platform.move(deltaTime);
			}

		// PLAYER 1
		this.player1.checkKeyEvents(this.keys);
		let player1PrevPos: { x: number, y: number } = { x: this.player1.x, y: this.player1.y};
		this.player1.move(this.keys, deltaTime);
		for (const platform of this.platforms)
		{
			let collisionType: collType = this.player1.cShape.checkCollision(platform.cShape, player1PrevPos);

			if (collisionType != collType.NON)
			{
				this.player1.resolveCollision(platform.cShape, collisionType, player1PrevPos.y, this.player1.y);
				break ;
			}
		}

		// PLAYER 2
		this.player2.checkKeyEvents(this.keys);
		let player2PrevPos: { x: number, y: number } = { x: this.player2.x, y: this.player2.y};
		this.player2.move(this.keys, deltaTime);
		for (const platform of this.platforms)
		{
			let collisionType: collType = this.player2.cShape.checkCollision(platform.cShape, player2PrevPos);
			if (collisionType != collType.NON)
			{
				this.player2.resolveCollision(platform.cShape, collisionType, player2PrevPos.y, this.player2.y);
				break ;
			}
		}

		// PROJECTILES
		for (const projectile of this.player1.projectiles) {
			projectile.update(this.canvas, deltaTime);
			projectile.cShape.checkBulletCollision(this.player2.cShape);
		}
		for (const projectile of this.player2.projectiles) {
			projectile.update(this.canvas, deltaTime);
			projectile.cShape.checkBulletCollision(this.player1.cShape);
		}

		this.player1.projectiles = this.player1.projectiles.filter(projectile => projectile.isValid);
		this.player2.projectiles = this.player2.projectiles.filter(projectile => projectile.isValid);


		// VICTORY CONDITION CHECK

		if (this.player1.userData && this.player2.userData)
		{
			const p1 = UserManager.cloneUser(this.player1.userData);
			const p2 = UserManager.cloneUser(this.player2.userData);

			if (this.player1.health.amount === 0)
				stateManager.changeState(new EndScreen(this.canvas, p2, p1));
			else if (this.player2.health.amount === 0)
				stateManager.changeState(new EndScreen(this.canvas, p1, p2));
		}

	}

	render(ctx: CanvasRenderingContext2D)
	{
		drawGround(ctx);
		drawWalls(ctx);

		for (const platform of this.platforms) {
			platform.draw(ctx);
		}

		this.player1.draw(ctx);
		this.player2.draw(ctx);
	}

}