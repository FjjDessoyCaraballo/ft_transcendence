import { GameStates, IGameState } from "../game/GameStates";
import { ReturnMainMenuButton } from "../game/EndScreen";
import { global_stateManager } from "./GameCanvas";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR } from "../game/Constants";
import { ChallengeButton, TournamentButton, User, UserManager } from "./UserManager";
import { Button } from "./Button";
import { GameType, UserHubState } from "./Types";
import { MatchIntro } from "../game/MatchIntro";
import { Tournament, TournamentPlayer } from "../game/Tournament";
import { drawCenteredText } from "../game/StartScreen";
import { checkTournamentStatus, getAllUsers, getLoggedInUserData, loginUser, removeTournamentPlayer, startNewTournament, verifyOpponent, verifyTournamentPlayer } from "../services/userService";
import { StartScreen } from "../game/StartScreen";

export class NextPageButton extends Button
{

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
	}
}

export class PrevPageButton extends Button
{
	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
	}
}


export class UserHUB implements IGameState
{
	name: GameStates;
	userStartIdx: number;
	prevUserStartIdx: number;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	returnMenuButton: ReturnMainMenuButton;
	nextPageButton: NextPageButton;
	prevPageButton: PrevPageButton;
	challengeBtnArr: ChallengeButton[];
	isNextActive: boolean;
	isPrevActive: boolean;
	isCheckingPassword: boolean;
	needNewChallengeButtons: boolean;
	opponentName: string | null;
	tournamentArr: TournamentPlayer [];
	gameType: GameType;
	state: UserHubState;
	loggedInUserData: User | null;
	userDataArr: User [];
	isDataReady: boolean;
	showLoadingText: boolean;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;
	submitPasswordBound: () => void;
	cancelPasswordBound: () => void;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, state: UserHubState, gameType: GameType)
	{
		this.name = GameStates.USER_HUB;
		this.canvas = canvas;
		this.ctx = ctx;
		this.userStartIdx = 0;
		this.prevUserStartIdx = 0;
		this.isNextActive = true;
		this.isPrevActive = false;
		this.isCheckingPassword = false;
		this.needNewChallengeButtons = true;
		this.opponentName = null;
		this.state = state;
		this.tournamentArr = [];
		this.gameType = gameType;
		this.isDataReady = false;
		this.showLoadingText = false;
		this.loggedInUserData = null;
		this.userDataArr = [];

		let text1 = 'RETURN TO MENU';
		ctx.font = '25px arial' // GLOBAL USE OF CTX!!
		const button1X = (canvas.width / 2) - (ctx.measureText(text1).width / 2) - TEXT_PADDING;
		const button1Y = (canvas.height / 2) - 20 - TEXT_PADDING + 370;

		let text2 = 'NEXT PAGE';
		const button2X = canvas.width - ctx.measureText(text2).width - TEXT_PADDING;
		const button2Y = 80 + TEXT_PADDING;

		let text3 = 'PREVIOUS PAGE';
		const button3X = 0 + TEXT_PADDING;
		const button3Y = 80 + TEXT_PADDING;

		this.returnMenuButton = new ReturnMainMenuButton(this.canvas, this.ctx, button1X, button1Y, 'red', '#780202', text1, 'white', '25px', 'arial', this.gameType);
		this.nextPageButton = new NextPageButton(ctx, button2X, button2Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text2, 'white', '25px', 'arial');
		this.prevPageButton = new PrevPageButton(ctx, button3X, button3Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text3, 'white', '25px', 'arial');
		this.challengeBtnArr = [];
		
		setTimeout(() => {
			this.showLoadingText = true;
		}, 500); 

		this.fetchUserDataArr();

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();
		this.submitPasswordBound = () => this.submitPasswordCallback();
		this.cancelPasswordBound = () => this.cancelPasswordCallback();
	}

	async fetchUserDataArr()
	{
		try
		{
			this.userDataArr = await getAllUsers();
			if (this.userDataArr.length === 0)
			{
				console.log("USER HUB: User data fetch failed.");
				return ;
			}

			this.loggedInUserData = await getLoggedInUserData();
			if (!this.loggedInUserData)
			{
				console.log("USER HUB: User data fetch failed.");
				return ;
			}

			if (this.state === UserHubState.TOURNAMENT)
			{
				await startNewTournament();
				
				const loggedInPlayer: TournamentPlayer = {
					id: 0,
					user: this.loggedInUserData,
					tournamentPoints: 0,
					place: 0,
					coinsCollected: 0,
					pongPointsScored: 0,
					isWinner: false,
					bbWeapons: []
				}

				this.tournamentArr.push(loggedInPlayer);
			}

			// Sort userArr based on player ranking
			const curUserRank = this.loggedInUserData.ranking_points;
			this.userDataArr.sort((a, b) => {
				const diffA = Math.abs(a.ranking_points - curUserRank);
				const diffB = Math.abs(b.ranking_points - curUserRank);
				return diffA - diffB;
			});

			this.isDataReady = true;
		
	
		}
		catch (error) {
			alert(`User data fetch failed, returning to main menu! ${error}`)
			console.log("USER HUB: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx));
			this.isDataReady = false;
		}
	}

	async removeTournamenPlayer(playerToRemove: TournamentPlayer)
	{

		try {

			this.tournamentArr = await removeTournamentPlayer(playerToRemove.user.id);
		
		} catch (error) {

			alert(`Error while removing player from tournament: ${error}`);
			// Do I need other error handling...?

		}

		
	}

	mouseMoveCallback(event: MouseEvent)
	{
		const rect = this.canvas.getBoundingClientRect();
		
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		const x = (event.clientX - rect.left) * scaleX;
		const y = (event.clientY - rect.top) * scaleY;

		this.returnMenuButton.checkMouse(x, y);
		this.nextPageButton.checkMouse(x, y);
		this.prevPageButton.checkMouse(x, y);

		for (const btn of this.challengeBtnArr)
		{
			btn.checkMouse(x, y);
		}

	}

	mouseClickCallback()
	{
		this.returnMenuButton.checkClick();
		if (this.nextPageButton.checkClick() && this.isNextActive)
			this.userStartIdx += 3;
		if (this.prevPageButton.checkClick() && this.isPrevActive)
			this.userStartIdx -= 3;

		for (const btn of this.challengeBtnArr)
		{
			if (btn.checkClick())
			{
				// Logic for "Remove from tournament" -button
				const tournamentPlayer = this.tournamentArr.find(player => player.user.username === btn.user.username);

				if (tournamentPlayer && btn.text === 'REMOVE')
				{
					this.removeTournamenPlayer(tournamentPlayer);
				}
				else if (this.loggedInUserData)
				{
					this.opponentName = btn.user.username;

					const passwordHeader = document.getElementById('passwordHeader') as HTMLHeadingElement;
					if (passwordHeader)
					{
						passwordHeader.textContent = `Hello ${this.opponentName}!`;
						passwordHeader.appendChild(document.createElement('br'));
						passwordHeader.appendChild(document.createTextNode('Please type in your password to start the game'));
					}

					const passwordModal = document.getElementById("passwordModal") as HTMLElement;
					const submitPasswordBtn = document.getElementById("submitPasswordBtn") as HTMLButtonElement;
					const cancelPasswordBtn = document.getElementById("cancelPasswordBtn") as HTMLButtonElement;
			
					// Show the password modal
					passwordModal.style.display = "flex";
					submitPasswordBtn.addEventListener("click", this.submitPasswordBound);
					cancelPasswordBtn.addEventListener("click", this.cancelPasswordBound);
				}
			}
		}

	}

	async handleOpponentLogin()
	{
		this.isCheckingPassword = true;

		const passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
		if (!passwordInput) {
			return;
		}
		
		const enteredPassword = passwordInput.value;

		try {

			if (!this.opponentName)
				return ;

			if (this.state === UserHubState.SINGLE_GAME)
			{
				await verifyOpponent({
						username: this.opponentName,
						password: enteredPassword
					  });
			}
			else if (this.state === UserHubState.TOURNAMENT)
			{
				this.tournamentArr = await verifyTournamentPlayer({
						username: this.opponentName,
						password: enteredPassword
					  });

			}

			const passwordModal = document.getElementById("passwordModal") as HTMLElement;
			if (passwordModal) {
				passwordModal.style.display = "none";
			}
			passwordInput.value = "";
			this.isCheckingPassword = false;

			if (this.state === UserHubState.SINGLE_GAME)
				global_stateManager.changeState(new MatchIntro(this.canvas, this.ctx, this.gameType, false));
			
		} catch {
			this.isCheckingPassword = false;
			alert("Incorrect password. Please try again.");
			passwordInput.value = ""; // Clear the input field
		}

		if (this.state === UserHubState.TOURNAMENT)
		{
			try {
				await checkTournamentStatus();
				global_stateManager.changeState(new Tournament(this.canvas, this.ctx, this.gameType));
			} catch {
				console.log('Tournament not ready yet');
			}
		}

	}

	submitPasswordCallback(): void
	{
		if (!this.opponentName || !this.loggedInUserData || this.isCheckingPassword)
			return ;

		this.handleOpponentLogin();
	}

	cancelPasswordCallback(): void
	{
		const passwordModal = document.getElementById("passwordModal") as HTMLElement;
		const submitPasswordBtn = document.getElementById("submitPasswordBtn") as HTMLButtonElement;
		const cancelPasswordBtn = document.getElementById("cancelPasswordBtn") as HTMLButtonElement;
		const passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
		passwordModal.style.display = "none";
		submitPasswordBtn.removeEventListener("click", this.submitPasswordBound);
		cancelPasswordBtn.removeEventListener("click", this.cancelPasswordBound);
		passwordInput.value = "";
	}

	enter()
	{
		this.canvas.addEventListener('mousemove', this.mouseMoveBound);
		this.canvas.addEventListener('click', this.mouseClickBound);
	}

	exit()
	{
		this.canvas.removeEventListener('mousemove', this.mouseMoveBound);
		this.canvas.removeEventListener('click', this.mouseClickBound);

		const submitPasswordBtn = document.getElementById("submitPasswordBtn") as HTMLButtonElement;
		const cancelPasswordBtn = document.getElementById("cancelPasswordBtn") as HTMLButtonElement;
		
		if (submitPasswordBtn) {
			submitPasswordBtn.removeEventListener("click", this.submitPasswordBound);
		}
		
		if (cancelPasswordBtn) {
			cancelPasswordBtn.removeEventListener("click", this.cancelPasswordBound);
		}
	}

	update(deltaTime: number)
	{
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


		if (this.prevUserStartIdx !== this.userStartIdx)
		{
			this.needNewChallengeButtons = true;
			this.prevUserStartIdx = this.userStartIdx;
			this.challengeBtnArr.length = 0;
		}

		UserManager.drawCurUser(this.canvas, ctx, this.loggedInUserData);

		if (this.state === UserHubState.TOURNAMENT)
		{
			let playerCountText = `${this.tournamentArr.length}/4 players chosen`;
			drawCenteredText(this.canvas, this.ctx, playerCountText, '40px impact', 'white', 120)
		}

		let x = 130; // check this proprely later
		let y = 150;

		for (let i = this.userStartIdx; i < this.userStartIdx + 3; ++i)
		{
			if (i >= this.userDataArr.length)
				break ;

			const isInTournament = this.tournamentArr.some(player => player.user.username === this.userDataArr[i].username);

			const btn: ChallengeButton | TournamentButton = UserManager.drawUserInfo(ctx, this.userDataArr[i], x, y, this.state, isInTournament);

			if (this.needNewChallengeButtons && btn.user.username !== this.loggedInUserData?.username
				&& this.state !== UserHubState.INFO)
			{
				this.challengeBtnArr.push(btn);
			}

			// Check if we need to update the tournament button
			const tournamentBtn = this.challengeBtnArr.find(btn => btn.user.username === this.userDataArr[i].username);

			if ((isInTournament && tournamentBtn && tournamentBtn.text === 'ADD TO TOURNAMENT')
				|| (!isInTournament && tournamentBtn && tournamentBtn.text === 'REMOVE')
			)
			{
				const idx = this.challengeBtnArr.indexOf(tournamentBtn);
				this.challengeBtnArr.splice(idx, 1);
				this.challengeBtnArr.push(btn);
			}

			y += 185;
		}

		if (this.needNewChallengeButtons)
			this.needNewChallengeButtons = false;

		this.returnMenuButton.draw(ctx);

		if (this.userStartIdx < this.userDataArr.length - 3)
		{
			this.nextPageButton.draw(ctx);
			this.isNextActive = true;
		}
		else
			this.isNextActive = false;

		if (this.userStartIdx != 0)
		{
			this.prevPageButton.draw(ctx);
			this.isPrevActive = true;
		}
		else
			this.isPrevActive = false;

		for (const btn of this.challengeBtnArr)
			btn.draw(ctx);
		
	}
}