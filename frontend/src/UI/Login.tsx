import React, {useState, useEffect } from 'react';
import { WindowManager } from './Header';

export const LoginPopup: React.FC<WindowManager> = ({ onAccept, onDecline }) => {
	const [showLogin, setShowLogin] = useState(false);

	const HandleCancel = () => {
		localStorage.setItem('logged-in', 'false');
		onDecline();
	}

	// Handle API communication through here
	const HandleLogin = () => {
		localStorage.setItem('logged-in', 'true');
		onAccept();
	}

	return (
		<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
		<div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
		<form className="titles">Login</form>
			<div className="px-12 overflow-y-auto max-h-[500px] flex-grow">
				<label className="username p-5">Username</label>
				<input type="text"
				placeholder="Username"
				id="username"/>
			</div>
			<div className="px-12 overflow-y-auto max-h-[500px] flex-grow">
				<label className="password p-5">Password</label>
				<input type="password" 
				placeholder="Password" 
				id="password"/>
			</div>
			<div className="flex justify-end p-5 border-t border-gray-100 gap-2">
			<button 
				className="px-5 py-2 rounded bg-red-600 text-white font-sans transition-colors hover:bg-red-700" 
				onClick={HandleCancel}
				>
				Cancel
			</button>
			<button 
				className="px-5 py-2 rounded bg-green-600 text-white font-sans transition-colors hover:bg-green-700" 
				onClick={HandleLogin}
				>
				Continue
			</button>
			</div>
		</div>
		</div>
	);
}


// value={password}
// onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
// value={username}
// onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} 