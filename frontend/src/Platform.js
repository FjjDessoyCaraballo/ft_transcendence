"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = exports.PlatformDir = void 0;
var constants_js_1 = require("./constants.js");
var Environment_js_1 = require("./Environment.js");
var CollisionShape_js_1 = require("./CollisionShape.js");
var PlatformDir;
(function (PlatformDir) {
    PlatformDir[PlatformDir["UP_DOWN"] = 0] = "UP_DOWN";
    PlatformDir[PlatformDir["LEFT_RIGHT"] = 1] = "LEFT_RIGHT";
    PlatformDir[PlatformDir["STILL"] = 2] = "STILL";
})(PlatformDir || (exports.PlatformDir = PlatformDir = {}));
;
var Platform = /** @class */ (function () {
    function Platform(x, y, width, dir, range) {
        this.x = x;
        this.y = y;
        this.orig_x = x;
        this.orig_y = y;
        this.color = 'orange';
        this.width = width;
        this.height = constants_js_1.PLATFORM_THICKNESS;
        this.dir = dir;
        this.range = range;
        if (dir == PlatformDir.UP_DOWN)
            this.velocity = { x: 0, y: -constants_js_1.PLATFORM_SPEED };
        else if (dir == PlatformDir.LEFT_RIGHT)
            this.velocity = { x: -constants_js_1.PLATFORM_SPEED, y: 0 };
        else
            this.velocity = { x: 0, y: 0 };
        this.cShape = new CollisionShape_js_1.CollisionShape(this.x, this.y, this.width, this.height, CollisionShape_js_1.collType.PLATFORM, this);
    }
    Platform.prototype.move = function (deltaTime) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        if (this.y >= Environment_js_1.gameArea.maxY - this.height) {
            this.y = Environment_js_1.gameArea.maxY - this.height;
            this.velocity.y = -constants_js_1.PLATFORM_SPEED;
        }
        else if (this.x <= Environment_js_1.gameArea.minX) {
            this.x = Environment_js_1.gameArea.minX;
            this.velocity.x = constants_js_1.PLATFORM_SPEED;
        }
        else if (this.x >= Environment_js_1.gameArea.maxX - this.width) {
            this.x = Environment_js_1.gameArea.maxX - this.width;
            this.velocity.x = -constants_js_1.PLATFORM_SPEED;
        }
        if (this.y > this.orig_y + this.range)
            this.velocity.y = -constants_js_1.PLATFORM_SPEED;
        else if (this.y < this.orig_y - this.range)
            this.velocity.y = constants_js_1.PLATFORM_SPEED;
        else if (this.x > this.orig_x + this.range)
            this.velocity.x = -constants_js_1.PLATFORM_SPEED;
        else if (this.x < this.orig_x - this.range)
            this.velocity.x = constants_js_1.PLATFORM_SPEED;
        this.cShape.move(this.x, this.y);
    };
    Platform.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        //		this.cShape.draw(ctx); // --> For debug
    };
    return Platform;
}());
exports.Platform = Platform;
