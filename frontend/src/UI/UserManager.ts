import { DEEP_PURPLE, LIGHT_PURPLE, PURPLE} from "../game/Constants";
import { drawCenteredText } from "../game/StartScreen";
import { Button } from "./Button";
import { UserHubState, GameType } from "./Types";
import { TFunction } from 'i18next';
import { Weapon } from "../game/Weapons";
import { bbMatchData } from "../game/BlockBattle";
import { recordMatchResult } from "../services/userService";
import { pongMatchData } from "../game/pong/Pong";


export interface PongData {
	id: number;
	match_id: number;
	longest_rally: number;
	avg_rally: number;
	player1_points: number;
	player2_points: number;
}

export interface BBData {
	id: number;
	match_id: number;
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

export interface MatchData {
	id: number;
	date: Date;
	player1_id: number;
	player1_name: string;
	p1_ranking_points: number;
	player2_id: number;
	player2_name: string;
	p2_ranking_points: number;
	winner_id: number;
	game_duration: number;
	game_type: string; // pong / blockbattle
	created_at: Date;
	game_data: PongData | BBData;
}

export interface User {
	id: number;
	username: string;
	ranking_points: number;
	avatar_url: string;
	games_played_pong: number;
	wins_pong: number;
	losses_pong: number;
	games_played_blockbattle: number;
	wins_blockbattle: number;
	losses_blockbattle: number;
	tournaments_played: number;
	tournaments_won: number;
	tournament_points: number;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date | null;
	bbWeapons: Weapon [];
	match_history: MatchData[];
}



export class ChallengeButton extends Button
{
	user: User;

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, user: User, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
		this.user = user;
	}

	clickAction(): void {
	}
}

export class PongButton extends Button
{
	user: User;

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, user: User, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
		this.user = user;
	}

	clickAction(): void {
	}
}

export class TournamentButton extends Button
{
	user: User;

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, user: User, t: TFunction)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font, t);
		this.user = user;
	}

	clickAction(): void {
	}
}

export class UserManager {

	static avatarCache: Record<string, HTMLImageElement> = {};

	static async updateUserStats(player1: User, player2: User, stats: bbMatchData | pongMatchData)
	{
		
		try {

			await recordMatchResult(player1, player2, stats);

		} catch (error) {

			console.error(error);
			throw (error);
		}

	} 


	static drawUserInfo(ctx: CanvasRenderingContext2D, user: User, x: number, y: number, state: UserHubState, isInTournament: boolean, t: TFunction): ChallengeButton | TournamentButton
	{
		const avatarW = 200;
		const avatarH = 180;

		if (!this.avatarCache[user.username])
		{
			const img = new Image();
			img.src = `https://localhost:3443${user.avatar_url}`;

			img.onload = () => {
			this.avatarCache[user.username] = img;
		    };

			// Draw avatar placeholder
			ctx.fillStyle = DEEP_PURPLE;
			ctx.fillRect(x, y, avatarW, avatarH);

			ctx.font = '20px arial';
			ctx.fillStyle = 'black';
			ctx.fillText('Loading avatar', x + 40, y + 30);
		}
		else
		{
			ctx.fillStyle = '#96799B';
			ctx.fillRect(x, y, avatarW, avatarH);
			ctx.drawImage(this.avatarCache[user.username], x, y, avatarW, avatarH);
		}
		

		// Draw info box
		const boxPadding = 40;
		const boxW = 700;
		const boxH = 180;
		const boxX = x + avatarW + 20;
		ctx.fillStyle = LIGHT_PURPLE; // GLOBAL USE
		ctx.fillRect(boxX, y, boxW, boxH);

		// Draw username
		ctx.font = '35px arial';
		ctx.fillStyle = 'black';
		const usernameX = boxX + (boxW / 2) - (ctx.measureText(user.username).width / 2);
		const usernameY = y + boxPadding;
		ctx.fillText(user.username, usernameX, usernameY);

		// Draw info
		const infoHeight = usernameY + 60;
		const infoWidth = 200;
		const lineHeight = 30;
		const buttonOffset = 20;

		ctx.font = '20px arial';
		ctx.fillStyle = '#1111d6';
		ctx.fillText(t('wins_losses'), boxX + boxPadding, infoHeight);
		const winLoseData = `${user.wins_blockbattle + user.wins_pong} / ${user.losses_blockbattle + user.losses_pong}`; // CHECK THIS: Should we separate these?
		ctx.fillStyle = 'black';
		ctx.fillText(winLoseData, boxX + boxPadding, infoHeight + lineHeight);
		ctx.fillStyle = '#1111d6';
		ctx.fillText(t('ranking_points_caps'), boxX + boxPadding + infoWidth, infoHeight);
		ctx.fillStyle = 'black';
		ctx.fillText(user.ranking_points.toFixed(2), boxX + boxPadding + infoWidth, infoHeight + lineHeight);

		// Create challenge button
		if (state === UserHubState.SINGLE_GAME)
		{
			let text = t('challenge');
			const buttonX = boxX + boxPadding * 2 + infoWidth * 2;
			const buttonY = infoHeight - buttonOffset;
			const challengeButton = new ChallengeButton(ctx, buttonX, buttonY, 'red', '#780202', text, 'white', '25px', 'arial', user, t);
			return challengeButton;
		}
		else
		{
			let tournamentBtn;

			if (!isInTournament)
			{
				let text = t('add_to_tournament');
				const buttonX = boxX + boxPadding * 2 + infoWidth * 2 - 20;
				const buttonY = infoHeight - buttonOffset;
				tournamentBtn = new TournamentButton(ctx, buttonX, buttonY, 'green', '#0e3801', text, 'white', '20px', 'arial', user, t);
			}
			else
			{
				let text = t('remove');
				const buttonX = boxX + boxPadding * 2 + infoWidth * 2 + 40;
				const buttonY = infoHeight - buttonOffset;
				tournamentBtn = new TournamentButton(ctx, buttonX, buttonY, 'red', '#780202', text, 'white', '20px', 'arial', user, t);
			}

			return tournamentBtn;

		}

	}


	static drawCurUser(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, curUser: User | null, t:TFunction)
	{
		if (curUser)
		{
			drawCenteredText(canvas, ctx, t('currently_logged_in'), '22px arial', 'white', 30);
			drawCenteredText(canvas, ctx, curUser.username, '28px arial', 'red', 60);
		}
	}
}
