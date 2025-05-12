import { Player } from './Player';
import { Player2 } from './Player2';
import { Platform, PlatformDir } from './Platform';
import { collType } from './CollisionShape';
import { drawGround, drawWalls} from './Environment';
import { global_stateManager } from '../UI/GameCanvas';
import { GameStates, IGameState } from './GameStates';
import { EndScreen } from './EndScreen';
import { User, UserManager } from '../UI/UserManager';
import { TournamentPlayer } from './Tournament';
import { CoinHandler } from './CoinHandler';
import { COIN_SPAWN_TIME } from './Constants';
import { GameType } from '../UI/Types';


export class BlockBattle implements IGameState
{
	name: GameStates
	player1: Player;
	player2: Player2;
	tournamentData1: TournamentPlayer | null;
	tournamentData2: TournamentPlayer | null;
	isStateReady: boolean;
	keys: { [key: string]: boolean };
	platforms: Platform[];
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	coinHandler: CoinHandler;
	KeyDownBound: (event: KeyboardEvent) => void;
	KeyUpBound: (event: KeyboardEvent) => void;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, user1: User, user2: User, tData1: TournamentPlayer | null, tData2: TournamentPlayer | null)
	{
		this.name = GameStates.BLOCK_BATTLE;
		this.isStateReady = false;
		this.tournamentData1 = tData1;
		this.tournamentData2 = tData2;
		
		this.player1 = new Player(100, 745, 'green', user1); // Check the color later!!
		this.player2 = new Player2(1100, 745, 'red', user2); // Check the color later!!

		this.keys = {}; // Maybe in enter() ?


		this.platforms = [
			new Platform(canvas, 900, 550, 80, PlatformDir.UP_DOWN, 80),
			new Platform(canvas, 220, 550, 80, PlatformDir.UP_DOWN, 80),
			new Platform(canvas, 500, 500, 200, PlatformDir.STILL, 0), // mid long
			new Platform(canvas, 320, 700, 80, PlatformDir.STILL, 0), // close to p1 start
			new Platform(canvas, 800, 700, 80, PlatformDir.STILL, 0), // close to p2 start
			new Platform(canvas, 800, 340, 40, PlatformDir.STILL, 0), // between move & mid long (right)
			new Platform(canvas, 350, 340, 40, PlatformDir.STILL, 0), // between move & mid long (left)
			new Platform(canvas, 900, 200, 80, PlatformDir.LEFT_RIGHT, 110),
			new Platform(canvas, 220, 200, 80, PlatformDir.LEFT_RIGHT, 110),
			new Platform(canvas, 550, 300, 100, PlatformDir.UP_DOWN, 80), // above mid

			new Platform(canvas, 1120, 280, 20, PlatformDir.STILL, 0), // mini right
			new Platform(canvas, 60, 280, 20, PlatformDir.STILL, 0), // mini left
			new Platform(canvas, 590, 80, 20, PlatformDir.STILL, 0), // mini top

		]
		

		this.coinHandler = new CoinHandler(COIN_SPAWN_TIME, this.platforms);
		this.coinHandler.start();

		this.canvas = canvas;
		this.ctx = ctx;

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
		this.coinHandler.stop();
	}

	drawStatScreen()
	{
		const screenW = 400;
		const screenH = 100;

		// PLAYER 1

		// Draw background
		this.ctx.fillStyle = 'rgba(140, 185, 87, 0.75)';
		this.ctx.fillRect(0, 0, screenW, screenH);

		// Draw outlines
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(0, 0, screenW, screenH);

		this.ctx.font = '20px arial';
		this.ctx.fillStyle = 'white';
		const name = `${this.player1.userData?.username}`;
		const nameX = screenW / 2 - (this.ctx.measureText(name).width / 2);
		this.ctx.fillText(name, nameX, 20);

		// Draw coin count & Current weapon texts
		this.ctx.font = '20px arial';
		this.ctx.fillStyle = 'white';
		const coinText = 'Coins collected:';
		const coinTextW = this.ctx.measureText(coinText).width;
		const coinTextX = 40;
		this.ctx.fillText(coinText, coinTextX, 52);

		const weaponText = 'Current weapon:';
		const WeaponW = this.ctx.measureText(weaponText).width;
		const WeaponX = coinTextX + coinTextW + 30;
		this.ctx.fillText(weaponText, WeaponX, 52);

		// Draw coin count & Current weapon values
		this.ctx.font = '30px arial';
		this.ctx.fillStyle = 'white';
		const coinNum = `${this.player1.coinCount}`;
		const coinNumX = coinTextX + (coinTextW / 2) - (this.ctx.measureText(coinNum).width / 2);
		this.ctx.fillText(coinNum, coinNumX, 80);

		const curWeapon = `Pistol`;
		const curWeaponX = WeaponX + (WeaponW / 2) - (this.ctx.measureText(curWeapon).width / 2);
		this.ctx.fillText(curWeapon, curWeaponX, 80);

		// PLAYER 2
		
		// Draw background
		this.ctx.fillStyle = 'rgba(211, 94, 91, 0.75)';
		const screenX = this.canvas.width - screenW;
		this.ctx.fillRect(screenX, 0, screenW, screenH);

		// Draw outlines
		this.ctx.strokeStyle = 'white'; // Can maybe be removed
		this.ctx.lineWidth = 2; // Can maybe be removed
		this.ctx.strokeRect(screenX, 0, screenW, screenH);

		this.ctx.font = '20px arial';
		this.ctx.fillStyle = 'white';
		const name2 = `${this.player2.userData?.username}`;
		const nameX2 = screenX + (screenW / 2) - (this.ctx.measureText(name2).width / 2);
		this.ctx.fillText(name2, nameX2, 20);

		// Draw coin count & Current weapon texts
		this.ctx.font = '20px arial';
		this.ctx.fillStyle = 'white';
		const coinText2 = 'Coins collected:';
		const coinTextW2 = this.ctx.measureText(coinText2).width;
		const coinTextX2 = screenX + 40;
		this.ctx.fillText(coinText2, coinTextX2, 52);

		const weaponText2 = 'Current weapon:';
		const WeaponW2 = this.ctx.measureText(weaponText2).width;
		const WeaponX2 = coinTextX2 + coinTextW2 + 30;
		this.ctx.fillText(weaponText2, WeaponX2, 52);

		// Draw coin count & Current weapon values
		this.ctx.font = '30px arial';
		this.ctx.fillStyle = 'white';
		const coinNum2 = `${this.player2.coinCount}`;
		const coinNumX2 = coinTextX2 + (coinTextW2 / 2) - (this.ctx.measureText(coinNum2).width / 2);
		this.ctx.fillText(coinNum2, coinNumX2, 80);

		const curWeapon2 = `Pistol`;
		const curWeaponX2 = WeaponX2 + (WeaponW2 / 2) - (this.ctx.measureText(curWeapon2).width / 2);
		this.ctx.fillText(curWeapon2, curWeaponX2, 80);

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

			if (collisionType !== collType.NON)
			{
				this.player1.resolveCollision(platform.cShape, collisionType, player1PrevPos.y, this.player1.y);
				break ;
			}
		}
		if (this.player1.health.amount === 0)
			this.player1.isDead = true;

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
		if (this.player2.health.amount === 0)
			this.player2.isDead = true;

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

		// COINS
		if (this.coinHandler.platformsFull && this.coinHandler.intervalId)
			this.coinHandler.stop();
		else if (!this.coinHandler.platformsFull && !this.coinHandler.intervalId)
			this.coinHandler.start();

		this.coinHandler.checkCoinCollision(this.player1);
		this.coinHandler.checkCoinCollision(this.player2);

		// VICTORY CONDITION CHECK
		if ((this.player1.isDead || this.player2.isDead || this.player1.hasWon || this.player2.hasWon) 
			&& !this.isStateReady)
		{
			// Tournament ending
			if (this.tournamentData1 && this.tournamentData2)
			{
				if (this.player1.health.amount === 0 || this.player2.hasWon)
				{
					this.tournamentData2.tournamentPoints++;
					this.tournamentData2.coinsCollected += this.player2.coinCount;
					this.tournamentData1.coinsCollected += this.player1.coinCount;
					this.tournamentData2.isWinner = true;
				}
				else if (this.player2.health.amount === 0 || this.player1.hasWon)
				{
					this.tournamentData1.tournamentPoints++;
					this.tournamentData1.coinsCollected += this.player1.coinCount;
					this.tournamentData2.coinsCollected += this.player2.coinCount;
					this.tournamentData1.isWinner = true;
				}				
				this.isStateReady = true;
				return ;
			}

			if (this.player1.userData && this.player2.userData)
			{
				// Regular ending
				const p1 = UserManager.cloneUser(this.player1.userData); // this might not be needed...
				const p2 = UserManager.cloneUser(this.player2.userData); // this might not be needed...
	
				if (this.player1.health.amount === 0 || this.player2.hasWon)
					global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p2, p1, null, null, GameType.BLOCK_BATTLE));
				else if (this.player2.health.amount === 0 || this.player1.hasWon)
					global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p1, p2, null, null, GameType.BLOCK_BATTLE));
			}
		}

	}

	render(ctx: CanvasRenderingContext2D)
	{
		drawGround(this.canvas, ctx);
		drawWalls(this.canvas, ctx);

		for (const platform of this.platforms) {
			platform.draw(ctx);
		}
		
		this.coinHandler.renderCoins(ctx);
		
		this.player1.draw(ctx);
		this.player2.draw(ctx);
		
		this.drawStatScreen();
		
	}

}