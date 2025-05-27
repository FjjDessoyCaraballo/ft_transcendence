// A helper variable that stores opponent information. 
// The frontend then uses this variable to verify that the opponent data is not changed mid game in frontend.
let globalObj = { opponentData: null };
module.exports = { globalObj };