import React, { useState } from 'react';
import { WindowManager } from './Header';
import { setToken, getToken } from '../services/TokenService';
import { updateAllUserDataArr, updateCurUser } from './GameCanvas';
import { getAllUsers, loginUser } from '../services/userService'

export const LoginPopup: React.FC<WindowManager> = ({ onAccept, onDecline }) => {
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const HandleCancel = () => {
    // Clear form data and close the popup
    setUsername('');
    setPassword('');
    setErrorMessage('');
    sessionStorage.setItem('logged-in', 'false');
    onDecline();
  };

  // Handle API communication through here
  const HandleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

	  console.log('Attempting login for:', username); // debug
    // Basic validation
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }

    try {
      const response = await loginUser({
        username: username,
        password: password
      });

      if (response && response.token) {
        await setToken(response.token);
        const stored = await getToken();
        console.log('[LoginPopup] Token after setToken:', stored);

      } else {
        console.error('No token received from server.')
      }
		  const userDataArr = await getAllUsers(); // Fetch all user data, JUST A TEST
      sessionStorage.setItem('logged-in', 'true');
	    updateCurUser(username);
	    updateAllUserDataArr(userDataArr); // TEST
	        
      window.dispatchEvent(new Event('loginStatusChanged'));
      onAccept();
    } catch (error) {
      setErrorMessage('Login failed.');
      console.error('Login failed.');
	    updateCurUser(null);
    }

	try {

	} catch (error) {
      setErrorMessage('User data fetch failed. Please try again');
      console.error('User data fetch failed.');
	  updateCurUser(null);
    }

  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[400px] max-w-[90%] overflow-hidden mx-auto">
        <div className="p-6 bg-[#4B0082] text-white">
          <h2 className="text-2xl font-bold font-mono">Login</h2>
        </div>
        
        <form onSubmit={HandleLogin} className="p-6">
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
              placeholder="Enter your username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-gray-700 font-mono mb-2"
            >
              Password
            </label>
            <input 
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              className="px-5 py-2 rounded bg-gray-200 text-gray-800 font-mono transition-colors hover:bg-gray-300" 
              onClick={HandleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded bg-[#800080] text-white font-mono transition-colors hover:bg-[#4B0082]" 
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};