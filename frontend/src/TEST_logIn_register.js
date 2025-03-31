"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupLogin = setupLogin;
var constants_js_1 = require("./constants.js");
var index_js_1 = require("./index.js");
/*
    CHECK ERROR HANDLING LATER!!
*/
function setupLogin() {
    document.addEventListener("DOMContentLoaded", function () {
        var loginBtn = document.getElementById("loginBtn");
        var logoutBtn = document.getElementById("logoutBtn");
        var registerBtn = document.getElementById("registerBtn");
        if (localStorage.getItem(constants_js_1.LOGIN_CHECK_KEY)) {
            loginBtn.style.display = "none";
            logoutBtn.style.display = "block";
        }
        else {
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
        }
        var loginForm = document.getElementById("loginForm");
        var registerForm = document.getElementById("registerForm");
        // Handle "Log In" button click
        loginBtn.addEventListener("click", function () {
            loginForm.style.display = "block";
            registerForm.style.display = "none";
        });
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem(constants_js_1.LOGIN_CHECK_KEY);
            (0, index_js_1.updateCurUser)(null);
            loginBtn.style.display = "block";
            logoutBtn.style.display = "none";
            alert("Logout successful!");
        });
        // Handle "Register" button click
        registerBtn.addEventListener("click", function () {
            registerForm.style.display = "block";
            loginForm.style.display = "none";
        });
        // Handle Log In form submission
        var loginFormFields = document.getElementById("loginFormFields");
        loginFormFields.addEventListener("submit", function (event) {
            event.preventDefault();
            var username = document.getElementById("loginUsername").value;
            var password = document.getElementById("loginPassword").value;
            var userData = localStorage.getItem(username);
            if (!userData) {
                alert("Login failed: username not found!");
                return;
            }
            else {
                var parsedData = JSON.parse(userData);
                if (parsedData.password !== password) {
                    alert("Login failed: wrong password!");
                    return;
                }
            }
            localStorage.setItem(constants_js_1.LOGIN_CHECK_KEY, JSON.stringify(username));
            loginBtn.style.display = "none";
            loginForm.style.display = "none";
            logoutBtn.style.display = "block";
            alert("Login successful!");
        });
        // Handle Register form submission
        var registerFormFields = document.getElementById("registerFormFields");
        registerFormFields.addEventListener("submit", function (event) {
            event.preventDefault();
            var registerUsername = document.getElementById("registerUsername").value;
            var registerPassword = document.getElementById("registerPassword").value;
            var registerColor = document.getElementById("registerColor").value;
            // Check for duplicate name here!!
            var userData = {
                username: registerUsername,
                password: registerPassword,
                wins: 0,
                losses: 0,
                rankingPoint: 1000,
                color: registerColor
            };
            try {
                localStorage.setItem(userData.username, JSON.stringify(userData));
                var userArrData = localStorage.getItem(constants_js_1.USER_ARR_KEY);
                if (!userArrData) {
                    var userArr = [registerUsername];
                    localStorage.setItem(constants_js_1.USER_ARR_KEY, JSON.stringify(userArr));
                }
                else {
                    var userArr = JSON.parse(userArrData);
                    userArr.push(registerUsername);
                    localStorage.setItem(constants_js_1.USER_ARR_KEY, JSON.stringify(userArr));
                }
            }
            catch (_a) {
                alert("Registering unsuccessful; localStorage is out of space");
                return;
            }
            registerForm.style.display = "none";
            alert("Registered successfully!");
        });
    });
}
