/*

import { User } from "../UI/UserManager";


// Uses the ELO ranking point system

export class RankingHandler {

    private static K: number = 50;

    // Function to calculate expected score (probability of winning)
    private static expectedScore(playerRating: number, opponentRating: number): number 
	{
        return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    }

	public static getPlayerRankEffects(player1: User, player2: User): [number, number]
	{
		const playerExpected = this.expectedScore(player1.ranking_points, player2.ranking_points);

		const winEffect = player1.ranking_points + this.K * (1 - playerExpected);
		const loseEffect = player1.ranking_points + this.K * (0 - playerExpected);

		return [winEffect, loseEffect];
	}

	// resultOfP1 == How game went for player1 (win = 1, lose = 0)
    public static updateRanking(winner: User, loser: User)
	{
		const winnerExpected = this.expectedScore(winner.ranking_points, loser.ranking_points);
        const loserExpected = 1 - winnerExpected;

        winner.ranking_points = winner.ranking_points + this.K * (1 - winnerExpected);
        loser.ranking_points = loser.ranking_points + this.K * (0 - loserExpected);

    }
}

*/