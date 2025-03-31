"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ctx = exports.canvas = exports.curUser = exports.stateManager = void 0;
exports.updateCurUser = updateCurUser;
var GameStates_js_1 = require("./GameStates.js");
var StartScreen_js_1 = require("./StartScreen.js");
var TEST_logIn_register_js_1 = require("./TEST_logIn_register.js");
var canvas = document.getElementById('gameCanvas');
exports.canvas = canvas;
var ctx = canvas.getContext('2d');
exports.ctx = ctx;
exports.stateManager = new GameStates_js_1.GameStateManager();
exports.curUser = null;
function updateCurUser(newUser) { exports.curUser = newUser; }
var prevTimeStamp = 0;
exports.stateManager.changeState(new StartScreen_js_1.StartScreen(canvas));
(0, TEST_logIn_register_js_1.setupLogin)();
function updateGame(deltaTime) {
    exports.stateManager.update(deltaTime);
}
function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    exports.stateManager.render(ctx);
}
// MAIN LOOP
function gameLoop(timeStamp) {
    var deltaTime = (timeStamp - prevTimeStamp) / 1000; // convert from ms to seconds
    prevTimeStamp = timeStamp;
    updateGame(deltaTime);
    renderGame();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
