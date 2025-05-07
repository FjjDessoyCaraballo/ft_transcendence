import { GameStates, IGameState } from "../Game/GameStates";
import { ReturnMainMenuButton } from "../Game/EndScreen";
import { curUser, stateManager } from "../components/index";
import { ctx } from "../components/Canvas";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR } from "../Game/Constants";
import { ChallengeButton, TournamentButton, User, UserManager } from "./UserManager";
import { Button } from "./Button";
import { GameType, UserHubState } from "./Types";
import { MatchIntro } from "../Game/MatchIntro";
import { Tournament } from "../Game/Tournament";
import { drawCenteredText } from "../Game/StartScreen";

export class NextPageButton extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
	}

	clickAction(): void {
	}
}

export class PrevPageButton extends Button
{
	constructor(x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string)
	{
		super(x, y, boxColor, hoverColor, text, textColor, textSize, font);
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

	constructor(canvas: HTMLCanvasElement, state: UserHubState, gameType: GameType)
	{
		this.name = GameStates.USER_HUB;
		this.canvas = canvas;
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

		if (curUser)
		{
			const curUserData = localStorage.getItem(curUser);
			if (curUserData)
			{
				const curUserObj = JSON.parse(curUserData);
				this.tournamentArr.push(curUserObj);
			}
		}

		// Sort userArr based on rankingPoint difference
		if (curUser)
		{
			const curUserObj = UserManager.getUserData(curUser);
			if (curUserObj)
			{
				const curUserRank = curUserObj.rankingPoint;
				this.userArr.sort((a, b) => {
					const diffA = Math.abs(a.rankingPoint - curUserRank);
					const diffB = Math.abs(b.rankingPoint - curUserRank);
					return diffA - diffB;
				  });
			}
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

		this.returnMenuButton = new ReturnMainMenuButton(button1X, button1Y, 'red', '#780202', text1, 'white', '25px', 'arial', this.gameType);
		this.nextPageButton = new NextPageButton(button2X, button2Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text2, 'white', '25px', 'arial');
		this.prevPageButton = new PrevPageButton(button3X, button3Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text3, 'white', '25px', 'arial');
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
				else if (curUser) 
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
		if (!this.opponent || !curUser)
			return ;

		const passwordInput = document.getElementById("passwordInput") as HTMLInputElement;
		const enteredPassword = passwordInput.value;
		const opponentData = localStorage.getItem(this.opponent.username);
		const curUserData = localStorage.getItem(curUser);

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
				passwordModal.style.display = "none";
				passwordInput.value = "";

				if (this.state === UserHubState.SINGLE_GAME)
				{
					stateManager.changeState(new MatchIntro(this.canvas, curUserObj, this.opponent, null, null, this.gameType));
				}
				else
				{
					this.tournamentArr.push(this.opponent);

					if (this.tournamentArr.length === 4)
						stateManager.changeState(new Tournament(this.canvas, this.tournamentArr, this.gameType));
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
		submitPasswordBtn.removeEventListener("click", this.submitPasswordBound);
		cancelPasswordBtn.removeEventListener("click", this.cancelPasswordBound);
	}

	update(deltaTime: number)
	{
	}

	render(ctx: CanvasRenderingContext2D)
	{
		if (this.prevUserStartIdx !== this.userStartIdx)
		{
			this.needNewChallengeButtons = true;
			this.prevUserStartIdx = this.userStartIdx;
			this.challengeBtnArr.length = 0;
		}

		UserManager.drawCurUser();

		if (this.state === UserHubState.TOURNAMENT)
		{
			let playerCountText = `${this.tournamentArr.length}/4 players chosen`;
			drawCenteredText(playerCountText, '40px impact', 'white', 120)
		}

		let x = 130; // check this proprely later
		let y = 150;

		for (let i = this.userStartIdx; i < this.userStartIdx + 3; ++i)
		{
			if (i >= this.userArr.length)
				break ;

			const isInTournament = this.tournamentArr.some(player => player.username === this.userArr[i].username);

			const btn: ChallengeButton | TournamentButton = UserManager.drawUserInfo(this.userArr[i], x, y, this.state, isInTournament);

			if (this.needNewChallengeButtons && btn.user.username !== curUser
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