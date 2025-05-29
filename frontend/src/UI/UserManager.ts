import { global_curUser } from "./GameCanvas"
import { DEEP_PURPLE, LIGHT_PURPLE} from "../game/Constants";
import { drawCenteredText } from "../game/StartScreen";
import { Button } from "./Button";
import { UserHubState, GameType } from "./Types";
import { RankingHandler } from "../game/RankingPoints";
import { updateUserStatsAPI } from "../services/userService";
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

/*
OLD VERSION

export interface User {
    username: string;
	password: string;
    wins: number;
    losses: number;
	rankingPoint: number;
	// Add match history here...? Or somewhere else?
}
	*/

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
	player1_rank: number;
	player2_id: number;
	player2_rank: number;
	winner_id: number;
	game_duration: number;
	game_type: string; // pong / blockbattle
	created_at: Date;
	game_data: PongData | BBData;
}

export interface User {
	id: number;
	username: string;
//	password: string; --> Not needed in the frontend, right?
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
	match_history: MatchData[];
}



export class ChallengeButton extends Button
{
	user: User;

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, user: User)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.user = user;
	}

	clickAction(): void {
	}
}

export class PongButton extends Button
{
	user: User;

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, user: User)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.user = user;
	}

	clickAction(): void {
	}
}

export class TournamentButton extends Button
{
	user: User;

	constructor(ctx: CanvasRenderingContext2D, x: number, y: number, boxColor: string, hoverColor: string, text: string, textColor: string, textSize: string, font: string, user: User)
	{
		super(ctx, x, y, boxColor, hoverColor, text, textColor, textSize, font);
		this.user = user;
	}

	clickAction(): void {
	}
}

export class UserManager {
   /* static saveUserData(user: User): void 
	{
        try 
		{
			// NOTE! If key already existed, it will be OVERWRITTEN!
			// So when we call this function, we need to already know that a duplicate does not exist
			localStorage.setItem(user.username, JSON.stringify(user));     
		} 
		catch (e) 
		{
            if (e instanceof DOMException) 
				console.error("Storage limit exceeded, could not save user data", e);
			else 
                console.error("An error occurred while saving user data", e);
        }
    } */


	static async updateUserStats(winner: User, loser: User, type: GameType) 
	{

		if (type === GameType.BLOCK_BATTLE)
		{
			winner.games_played_blockbattle++;
			winner.wins_blockbattle++;
			loser.games_played_blockbattle++;
			loser.losses_blockbattle++;
		}
		else if (type === GameType.PONG)
		{
			winner.games_played_pong++;
			winner.wins_pong++;
			loser.games_played_pong++;
			loser.losses_pong++;
		}
		
		RankingHandler.updateRanking(winner, loser);

		try {

			await updateUserStatsAPI(winner, loser, type);

		} catch {

			throw new Error('Failed to update user statistics'); // is this necessary...?

		}

	} 

	// This could be more simple now that I have the whole User object in updateUserStats...?
/*	static updateUserData(username: string, updatedData: Partial<User>): void 
	{
		try 
		{
			const oldData = this.getUserData(username);
			if (oldData) 
			{
				const updatedUser = { ...oldData, ...updatedData };
				this.saveUserData(updatedUser);
			} 
			else
				console.error(`No user found with username: ${username}`);
		} 
		catch (e) {
			console.error("An error occurred while updating user data", e);
		}
	} */

/*	static cloneUser(user: User): User
	{
		let newUser: User = {
			id: user.id,
			username: user.username,
		//	password: string; --> Not needed in the frontend, right?
			ranking_points: user.ranking_points,
			avatar_url: user.avatar_url,
			games_played_pong: user.games_played_pong,
			wins_pong: user.wins_pong,
			losses_pong: user.losses_pong,
			games_played_blockbattle: user.games_played_blockbattle,
			wins_blockbattle: user.wins_blockbattle,
			losses_blockbattle: user.losses_blockbattle,
			tournaments_played: user.tournaments_played,
			tournaments_won: user.tournaments_won,
			tournament_points: user.tournament_points,
			created_at: user.created_at,
			updated_at: user.updated_at,
			deleted_at: user.deleted_at
		//	match_history: MatchData[]; --> Needs to be added at some point maybe...?
		};

		return newUser;
	} */



 /*   static getAllUserData(): User[] {

        const usersArr: User[] = [];
		const usernames = localStorage.getItem(USER_ARR_KEY);
		let usernameArr;

		if (!usernames)
			return usersArr;
		else
			usernameArr = JSON.parse(usernames);
        
        for (let i = 0; i < usernameArr.length; i++) 
		{
            const userData = localStorage.getItem(usernameArr[i]);

			if (!userData)
				continue ;
			else
			{
				try 
				{
					const user: User = JSON.parse(userData);
					usersArr.push(user);
				} 
				catch (e) 
				{
					console.error(`Error parsing user data for ${userData}:`, e);
				}
			}


        }

        return usersArr;
    } */


	static drawUserInfo(ctx: CanvasRenderingContext2D, user: User, x: number, y: number, state: UserHubState, isInTournament: boolean, t: TFunction): ChallengeButton | TournamentButton
	{
		// Draw avatar box & text (JUST A TEST)
		const avatarW = 200;
		const avatarH = 180;
		ctx.fillStyle = DEEP_PURPLE; // GLOBAL USE of ctx
		ctx.fillRect(x, y, avatarW, avatarH);

		ctx.font = '20px arial';
		ctx.fillStyle = 'black';
		ctx.fillText('Avatar here', x + 40, y + 30);

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
			const challengeButton = new ChallengeButton(ctx, buttonX, buttonY, 'red', '#780202', text, 'white', '25px', 'arial', user);
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
				tournamentBtn = new TournamentButton(ctx, buttonX, buttonY, 'green', '#0e3801', text, 'white', '20px', 'arial', user);
			}
			else
			{
				let text = t('remove');
				const buttonX = boxX + boxPadding * 2 + infoWidth * 2 + 40;
				const buttonY = infoHeight - buttonOffset;
				tournamentBtn = new TournamentButton(ctx, buttonX, buttonY, 'red', '#780202', text, 'white', '20px', 'arial', user);
			}

			return tournamentBtn;

		}

	}


	static drawCurUser(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, t: TFunction)
	{
		if (global_curUser)
		{
			drawCenteredText(canvas, ctx, t('currently_logged_in'), '22px arial', 'white', 30);
			drawCenteredText(canvas, ctx, global_curUser, '28px arial', 'red', 60);
		}
	}
}
