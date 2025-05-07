import { Player } from './Player';
import { Player2 } from './Player2';
import { Platform, PlatformDir } from './Platform';
import { collType } from './CollisionShape';
import { drawGround, drawWalls} from './Environment';
import { stateManager } from '../components/index';
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
	coinHandler: CoinHandler;
	KeyDownBound: (event: KeyboardEvent) => void;
	KeyUpBound: (event: KeyboardEvent) => void;

	constructor(canvas: HTMLCanvasElement, user1: User, user2: User, tData1: TournamentPlayer | null, tData2: TournamentPlayer | null)
	{
		this.name = GameStates.BLOCK_BATTLE;
		this.isStateReady = false;
		this.tournamentData1 = tData1;
		this.tournamentData2 = tData2;
		
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

		this.coinHandler = new CoinHandler(COIN_SPAWN_TIME, this.platforms);
		this.coinHandler.start();

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
		this.coinHandler.stop();
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
					stateManager.changeState(new EndScreen(this.canvas, p2, p1, null, null, GameType.BLOCK_BATTLE));
				else if (this.player2.health.amount === 0 || this.player1.hasWon)
					stateManager.changeState(new EndScreen(this.canvas, p1, p2, null, null, GameType.BLOCK_BATTLE));
			}
		}

	}

	render(ctx: CanvasRenderingContext2D)
	{
		drawGround(ctx);
		drawWalls(ctx);

		for (const platform of this.platforms) {
			platform.draw(ctx);
		}
		
		this.coinHandler.renderCoins(ctx);

		this.player1.draw(ctx);
		this.player2.draw(ctx);

	}

}