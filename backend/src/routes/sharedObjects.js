// A helper variable that stores opponent information. 
// The frontend then uses this variable to verify that the opponent data is not changed mid game in frontend.
let globalObj = { opponentData: null };

// Same for tournament logic
let globalTournamentObj = { 
	tournamentArr: [],
	gameOrder: [
		[0, 1],
		[2, 3],
		[0, 2],
		[1, 3],
		[3, 0],
		[2, 1]
	],
	matchCounter: 0,
	gameType: '' // pong or blockbattle
 };
module.exports = { globalObj, globalTournamentObj };
