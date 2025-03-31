"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateManager = exports.GameStates = void 0;
var GameStates;
(function (GameStates) {
    GameStates[GameStates["START_SCREEN"] = 0] = "START_SCREEN";
    GameStates[GameStates["MAIN_MENU"] = 1] = "MAIN_MENU";
    GameStates[GameStates["INSTRUCTIONS"] = 2] = "INSTRUCTIONS";
    GameStates[GameStates["USER_HUB"] = 3] = "USER_HUB";
    GameStates[GameStates["MATCH_INTRO"] = 4] = "MATCH_INTRO";
    GameStates[GameStates["IN_GAME"] = 5] = "IN_GAME";
    GameStates[GameStates["END_SCREEN"] = 6] = "END_SCREEN";
})(GameStates || (exports.GameStates = GameStates = {}));
;
// STATE HANDLER
var GameStateManager = /** @class */ (function () {
    function GameStateManager() {
        this.currentState = null;
    }
    GameStateManager.prototype.changeState = function (newState) {
        if (this.currentState) {
            this.currentState.exit();
        }
        this.currentState = newState;
        this.currentState.enter();
    };
    GameStateManager.prototype.update = function (deltaTime) {
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    };
    GameStateManager.prototype.render = function (ctx) {
        if (this.currentState) {
            this.currentState.render(ctx);
        }
    };
    GameStateManager.prototype.getStateName = function () {
        if (!this.currentState)
            return null;
        else
            return this.currentState.name;
    };
    return GameStateManager;
}());
exports.GameStateManager = GameStateManager;
