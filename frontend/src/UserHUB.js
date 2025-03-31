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
exports.UserHUB = exports.PrevPageButton = exports.NextPageButton = void 0;
var GameStates_js_1 = require("./GameStates.js");
var EndScreen_js_1 = require("./EndScreen.js");
var index_js_1 = require("./index.js");
var constants_js_1 = require("./constants.js");
var UserManager_js_1 = require("./UserManager.js");
var Button_js_1 = require("./Button.js");
var MatchIntro_js_1 = require("./MatchIntro.js");
var NextPageButton = /** @class */ (function (_super) {
    __extends(NextPageButton, _super);
    function NextPageButton(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        return _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
    }
    NextPageButton.prototype.clickAction = function () {
    };
    return NextPageButton;
}(Button_js_1.Button));
exports.NextPageButton = NextPageButton;
var PrevPageButton = /** @class */ (function (_super) {
    __extends(PrevPageButton, _super);
    function PrevPageButton(x, y, boxColor, hoverColor, text, textColor, textSize, font) {
        return _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
    }
    PrevPageButton.prototype.clickAction = function () {
    };
    return PrevPageButton;
}(Button_js_1.Button));
exports.PrevPageButton = PrevPageButton;
var UserHUB = /** @class */ (function () {
    function UserHUB(canvas) {
        var _this = this;
        this.name = GameStates_js_1.GameStates.USER_HUB;
        this.canvas = canvas;
        this.userStartIdx = 0;
        this.prevUserStartIdx = 0;
        this.isNextActive = true;
        this.isPrevActive = false;
        this.needNewChallengeButtons = true;
        this.opponent = null;
        var text1 = 'RETURN TO MENU';
        index_js_1.ctx.font = '25px arial'; // GLOBAL USE OF CTX!!
        var button1X = (canvas.width / 2) - (index_js_1.ctx.measureText(text1).width / 2) - constants_js_1.TEXT_PADDING;
        var button1Y = (canvas.height / 2) - 20 - constants_js_1.TEXT_PADDING + 370;
        var text2 = 'NEXT PAGE';
        var button2X = canvas.width - index_js_1.ctx.measureText(text2).width - constants_js_1.TEXT_PADDING;
        var button2Y = 80 + constants_js_1.TEXT_PADDING;
        var text3 = 'PREVIOUS PAGE';
        var button3X = 0 + constants_js_1.TEXT_PADDING;
        var button3Y = 80 + constants_js_1.TEXT_PADDING;
        this.returnMenuButton = new EndScreen_js_1.ReturnMainMenuButton(button1X, button1Y, 'red', '#780202', text1, 'white', '25px', 'arial');
        this.nextPageButton = new NextPageButton(button2X, button2Y, constants_js_1.BUTTON_COLOR, constants_js_1.BUTTON_HOVER_COLOR, text2, 'white', '25px', 'arial');
        this.prevPageButton = new PrevPageButton(button3X, button3Y, constants_js_1.BUTTON_COLOR, constants_js_1.BUTTON_HOVER_COLOR, text3, 'white', '25px', 'arial');
        this.challengeBtnArr = [];
        this.mouseMoveBound = function (event) { return _this.mouseMoveCallback(event); };
        this.mouseClickBound = function () { return _this.mouseClickCallback(); };
        this.submitPasswordBound = function () { return _this.submitPasswordCallback(); };
        this.cancelPasswordBound = function () { return _this.cancelPasswordCallback(); };
    }
    UserHUB.prototype.mouseMoveCallback = function (event) {
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        var x = (event.clientX - rect.left) * scaleX;
        var y = (event.clientY - rect.top) * scaleY;
        this.returnMenuButton.checkMouse(x, y);
        this.nextPageButton.checkMouse(x, y);
        this.prevPageButton.checkMouse(x, y);
        for (var _i = 0, _a = this.challengeBtnArr; _i < _a.length; _i++) {
            var btn = _a[_i];
            btn.checkMouse(x, y);
        }
    };
    UserHUB.prototype.mouseClickCallback = function () {
        this.returnMenuButton.checkClick();
        if (this.nextPageButton.checkClick() && this.isNextActive)
            this.userStartIdx += 3;
        if (this.prevPageButton.checkClick() && this.isPrevActive)
            this.userStartIdx -= 3;
        for (var _i = 0, _a = this.challengeBtnArr; _i < _a.length; _i++) {
            var btn = _a[_i];
            if (btn.checkClick()) {
                if (index_js_1.curUser) {
                    this.opponent = btn.user;
                    var passwordHeader = document.getElementById('passwordHeader');
                    if (passwordHeader)
                        passwordHeader.innerHTML = "Hello ".concat(this.opponent.username, "!<br>Please type in your password to start the game");
                    var passwordModal = document.getElementById("passwordModal");
                    var submitPasswordBtn = document.getElementById("submitPasswordBtn");
                    var cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
                    // Show the password modal
                    passwordModal.style.display = "flex";
                    submitPasswordBtn.addEventListener("click", this.submitPasswordBound);
                    cancelPasswordBtn.addEventListener("click", this.cancelPasswordBound);
                }
            }
        }
    };
    UserHUB.prototype.submitPasswordCallback = function () {
        if (!this.opponent || !index_js_1.curUser)
            return;
        var passwordInput = document.getElementById("passwordInput");
        var enteredPassword = passwordInput.value;
        var opponentData = localStorage.getItem(this.opponent.username);
        var curUserData = localStorage.getItem(index_js_1.curUser);
        if (!opponentData || !curUserData) {
            alert("Database error: User data not found");
            return;
        }
        else {
            var storedUser = JSON.parse(opponentData);
            var curUserObj = JSON.parse(curUserData);
            if (enteredPassword === storedUser.password) {
                var passwordModal = document.getElementById("passwordModal");
                passwordModal.style.display = "none";
                passwordInput.value = "";
                index_js_1.stateManager.changeState(new MatchIntro_js_1.MatchIntro(this.canvas, curUserObj, this.opponent));
            }
            else {
                alert("Incorrect password. Please try again.");
                passwordInput.value = ""; // Clear the input field
            }
        }
    };
    UserHUB.prototype.cancelPasswordCallback = function () {
        var passwordModal = document.getElementById("passwordModal");
        var submitPasswordBtn = document.getElementById("submitPasswordBtn");
        var cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
        var passwordInput = document.getElementById("passwordInput");
        passwordModal.style.display = "none";
        submitPasswordBtn.removeEventListener("click", this.submitPasswordBound);
        cancelPasswordBtn.removeEventListener("click", this.cancelPasswordBound);
        passwordInput.value = "";
    };
    UserHUB.prototype.enter = function () {
        this.canvas.addEventListener('mousemove', this.mouseMoveBound);
        this.canvas.addEventListener('click', this.mouseClickBound);
    };
    UserHUB.prototype.exit = function () {
        this.canvas.removeEventListener('mousemove', this.mouseMoveBound);
        this.canvas.removeEventListener('click', this.mouseClickBound);
        var submitPasswordBtn = document.getElementById("submitPasswordBtn");
        var cancelPasswordBtn = document.getElementById("cancelPasswordBtn");
        submitPasswordBtn.removeEventListener("click", this.submitPasswordBound);
        cancelPasswordBtn.removeEventListener("click", this.cancelPasswordBound);
    };
    UserHUB.prototype.update = function (deltaTime) {
    };
    UserHUB.prototype.render = function (ctx) {
        if (this.prevUserStartIdx !== this.userStartIdx) {
            this.needNewChallengeButtons = true;
            this.prevUserStartIdx = this.userStartIdx;
            this.challengeBtnArr.length = 0;
        }
        UserManager_js_1.UserManager.drawCurUser();
        var userArr = UserManager_js_1.UserManager.getAllUserData();
        var x = 130; // check this proprely later
        var y = 150;
        for (var i = this.userStartIdx; i < this.userStartIdx + 3; ++i) {
            if (i >= userArr.length)
                break;
            var challengeBtn = UserManager_js_1.UserManager.drawUserInfo(userArr[i], x, y);
            if (this.needNewChallengeButtons && challengeBtn.user.username !== index_js_1.curUser)
                this.challengeBtnArr.push(challengeBtn);
            y += 185;
        }
        if (this.needNewChallengeButtons)
            this.needNewChallengeButtons = false;
        this.returnMenuButton.draw(ctx);
        if (this.userStartIdx < userArr.length - 3) {
            this.nextPageButton.draw(ctx);
            this.isNextActive = true;
        }
        else
            this.isNextActive = false;
        if (this.userStartIdx != 0) {
            this.prevPageButton.draw(ctx);
            this.isPrevActive = true;
        }
        else
            this.isPrevActive = false;
        for (var _i = 0, _a = this.challengeBtnArr; _i < _a.length; _i++) {
            var btn = _a[_i];
            btn.draw(ctx);
        }
    };
    return UserHUB;
}());
exports.UserHUB = UserHUB;
