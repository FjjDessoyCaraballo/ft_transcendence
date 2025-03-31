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
exports.Player2 = void 0;
var Player_js_1 = require("./Player.js");
var constants_js_1 = require("./constants.js");
var Platform_js_1 = require("./Platform.js");
var Player2 = /** @class */ (function (_super) {
    __extends(Player2, _super);
    function Player2(x, y, color, user) {
        var _this = _super.call(this, x, y, color, user) || this;
        _this.direction = 'left';
        return _this;
    }
    Player2.prototype.move = function (keys, deltaTime) {
        if (this.onPlatform && !keys['j'] && !keys['l']) {
            this.x += this.onPlatform.velocity.x * deltaTime;
            this.y += this.onPlatform.velocity.y * deltaTime;
            if (this.y != this.onPlatform.y - constants_js_1.PLAYER_SIZE)
                this.y = this.onPlatform.y - constants_js_1.PLAYER_SIZE;
        }
        else if (this.onPlatform && this.onPlatform.dir === Platform_js_1.PlatformDir.UP_DOWN) {
            this.x += this.velocity.x * deltaTime;
            this.y += this.onPlatform.velocity.y * deltaTime;
            if (this.y != this.onPlatform.y - constants_js_1.PLAYER_SIZE)
                this.y = this.onPlatform.y - constants_js_1.PLAYER_SIZE;
        }
        else {
            this.x += this.velocity.x * deltaTime;
            this.y += this.velocity.y * deltaTime;
        }
        if (!this.isOnGround) {
            this.velocity.y += constants_js_1.GRAVITY * deltaTime;
        }
        this.checkGroundCollision();
        this.checkWallCollision();
        this.checkPlatformDrop();
        this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
    };
    Player2.prototype.checkKeyEvents = function (keys) {
        this.velocity.x = 0;
        if (keys['i'] && this.isOnGround) {
            this.velocity.y = constants_js_1.JUMP_POWER;
            this.isOnGround = false;
            this.onPlatform = undefined;
        }
        if (keys['j']) {
            this.velocity.x = -constants_js_1.PLAYER_SPEED;
            this.direction = 'left';
        }
        if (keys['l']) {
            this.velocity.x = constants_js_1.PLAYER_SPEED;
            this.direction = 'right';
        }
        if (keys['u'] && this.canFire()) {
            this.fireProjectile();
        }
    };
    return Player2;
}(Player_js_1.Player));
exports.Player2 = Player2;
