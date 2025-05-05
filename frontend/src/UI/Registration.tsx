import React, { useState, useEffect } from 'react';

interface GDPRPopupProps {
	onAccept: () => void;
	onDecline: () => void;
}

export const GDPRPopup: React.FC<GDPRPopupProps> = ({ onAccept, onDecline }) => {
	const [visible, setVisible] = useState(true);
	const [declinedMessage, setShowDeclined] = useState(false);
	const [showRegistration, setShowRegistration] = useState(false);

	// useEffect(() => {
	// 	const hasAccepted = localStorage.getItem('gdpr-accepted');
	// 	if (hasAccepted === 'true') {
	// 		setVisible(false);
	// 	}

	// }, []);

	const handleCancel = () => {
		localStorage.setItem('gdpr-accepted', 'false');
		onDecline();
	}

	const handleAccept = () => {
		localStorage.setItem('gdpr-accepted', 'true')
		if (!showRegistration) {
			setShowRegistration(true);
		} else {
			setVisible(false);
			onAccept();
		}
	};

	const handleDecline = () => {
		localStorage.setItem('gdpr-accepted', 'false')
		setShowDeclined(true);
		onDecline();
	};

	if (!visible) return null;

	if (declinedMessage)
		return (
		  <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
			<div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
			  <h2 className="titles">Privacy notice</h2>
			  <div className="px-12 overflow-y-auto max-h-[500px] flex-grow">
				<p className="texts">
				  Can't really do much without consent, can we?
				</p>
				<p className="texts">
				  If you really don't want to play, just close the tab. 🗿
				</p>
			  </div>
			  <div className="flex justify-end p-5 border-t border-gray-100">
				<button 
				  className="px-5 py-2 rounded bg-green-600 text-white font-sans transition-colors hover:bg-green-700" 
				  onClick={handleAccept}
				>
				  Accept
				</button>
			  </div>
			</div>
		  </div>
		);

		if (showRegistration) {
			return (
				<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
				<div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
				<h2 className="titles">Registration</h2>
					<div className="px-12 overflow-y-auto max-h-[500px] flex-grow">
						<input type="text" placeholder="Username" id="username" />
						<input type="password" placeholder="Password" id="password" />
					</div>
					<div className="flex justify-end p-5 border-t border-gray-100 gap-2">
					<button 
						className="px-5 py-2 rounded bg-red-600 text-white font-sans transition-colors hover:bg-red-700" 
						onClick={handleCancel}
						>
						Cancel
					</button>
					<button 
						className="px-5 py-2 rounded bg-green-600 text-white font-sans transition-colors hover:bg-green-700" 
						onClick={handleAccept}
						>
						Register
					</button>
					</div>
				</div>
				</div>
			);
		}

		return (
			<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
			  <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
			  <h2 className="titles">Privacy notice</h2>
				<div className="px-12 overflow-y-auto max-h-[500px] flex-grow">
				<p className="texts">
					This website stores data locally in your computer using 
					localStorage to enhance your gaming experience.
					This includes user account information and game metrics.
					This information is saved in our servers for one day solely for the purpose
					of displaying the gaming metrics for the player and making it possible for you
					to log into your account again after the browser is closed.
				  </p>
				  <p></p>
				  <p className="texts">
					For any inquiries or questions, you can contact the data protection officer: 
					Felipe Dessoy, fdessoy-@hive.student.fi
				  </p>
				</div>
				<div className="flex justify-end p-5 border-t border-gray-100 gap-2">
				  <button 
					className="px-5 py-2 rounded bg-red-600 text-white font-sans transition-colors hover:bg-red-700" 
					onClick={handleDecline}
				  >
					Decline
				  </button>
				  <button 
					className="px-5 py-2 rounded bg-green-600 text-white font-sans transition-colors hover:bg-green-700" 
					onClick={handleAccept}
				  >
					Accept
				  </button>
				</div>
			  </div>
			</div>
		);
};