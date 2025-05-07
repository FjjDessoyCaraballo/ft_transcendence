import React, { useState } from 'react';

interface SettingsProps {
	onClick: () => void;
}

export const SettingsPopup: React.FC<SettingsProps> = ({ onClick }) => {

	const HandleDownloadData = () => {
		// reserved for API call
	}

	const DeleteData = () => {
		// reserved for API call
	}

	const HandleLogout = () => {
		// reserved for API call
		localStorage.setItem('logged-in', 'false');
	}

	const DeleteAccount = () => {
		// reserved for API call
	}

	const HandleClose = () => {
		onClick();
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
			  onClick={DeleteData}
			>
      		Download Data
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
