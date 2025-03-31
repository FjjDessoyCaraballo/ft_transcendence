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
exports.StartScreen = exports.StartButton = void 0;
var Button_js_1 = require("./Button.js");
var index_js_1 = require("./index.js");
var MainMenu_js_1 = require("./MainMenu.js");
var index_js_2 = require("./index.js"); // Sort of weird to use this globally here to pass it to InGame...
var GameStates_js_1 = require("./GameStates.js");
var constants_js_1 = require("./constants.js");
var UserManager_js_1 = require("./UserManager.js");
var StartButton = /** @class */ (function (_super) {
    __extends(StartButton, _super);
    function StartButton(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        return _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
    }
    StartButton.prototype.clickAction = function () {
        if (!index_js_1.curUser)
            alert("You have to first log in to play this game!");
        else
            index_js_1.stateManager.changeState(new MainMenu_js_1.MainMenu(index_js_2.canvas));
    };
    return StartButton;
}(Button_js_1.Button));
exports.StartButton = StartButton;
var StartScreen = /** @class */ (function () {
    function StartScreen(canvas) {
        var _this = this;
        this.name = GameStates_js_1.GameStates.START_SCREEN;
        var text = 'START GAME';
        index_js_2.ctx.font = '50px arial'; // GLOBAL USE OF CTX!!
        var buttonX = (canvas.width / 2) - (index_js_2.ctx.measureText(text).width / 2) - constants_js_1.TEXT_PADDING;
        var buttonY = (canvas.height / 2) + 100;
        this.startButton = new StartButton(buttonX, buttonY, constants_js_1.BUTTON_COLOR, constants_js_1.BUTTON_HOVER_COLOR, text, 'white', '50px', 'arial');
        this.canvas = canvas;
        this.mouseMoveBound = function (event) { return _this.mouseMoveCallback(event); };
        this.mouseClickBound = function () { return _this.mouseClickCallback(); };
    }
    StartScreen.prototype.mouseMoveCallback = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        // Calculate the scaling factor based on the CSS size and the canvas resolution
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        // Calculate the mouse position relative to the canvas, adjusting for scaling
        var x = (event.clientX - rect.left) * scaleX;
        var y = (event.clientY - rect.top) * scaleY;
        this.startButton.checkMouse(x, y);
    };
    StartScreen.prototype.mouseClickCallback = function () {
        this.startButton.checkClick();
    };
    StartScreen.prototype.enter = function () {
        this.canvas.addEventListener('mousemove', this.mouseMoveBound);
        this.canvas.addEventListener('click', this.mouseClickBound);
    };
    StartScreen.prototype.exit = function () {
        this.canvas.removeEventListener('mousemove', this.mouseMoveBound);
        this.canvas.removeEventListener('click', this.mouseClickBound);
    };
    StartScreen.prototype.update = function (deltaTime) {
    };
    StartScreen.prototype.render = function (ctx) {
        UserManager_js_1.UserManager.drawCurUser();
        var mainTitle = 'Block Wars';
        ctx.font = '140px Impact';
        ctx.fillStyle = '#0a42ab';
        var titleX = (this.canvas.width / 2) - (ctx.measureText(mainTitle).width / 2);
        var titleY = this.canvas.height / 2 - 30;
        ctx.fillText(mainTitle, titleX, titleY);
        if (!index_js_1.curUser) {
            var infoText = 'Please log in to play the game';
            ctx.font = '50px arial';
            ctx.fillStyle = 'white';
            var infoX = (this.canvas.width / 2) - (ctx.measureText(infoText).width / 2);
            var infoY = this.canvas.height / 2 + 100;
            ctx.fillText(infoText, infoX, infoY);
        }
        else
            this.startButton.draw(ctx);
    };
    return StartScreen;
}());
exports.StartScreen = StartScreen;
