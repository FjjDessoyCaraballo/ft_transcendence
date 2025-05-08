import React, { useState, useEffect } from 'react';
import { WindowManager } from './Header';
import { registerUser } from '../services/userService'

export const GDPRPopup: React.FC<WindowManager> = ({ onAccept, onDecline }) => {
	// State management
	const [visible, setVisible] = useState(true);
	const [showRegistration, setShowRegistration] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
  
	const HandleCancel = () => {
	  setUsername('');
	  setPassword('');
	  setConfirmPassword('');
	  setErrorMessage('');
	  localStorage.setItem('gdpr-accepted', 'false');
	  onDecline();
	};
  
	const HandleGDPRAccept = () => {
	  localStorage.setItem('gdpr-accepted', 'true');
	  setShowRegistration(true);
	};
  
	const HandleGDPRDecline = () => {
	  localStorage.setItem('gdpr-accepted', 'false');
	  onDecline();
	};
  
	const HandleRegistration = (e: React.FormEvent) => {
	  e.preventDefault();
	  
	  if (!username || !password || !confirmPassword) {
		setErrorMessage('All fields are required');
		return ;
	  }
	  
	  if (password !== confirmPassword) {
		setErrorMessage('Passwords do not match');
		return ;
	  }

	  setIsLoading(true);

	  if (localStorage.getItem(username)) {
		setErrorMessage('Username already exists');
		return ;
	  }
	  
	  try {
		await registerUser({
			username: username,
			password: password
		});

		localStorage.setItem('username', username);
		setVisible(false);
		onAccept();
		
	  } catch (error) {
		if (error instanceof Error) {
			setErrorMessage('Registration failed. Please try again.');
		console.error('Registration error:', error);
		} else {
			setErrorMessage('Registration failed. Please try again.');
		}
		console.error('Registration error:', error);
	  } finally {
		setIsLoading(false);
	  }
	};
  
	if (!visible) return null;

	if (showRegistration) {
		return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
        <div className="p-6 bg-[#4B0082] text-white">
          <h2 className="text-2xl font-bold font-mono">Registration</h2>
        </div>
        
        <form onSubmit={HandleRegistration} className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          <div className="mb-4">
            <label 
              htmlFor="username" 
              className="block text-gray-700 font-mono mb-2"
            >
              Username
            </label>
            <input 
              type="text"
              id="username"
              placeholder="Choose a username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
			  disabled={isLoading}
            />
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="password" 
              className="block text-gray-700 font-mono mb-2"
            >
              Password
            </label>
            <input 
              type="password"
              id="password"
              placeholder="Create a password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
			  disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="confirmPassword" 
              className="block text-gray-700 font-mono mb-2"
            >
              Confirm Password
            </label>
            <input 
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
			  disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              className="px-5 py-2 rounded bg-gray-200 text-gray-800 font-mono transition-colors hover:bg-gray-300" 
              onClick={HandleCancel}
			  disabled={isLoading}
            >
              Cancel
		</button>
		<button 
              type="submit"
              className="px-5 py-2 rounded bg-[#800080] text-white font-mono transition-colors hover:bg-[#4B0082]"
			  disabled={isLoading}
			>
			{isLoading ? (
				<span className="inline-block animate-spin mr-2">↻</span>
			): null}
      		Register
          </button>
          </div>
        </form>
      </div>
    </div>
    );
  }

	return (
		<div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
		  <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
			<div className="p-6 bg-[#4B0082] text-white">
			  <h2 className="text-2xl font-bold font-mono">Terms of Service and Privacy Notice</h2>
			</div>
			<div className="px-9 p-5 overflow-y-auto max-h-[500px] flex-grow">
			<p className="gdpr">
				Dads and Coders Inc. ("controller" and "processor") collects data for (mandatory) statistical purposes.
				The data is collected during matches and processed in our servers. The data will be stored for a day solely
				for the purposes of giving statistical insights to players in our two games: Pong and Block Battle.</p>
			  <p className="gdpr">By pressing "Accept" button you are agreeing to the following:</p>
			  <p className="gdpr">- Data collection by Dads and Coders Inc.</p>
			  <p className="gdpr">- Data processing by Dads and Coders Inc.</p>
			  <p className="gdpr">The data that Dads and Coders Inc. collect for the purposes processing are the following:</p>
			  <p className="gdpr">- Id;</p>
			  <p className="gdpr">- Username;</p>
			  <p className="gdpr">- Password;</p>
			  <p className="gdpr">- Ranking points;</p>
			  <p className="gdpr">- Avatar;</p>
			  <p className="gdpr">- Games played (Pong);</p>
			  <p className="gdpr">- Wins (Pong);</p>
			  <p className="gdpr">- Losses (Pong);</p>
			  <p className="gdpr">- Games played (Block Battle);</p>
			  <p className="gdpr">- Wins (Block Battle);</p>
			  <p className="gdpr">- Losses (Block Battle);</p>
			  <p className="gdpr">- Tournaments played;</p>
			  <p className="gdpr">- Tournaments won;</p>
			  <p className="gdpr">- Tournament points overall;</p>
			  <p className="gdpr">- Friends;</p>
			  <p className="gdpr">- Match history. </p>
			  <p className="gdpr"> REQUESTS FOR DATA DELETION: requests for data deletion can be made directly through the settings by end-user.</p>
			  <p className="gdpr"> REQUESTS FOR OWN DATA: End-users who want to download all their data that is contained within Dads and Coders Inc. 
				servers can do so by directly downloading the data from the settings section by pressing the "Download data" button.</p>
			  <p className="gdpr">
			  If said end-user finds difficulties in deleting their data, they may contact data protection officer. For any inquiries or questions, you can contact the data protection officer:</p>
			  <p className="texts">
			  Felipe Dessoy, fdessoy-@hive.student.fi
			  </p>
			</div>
			<div className="flex justify-end p-5 border-t border-gray-200 gap-2">
			  <button 
				className="px-5 py-2 rounded bg-red-600 text-white font-mono transition-colors hover:bg-red-700" 
				onClick={HandleGDPRDecline}
			  >
				Decline
			  </button>
			  <button 
				className="px-5 py-2 rounded bg-green-600 text-white font-mono transition-colors hover:bg-green-700" 
				onClick={HandleGDPRAccept}
			  >
				Accept
			  </button>
			</div>
		  </div>
		</div>
	  );
};


