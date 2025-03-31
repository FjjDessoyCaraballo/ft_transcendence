"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameArea = void 0;
exports.drawGround = drawGround;
exports.drawWalls = drawWalls;
var constants_js_1 = require("./constants.js");
var index_js_1 = require("./index.js");
window.onload = function () {
    // Initialize gameArea only after canvas is fully ready
    exports.gameArea = {
        minX: constants_js_1.WALL_THICKNESS,
        maxX: index_js_1.canvas.width - constants_js_1.WALL_THICKNESS,
        maxY: index_js_1.canvas.height - constants_js_1.FLOOR_THICKNESS
    };
};
function drawGround(ctx) {
    ctx.fillStyle = 'orange';
    ctx.fillRect(0, index_js_1.canvas.height - constants_js_1.FLOOR_THICKNESS, index_js_1.canvas.width, constants_js_1.FLOOR_THICKNESS);
}
function drawWalls(ctx) {
    ctx.fillStyle = 'orange';
    ctx.fillRect(0, 0, constants_js_1.WALL_THICKNESS, index_js_1.canvas.height);
    ctx.fillRect(index_js_1.canvas.width - constants_js_1.WALL_THICKNESS, 0, constants_js_1.WALL_THICKNESS, index_js_1.canvas.height);
}
