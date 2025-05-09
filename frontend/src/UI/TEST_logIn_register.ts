import { User } from "./UserManager";
import { USER_ARR_KEY, LOGIN_CHECK_KEY } from "../game/Constants";
import { updateCurUser } from "../components/index";

/*
	CHECK ERROR HANDLING LATER!!
*/

export function setupLogin()
{
	document.addEventListener("DOMContentLoaded", () => {
		const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
		const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
		const registerBtn = document.getElementById("registerBtn") as HTMLButtonElement;

		if (localStorage.getItem(LOGIN_CHECK_KEY))
		{
			loginBtn.style.display = "none";
			logoutBtn.style.display = "block";
		}
		else
		{
			loginBtn.style.display = "block";
			logoutBtn.style.display = "none";
		}
	
		const loginForm = document.getElementById("loginForm") as HTMLElement;
		const registerForm = document.getElementById("registerForm") as HTMLElement;
	
		// Handle "Log In" button click
		loginBtn.addEventListener("click", () => {
			loginForm.style.display = "block";
			registerForm.style.display = "none";
		});

		logoutBtn.addEventListener("click", () => {
			localStorage.removeItem(LOGIN_CHECK_KEY);
			updateCurUser(null);
			loginBtn.style.display = "block";
			logoutBtn.style.display = "none";
			alert("Logout successful!");
		});
	
		// Handle "Register" button click
		registerBtn.addEventListener("click", () => {
			registerForm.style.display = "block";
			loginForm.style.display = "none";
		});
	
		// Handle Log In form submission
		const loginFormFields = document.getElementById("loginFormFields") as HTMLFormElement;
		loginFormFields.addEventListener("submit", (event) => {
			event.preventDefault();

			const username = (document.getElementById("loginUsername") as HTMLInputElement).value;
			const password = (document.getElementById("loginPassword") as HTMLInputElement).value;
	
			const userData = localStorage.getItem(username);

			if (!userData)
			{
				alert("Login failed: username not found!");
				return ;
			}
			else
			{
				const parsedData = JSON.parse(userData);
				if (parsedData.password !== password)
				{
					alert("Login failed: wrong password!");
					return ;
				}
			}
			
			localStorage.setItem(LOGIN_CHECK_KEY, JSON.stringify(username));
			loginBtn.style.display = "none";
			loginForm.style.display = "none";
			logoutBtn.style.display = "block";
			alert("Login successful!");

		});
	
		// Handle Register form submission
		const registerFormFields = document.getElementById("registerFormFields") as HTMLFormElement;
		registerFormFields.addEventListener("submit", (event) => {
			event.preventDefault();

			const registerUsername = (document.getElementById("registerUsername") as HTMLInputElement).value;
			const registerPassword = (document.getElementById("registerPassword") as HTMLInputElement).value;
			const registerColor = (document.getElementById("registerColor") as HTMLInputElement).value;
	
			// Check for duplicate name here!!

			let userData: User = {
				username: registerUsername,
				password: registerPassword,
				wins: 0,
				losses: 0,
				rankingPoint: 1000,
				color: registerColor
			};

			try
			{
				localStorage.setItem(userData.username, JSON.stringify(userData));

				const userArrData = localStorage.getItem(USER_ARR_KEY);
				if (!userArrData)
				{
					let userArr: string[] = [registerUsername];
					localStorage.setItem(USER_ARR_KEY, JSON.stringify(userArr));
				}
				else
				{
					let userArr: string[] = JSON.parse(userArrData);
					userArr.push(registerUsername);
					localStorage.setItem(USER_ARR_KEY, JSON.stringify(userArr));
				}
			}
			catch
			{
				alert("Registering unsuccessful; localStorage is out of space");
				return ;
			}

			registerForm.style.display = "none";
			alert("Registered successfully!");

		});


	});
}


