import React, { useState } from 'react';
import { getUserDataForDownload, deleteUserAccount } from '../services/userService'; 
import { PasswordChangePopup } from './PasswordChange'
import { AvatarChangePopup } from './AvatarChange'
import { clearToken } from '../services/TokenService'
import { updateCurUser } from './GameCanvas';

interface SettingsProps {
	onClick: () => void;
	onLogout: () => void;
}

const DeleteAccountPopup: React.FC<{ onClose: () => void, onConfirm: () => void }> = ({onClose, onConfirm}) => {
	const [] = useState(false);

	const handleClose = () => {
		onClose();
	}

	const handleConfirm = async () => {
		try {
			await deleteUserAccount()
			.then(() => {
				alert("Account successfully deleted");
				sessionStorage.setItem('logged-in', 'false');
				window.dispatchEvent(new Event('loginStatusChanged'));
				onConfirm();
			})
		} catch (error) {
			console.error(`${error}`);
		} finally {
			handleClose();
		}
	}
	
	return (
		<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
		<div className="bg-white rounded-lg shadow-lg w-[500px] max-w-[90%] overflow-hidden mx-auto">
		  <div className="p-6 bg-red-600 text-white">
			<h2 className="text-2xl font-bold font-mono">Delete Account</h2>
		  </div>
		  <div className="p-6">
			<p className="mb-6 text-gray-700">
			  Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
			</p>
			<div className="flex justify-end gap-3">
			  <button 
				onClick={handleClose}
				className="px-5 py-2 rounded bg-gray-200 text-gray-800 font-mono transition-colors hover:bg-gray-300"
			  >
				Cancel
			  </button>
			  <button 
				onClick={handleConfirm}
				className="px-5 py-2 rounded bg-red-600 text-white font-mono transition-colors hover:bg-red-700"
			  >
				Delete My Account
			  </button>
			</div>
		  </div>
		</div>
	  </div>
	);
};

export const SettingsPopup: React.FC<SettingsProps> = ({ onClick, onLogout }) => {
	const [showDeleteAccount, setShowDeleteAccount] = useState(false);
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [showAvatarChange, setShowAvatarChange] = useState(false);

	const HandleDownloadData = async () => {
		try {
			const userData = await getUserDataForDownload();
			const jsonString = JSON.stringify(userData);
			const blob = new Blob([jsonString], {type: '/application/json'});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `user_data_${Date.now()}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			throw new Error('Could not fetch data at the moment. Try again later or contact data protection officer.')
		}
		onClick();
	}

	const HandleLogout = async () => {
		try {
			await clearToken();
			sessionStorage.setItem('logged-in', 'false');
			updateCurUser(null);
			console.log(`Action: user logged off. Status of logged-in: ${sessionStorage.getItem('logged-in')}`);
			window.dispatchEvent(new Event('loginStatusChanged'));
			onLogout(); // Reset Header state
			onClick(); // Close popup
		} catch (error) {
			console.error("Error in logout: ", error);
		}
	};
	

	const HandleChangePasswordClick = () => {
		setShowChangePassword(true);
	}

	const DeleteAccountClick = () => {
		setShowDeleteAccount(true);
	}

	const confirmDeleteAccount = async () => {
		try {
			await HandleLogout();
		} catch (error) {
			console.error('Could not delete data. Try again later.');
		}
		setShowDeleteAccount(false);
	};
	

	const HandleAvatarChange = async () => {
		setShowAvatarChange(true);
	}

	const HandleClose = () => {
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
	<>
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
			  onClick={HandleChangePasswordClick}
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
              className="buttonsStyle text-red-600 hover:bg-red-50"
			  onClick={DeleteAccountClick}
			>
      		Delete Account
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

      {/* Render the password change popup when needed */}
      {showChangePassword && (
        <PasswordChangePopup onClose={() => setShowChangePassword(false)} 
		/>
      )}
      
      {/* Render the delete account confirmation popup when needed */}
      {showDeleteAccount && (
        <DeleteAccountPopup 
          onClose={() => setShowDeleteAccount(false)} 
          onConfirm={confirmDeleteAccount}
        />
      )}

      {/* Render the avatar change popup when needed */}
      {showAvatarChange && (
        <AvatarChangePopup 
          onClick={() => setShowAvatarChange(false)}
        />
      )}
    </>
  );
};
