import React, { useState } from 'react';
import { getUserDataForDownload, deleteUserAccount, changePassword } from '../services/userService'; 

interface SettingsProps {
	onClick: () => void;
}

export const SettingsPopup: React.FC<SettingsProps> = ({ onClick }) => {

	const HandleDownloadData = async () => {
		try {
			await getUserDataForDownload();
		} catch (error) {
			throw new Error('Could not fetch data at the moment. Try again later or contact data protection officer.')
		}
		onClick();
	}

	const HandleLogout = () => {
		// needs to be changed to JWT instead of localStorage()
		localStorage.setItem('logged-in', 'false');
		window.dispatchEvent(new Event('loginStatusChanged'));
		onClick();
	}

	const HandleChangePassword = async () => {
		const [oldPassword, setOldPassword] = useState('');
		const [newPassword, setNewPassword] = useState('');
		const [confirmPassword, setConfirmPassword] = useState('');
		const [errorMessage, setErrorMessage] = useState('');

		try {
			await changePassword({
				oldPassword: oldPassword,
				newPassword: newPassword
			});
		} catch (error) {
			throw new Error("Could not change password. Try again later.");
		}

		onClick();

		return (
			<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
			<div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
			  <div className="p-6 bg-[#4B0082] text-white">
				<h2 className="text-2xl font-bold font-mono">Password Change</h2>
			  </div>
			  
			  <form onSubmit={HandleChangePassword} className="p-6">
				{errorMessage && (
				  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
					{errorMessage}
				  </div>
				)}
				
				<div className="mb-4">
				  <label 
					htmlFor="oldPassword" 
					className="block text-gray-700 font-mono mb-2"
				  >
					Old Password
				  </label>
				  <input 
					type="password"
					id="oldPassword"
					placeholder="Provide the old password"
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
					value={oldPassword}
					onChange={(e) => setOldPassword(e.target.value)}
				  />
				</div>
				
				<div className="mb-4">
				  <label 
					htmlFor="newPassword" 
					className="block text-gray-700 font-mono mb-2"
				  >
					New Password
				  </label>
				  <input 
					type="password"
					id="newPassword"
					placeholder="Create a new password"
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
				  />
				</div>
				
				<div className="mb-6">
				  <label 
					htmlFor="confirmPassword" 
					className="block text-gray-700 font-mono mb-2"
				  >
					Confirm New Password
				  </label>
				  <input 
					type="password"
					id="confirmPassword"
					placeholder="Confirm your password"
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
				  />
				</div>
				
				<div className="flex justify-end gap-3">
				  <button 
					type="button"
					className="px-5 py-2 rounded bg-gray-200 text-gray-800 font-mono transition-colors hover:bg-gray-300"
				  >
					Cancel
			  </button>
			  <button 
					type="submit"
					className="px-5 py-2 rounded bg-[#800080] text-white font-mono transition-colors hover:bg-[#4B0082]"
				  >
					Change
				</button>
				</div>
			  </form>
			</div>
		  </div>
		  );
	}

	const DeleteAccount = async () => {
		// Data deletion needs an extra layer of confirmation. No one wants to
		// delete their data by accident.
		try {
			await deleteUserAccount();
			localStorage.setItem('logged-in', 'false');
			window.dispatchEvent(new Event('loginStatusChanged'));	
			alert('Data has been deleted');
		} catch (error) {
			throw new Error('Could not delete data now. Try again later or contact data protection officer.')
		}
		onClick();
	}

	const HandleAvatarChange = async () => {
		// under construction
		onClick();
	}

	const HandleClose = () => {
		// On click is a void function, so it just closes the box/window
		onClick();
	}

	const HandleContribute = () => {
		// What noreferrer does:
		// Prevents the browser from sending the Referer header
		// Hides the URL of your site from the destination site
		// Adds privacy by not revealing where the user came from
		// Provides all the security benefits of noopener (plus additional privacy)
		window.open('https://www.github.com/fjjdessoycaraballo/ft_transcendence', '_blank', 'noopener,noreferrer');
	}

	return (
		<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
		  <div className="bg-white rounded-lg shadow-lg w-[400px] max-w-[90%] overflow-hidden mx-auto">
			<div className="p-6 bg-[#4B0082] text-white">
			  <h2 className="text-2xl font-bold font-mono">Settings</h2>
			</div>
			{/* DOWNLOAD DATA BUTTON */}
			<div className="buttonsDiv">
			<button 
              type="submit"
              className="buttonsStyle"
			  onClick={HandleDownloadData}
			>
      		Download Data
          	</button>
		  	</div>
			{/* CHANGE PASSWORD BUTTON */}
			<div className="buttonsDiv">
			<button 
              type="submit"
              className="buttonsStyle"
			  onClick={HandleChangePassword}
			>
      		Change Password
          	</button>
		  	</div>
			{/* CHANGE AVATAR BUTTON */}
			<div className="buttonsDiv">
			<button 
              type="submit"
              className="buttonsStyle"
			  onClick={HandleAvatarChange}
			>
      		Change Avatar
          	</button>
		  	</div>
			{/* ACCOUNT DELETION */}
			<div className="buttonsDiv">
			<button 
              type="submit"
              className="buttonsStyle"
			  onClick={DeleteAccount}
			>
      		Delete Account
          	</button>
		  	</div>
			{/* LOGOUT */}
			<div className="buttonsDiv">
			<button 
              type="submit"
              className="buttonsStyle"
			  onClick={HandleLogout}
			>
      		Logout
          	</button>
		  	</div>
			{/* CONTRIBUTE */}
			<div className="buttonsDiv">
			<button 
              type="submit"
              className="buttonsStyle"
			  onClick={HandleContribute}
			>
      		Contribute
          	</button>
		  	</div>
			{/* CLOSE BUTTON */}
			<div className="buttonsDiv">
            <button 
              type="button"
              className="buttonsStyle" 
              onClick={HandleClose}
            >
              Close
			</button>
			</div>
		  </div>
		</div>
	  );
};
