"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
var index_js_1 = require("./index.js"); // is this bad...? Using global variable?
var constants_js_1 = require("./constants.js");
var Button = /** @class */ (function () {
    function Button(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        this.x = x;
        this.y = y;
        this.boxColor = boxColor;
        this.hoverColor = hoverColor;
        this.text = text;
        this.textColor = textColor;
        this.textSize = textSize;
        this.font = font;
        this.isHover = false;
        index_js_1.ctx.font = textSize + ' ' + font;
        var textMetrics = index_js_1.ctx.measureText(this.text);
        this.width = textMetrics.width + 2 * constants_js_1.TEXT_PADDING;
        this.height = parseInt(textSize) + 2 * constants_js_1.TEXT_PADDING;
    }
    Button.prototype.checkMouse = function (mouseX, mouseY) {
        if (mouseX > this.x && mouseX < this.x + this.width
            && mouseY > this.y && mouseY < this.y + this.height) {
            this.isHover = true;
        }
        else
            this.isHover = false;
    };
    Button.prototype.checkClick = function () {
        if (!this.isHover)
            return false;
        else {
            this.clickAction();
            return true;
        }
    };
    Button.prototype.draw = function (ctx) {
        var color;
        if (this.isHover)
            color = this.hoverColor;
        else
            color = this.boxColor;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.textColor;
        ctx.font = this.textSize + ' ' + this.font;
        var fontSize = parseInt(this.textSize);
        var textX = (this.x + this.width / 2) - (ctx.measureText(this.text).width / 2);
        var textY = (this.y + this.height / 2) + (fontSize / 2) - constants_js_1.TEXT_PADDING;
        ctx.fillText(this.text, textX, textY);
    };
    return Button;
}());
exports.Button = Button;
