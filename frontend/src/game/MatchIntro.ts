import { GameStates, IGameState } from "./GameStates";
import { global_stateManager } from "../UI/GameCanvas";
import { User } from "../UI/UserManager";
import { BlockBattle } from "./BlockBattle";
import { TournamentPlayer } from "./Tournament";
import { GameType } from "../UI/Types";
import { Pong } from "./pong/Pong";
import { drawCenteredText, drawText, StartScreen } from "./StartScreen";
import { BB_SHOOT_1, BB_SHOOT_2, PONG_UP_1, PONG_UP_2, DEEP_PURPLE, BB_LEFT_1, BB_RIGHT_1, BB_LEFT_2, BB_RIGHT_2 } from "./Constants";
import { Bazooka, LandMine, Pistol, Weapon } from "./Weapons";
import { getLoggedInUserData, getNextTournamentGameData, getOpponentData, saveWeaponDataToDB } from "../services/userService";


export class MatchIntro implements IGameState
{
	name: GameStates;
	player1Data: User | null = null;
	player2Data: User | null = null;
	player1TournamentData: TournamentPlayer | null;
	player2TournamentData: TournamentPlayer | null;
	isStateReady: boolean;
	p1IsReady: boolean;
	p2IsReady: boolean;
	keys: { [key: string]: boolean };
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	gameType: GameType;
	weaponOptions: Weapon[] = [new Pistol(), new Bazooka(), new LandMine()]; // add new weapons here
	p1Weapons: Weapon [] = [];
	p2Weapons: Weapon [] = [];
	weaponIdx1: number;
	weaponIdx2: number;
	p1SelectDown: boolean = false;
	p1LeftDown: boolean = false;
	p1RightDown: boolean = false;
	p2SelectDown: boolean = false;
	p2LeftDown: boolean = false;
	p2RightDown: boolean = false;
	isTournament: boolean;
	isDataReady: boolean;
	showLoadingText: boolean;
	isSavingData: boolean = false;
	KeyDownBound: (event: KeyboardEvent) => void;
	KeyUpBound: (event: KeyboardEvent) => void;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, type: GameType, isTournament: boolean)
	{
		this.name = GameStates.MATCH_INTRO;
		this.isTournament = isTournament;
		this.isDataReady = false;
		this.showLoadingText = false;

		// We should create a user in the DB for AI computer. Then we could track it's win/lose stats etc :D
		if (type === GameType.PONG_AI)
		{
			this.player2Data = {
				id: -1,
				username: 'Computer',
				ranking_points: 9999,
				avatar_url: 'Something funny here',
				games_played_pong: 9999,
				wins_pong: 9999,
				losses_pong: 9999,
				games_played_blockbattle: 9999,
				wins_blockbattle: 9999,
				losses_blockbattle: 9999,
				tournaments_played: 9999,
				tournaments_won: 9999,
				tournament_points: 9999,
				match_history: [],
				bbWeapons: [],
				created_at: new Date(),
				updated_at: new Date(),
				deleted_at: null
			};
		}

		this.player1TournamentData = null;
		this.player2TournamentData = null;

		/**
		 * ADD TOURNAMENT DATA CREATION LOGIC HERE
		 */

		this.canvas = canvas;
		this.ctx = ctx;
		this.keys = {};
		this.gameType = type;
		this.p1IsReady = false;
		if (this.gameType === GameType.PONG_AI)
			this.p2IsReady = true;
		else
			this.p2IsReady = false;
		this.isStateReady = false;
		this.weaponIdx1 = 0;
		this.weaponIdx2 = 0;

		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

		if (!isTournament)
			this.fetchPlayerData();
		else
			this.fetchNextTournamentData();

		this.KeyDownBound = (event: KeyboardEvent) => this.keyDownCallback(event);
		this.KeyUpBound = (event: KeyboardEvent) => this.keyUpCallback(event);

	}

	async fetchPlayerData()
	{
		try
		{
			this.player1Data = await getLoggedInUserData();
			if (!this.player1Data)
			{
				console.log("MATCH INTRO: User data fetch failed.");
				return ;
			}

			if (this.gameType !== GameType.PONG_AI)
			{
				this.player2Data = await getOpponentData();
				if (!this.player2Data)
				{
					console.log("MATCH INTRO: User data fetch failed.");
					return ;
				}
			}

			this.isDataReady = true;
		}
		catch (error) {
			alert(`User data fetch failed, returning to main menu! ${error}`)
			console.log("MATCH INTRO: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx));
			this.isDataReady = false;
		}
	}

	async fetchNextTournamentData()
	{
		try
		{
			const response = await getNextTournamentGameData();

			this.player1TournamentData = response[0];
			this.player2TournamentData = response[1];

			this.player1Data = this.player1TournamentData.user;
			this.player2Data = this.player2TournamentData.user;

			this.isDataReady = true;
		}
		catch (error) {
			alert(`User data fetch failed, returning to main menu! ${error}`)
			console.log("MATCH INTRO: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx));
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

		if (event.key === BB_SHOOT_1 && this.p1SelectDown)
			this.p1SelectDown = false;
		else if (event.key === BB_LEFT_1 && this.p1LeftDown)
			this.p1LeftDown = false;
		else if (event.key === BB_RIGHT_1 && this.p1RightDown)
			this.p1RightDown = false;

		if (event.key === BB_SHOOT_2 && this.p2SelectDown)
			this.p2SelectDown = false;
		else if (event.key === BB_LEFT_2 && this.p2LeftDown)
			this.p2LeftDown = false;
		else if (event.key === BB_RIGHT_2 && this.p2RightDown)
			this.p2RightDown = false;
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
		if (this.isSavingData)
			return ;

		// PONG
		if (this.keys[PONG_UP_1] && (this.gameType === GameType.PONG || this.gameType === GameType.PONG_AI))
			this.p1IsReady = true;

		if (this.keys[PONG_UP_2] && this.gameType === GameType.PONG)
			this.p2IsReady = true;

		// BLOCK BATTLE (PLAYER 1)
		if (this.keys[BB_LEFT_1] && this.weaponIdx1 > 0 && !this.p1LeftDown)
		{
			this.weaponIdx1--;
			this.p1LeftDown = true;
		}
		if (this.keys[BB_RIGHT_1] && this.weaponIdx1 < this.weaponOptions.length - 1 && !this.p1RightDown)
		{
			this.weaponIdx1++;
			this.p1RightDown = true;
		}
		if (this.keys[BB_SHOOT_1] && !this.p1SelectDown)
		{			
			if (this.p1Weapons.some(weapon => weapon.name === this.weaponOptions[this.weaponIdx1].name))
			{
				this.p1Weapons = this.p1Weapons.filter(weapon => weapon.name !== this.weaponOptions[this.weaponIdx1].name)
				if (this.p1IsReady)
					this.p1IsReady = false;
			}
			else if (this.p1Weapons.length < 2)
				this.p1Weapons.push(this.weaponOptions[this.weaponIdx1].clone());
			this.p1SelectDown = true;

			if (this.p1Weapons.length === 2)
				this.p1IsReady = true;
		}

		// BLOCK BATTLE (PLAYER 2)
		if (this.keys[BB_LEFT_2] && this.weaponIdx2 > 0 && !this.p2LeftDown)
		{
			this.weaponIdx2--;
			this.p2LeftDown = true;
		}
		if (this.keys[BB_RIGHT_2] && this.weaponIdx2 < this.weaponOptions.length - 1 && !this.p2RightDown)
		{
			this.weaponIdx2++;
			this.p2RightDown = true;
		}
		if (this.keys[BB_SHOOT_2] && !this.p2SelectDown)
		{			
			if (this.p2Weapons.some(weapon => weapon.name === this.weaponOptions[this.weaponIdx2].name))
			{
				this.p2Weapons = this.p2Weapons.filter(weapon => weapon.name !== this.weaponOptions[this.weaponIdx2].name)
				if (this.p2IsReady)
					this.p2IsReady = false;
			}
			else if (this.p2Weapons.length < 2)
				this.p2Weapons.push(this.weaponOptions[this.weaponIdx2].clone());
			this.p2SelectDown = true;

			if (this.p2Weapons.length === 2)
				this.p2IsReady = true;
		}

		// CHECK GAME START
		if (this.p1IsReady && this.p2IsReady)
		{
			if (!this.isTournament)
			{
				if (this.gameType === GameType.BLOCK_BATTLE)
					global_stateManager.changeState(new BlockBattle(this.canvas, this.ctx, this.p1Weapons, this.p2Weapons, false));
				else if (this.gameType === GameType.PONG && this.player1Data && this.player2Data)
					global_stateManager.changeState(new Pong(this.canvas, this.ctx, null, 'playing'));
				else if (this.gameType === GameType.PONG_AI && this.player1Data && this.player2Data)
					global_stateManager.changeState(new Pong(this.canvas, this.ctx, this.player2Data, 'ai'));
			}
			else
			{
				this.isSavingData = true;
				this.saveWeaponData();
			}
		}
	}

	async saveWeaponData()
	{
		try {

			await saveWeaponDataToDB(this.p1Weapons, this.p2Weapons);

			this.isStateReady = true;

		} catch (error) {

			alert(`Weapon data save failed, returning to main menu! ${error}`)
			console.log("MATCH INTRO: Weapon data saving failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx));
			// Is it a bad idea to exit to StartScreen mid tournament...?

		}
	}

	drawWeaponMenu(ctx: CanvasRenderingContext2D)
	{

		const infoBoxW = 500;
		const infoBoxH = 150;
		const infoBox1X = this.canvas.width / 4 - infoBoxW / 2;

		// PLAYER 1
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		let weaponX = infoBox1X;
		const weaponY = 540; // 100 more than P1Y

		// Weapon info box && BG
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;
		ctx.strokeRect(infoBox1X, 580, infoBoxW, infoBoxH);
		ctx.fillStyle = 'rgba(178, 93, 217, 0.5)';
		ctx.fillRect(infoBox1X, 580, infoBoxW, infoBoxH);


		// Weapon icons
		for (let i = 0; i < this.weaponOptions.length; i++)
		{
			let weaponName = this.weaponOptions[i].name;
			ctx.fillStyle = 'white';
			ctx.fillText(weaponName, weaponX, weaponY);

			if (this.p1Weapons.some(weapon => weapon.name === this.weaponOptions[i].name))
			{
				// Draw green box
				ctx.strokeStyle = 'green';
				ctx.lineWidth = 4;
				ctx.strokeRect(weaponX - 10, weaponY - 30, ctx.measureText(weaponName).width + 20, 40);
			}

			if (this.weaponIdx1 === i)
			{
				// Draw selector
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 2;
				ctx.strokeRect(weaponX - 10, weaponY - 30, ctx.measureText(weaponName).width + 20, 40);
			}

			weaponX += ctx.measureText(weaponName).width + 30;
		}

		// Weapon info

		const curWeapon = this.weaponOptions[this.weaponIdx1];

		const name = curWeapon.name;
		const nameX = infoBox1X + infoBoxW / 2 - ctx.measureText(name).width / 2;
		const nameY = 580 + 40;
		ctx.fillText(name, nameX, nameY);

		ctx.font = '24px arial';
		const descript = curWeapon.description;
		const descriptX = infoBox1X + infoBoxW / 2 - ctx.measureText(descript).width / 2;
		const descriptY = nameY + 40;
		ctx.fillText(descript, descriptX, descriptY);

		const damage = `DAMAGE: ${curWeapon.damage}`;
		const damageX = infoBox1X + 20;
		const damageY = descriptY + 50;
		ctx.fillText(damage, damageX, damageY);

		const cooldown = `COOLDOWN: ${curWeapon.cooldown / 1000}s`;
		const cooldownX = infoBox1X + infoBoxW - 20 - ctx.measureText(cooldown).width;
		ctx.fillText(cooldown, cooldownX, damageY);


		const infoBox2X = this.canvas.width * 0.75 - infoBoxW / 2;

		// PLAYER 2
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		let weapon2X = infoBox2X;

		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;
		ctx.strokeRect(infoBox2X, 580, infoBoxW, infoBoxH);
		ctx.fillStyle = 'rgba(178, 93, 217, 0.5)';
		ctx.fillRect(infoBox2X, 580, infoBoxW, infoBoxH);

		// Weapon icons
		for (let i = 0; i < this.weaponOptions.length; i++)
		{
			let weaponName = this.weaponOptions[i].name;
			ctx.fillStyle = 'white';
			ctx.fillText(weaponName, weapon2X, weaponY);

			if (this.p2Weapons.some(weapon => weapon.name === this.weaponOptions[i].name))
			{
				// Draw green box
				ctx.strokeStyle = 'green';
				ctx.lineWidth = 4;
				ctx.strokeRect(weapon2X - 10, weaponY - 30, ctx.measureText(weaponName).width + 20, 40);
			}

			if (this.weaponIdx2 === i)
			{
				// Draw selector
				ctx.strokeStyle = 'white';
				ctx.lineWidth = 2;
				ctx.strokeRect(weapon2X - 10, weaponY - 30, ctx.measureText(weaponName).width + 20, 40);
			}

			weapon2X += ctx.measureText(weaponName).width + 25;
		}

		// Weapon info

		const curWeapon2 = this.weaponOptions[this.weaponIdx2];

		const name2 = curWeapon2.name;
		const nameX2 = infoBox2X + infoBoxW / 2 - ctx.measureText(name2).width / 2;
		ctx.fillText(name2, nameX2, nameY);

		ctx.font = '24px arial';
		const descript2 = curWeapon2.description;
		const descript2X = infoBox2X + infoBoxW / 2 - ctx.measureText(descript2).width / 2;
		ctx.fillText(descript2, descript2X, descriptY);

		const damage2 = `DAMAGE: ${curWeapon2.damage}`;
		const damage2X = infoBox2X + 20;
		ctx.fillText(damage2, damage2X, damageY);

		const cooldown2 = `COOLDOWN: ${curWeapon2.cooldown / 1000}s`;
		const cooldown2X = infoBox2X + infoBoxW - 20 - ctx.measureText(cooldown2).width;
		ctx.fillText(cooldown2, cooldown2X, damageY);

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

		const p1FillColor = this.p1IsReady ? 'green' : 'red';
		const p2FillColor = this.p2IsReady ? 'green' : 'red';

		// Add the expected ranking point diff here...?

		drawCenteredText(this.canvas, this.ctx, "GAME IS ABOUT TO START!", '70px Impact', DEEP_PURPLE, 100);

		let infoText = '';
		if (this.gameType != GameType.BLOCK_BATTLE && this.player1Data && this.player2Data)
		{
			infoText = `Press the up key (${this.player1Data.username}: '${PONG_UP_1}' / ${this.player2Data.username}: '${PONG_UP_2}') when you are ready to play`;
			drawCenteredText(this.canvas, this.ctx, infoText, '30px arial', 'white', 150);

		}
		else
		{
			infoText = 'Use LEFT and RIGHT keys to navigate through weapons.';
			drawCenteredText(this.canvas, this.ctx, infoText, '30px arial', 'white', 150);
			infoText = 'Use SHOOT key to equip/unequip weapons.';
			drawCenteredText(this.canvas, this.ctx, infoText, '30px arial', 'white', 185);
		}

		const playerNamesY = 340;
		const rankingPointsY = 380;

		// PLAYER 1

		if (!this.player1Data)
			return ;

		let p1Text = this.player1Data.username;
		let p1X = this.canvas.width / 4 - this.ctx.measureText(p1Text).width / 2;
		drawText(this.ctx, p1Text, '55px arial', p1FillColor, p1X, playerNamesY);

		let p1Rank;
		if (!this.isTournament)
			p1Rank = `Ranking points: ${this.player1Data.ranking_points.toFixed(2)}`;
		else
		{
			if (this.player1TournamentData)
			{
				p1Rank = `Place: ${this.player1TournamentData.place}
				Points: ${this.player1TournamentData.tournamentPoints}`;
			}
			else
				p1Rank = 'Error';
		}
		const halfOfP1Text = ctx.measureText(p1Text).width / 2;
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const rank1X = p1X + halfOfP1Text - ctx.measureText(p1Rank).width / 2;
		ctx.fillText(p1Rank, rank1X, rankingPointsY);

		drawCenteredText(this.canvas, this.ctx, 'VS', '60px arial', 'white', playerNamesY);

		// PLAYER 2
		if (!this.player2Data)
				return ;

		const p2Text = this.player2Data.username;
		const p2X = this.canvas.width * 0.75 - ctx.measureText(p2Text).width / 2;
		drawText(this.ctx, p2Text, '55px arial', p2FillColor, p2X, playerNamesY);

		let p2Rank;
		if (!this.isTournament)
			p2Rank = `Ranking points: ${this.player2Data.ranking_points.toFixed(2)}`;
		else
		{
			if (this.player2TournamentData)
			{
				p2Rank = `Place: ${this.player2TournamentData.place}
				Points: ${this.player2TournamentData.tournamentPoints}`;
			}
			else
				p2Rank = 'Error';
		}
		const halfOfP2Text = ctx.measureText(p2Text).width / 2;
		ctx.font = '30px arial';
		ctx.fillStyle = 'white';
		const rank2X = p2X + halfOfP2Text - ctx.measureText(p2Rank).width / 2;
		ctx.fillText(p2Rank, rank2X, rankingPointsY);

		if (this.gameType === GameType.BLOCK_BATTLE)
			this.drawWeaponMenu(ctx);

	}

}