import React, { useState } from 'react';

interface SettingsProps {
	onClick: () => void;
}

export const SettingsPopup: React.FC<SettingsProps> = ({ onClick }) => {
	const [showLoggedIn, setLoggedIn] = useState(false);

	const HandleDownloadData = () => {
		if (localStorage.getItem('logged-in') === 'true') {
			// reserved for API call
		}
	}

	const ShowLogout = () => {
		if (localStorage.getItem('logged-in') === 'true')
				setShowLogout(true);
	}

	const HandleLogout = () => {

	}

	return (
		<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
			<div className="bg-white rounded-lg shadow-lg w-[400px] max-w-[90%] overflow-hidden mx-auto">
				<div className="p-6 bg-[#4B0082] text-white">
			  		<h2 className="text-2xl font-bold font-mono">Settings</h2>
				</div>
			</div>
		</div>
	  );
};
