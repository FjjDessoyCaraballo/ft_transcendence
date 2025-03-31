"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instructions = void 0;
var GameStates_js_1 = require("./GameStates.js");
var EndScreen_js_1 = require("./EndScreen.js");
var index_js_1 = require("./index.js");
var constants_js_1 = require("./constants.js");
var UserManager_js_1 = require("./UserManager.js");
var Instructions = /** @class */ (function () {
    function Instructions(canvas) {
        var _this = this;
        this.name = GameStates_js_1.GameStates.INSTRUCTIONS;
        this.canvas = canvas;
        var text = 'RETURN TO MENU';
        index_js_1.ctx.font = '25px arial'; // GLOBAL USE OF CTX!!
        var buttonX = (canvas.width / 2) - (index_js_1.ctx.measureText(text).width / 2) - constants_js_1.TEXT_PADDING;
        var buttonY = (canvas.height / 2) - 20 - constants_js_1.TEXT_PADDING + 370;
        this.returnMenuButton = new EndScreen_js_1.ReturnMainMenuButton(buttonX, buttonY, 'red', '#780202', text, 'white', '25px', 'arial');
        this.mouseMoveBound = function (event) { return _this.mouseMoveCallback(event); };
        this.mouseClickBound = function () { return _this.mouseClickCallback(); };
    }
    Instructions.prototype.mouseMoveCallback = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        var x = (event.clientX - rect.left) * scaleX;
        var y = (event.clientY - rect.top) * scaleY;
        this.returnMenuButton.checkMouse(x, y);
    };
    Instructions.prototype.mouseClickCallback = function () {
        this.returnMenuButton.checkClick();
    };
    Instructions.prototype.enter = function () {
        this.canvas.addEventListener('mousemove', this.mouseMoveBound);
        this.canvas.addEventListener('click', this.mouseClickBound);
    };
    Instructions.prototype.exit = function () {
        this.canvas.removeEventListener('mousemove', this.mouseMoveBound);
        this.canvas.removeEventListener('click', this.mouseClickBound);
    };
    Instructions.prototype.update = function (deltaTime) {
    };
    Instructions.prototype.render = function (ctx) {
        UserManager_js_1.UserManager.drawCurUser();
        // Draw info box
        var boxPadding = 70;
        var boxW = this.canvas.width - 2 * boxPadding;
        var boxH = this.canvas.height - 2 * boxPadding;
        ctx.fillStyle = constants_js_1.BUTTON_HOVER_COLOR;
        ctx.fillRect(boxPadding, boxPadding, boxW, boxH);
        // Draw header
        var headerText = 'GAME INSTRUCTIONS';
        ctx.font = '50px arial';
        ctx.fillStyle = 'black';
        var headerX = (this.canvas.width / 2) - (ctx.measureText(headerText).width / 2);
        var headerY = boxPadding + 60 + 10; // 60 = font size, 10 = small margin
        ctx.fillText(headerText, headerX, headerY);
        // Draw info text
        var infoTextArr = this.getInstructionText();
        ctx.font = '28px arial';
        ctx.fillStyle = 'black';
        var infoX, infoY;
        var lineCount = 1;
        var lineHeight = 32;
        for (var _i = 0, infoTextArr_1 = infoTextArr; _i < infoTextArr_1.length; _i++) {
            var line = infoTextArr_1[_i];
            infoX = (this.canvas.width / 2) - (ctx.measureText(line).width / 2);
            infoY = headerY + 20 + lineHeight * lineCount; // 20 = font size
            ctx.fillText(line, infoX, infoY);
            lineCount++;
        }
        this.returnMenuButton.draw(ctx);
    };
    Instructions.prototype.getInstructionText = function () {
        var lines = [
            "These are the instructions.",
            "They will be updated later =)",
        ];
        return lines;
    };
    return Instructions;
}());
exports.Instructions = Instructions;
