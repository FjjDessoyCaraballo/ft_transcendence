import { Player } from './Player';
import { Player2 } from './Player2';
import { Platform, PlatformDir } from './Platform';
import { collType } from './CollisionShape';
import { drawGround, drawWalls} from './Environment';
import { global_stateManager } from '../UI/GameCanvas';
import { GameStates, IGameState } from './GameStates';
import { EndScreen } from './EndScreen';
import { UserManager, User } from '../UI/UserManager';
import { TournamentPlayer } from './Tournament';
import { CoinHandler } from './CoinHandler';
import { COIN_SPAWN_TIME } from './Constants';
import { GameType } from '../UI/Types';
import { Bazooka, LandMine, Pistol, Weapon } from './Weapons';
import { getLoggedInUserData, getNextTournamentGameData, getOpponentData, recordTournamentMatchResult } from '../services/userService';
import { drawCenteredText, StartScreen } from './StartScreen';
import { TFunction } from 'i18next';


function createWeapon(name: string, t: TFunction) : Weapon{
	if (name === 'Pistol')
		return new Pistol(t);
	else if (name === 'Bazooka')
		return new Bazooka(t);
	else
		return new LandMine(t);
}

export interface bbMatchData {
	date: Date;
	game_type: string;
	startTime: number;
	player1_id: number;
	player1_rank: number;
	player2_id: number;
	player2_rank: number;
	game_duration: number; // in seconds
	winner_id: number;
	win_method: string; // KO or Coins
	player1_weapon1: string;
	player1_weapon2: string;
	player1_damage_taken: number;
	player1_damage_done: number;
	player1_coins_collected: number;
	player1_shots_fired: number;
	player2_weapon1: string;
	player2_weapon2: string;
	player2_damage_taken: number;
	player2_damage_done: number;
	player2_coins_collected: number;
	player2_shots_fired: number;	
}


export class BlockBattle implements IGameState
{
	name: GameStates
	player1: Player | null;
	player2: Player2 | null;
	p1Weapons: Weapon [] = [];
	p2Weapons: Weapon [] = [];
	tournamentData1: TournamentPlayer | null;
	tournamentData2: TournamentPlayer | null;
	isStateReady: boolean;
	keys: { [key: string]: boolean };
	platforms: Platform[];
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	coinHandler: CoinHandler;
	gameStats: bbMatchData | null;
	isDataReady: boolean;
	showLoadingText: boolean;
	savingDataToDB: boolean;
	saveReady: boolean;
	isLoggedIn: boolean = false;
	KeyDownBound: (event: KeyboardEvent) => void;
	KeyUpBound: (event: KeyboardEvent) => void;
	t: TFunction;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, p1Weapons: Weapon[], p2Weapons: Weapon[], isTournament: boolean, t: TFunction)
	{
		this.name = GameStates.BLOCK_BATTLE;
		this.isStateReady = false;
		this.tournamentData1 = null;
		this.tournamentData2 = null;
		this.isDataReady = false;
		this.showLoadingText = false;
		this.savingDataToDB = false;
		this.saveReady = false;
		this.p1Weapons = p1Weapons;
		this.p2Weapons = p2Weapons;

		this.player1 = null;
		this.player2 = null;
		this.gameStats = null;

		this.t = t;

		this.keys = {}; // Maybe in enter() ?

		this.platforms = [
			new Platform(canvas, 900, 550, 80, PlatformDir.UP_DOWN, 80),
			new Platform(canvas, 220, 550, 80, PlatformDir.UP_DOWN, 80),
			new Platform(canvas, 500, 500, 200, PlatformDir.STILL, 0), // mid long
			new Platform(canvas, 320, 700, 80, PlatformDir.STILL, 0), // close to p1 start
			new Platform(canvas, 800, 700, 80, PlatformDir.STILL, 0), // close to p2 start
			new Platform(canvas, 770, 370, 60, PlatformDir.STILL, 0), // between move & mid long (right)
			new Platform(canvas, 380, 370, 60, PlatformDir.STILL, 0), // between move & mid long (left)
			new Platform(canvas, 900, 220, 80, PlatformDir.LEFT_RIGHT, 110),
			new Platform(canvas, 220, 220, 80, PlatformDir.LEFT_RIGHT, 110),
			new Platform(canvas, 550, 300, 100, PlatformDir.UP_DOWN, 80), // above mid

			new Platform(canvas, 1120, 280, 20, PlatformDir.STILL, 0), // mini right
			new Platform(canvas, 60, 280, 20, PlatformDir.STILL, 0), // mini left
			new Platform(canvas, 590, 80, 20, PlatformDir.STILL, 0), // mini top

		]
		
		this.coinHandler = new CoinHandler(COIN_SPAWN_TIME, this.platforms);
		this.coinHandler.start();

		this.canvas = canvas;
		this.ctx = ctx;

		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

		if (!isTournament)
			this.fetchUserData();
		else
			this.fetchNextTournamentData();

		this.KeyDownBound = (event: KeyboardEvent) => this.keyDownCallback(event);
		this.KeyUpBound = (event: KeyboardEvent) => this.keyUpCallback(event);
	}

	async fetchNextTournamentData()
	{
		try {
		const response = await getNextTournamentGameData();

		this.tournamentData1 = response[0];
		this.tournamentData2 = response[1];

		const p1w1 = createWeapon(this.tournamentData1.bbWeapons[0].name, this.t);
		const p1w2 = createWeapon(this.tournamentData1.bbWeapons[1].name, this.t);
		const p2w1 = createWeapon(this.tournamentData2.bbWeapons[0].name, this.t);
		const p2w2 = createWeapon(this.tournamentData2.bbWeapons[1].name, this.t);

		this.player1 = new Player(100, 745, 'green', this.tournamentData1.user, p1w1, p1w2);
		this.player2 = new Player2(1100, 745, 'red', this.tournamentData2.user, p2w1, p2w2);

		this.gameStats = {
			date: new Date(),
			game_type: 'blockbattle',
			startTime: Date.now(),
			player1_id: this.tournamentData1.user.id,
			player1_rank: this.tournamentData1.user.ranking_points,
			player2_id: this.tournamentData2.user.id,
			player2_rank: this.tournamentData2.user.ranking_points,
			game_duration: -1,
			win_method: '', // KO or Coins
			winner_id: -1,
			player1_weapon1: this.player1.weapons[0].name,
			player1_weapon2: this.player1.weapons[1].name,
			player1_damage_taken: 0,
			player1_damage_done: 0,
			player1_coins_collected: 0,
			player1_shots_fired: 0,
			player2_weapon1: this.player2.weapons[0].name,
			player2_weapon2: this.player2.weapons[1].name,
			player2_damage_taken: 0,
			player2_damage_done: 0,
			player2_coins_collected: 0,
			player2_shots_fired: 0
		}

		this.isDataReady = true;
		}
		catch (error) {
			alert(`${this.t('data_fail')} ${error}`)
			console.log("BLOCK BATTLE: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.isDataReady = false;
		}
	}

	async fetchUserData()
	{
		try
		{
			const player1UserData = await getLoggedInUserData();
			if (!player1UserData)
			{
				console.log("BLOCK BATTLE: User data fetch failed.");
				return ;
			}

			const player2UserData = await getOpponentData();
			if (!player2UserData)
			{
				console.log("BLOCK BATTLE: User data fetch failed.");
				return ;
			}

			this.player1 = new Player(100, 745, 'green', player1UserData, this.p1Weapons[0], this.p1Weapons[1]);
			this.player2 = new Player2(1100, 745, 'red', player2UserData, this.p2Weapons[0], this.p2Weapons[1]);

			this.gameStats = {
				date: new Date(),
				game_type: 'blockbattle',
				startTime: Date.now(),
				player1_id: player1UserData.id,
				player1_rank: player1UserData.ranking_points,
				player2_id: player2UserData.id,
				player2_rank: player2UserData.ranking_points,
				game_duration: -1,
				win_method: '', // KO or Coins
				winner_id: -1,
				player1_weapon1: this.p1Weapons[0].name,
				player1_weapon2: this.p1Weapons[1].name,
				player1_damage_taken: 0,
				player1_damage_done: 0,
				player1_coins_collected: 0,
				player1_shots_fired: 0,
				player2_weapon1: this.p2Weapons[0].name,
				player2_weapon2: this.p2Weapons[1].name,
				player2_damage_taken: 0,
				player2_damage_done: 0,
				player2_coins_collected: 0,
				player2_shots_fired: 0
			}

			this.isDataReady = true;
		}
		catch (error) {
			alert(`${this.t('data_fail')} ${error}`)
			console.log("BLOCK BATTLE: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.isDataReady = false;
		}
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
		if (!this.player1)
			return ;

		// Draw background
		this.ctx.fillStyle = 'rgba(140, 185, 87, 0.75)';
		this.ctx.fillRect(0, 0, screenW, screenH);

		// Draw outlines
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(0, 0, screenW, screenH);

		this.ctx.font = '30px arial';
		this.ctx.fillStyle = 'white';
		const name = `${this.player1.userData?.username}`;
		const nameX = screenW / 2 - (this.ctx.measureText(name).width / 2);
		this.ctx.fillText(name, nameX, 25);

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

		const curWeapon = this.player1.curWeapon.name;
		const curWeaponX = WeaponX + (WeaponW / 2) - (this.ctx.measureText(curWeapon).width / 2);
		this.ctx.fillStyle = this.player1.curWeapon.canFire() ? '#24f03f' : '#544848';
		this.ctx.fillText(curWeapon, curWeaponX, 80);
		this.ctx.fillStyle = 'white';


		// PLAYER 2
		if (!this.player2)
			return ;

		// Draw background
		this.ctx.fillStyle = 'rgba(211, 94, 91, 0.75)';
		const screenX = this.canvas.width - screenW;
		this.ctx.fillRect(screenX, 0, screenW, screenH);

		// Draw outlines
		this.ctx.strokeStyle = 'white'; // Can maybe be removed
		this.ctx.lineWidth = 2; // Can maybe be removed
		this.ctx.strokeRect(screenX, 0, screenW, screenH);

		this.ctx.font = '30px arial';
		this.ctx.fillStyle = 'white';
		const name2 = `${this.player2.userData?.username}`;
		const nameX2 = screenX + (screenW / 2) - (this.ctx.measureText(name2).width / 2);
		this.ctx.fillText(name2, nameX2, 25);

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

		const curWeapon2 = this.player2.curWeapon.name;
		const curWeaponX2 = WeaponX2 + (WeaponW2 / 2) - (this.ctx.measureText(curWeapon2).width / 2);
		this.ctx.fillStyle = this.player2.curWeapon.canFire() ? '#24f03f' : '#544848';
		this.ctx.fillText(curWeapon2, curWeaponX2, 80);
		this.ctx.fillStyle = 'white';

	}

	async saveUserDataToDB(winner: User)
	{
		if (!this.gameStats || !this.player1 || !this.player2 || !this.player1.userData || !this.player2.userData)
			return ;

		this.gameStats.winner_id = winner.id;

		this.savingDataToDB = true;

		try {
			await UserManager.updateUserStats(this.player1.userData, this.player2.userData, this.gameStats);
		} catch (error) {

			alert(`${this.t('saving_failed')} ${error}`);
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.savingDataToDB = false;
			return ;
		}

		this.saveReady = true;
	}

	async saveTournamentGameDataToDB(winner: User)
	{
		if (!this.gameStats || !this.player1 || !this.player2 || !this.player1.userData || !this.player2.userData)
			return ;

		this.gameStats.winner_id = winner.id;
		this.savingDataToDB = true;

		try {

			await recordTournamentMatchResult(this.player1.userData, this.player2.userData, this.gameStats);
			this.isStateReady = true;

		} catch (error) {

			alert(`${this.t("saving_failed")} ${error}`);
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.savingDataToDB = false;
			return ;
		}

		this.saveReady = true;
	}

	update(deltaTime: number)
	{

		if (!this.isDataReady)
			return ;

		for (const platform of this.platforms) {
				platform.move(deltaTime);
			}

		// PLAYER 1
		if (!this.player1 || !this.gameStats)
			return ;

		this.player1.checkKeyEvents(this.keys, this.gameStats);
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

		// PLAYER 2
		if (!this.player2 || !this.gameStats)
			return ;

		this.player2.checkKeyEvents(this.keys, this.gameStats);
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

		const preHealth1 = this.player1.health.amount;
		const preHealth2 = this.player2.health.amount;

		this.player1.updateWeapons(this.canvas, deltaTime, this.player2);
		this.player2.updateWeapons(this.canvas, deltaTime, this.player1);

		if (preHealth1 !== this.player1.health.amount)
		{
			const healthDiff = preHealth1 - this.player1.health.amount;
			this.gameStats.player1_damage_taken += healthDiff;
			this.gameStats.player2_damage_done += healthDiff;
		}
		if (preHealth2 !== this.player2.health.amount)
		{
			const healthDiff = preHealth2 - this.player2.health.amount;
			this.gameStats.player2_damage_taken += healthDiff;
			this.gameStats.player1_damage_done += healthDiff;
		}

		if (this.player1.health.amount === 0)
			this.player1.isDead = true;
		if (this.player2.health.amount === 0)
			this.player2.isDead = true;

		// COINS
		if (this.coinHandler.platformsFull && this.coinHandler.intervalId)
			this.coinHandler.stop();
		else if (!this.coinHandler.platformsFull && !this.coinHandler.intervalId)
			this.coinHandler.start();

		const preCoins1 = this.player1.coinCount;
		const preCoins2 = this.player2.coinCount;

		this.coinHandler.checkCoinCollision(this.player1);
		this.coinHandler.checkCoinCollision(this.player2);

		if (preCoins1 !== this.player1.coinCount)
		{
			const coinDiff = this.player1.coinCount - preCoins1;
			this.gameStats.player1_coins_collected += coinDiff;
		}
		if (preCoins2 !== this.player2.coinCount)
		{
			const coinDiff = this.player2.coinCount - preCoins2;
			this.gameStats.player2_coins_collected += coinDiff;
		}

		// VICTORY CONDITION CHECK
		if ((this.player1.isDead || this.player2.isDead || this.player1.hasWon || this.player2.hasWon) 
			&& !this.isStateReady)
		{
			// Update stats
			this.gameStats.game_duration = (Date.now() - this.gameStats.startTime) / 1000; // in seconds
			if (this.player1.isDead || this.player2.isDead)
				this.gameStats.win_method = 'KO';
			else
				this.gameStats.win_method = 'Coins';

			// Tournament ending
			if (this.tournamentData1 && this.tournamentData2)
			{
				if (!this.savingDataToDB)
				{
					if (this.player1.health.amount === 0 || this.player2.hasWon)
					{
						this.saveTournamentGameDataToDB(this.tournamentData2.user);
					}
					else if (this.player2.health.amount === 0 || this.player1.hasWon)
					{
						this.saveTournamentGameDataToDB(this.tournamentData1.user);
					}

				}

				return ;
			}

			// Single game ending
			if (this.player1.userData && this.player2.userData)
			{
				if (!this.savingDataToDB)
				{
					if (this.player1.health.amount === 0 || this.player2.hasWon)
						this.saveUserDataToDB(this.player2.userData);
					else if (this.player2.health.amount === 0 || this.player1.hasWon)
						this.saveUserDataToDB(this.player1.userData);

					return ;
				}

				if (this.saveReady)
				{
					if (this.player1.health.amount === 0 || this.player2.hasWon)
						global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, this.player2.userData.id, this.player1.userData.id, GameType.BLOCK_BATTLE, false, null, this.t));
					else if (this.player2.health.amount === 0 || this.player1.hasWon)
						global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, this.player1.userData.id, this.player2.userData.id, GameType.BLOCK_BATTLE, false, null, this.t));
				}

			}
		}

	}

	render(ctx: CanvasRenderingContext2D)
	{
		if (!this.isDataReady)
		{
			if (!this.showLoadingText)
				return ;

			const loadingHeader = 'Fetching user data, please wait.';
			drawCenteredText(this.canvas, this.ctx, loadingHeader, '50px arial', 'white', this.canvas.height / 2);
			const loadingInfo = 'If this takes more than 10 seconds, please try to log out and in again.';
			drawCenteredText(this.canvas, this.ctx, loadingInfo, '30px arial', 'white', this.canvas.height / 2 + 50);
			return ;
		}

		drawGround(this.canvas, ctx);
		drawWalls(this.canvas, ctx);

		for (const platform of this.platforms) {
			platform.draw(ctx);
		}
		
		if (this.player1 && this.player2)
		{
			this.player1.draw(ctx);
			this.player2.draw(ctx);
		}
		
		this.coinHandler.renderCoins(ctx);
		
		this.drawStatScreen();
		
	}

}