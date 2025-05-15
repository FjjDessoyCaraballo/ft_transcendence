import { GameStates, IGameState } from "../game/GameStates";
import { ReturnMainMenuButton } from "../game/EndScreen";
import { global_curUser, global_stateManager } from "./GameCanvas";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR } from "../game/Constants";
import { ChallengeButton, TournamentButton, User, UserManager } from "./UserManager";
import { Button } from "./Button";
import { GameType, UserHubState } from "./Types";
import { MatchIntro } from "../game/MatchIntro";
import { Tournament } from "../game/Tournament";
import { drawCenteredText } from "../game/StartScreen";
import { getUserData } from "../services/userService";

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
	needNewChallengeButtons: boolean;
	opponent: User | null;
	tournamentArr: User [];
	gameType: GameType;
	userArr: User [];
	state: UserHubState;
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
		this.needNewChallengeButtons = true;
		this.opponent = null;
		this.state = state;
		this.tournamentArr = [];
		this.gameType = gameType;
		this.userArr = UserManager.getAllUserData();

		if (global_curUser)
		{
			this.addUserToTournament(global_curUser);
			this.sortUserDataByCurUserRank();
		}

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

		this.mouseMoveBound = (event: MouseEvent) => this.mouseMoveCallback(event);
        this.mouseClickBound = () => this.mouseClickCallback();
		this.submitPasswordBound = () => this.submitPasswordCallback();
		this.cancelPasswordBound = () => this.cancelPasswordCallback();
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
				const tournamentPlayer = this.tournamentArr.find(player => player.username === btn.user.username);

				if (tournamentPlayer && btn.text === 'REMOVE')
				{
					const idx = this.tournamentArr.indexOf(tournamentPlayer);
					this.tournamentArr.splice(idx, 1);
				}
				else if (global_curUser) 
				{
					this.opponent = btn.user;

					const passwordHeader = document.getElementById('passwordHeader') as HTMLHeadingElement;
					if (passwordHeader) 
						passwordHeader.innerHTML = `Hello ${this.opponent.username}!<br>Please type in your password to start the game`;

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

	submitPasswordCallback(): void
	{
		if (!this.opponent || !global_curUser)
			return ;

		const passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
		
		if (!passwordInput) {
			return;
		}
		
		const enteredPassword = passwordInput.value;
		const opponentData = localStorage.getItem(this.opponent.username);
		const curUserData = localStorage.getItem(global_curUser);

		if (!opponentData || !curUserData)
		{
			alert("Database error: User data not found");
			return ;
		}
		else
		{
			const storedUser = JSON.parse(opponentData);
			const curUserObj = JSON.parse(curUserData);

			if (enteredPassword === storedUser.password)
			{
				const passwordModal = document.getElementById("passwordModal") as HTMLElement;
				if (passwordModal) {
					passwordModal.style.display = "none";
				}
				passwordInput.value = "";

				if (this.state === UserHubState.SINGLE_GAME)
				{
					global_stateManager.changeState(new MatchIntro(this.canvas, this.ctx, curUserObj, this.opponent, null, null, this.gameType));
				}
				else
				{
					this.tournamentArr.push(this.opponent);

					if (this.tournamentArr.length === 4)
						global_stateManager.changeState(new Tournament(this.canvas, this.ctx, this.tournamentArr, this.gameType));
				}
			}
			else
			{
				alert("Incorrect password. Please try again.");
				passwordInput.value = ""; // Clear the input field
			}
		}
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

	async addUserToTournament(username: string)
	{
		if (!username)
			return ;

		try {

			const userData = await getUserData(username);

			this.tournamentArr.push(userData);

		} catch (error) {
			
			console.error('Error while fetching user data');
			alert('Error while fetching user data');
		}
		
	}

	async sortUserDataByCurUserRank()
	{
		if (!global_curUser)
			return ;

		try {
			
			const userData = await getUserData(global_curUser);
			const curUserRank = userData.ranking_points;

			this.userArr.sort((a, b) => {
				const diffA = Math.abs(a.ranking_points - curUserRank);
				const diffB = Math.abs(b.ranking_points - curUserRank);
				return diffA - diffB;
			});

		} catch (error) {
			
			console.error('Error while fetching user data');
			alert('Error while fetching user data');
		}

	}

	render(ctx: CanvasRenderingContext2D)
	{
		if (this.prevUserStartIdx !== this.userStartIdx)
		{
			this.needNewChallengeButtons = true;
			this.prevUserStartIdx = this.userStartIdx;
			this.challengeBtnArr.length = 0;
		}

		UserManager.drawCurUser(this.canvas, ctx);

		if (this.state === UserHubState.TOURNAMENT)
		{
			let playerCountText = `${this.tournamentArr.length}/4 players chosen`;
			drawCenteredText(this.canvas, this.ctx, playerCountText, '40px impact', 'white', 120)
		}

		let x = 130; // check this proprely later
		let y = 150;

		for (let i = this.userStartIdx; i < this.userStartIdx + 3; ++i)
		{
			if (i >= this.userArr.length)
				break ;

			const isInTournament = this.tournamentArr.some(player => player.username === this.userArr[i].username);

			const btn: ChallengeButton | TournamentButton = UserManager.drawUserInfo(ctx, this.userArr[i], x, y, this.state, isInTournament);

			if (this.needNewChallengeButtons && btn.user.username !== global_curUser
				&& this.state !== UserHubState.INFO)
			{
				this.challengeBtnArr.push(btn);
			}

			// Check if we need to update the tournament button
			const tournamentBtn = this.challengeBtnArr.find(btn => btn.user.username === this.userArr[i].username);

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

		if (this.userStartIdx < this.userArr.length - 3)
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