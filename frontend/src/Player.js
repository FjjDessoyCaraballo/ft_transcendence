"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var constants_js_1 = require("./constants.js");
var Projectiles_js_1 = require("./Projectiles.js");
var Environment_js_1 = require("./Environment.js");
var CollisionShape_js_1 = require("./CollisionShape.js");
var Platform_js_1 = require("./Platform.js");
var Health_js_1 = require("./Health.js");
var Player = /** @class */ (function () {
    function Player(x, y, color, user) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.width = constants_js_1.PLAYER_SIZE;
        this.height = constants_js_1.PLAYER_SIZE;
        this.velocity = { x: 0, y: 0 };
        this.direction = 'right';
        this.isOnGround = true;
        this.projectiles = [];
        this.lastFired = 0;
        this.cooldownTime = constants_js_1.FIRE_COOLDOWN;
        this.cShapeSize = constants_js_1.PLAYER_SIZE - 4;
        this.cShapeOffset = 2;
        this.cShape = new CollisionShape_js_1.CollisionShape(this.x + this.cShapeOffset, this.y + this.cShapeOffset, this.cShapeSize, this.cShapeSize, CollisionShape_js_1.collType.PLAYER, this);
        this.health = new Health_js_1.Health();
        this.userData = user;
    }
    Player.prototype.move = function (keys, deltaTime) {
        if (this.onPlatform && !keys['a'] && !keys['d']) {
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
    Player.prototype.checkGroundCollision = function () {
        if (this.y >= Environment_js_1.gameArea.maxY - this.height) {
            this.isOnGround = true;
            this.y = Environment_js_1.gameArea.maxY - this.height;
            this.velocity.y = 0;
            this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
        }
    };
    Player.prototype.checkWallCollision = function () {
        if (this.x <= Environment_js_1.gameArea.minX) {
            this.x = Environment_js_1.gameArea.minX;
            this.velocity.x = 0;
        }
        else if (this.x >= Environment_js_1.gameArea.maxX - this.width) {
            this.x = Environment_js_1.gameArea.maxX - this.width;
            this.velocity.x = 0;
        }
        this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
    };
    Player.prototype.checkPlatformDrop = function () {
        if (!this.onPlatform)
            return;
        if (this.x > this.onPlatform.x + this.onPlatform.width
            || this.x + this.width < this.onPlatform.x) {
            this.isOnGround = false;
            this.onPlatform = undefined;
        }
    };
    Player.prototype.resolveCollision = function (obj, type, prevPointY, curPointY) {
        // Player corner points, starting top-left, in clockwise order
        var playerPoints = [
            { x: this.x, y: this.y },
            { x: this.x + this.width, y: this.y },
            { x: this.x + this.width, y: this.y + this.height },
            { x: this.x, y: this.y + this.height }
        ];
        if (type === CollisionShape_js_1.collType.FALL) {
            this.y = obj.y - constants_js_1.PLAYER_SIZE;
            this.velocity.y = 0;
            this.isOnGround = true;
            this.onPlatform = obj.master;
        }
        else if (this.velocity.y > 0 && obj.type === CollisionShape_js_1.collType.PLATFORM) {
            if (obj.isPointInShape(playerPoints[2]) || obj.isPointInShape(playerPoints[3])) // Player going down && either of the lower points is in the obj
             {
                this.y = obj.y - constants_js_1.PLAYER_SIZE;
                this.velocity.y = 0;
                this.isOnGround = true;
                this.onPlatform = obj.master;
            }
            else if (obj.isPointInShape(playerPoints[0]) || obj.isPointInShape(playerPoints[1])) {
                if (obj.checkFallCollision(obj, prevPointY + constants_js_1.PLAYER_SIZE, curPointY + constants_js_1.PLAYER_SIZE)) {
                    this.y = obj.y - constants_js_1.PLAYER_SIZE;
                    this.velocity.y = 0;
                    this.isOnGround = true;
                    this.onPlatform = obj.master;
                }
            }
        }
        this.cShape.move(this.x + this.cShapeOffset, this.y + this.cShapeOffset);
    };
    Player.prototype.checkKeyEvents = function (keys) {
        this.velocity.x = 0;
        if (keys['w'] && this.isOnGround) {
            this.velocity.y = constants_js_1.JUMP_POWER;
            this.isOnGround = false;
            this.onPlatform = undefined;
        }
        if (keys['a']) {
            this.velocity.x = -constants_js_1.PLAYER_SPEED;
            this.direction = 'left';
        }
        if (keys['d']) {
            this.velocity.x = constants_js_1.PLAYER_SPEED;
            this.direction = 'right';
        }
        if (keys[' '] && this.canFire()) {
            this.fireProjectile();
        }
    };
    Player.prototype.canFire = function () {
        var currentTime = Date.now();
        return currentTime - this.lastFired >= this.cooldownTime;
    };
    Player.prototype.fireProjectile = function () {
        var bulletSpeed = constants_js_1.BULLET_SPEED;
        if (this.direction === 'left')
            bulletSpeed *= -1;
        var projectileVelocity = { x: bulletSpeed, y: 0 };
        var projectile = new Projectiles_js_1.Projectile(this.x + this.width / 2, this.y + this.height / 2, projectileVelocity);
        this.projectiles.push(projectile);
        this.lastFired = Date.now();
    };
    Player.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        var offsetX = this.x + constants_js_1.PLAYER_SIZE / 2 - constants_js_1.HEALTH_WIDTH / 2;
        var offsetY = this.y - constants_js_1.HEALT_HEIGHT - 10; // random 10 :D
        this.health.draw(ctx, offsetX, offsetY);
        for (var _i = 0, _a = this.projectiles; _i < _a.length; _i++) {
            var projectile = _a[_i];
            projectile.draw(ctx);
        }
        //		this.cShape.draw(ctx); // --> For debug
    };
    return Player;
}());
exports.Player = Player;
