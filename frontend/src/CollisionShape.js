"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollisionShape = exports.collType = void 0;
var constants_js_1 = require("./constants.js");
var collType;
(function (collType) {
    collType[collType["PLAYER"] = 0] = "PLAYER";
    collType[collType["PLATFORM"] = 1] = "PLATFORM";
    collType[collType["FALL"] = 2] = "FALL";
    collType[collType["BULLET"] = 3] = "BULLET";
    collType[collType["NON"] = 4] = "NON";
})(collType || (exports.collType = collType = {}));
var CollisionShape = /** @class */ (function () {
    function CollisionShape(x, y, width, height, type, master) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'red';
        this.type = type;
        this.master = master;
    }
    CollisionShape.prototype.move = function (x, y) {
        this.x = x;
        this.y = y;
    };
    CollisionShape.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    CollisionShape.prototype.checkCollision = function (obj, prevPoint) {
        if ((this.x > obj.x && this.x < obj.x + obj.width)
            || (this.x + this.width > obj.x && this.x + this.width < obj.x + obj.width)) {
            if (obj.y > prevPoint.y + this.height && obj.y < this.y + this.height) {
                return collType.FALL;
            }
        }
        if (this.x + this.width < obj.x ||
            this.x > obj.x + obj.width ||
            this.y + this.height < obj.y ||
            this.y > obj.y + obj.height) {
            // This statement checks if this object is completely to the left, right, above or below of the other object
            return collType.NON;
        }
        return collType.PLATFORM;
    };
    CollisionShape.prototype.checkFallCollision = function (obj, prevPointY, curPointY) {
        if (obj.y > prevPointY && obj.y < curPointY)
            return true;
        else
            return false;
    };
    CollisionShape.prototype.checkBulletCollision = function (obj) {
        if (this.x + this.width < obj.x ||
            this.x > obj.x + obj.width ||
            this.y + this.height < obj.y ||
            this.y > obj.y + obj.height) {
            // This statement checks if this object is completely to the left, right, above or below of the other object
            return false;
        }
        if (obj.type != collType.PLAYER || this.type != collType.BULLET)
            return false;
        // The 'obj' has to be of type PLAYER and this has to be of type BULLET
        obj.master.health.takeDmg(constants_js_1.BULLET_DMG);
        this.master.isValid = false;
        return true;
    };
    CollisionShape.prototype.isPointInShape = function (point) {
        if (point.x > this.x && point.x < this.x + this.width
            && point.y > this.y && point.y < this.y + this.height)
            return true;
        else
            return false;
    };
    return CollisionShape;
}());
exports.CollisionShape = CollisionShape;
