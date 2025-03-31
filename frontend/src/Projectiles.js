"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projectile = void 0;
var CollisionShape_js_1 = require("./CollisionShape.js");
var constants_js_1 = require("./constants.js");
var Projectile = /** @class */ (function () {
    function Projectile(x, y, velocity) {
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.width = 10; // Add to constants?
        this.height = 5; // Add to constants?
        this.color = 'red';
        this.cShape = new CollisionShape_js_1.CollisionShape(x, y, this.width, this.height, CollisionShape_js_1.collType.BULLET, this);
        this.isValid = true;
    }
    Projectile.prototype.update = function (canvas, deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        this.cShape.move(this.x, this.y);
        if (this.x <= constants_js_1.WALL_THICKNESS || this.x >= canvas.width - constants_js_1.WALL_THICKNESS - this.width ||
            this.y <= 0 || this.y >= canvas.height - constants_js_1.FLOOR_THICKNESS - this.width) {
            this.isValid = false;
        }
    };
    Projectile.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    return Projectile;
}());
exports.Projectile = Projectile;
