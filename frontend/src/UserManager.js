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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = exports.ChallengeButton = void 0;
var index_js_1 = require("./index.js"); // GLOBAL USE OF ctx and canvas
var index_js_2 = require("./index.js"); // GLOBAL USE
var constants_js_1 = require("./constants.js");
var StartScreen_js_1 = require("./StartScreen.js");
var GameStates_js_1 = require("./GameStates.js");
var Button_js_1 = require("./Button.js");
var RankingPoints_js_1 = require("./RankingPoints.js");
var ChallengeButton = /** @class */ (function (_super) {
    __extends(ChallengeButton, _super);
    function ChallengeButton(x, y, boxColor, hoverColor, text, textColor, textSize, font, user) {
        var _this = _super.call(this, x, y, boxColor, hoverColor, text, textColor, textSize, font) || this;
        _this.user = user;
        return _this;
    }
    ChallengeButton.prototype.clickAction = function () {
    };
    return ChallengeButton;
}(Button_js_1.Button));
exports.ChallengeButton = ChallengeButton;
var UserManager = /** @class */ (function () {
    function UserManager() {
    }
    UserManager.saveUserData = function (user) {
        try {
            // NOTE! If key already existed, it will be OVERWRITTEN!
            // So when we call this function, we need to already know that a duplicate does not exist
            localStorage.setItem(user.username, JSON.stringify(user));
        }
        catch (e) {
            if (e instanceof DOMException)
                console.error("Storage limit exceeded, could not save user data", e);
            else
                console.error("An error occurred while saving user data", e);
        }
    };
    UserManager.getUserData = function (username) {
        var data = localStorage.getItem(username);
        return data ? JSON.parse(data) : null; // Return null if no data is found
    };
    UserManager.deleteUserData = function (username) {
        localStorage.removeItem(username);
    };
    UserManager.updateUserStats = function (winner, loser) {
        winner.wins++;
        loser.losses++;
        RankingPoints_js_1.RankingHandler.updateRanking(winner, loser);
        this.updateUserData(winner.username, winner); // This does not necessarily need the username...?
        this.updateUserData(loser.username, loser);
    };
    // This could be more simple now that I have the whole User object in updateUserStats...?
    UserManager.updateUserData = function (username, updatedData) {
        try {
            var oldData = this.getUserData(username);
            if (oldData) {
                var updatedUser = __assign(__assign({}, oldData), updatedData);
                this.saveUserData(updatedUser);
            }
            else
                console.error("No user found with username: ".concat(username));
        }
        catch (e) {
            console.error("An error occurred while updating user data", e);
        }
    };
    UserManager.cloneUser = function (user) {
        var newUser = {
            username: user.username,
            password: user.password,
            wins: user.wins,
            losses: user.losses,
            rankingPoint: user.rankingPoint,
            color: user.color
        };
        return newUser;
    };
    UserManager.getAllUserData = function () {
        var usersArr = [];
        var usernames = localStorage.getItem(constants_js_1.USER_ARR_KEY);
        var usernameArr;
        if (!usernames)
            return usersArr;
        else
            usernameArr = JSON.parse(usernames);
        for (var i = 0; i < usernameArr.length; i++) {
            var userData = localStorage.getItem(usernameArr[i]);
            if (!userData)
                continue;
            else {
                try {
                    var user = JSON.parse(userData);
                    usersArr.push(user);
                }
                catch (e) {
                    console.error("Error parsing user data for ".concat(userData, ":"), e);
                }
            }
        }
        return usersArr;
    };
    UserManager.drawUserInfo = function (user, x, y) {
        // Draw avatar box & text (JUST A TEST)
        var avatarW = 200;
        var avatarH = 180;
        index_js_1.ctx.fillStyle = user.color; // GLOBAL USE of ctx
        index_js_1.ctx.fillRect(x, y, avatarW, avatarH);
        index_js_1.ctx.font = '20px arial';
        index_js_1.ctx.fillStyle = 'black';
        index_js_1.ctx.fillText('Avatar here', x + 40, y + 30);
        // Draw info box
        var boxPadding = 40;
        var boxW = 700;
        var boxH = 180;
        var boxX = x + avatarW + 20;
        index_js_1.ctx.fillStyle = constants_js_1.BUTTON_HOVER_COLOR; // GLOBAL USE
        index_js_1.ctx.fillRect(boxX, y, boxW, boxH);
        // Draw username
        index_js_1.ctx.font = '35px arial';
        index_js_1.ctx.fillStyle = 'black';
        var usernameX = boxX + (boxW / 2) - (index_js_1.ctx.measureText(user.username).width / 2);
        var usernameY = y + boxPadding;
        index_js_1.ctx.fillText(user.username, usernameX, usernameY);
        // Draw info
        var infoHeight = usernameY + 60;
        var infoWidth = 200;
        var lineHeight = 30;
        index_js_1.ctx.font = '20px arial';
        index_js_1.ctx.fillStyle = '#1111d6';
        index_js_1.ctx.fillText('WINS / LOSSES:  ', boxX + boxPadding, infoHeight);
        var winLoseData = "".concat(user.wins, " / ").concat(user.losses);
        index_js_1.ctx.fillStyle = 'black';
        index_js_1.ctx.fillText(winLoseData, boxX + boxPadding, infoHeight + lineHeight);
        index_js_1.ctx.fillStyle = '#1111d6';
        index_js_1.ctx.fillText('RANKING POINTS:  ', boxX + boxPadding + infoWidth, infoHeight);
        index_js_1.ctx.fillStyle = 'black';
        index_js_1.ctx.fillText(user.rankingPoint.toFixed(2), boxX + boxPadding + infoWidth, infoHeight + lineHeight);
        // Draw challenge button
        var text = 'CHALLENGE';
        var buttonX = boxX + boxPadding + infoWidth * 2;
        var buttonY = infoHeight;
        var challengeButton = new ChallengeButton(buttonX, buttonY, 'red', '#780202', text, 'white', '25px', 'arial', user);
        return challengeButton;
    };
    UserManager.drawCurUser = function () {
        if (!index_js_2.curUser) {
            var loginUser = localStorage.getItem(constants_js_1.LOGIN_CHECK_KEY);
            if (!loginUser) {
                var curGameState = index_js_1.stateManager.getStateName();
                if (curGameState !== null && curGameState !== GameStates_js_1.GameStates.START_SCREEN)
                    index_js_1.stateManager.changeState(new StartScreen_js_1.StartScreen(index_js_1.canvas));
                return;
            }
            else
                (0, index_js_2.updateCurUser)(JSON.parse(loginUser));
        }
        else {
            index_js_1.ctx.fillStyle = 'white';
            index_js_1.ctx.font = '22px arial';
            var text = "Currently logged in user: ";
            index_js_1.ctx.fillText(text, index_js_1.canvas.width / 2 - index_js_1.ctx.measureText(text).width / 2, 20);
            index_js_1.ctx.fillStyle = 'red';
            index_js_1.ctx.font = '28px arial';
            index_js_1.ctx.fillText(index_js_2.curUser, index_js_1.canvas.width / 2 - index_js_1.ctx.measureText(index_js_2.curUser).width / 2, 50);
        }
    };
    return UserManager;
}());
exports.UserManager = UserManager;
