import { global_curUser } from "./GameCanvas"
import { USER_ARR_KEY, DEEP_PURPLE, LIGHT_PURPLE} from "../game/Constants";
import { drawCenteredText } from "../game/StartScreen";
import { Button } from "./Button";
import { RankingHandler } from "../game/RankingPoints";
import { UserHubState } from "./Types";

// interface already present in /frontend/src/services/Auth.ts
export interface User {
    username: string;
	password: string;
    wins: number;
    losses: number;
	rankingPoint: number;
	// Add match history here...? Or somewhere else?
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

    static saveUserData(user: User): void 
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
    }

    static getUserData(username: string): User | null {
        const data = localStorage.getItem(username);
        return data ? JSON.parse(data) : null; // Return null if no data is found
    }

    static deleteUserData(username: string): void {
        localStorage.removeItem(username);
    }

	static updateUserStats(winner: User, loser: User): void 
	{
		winner.wins++;
		loser.losses++;
		RankingHandler.updateRanking(winner, loser);

		this.updateUserData(winner.username, winner); // This does not necessarily need the username...?
		this.updateUserData(loser.username, loser);			

	}

	// This could be more simple now that I have the whole User object in updateUserStats...?
	static updateUserData(username: string, updatedData: Partial<User>): void 
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
	}

	static cloneUser(user: User): User
	{
		let newUser: User = {
			username: user.username,
			password: user.password,
			wins: user.wins,
			losses: user.losses,
			rankingPoint: user.rankingPoint,
		};

		return newUser;
	}



    static getAllUserData(): User[] {

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
    }


	static drawUserInfo(ctx: CanvasRenderingContext2D, user: User, x: number, y: number, state: UserHubState, isInTournament: boolean): ChallengeButton | TournamentButton
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
		ctx.fillText('WINS / LOSSES:  ', boxX + boxPadding, infoHeight);
		const winLoseData = `${user.wins} / ${user.losses}`;
		ctx.fillStyle = 'black';
		ctx.fillText(winLoseData, boxX + boxPadding, infoHeight + lineHeight);
		ctx.fillStyle = '#1111d6';
		ctx.fillText('RANKING POINTS:  ', boxX + boxPadding + infoWidth, infoHeight);
		ctx.fillStyle = 'black';
		ctx.fillText(user.rankingPoint.toFixed(2), boxX + boxPadding + infoWidth, infoHeight + lineHeight);

		// Create challenge button
		if (state === UserHubState.SINGLE_GAME)
		{
			let text = 'CHALLENGE';
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
				let text = 'ADD TO TOURNAMENT';
				const buttonX = boxX + boxPadding * 2 + infoWidth * 2 - 20;
				const buttonY = infoHeight - buttonOffset;
				tournamentBtn = new TournamentButton(ctx, buttonX, buttonY, 'green', '#0e3801', text, 'white', '20px', 'arial', user);
			}
			else
			{
				let text = 'REMOVE';
				const buttonX = boxX + boxPadding * 2 + infoWidth * 2 + 40;
				const buttonY = infoHeight - buttonOffset;
				tournamentBtn = new TournamentButton(ctx, buttonX, buttonY, 'red', '#780202', text, 'white', '20px', 'arial', user);
			}

			return tournamentBtn;

		}

	}


	static drawCurUser(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D)
	{
		if (global_curUser)
		{
			drawCenteredText(canvas, ctx, 'Currently logged in user: ', '22px arial', 'white', 30);
			drawCenteredText(canvas, ctx, global_curUser, '28px arial', 'red', 60);
		}
	}
}
