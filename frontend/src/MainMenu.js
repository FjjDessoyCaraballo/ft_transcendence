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
exports.MainMenu = exports.UserHubButton = exports.InstructionsButton = exports.SingleGameButton = void 0;
var GameStates_js_1 = require("./GameStates.js");
var Button_js_1 = require("./Button.js");
var index_js_1 = require("./index.js"); // canvas again globally used... is it bad?
var constants_js_1 = require("./constants.js");
var Instructions_js_1 = require("./Instructions.js");
var UserHUB_js_1 = require("./UserHUB.js");
var UserManager_js_1 = require("./UserManager.js");
// BUTTONS
var SingleGameButton = /** @class */ (function (_super) {
    __extends(SingleGameButton, _super);
    function SingleGameButton(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        return _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
    }
    SingleGameButton.prototype.clickAction = function () {
        index_js_1.stateManager.changeState(new UserHUB_js_1.UserHUB(index_js_1.canvas)); // opponent will be chosen through UserHUB
    };
    return SingleGameButton;
}(Button_js_1.Button));
exports.SingleGameButton = SingleGameButton;
var InstructionsButton = /** @class */ (function (_super) {
    __extends(InstructionsButton, _super);
    function InstructionsButton(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        return _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
    }
    InstructionsButton.prototype.clickAction = function () {
        index_js_1.stateManager.changeState(new Instructions_js_1.Instructions(index_js_1.canvas));
    };
    return InstructionsButton;
}(Button_js_1.Button));
exports.InstructionsButton = InstructionsButton;
var UserHubButton = /** @class */ (function (_super) {
    __extends(UserHubButton, _super);
    function UserHubButton(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        return _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
    }
    UserHubButton.prototype.clickAction = function () {
        index_js_1.stateManager.changeState(new UserHUB_js_1.UserHUB(index_js_1.canvas));
    };
    return UserHubButton;
}(Button_js_1.Button));
exports.UserHubButton = UserHubButton;
// STATE CLASS
var MainMenu = /** @class */ (function () {
    function MainMenu(canvas) {
        var _this = this;
        this.name = GameStates_js_1.GameStates.MAIN_MENU;
        this.canvas = canvas;
        this.opponent = null;
        index_js_1.ctx.font = '40px arial'; // GLOBAL USE OF CTX!!
        var text1 = 'PLAY SINGLE GAME';
        var button1X = (canvas.width / 2) - (index_js_1.ctx.measureText(text1).width / 2) - constants_js_1.TEXT_PADDING;
        var text2 = 'USER HUB';
        var button2X = (canvas.width / 2) - (index_js_1.ctx.measureText(text2).width / 2) - constants_js_1.TEXT_PADDING;
        var buttonYCenter = (canvas.height / 2) - 20 - constants_js_1.TEXT_PADDING; // 20 == 40px / 2
        var button1Y = buttonYCenter - 60;
        var button2Y = buttonYCenter + 30;
        index_js_1.ctx.font = '30px arial'; // GLOBAL USE OF CTX!!
        var text3 = 'INSTRUCTIONS';
        var button3X = (canvas.width / 2) - (index_js_1.ctx.measureText(text3).width / 2) - constants_js_1.TEXT_PADDING;
        var button3Y = 600;
        this.singleGameButton = new SingleGameButton(button1X, button1Y, constants_js_1.BUTTON_COLOR, constants_js_1.BUTTON_HOVER_COLOR, text1, 'white', '40px', 'arial');
        this.userHubButton = new UserHubButton(button2X, button2Y, constants_js_1.BUTTON_COLOR, constants_js_1.BUTTON_HOVER_COLOR, text2, 'white', '40px', 'arial');
        this.instructionButton = new InstructionsButton(button3X, button3Y, '#b0332a', '#780202', text3, 'white', '30px', 'arial');
        this.mouseMoveBound = function (event) { return _this.mouseMoveCallback(event); };
        this.mouseClickBound = function () { return _this.mouseClickCallback(); };
    }
    MainMenu.prototype.mouseMoveCallback = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        // Calculate the scaling factor based on the CSS size and the canvas resolution
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        // Calculate the mouse position relative to the canvas, adjusting for scaling
        var x = (event.clientX - rect.left) * scaleX;
        var y = (event.clientY - rect.top) * scaleY;
        this.singleGameButton.checkMouse(x, y);
        this.instructionButton.checkMouse(x, y);
        this.userHubButton.checkMouse(x, y);
    };
    MainMenu.prototype.mouseClickCallback = function () {
        this.singleGameButton.checkClick();
        this.instructionButton.checkClick();
        this.userHubButton.checkClick();
    };
    MainMenu.prototype.enter = function () {
        this.canvas.addEventListener('mousemove', this.mouseMoveBound);
        this.canvas.addEventListener('click', this.mouseClickBound);
    };
    MainMenu.prototype.exit = function () {
        this.canvas.removeEventListener('mousemove', this.mouseMoveBound);
        this.canvas.removeEventListener('click', this.mouseClickBound);
    };
    MainMenu.prototype.update = function (deltaTime) {
    };
    MainMenu.prototype.render = function (ctx) {
        UserManager_js_1.UserManager.drawCurUser();
        this.singleGameButton.draw(ctx);
        this.instructionButton.draw(ctx);
        this.userHubButton.draw(ctx);
    };
    return MainMenu;
}());
exports.MainMenu = MainMenu;
