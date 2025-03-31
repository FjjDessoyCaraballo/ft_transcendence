"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingHandler = void 0;
// Uses the ELO ranking point system
var RankingHandler = /** @class */ (function () {
    function RankingHandler() {
    }
    // Function to calculate expected score (probability of winning)
    RankingHandler.expectedScore = function (playerRating, opponentRating) {
        return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    };
    RankingHandler.getPlayerRankEffects = function (player1, player2) {
        var playerExpected = this.expectedScore(player1.rankingPoint, player2.rankingPoint);
        var winEffect = player1.rankingPoint + this.K * (1 - playerExpected);
        var loseEffect = player1.rankingPoint + this.K * (0 - playerExpected);
        return [winEffect, loseEffect];
    };
    // resultOfP1 == How game went for player1 (win = 1, lose = 0)
    RankingHandler.updateRanking = function (winner, loser) {
        var winnerExpected = this.expectedScore(winner.rankingPoint, loser.rankingPoint);
        var loserExpected = 1 - winnerExpected;
        //		console.log('EXPECT: ', winnerExpected, loserExpected);
        //		console.log('RANK DIFF: ', this.K * (1 - winnerExpected), this.K * (0 - loserExpected));
        winner.rankingPoint = winner.rankingPoint + this.K * (1 - winnerExpected);
        loser.rankingPoint = loser.rankingPoint + this.K * (0 - loserExpected);
    };
    RankingHandler.K = 50;
    return RankingHandler;
}());
exports.RankingHandler = RankingHandler;
