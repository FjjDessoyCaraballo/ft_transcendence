"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InGame = void 0;
var Player_js_1 = require("./Player.js");
var Player2_js_1 = require("./Player2.js");
var Platform_js_1 = require("./Platform.js");
var CollisionShape_js_1 = require("./CollisionShape.js");
var Environment_js_1 = require("./Environment.js");
var index_js_1 = require("./index.js");
var GameStates_js_1 = require("./GameStates.js");
var EndScreen_js_1 = require("./EndScreen.js");
var UserManager_js_1 = require("./UserManager.js");
var InGame = /** @class */ (function () {
    function InGame(canvas, user1, user2) {
        var _this = this;
        this.name = GameStates_js_1.GameStates.IN_GAME;
        // Check that if players have same color, use some default ones
        this.player1 = new Player_js_1.Player(100, 745, user1.color, user1); // Maybe in enter() ?
        this.player2 = new Player2_js_1.Player2(1100, 745, user2.color, user2); // Maybe in enter() ?
        this.keys = {}; // Maybe in enter() ?
        this.platforms = [
            new Platform_js_1.Platform(800, 600, 80, Platform_js_1.PlatformDir.UP_DOWN, 200),
            new Platform_js_1.Platform(300, 600, 80, Platform_js_1.PlatformDir.UP_DOWN, 200),
            new Platform_js_1.Platform(600, 200, 50, Platform_js_1.PlatformDir.STILL, 100),
            new Platform_js_1.Platform(500, 700, 200, Platform_js_1.PlatformDir.STILL, 100), // mid long
            new Platform_js_1.Platform(600, 300, 100, Platform_js_1.PlatformDir.LEFT_RIGHT, 200)
        ];
        this.canvas = canvas;
        this.KeyDownBound = function (event) { return _this.keyDownCallback(event); };
        this.KeyUpBound = function (event) { return _this.keyUpCallback(event); };
    }
    InGame.prototype.keyDownCallback = function (event) {
        this.keys[event.key] = true;
    };
    InGame.prototype.keyUpCallback = function (event) {
        this.keys[event.key] = false;
    };
    InGame.prototype.enter = function () {
        document.addEventListener('keydown', this.KeyDownBound);
        document.addEventListener('keyup', this.KeyUpBound);
    };
    InGame.prototype.exit = function () {
        document.removeEventListener('keydown', this.KeyDownBound);
        document.removeEventListener('keyup', this.KeyUpBound);
    };
    InGame.prototype.update = function (deltaTime) {
        for (var _i = 0, _a = this.platforms; _i < _a.length; _i++) {
            var platform = _a[_i];
            platform.move(deltaTime);
        }
        // PLAYER 1
        this.player1.checkKeyEvents(this.keys);
        var player1PrevPos = { x: this.player1.x, y: this.player1.y };
        this.player1.move(this.keys, deltaTime);
        for (var _b = 0, _c = this.platforms; _b < _c.length; _b++) {
            var platform = _c[_b];
            var collisionType = this.player1.cShape.checkCollision(platform.cShape, player1PrevPos);
            if (collisionType != CollisionShape_js_1.collType.NON) {
                this.player1.resolveCollision(platform.cShape, collisionType, player1PrevPos.y, this.player1.y);
                break;
            }
        }
        // PLAYER 2
        this.player2.checkKeyEvents(this.keys);
        var player2PrevPos = { x: this.player2.x, y: this.player2.y };
        this.player2.move(this.keys, deltaTime);
        for (var _d = 0, _e = this.platforms; _d < _e.length; _d++) {
            var platform = _e[_d];
            var collisionType = this.player2.cShape.checkCollision(platform.cShape, player2PrevPos);
            if (collisionType != CollisionShape_js_1.collType.NON) {
                this.player2.resolveCollision(platform.cShape, collisionType, player2PrevPos.y, this.player2.y);
                break;
            }
        }
        // PROJECTILES
        for (var _f = 0, _g = this.player1.projectiles; _f < _g.length; _f++) {
            var projectile = _g[_f];
            projectile.update(this.canvas, deltaTime);
            projectile.cShape.checkBulletCollision(this.player2.cShape);
        }
        for (var _h = 0, _j = this.player2.projectiles; _h < _j.length; _h++) {
            var projectile = _j[_h];
            projectile.update(this.canvas, deltaTime);
            projectile.cShape.checkBulletCollision(this.player1.cShape);
        }
        this.player1.projectiles = this.player1.projectiles.filter(function (projectile) { return projectile.isValid; });
        this.player2.projectiles = this.player2.projectiles.filter(function (projectile) { return projectile.isValid; });
        // VICTORY CONDITION CHECK
        if (this.player1.userData && this.player2.userData) {
            var p1 = UserManager_js_1.UserManager.cloneUser(this.player1.userData);
            var p2 = UserManager_js_1.UserManager.cloneUser(this.player2.userData);
            if (this.player1.health.amount === 0)
                index_js_1.stateManager.changeState(new EndScreen_js_1.EndScreen(this.canvas, p2, p1));
            else if (this.player2.health.amount === 0)
                index_js_1.stateManager.changeState(new EndScreen_js_1.EndScreen(this.canvas, p1, p2));
        }
    };
    InGame.prototype.render = function (ctx) {
        (0, Environment_js_1.drawGround)(ctx);
        (0, Environment_js_1.drawWalls)(ctx);
        for (var _i = 0, _a = this.platforms; _i < _a.length; _i++) {
            var platform = _a[_i];
            platform.draw(ctx);
        }
        this.player1.draw(ctx);
        this.player2.draw(ctx);
    };
    return InGame;
}());
exports.InGame = InGame;
