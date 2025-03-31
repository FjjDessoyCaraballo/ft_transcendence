"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndScreen = exports.ReturnMainMenuButton = void 0;
var GameStates_js_1 = require("./GameStates.js");
var Button_js_1 = require("./Button.js");
var index_js_1 = require("./index.js");
var MainMenu_js_1 = require("./MainMenu.js");
var constants_js_1 = require("./constants.js");
var UserManager_js_1 = require("./UserManager.js");
var ReturnMainMenuButton = /** @class */ (function (_super) {
    __extends(ReturnMainMenuButton, _super);
    function ReturnMainMenuButton(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        return _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
    }
    ReturnMainMenuButton.prototype.clickAction = function () {
        index_js_1.stateManager.changeState(new MainMenu_js_1.MainMenu(index_js_1.canvas));
    };
    return ReturnMainMenuButton;
}(Button_js_1.Button));
exports.ReturnMainMenuButton = ReturnMainMenuButton;
var EndScreen = /** @class */ (function () {
    function EndScreen(canvas, winner, loser) {
        var _this = this;
        this.name = GameStates_js_1.GameStates.END_SCREEN;
        this.canvas = canvas;
        this.winner = winner;
        this.loser = loser;
        var text = 'RETURN TO MENU';
        index_js_1.ctx.font = '40px arial'; // GLOBAL USE OF CTX!!
        var buttonX = (canvas.width / 2) - (index_js_1.ctx.measureText(text).width / 2) - constants_js_1.TEXT_PADDING;
        var buttonY = (canvas.height / 2) + 200 - constants_js_1.TEXT_PADDING;
        this.returnMenuButton = new ReturnMainMenuButton(buttonX, buttonY, 'red', '#780202', text, 'white', '40px', 'arial');
        this.mouseMoveBound = function (event) { return _this.mouseMoveCallback(event); };
        this.mouseClickBound = function () { return _this.mouseClickCallback(); };
        UserManager_js_1.UserManager.updateUserStats(winner, loser);
    }
    EndScreen.prototype.mouseMoveCallback = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        var x = (event.clientX - rect.left) * scaleX;
        var y = (event.clientY - rect.top) * scaleY;
        this.returnMenuButton.checkMouse(x, y);
    };
    EndScreen.prototype.mouseClickCallback = function () {
        this.returnMenuButton.checkClick();
    };
    EndScreen.prototype.enter = function () {
        this.canvas.addEventListener('mousemove', this.mouseMoveBound);
        this.canvas.addEventListener('click', this.mouseClickBound);
    };
    EndScreen.prototype.exit = function () {
        this.canvas.removeEventListener('mousemove', this.mouseMoveBound);
        this.canvas.removeEventListener('click', this.mouseClickBound);
    };
    EndScreen.prototype.update = function (deltaTime) {
    };
    EndScreen.prototype.render = function (ctx) {
        var text = this.winner.username + ' wins the game!';
        ctx.font = '40px arial';
        ctx.fillStyle = '#1cc706';
        var textX = (this.canvas.width / 2) - (ctx.measureText(text).width / 2);
        ctx.fillText(text, textX, 200);
        var winnerRankText = "The new rank of ".concat(this.winner.username, " is ").concat(this.winner.rankingPoint.toFixed(2), ".");
        ctx.font = '30px arial';
        ctx.fillStyle = 'white';
        var ranking1X = (this.canvas.width / 2) - (ctx.measureText(winnerRankText).width / 2);
        ctx.fillText(winnerRankText, ranking1X, 300);
        var loserRankText = "The new rank of ".concat(this.loser.username, " is ").concat(this.loser.rankingPoint.toFixed(2), ".");
        var ranking2X = (this.canvas.width / 2) - (ctx.measureText(loserRankText).width / 2);
        ctx.fillText(loserRankText, ranking2X, 340);
        this.returnMenuButton.draw(ctx);
    };
    return EndScreen;
}());
exports.EndScreen = EndScreen;
