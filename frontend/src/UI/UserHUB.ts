import { GameStates, IGameState } from "../game/GameStates";
import { ReturnMainMenuButton } from "../game/EndScreen";
import { global_allUserDataArr, global_curUser, global_stateManager } from "./GameCanvas";
import { TEXT_PADDING, BUTTON_COLOR, BUTTON_HOVER_COLOR } from "../game/Constants";
import { ChallengeButton, TournamentButton, User, UserManager } from "./UserManager";
import { Button } from "./Button";
import { GameType, UserHubState } from "./Types";
import { MatchIntro } from "../game/MatchIntro";
import { Tournament } from "../game/Tournament";
import { drawCenteredText } from "../game/StartScreen";
import { loginUser } from "../services/userService";
import { TFunction } from 'i18next';

export class NextPageButton extends Button
{

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
	}

	clickAction(): void {
	}
}

export class PrevPageButton extends Button
{
	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
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
	tournamentArr: User [];
	gameType: GameType;
	state: UserHubState;
	t: TFunction;
	mouseMoveBound: (event: MouseEvent) => void;
    mouseClickBound: () => void;
	submitPasswordBound: () => void;
	cancelPasswordBound: () => void;

	constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, state: UserHubState, gameType: GameType, t: TFunction)
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
		this.t = t;

		if (global_curUser)
		{
			const curUserData = global_allUserDataArr.find(user => user.username === global_curUser)
			if (curUserData)
			{
				this.tournamentArr.push(curUserData);

				// Sort userArr based on player ranking
				const curUserRank = curUserData.ranking_points;
				global_allUserDataArr.sort((a, b) => {
					const diffA = Math.abs(a.ranking_points - curUserRank);
					const diffB = Math.abs(b.ranking_points - curUserRank);
					return diffA - diffB;
				});
			}
		}

		let text1 = 'return_to_menu';
		ctx.font = '25px arial' // GLOBAL USE OF CTX!!
		const button1X = (canvas.width / 2) - (ctx.measureText(t('return_to_menu')).width / 2) - TEXT_PADDING;
		const button1Y = (canvas.height / 2) - 20 - TEXT_PADDING + 370;

		let text2 = 'next_page';
		const button2X = canvas.width - ctx.measureText(t('next_page')).width - TEXT_PADDING;
		const button2Y = 80 + TEXT_PADDING;

		let text3 = 'previous_page';
		const button3X = 0 + TEXT_PADDING;
		const button3Y = 80 + TEXT_PADDING;

		this.returnMenuButton = new ReturnMainMenuButton(this.canvas, this.ctx, button1X, button1Y, 'red', '#780202', text1, 'white', '25px', 'arial', this.gameType, this.t);
		this.nextPageButton = new NextPageButton(ctx, button2X, button2Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text2, 'white', '25px', 'arial', t);
		this.prevPageButton = new PrevPageButton(ctx, button3X, button3Y, BUTTON_COLOR, BUTTON_HOVER_COLOR, text3, 'white', '25px', 'arial', t);
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

				if (tournamentPlayer && btn.textKey === this.t('remove'))
				{
					const idx = this.tournamentArr.indexOf(tournamentPlayer);
					this.tournamentArr.splice(idx, 1);
				}
				else if (global_curUser) 
				{
					this.opponentName = btn.user.username;

					const passwordHeader = document.getElementById('passwordHeader') as HTMLHeadingElement;
					if (passwordHeader)
					{
						passwordHeader.textContent = `${this.t('hello')}${this.opponentName}!`;
						passwordHeader.appendChild(document.createElement('br'));
						passwordHeader.appendChild(document.createTextNode(this.t('type_password')));
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

			await loginUser({
					username: this.opponentName,
					password: enteredPassword
				  });

			const passwordModal = document.getElementById("passwordModal") as HTMLElement;
			if (passwordModal) {
				passwordModal.style.display = "none";
			}
			passwordInput.value = "";
			this.isCheckingPassword = false;
			const curUserData = global_allUserDataArr.find(user => user.username === global_curUser);
			const opponentData = global_allUserDataArr.find(user => user.username === this.opponentName);

			if (this.state === UserHubState.SINGLE_GAME && curUserData && opponentData)
			{
				global_stateManager.changeState(new MatchIntro(this.canvas, this.ctx, curUserData, opponentData, null, null, this.gameType, this.t));
			}
			else
			{
				if (opponentData)
					this.tournamentArr.push(opponentData);

				if (this.tournamentArr.length === 4)
					global_stateManager.changeState(new Tournament(this.canvas, this.ctx, this.tournamentArr, this.gameType, this.t));
			}

			
		} catch {
			this.isCheckingPassword = false;
			alert(this.t('incorrect_password'));
			passwordInput.value = ""; // Clear the input field
		}

	}

	submitPasswordCallback(): void
	{
		if (!this.opponentName || !global_curUser || this.isCheckingPassword)
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
		if (this.prevUserStartIdx !== this.userStartIdx)
		{
			this.needNewChallengeButtons = true;
			this.prevUserStartIdx = this.userStartIdx;
			this.challengeBtnArr.length = 0;
		}

		UserManager.drawCurUser(this.canvas, ctx, this.t);

		if (this.state === UserHubState.TOURNAMENT)
		{
			let playerCountText = `${this.tournamentArr.length}${this.t('chosen')}`;
			drawCenteredText(this.canvas, this.ctx, playerCountText, '40px impact', 'white', 120)
		}

		let x = 130; // check this proprely later
		let y = 150;

		for (let i = this.userStartIdx; i < this.userStartIdx + 3; ++i)
		{
			if (i >= global_allUserDataArr.length)
				break ;

			const isInTournament = this.tournamentArr.some(player => player.username === global_allUserDataArr[i].username);

			const btn: ChallengeButton | TournamentButton = UserManager.drawUserInfo(ctx, global_allUserDataArr[i], x, y, this.state, isInTournament, this.t);

			if (this.needNewChallengeButtons && btn.user.username !== global_curUser
				&& this.state !== UserHubState.INFO)
			{
				this.challengeBtnArr.push(btn);
			}

			// Check if we need to update the tournament button
			const tournamentBtn = this.challengeBtnArr.find(btn => btn.user.username === global_allUserDataArr[i].username);

			if ((isInTournament && tournamentBtn && tournamentBtn.textKey === this.t('add_to_tournament'))
				|| (!isInTournament && tournamentBtn && tournamentBtn.textKey === this.t('remove'))
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

		this.returnMenuButton.draw(ctx, this.t);

		if (this.userStartIdx < global_allUserDataArr.length - 3)
		{
			this.nextPageButton.draw(ctx, this.t);
			this.isNextActive = true;
		}
		else
			this.isNextActive = false;

		if (this.userStartIdx != 0)
		{
			this.prevPageButton.draw(ctx, this.t);
			this.isPrevActive = true;
		}
		else
			this.isPrevActive = false;

		for (const btn of this.challengeBtnArr)
			btn.draw(ctx, this.t);
		
	}
}