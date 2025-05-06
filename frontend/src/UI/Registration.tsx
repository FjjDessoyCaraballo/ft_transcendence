import React, { useState, useEffect } from 'react';
import { WindowManager } from './Header'

export const GDPRPopup: React.FC<WindowManager> = ({ onAccept, onDecline }) => {
	const [visible, setVisible] = useState(true);
	const [declinedMessage, setShowDeclined] = useState(false);
	const [showRegistration, setShowRegistration] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const HandleCancel = () => {
		localStorage.setItem('gdpr-accepted', 'false');
		onDecline();
	}

	const HandleAccept = () => {
		localStorage.setItem('gdpr-accepted', 'true')
		localStorage.setItem('username', username);
		localStorage.setItem('password', password);
		if (!showRegistration) {
			setShowRegistration(true);
		} else {
			setVisible(false);
			onAccept();
		}
	};

	const HandleDecline = () => {
		localStorage.setItem('gdpr-accepted', 'false')
		setShowDeclined(true);
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
			  <div className="flex justify-end p-5 border-t border-gray-100 gap-2">
			  	<button 
						className="px-5 py-2 rounded bg-red-600 text-white font-sans transition-colors hover:bg-red-700" 
						onClick={HandleCancel}
						>
						Cancel
					</button>
				<button 
				  className="px-5 py-2 rounded bg-green-600 text-white font-sans transition-colors hover:bg-green-700" 
				  onClick={HandleAccept}
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
				<form className="titles">Registration</form>
					<div className="px-12 overflow-y-auto max-h-[500px] flex-grow">
						<label className="username p-5">Username</label>
						<input type="text"
						placeholder="Username"
						id="username"
						value={username}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} />
					</div>
					<div className="px-12 overflow-y-auto max-h-[500px] flex-grow">
						<label className="password p-5">Password</label>
						<input type="password" 
						placeholder="Password" 
						id="password"
						value={password}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
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
						onClick={HandleAccept}
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
			  <h2 className="titles">Terms of Service and Privacy Notice</h2>
				<div className="px-8 overflow-y-auto max-h-[500px] flex-grow">
				<p className="texts">
					Dads and Coders Inc. ("controller" and "processor") collects data for (mandatory) statistical purposes.
					The data is collected during matches and processed in our servers. The data will be stored for a day solely
					for the purposes of giving statistical insights to players in our two games: Pong and Block Battle.</p>
				  <p className="texts">By pressing "Accept" button you are agreeing to the following:</p>
				  <p className="texts">- Data collection by Dads and Coders Inc.</p>
				  <p className="texts">- Data processing by Dads and Coders Inc.</p>
				  <p className="texts">The data that Dads and Coders Inc. collect for the purposes processing are the following:</p>
				  <p className="texts">- Id;</p>
				  <p className="texts">- Username;</p>
				  <p className="texts">- Password;</p>
				  <p className="texts">- Ranking points;</p>
				  <p className="texts">- Avatar;</p>
				  <p className="texts">- Games played (Pong);</p>
				  <p className="texts">- Wins (Pong);</p>
				  <p className="texts">- Losses (Pong);</p>
				  <p className="texts">- Games played (Block Battle);</p>
				  <p className="texts">- Wins (Block Battle);</p>
				  <p className="texts">- Losses (Block Battle);</p>
				  <p className="texts">- Tournaments played;</p>
				  <p className="texts">- Tournaments won;</p>
				  <p className="texts">- Tournament points overall;</p>
				  <p className="texts">- Friends;</p>
				  <p className="texts">- MATCH HISTORY (an array of MATCHES). </p>
				  <p className="texts"> REQUESTS FOR DATA DELETION: requests for data deletion can be made directly through the settings by end-user.</p>
				  <p className="texts"> REQUESTS FOR OWN DATA: End-users that want to download all their data that is contained within Dads and Coders Inc. 
					servers, it is possible to download the data directly from the settings section by pressing the "Download data" button.</p>
				  <p className="texts">
				  If said end-user finds difficulties in deleting their data, they may contact data protection officer. For any inquiries or questions, you can contact the data protection officer: Felipe Dessoy, fdessoy-@hive.student.fi</p>
				</div>
				<div className="flex justify-end p-5 border-t border-gray-100 gap-2">
					<button 
					className="px-5 py-2 rounded bg-red-600 text-white font-sans transition-colors hover:bg-red-700" 
					onClick={HandleDecline}>
						Decline
					</button>
					<button 
					className="px-5 py-2 rounded bg-green-600 text-white font-sans transition-colors hover:bg-green-700" 
					onClick={HandleAccept}>
						Accept
					</button>
				</div>
			  </div>
			</div>
		);
};