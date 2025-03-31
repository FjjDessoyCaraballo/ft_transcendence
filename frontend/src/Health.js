"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Health = void 0;
var constants_js_1 = require("./constants.js");
var Health = /** @class */ (function () {
    function Health() {
        this.amount = constants_js_1.MAX_HEALTH;
        this.color = 'green';
    }
    Health.prototype.addHealth = function (addition) {
        this.amount += addition;
        if (this.amount <= constants_js_1.MAX_HEALTH * 0.333)
            this.color = 'red';
        else if (this.amount <= constants_js_1.MAX_HEALTH * 0.666)
            this.color = 'yellow';
        else
            this.color = 'green';
        if (this.amount > constants_js_1.MAX_HEALTH)
            this.amount = constants_js_1.MAX_HEALTH;
    };
    Health.prototype.takeDmg = function (damage) {
        this.amount -= damage;
        if (this.amount <= constants_js_1.MAX_HEALTH * 0.333)
            this.color = 'red';
        else if (this.amount <= constants_js_1.MAX_HEALTH * 0.666)
            this.color = 'yellow';
        else
            this.color = 'green';
        if (this.amount < 0)
            this.amount = 0;
    };
    Health.prototype.draw = function (ctx, x, y) {
        var borderWidth = 4;
        var width = constants_js_1.HEALTH_WIDTH;
        var height = constants_js_1.HEALT_HEIGHT;
        var healthWidth = (constants_js_1.HEALTH_WIDTH / constants_js_1.MAX_HEALTH) * this.amount;
        // Borders (4 px per side)
        ctx.fillStyle = 'white';
        ctx.fillRect(x - borderWidth, y - borderWidth, width + borderWidth * 2, height + borderWidth * 2);
        // Background
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, width, height);
        // Health
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, healthWidth, height);
    };
    return Health;
}());
exports.Health = Health;
