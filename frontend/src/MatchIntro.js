"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchIntro = void 0;
var GameStates_js_1 = require("./GameStates.js");
var index_js_1 = require("./index.js");
var InGame_js_1 = require("./InGame.js");
var MatchIntro = /** @class */ (function () {
    function MatchIntro(canvas, player1, player2) {
        var _this = this;
        this.name = GameStates_js_1.GameStates.MATCH_INTRO;
        this.canvas = canvas;
        this.player1 = player1;
        this.player2 = player2;
        this.keys = {}; // Maybe in enter() ?
        this.p1IsReady = false;
        this.p2IsReady = false;
        this.KeyDownBound = function (event) { return _this.keyDownCallback(event); };
        this.KeyUpBound = function (event) { return _this.keyUpCallback(event); };
    }
    MatchIntro.prototype.keyDownCallback = function (event) {
        this.keys[event.key] = true;
    };
    MatchIntro.prototype.keyUpCallback = function (event) {
        this.keys[event.key] = false;
    };
    MatchIntro.prototype.enter = function () {
        document.addEventListener('keydown', this.KeyDownBound);
        document.addEventListener('keyup', this.KeyUpBound);
    };
    MatchIntro.prototype.exit = function () {
        document.removeEventListener('keydown', this.KeyDownBound);
        document.removeEventListener('keyup', this.KeyUpBound);
    };
    MatchIntro.prototype.update = function (deltaTime) {
        if (this.keys[' '])
            this.p1IsReady = true;
        if (this.keys['u'])
            this.p2IsReady = true;
        if (this.p1IsReady && this.p2IsReady)
            index_js_1.stateManager.changeState(new InGame_js_1.InGame(this.canvas, this.player1, this.player2));
    };
    MatchIntro.prototype.render = function (ctx) {
        var p1FillColor = this.p1IsReady ? 'green' : 'red';
        var p2FillColor = this.p2IsReady ? 'green' : 'red';
        // Add the expected ranking point diff here
        var header = "GAME IS ABOUT TO START!";
        ctx.font = '70px Impact';
        ctx.fillStyle = '#0a42ab';
        var headerX = (this.canvas.width / 2) - (ctx.measureText(header).width / 2);
        ctx.fillText(header, headerX, 100);
        var info = "(press the shoot key when you are ready to play)";
        ctx.font = '30px arial';
        ctx.fillStyle = 'white';
        var infoX = (this.canvas.width / 2) - (ctx.measureText(info).width / 2);
        ctx.fillText(info, infoX, 140);
        var p1Text = this.player1.username;
        ctx.font = '55px arial';
        ctx.fillStyle = p1FillColor;
        var p1X = 100;
        ctx.fillText(p1Text, p1X, 440);
        var p1Rank = "(".concat(this.player1.rankingPoint.toFixed(2), ")");
        var halfOfP1Text = ctx.measureText(p1Text).width / 2;
        ctx.font = '30px arial';
        ctx.fillStyle = 'white';
        var rank1X = p1X + halfOfP1Text - ctx.measureText(p1Rank).width / 2;
        ctx.fillText(p1Rank, rank1X, 480);
        ctx.font = '60px arial';
        ctx.fillStyle = 'white';
        ctx.fillText('VS', (this.canvas.width / 2) - (ctx.measureText('VS').width / 2), 440);
        var p2Text = this.player2.username;
        ctx.font = '55px arial';
        ctx.fillStyle = p2FillColor;
        var p2X = this.canvas.width - ctx.measureText(p2Text).width - 100;
        ctx.fillText(p2Text, p2X, 440);
        var p2Rank = "(".concat(this.player2.rankingPoint.toFixed(2), ")");
        var halfOfP2Text = ctx.measureText(p2Text).width / 2;
        ctx.font = '30px arial';
        ctx.fillStyle = 'white';
        var rank2X = p2X + halfOfP2Text - ctx.measureText(p2Rank).width / 2;
        ctx.fillText(p2Rank, rank2X, 480);
    };
    return MatchIntro;
}());
exports.MatchIntro = MatchIntro;
