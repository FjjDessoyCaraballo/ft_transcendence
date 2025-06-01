import React, { useState, useEffect } from 'react';
import { WindowManager } from './Header';
import { registerUser } from '../services/userService'
import { useTranslation } from 'react-i18next';

export const RegistrationPopup: React.FC<WindowManager> = ({ onAccept, onDecline }) => {
	// State management
	const [visible, setVisible] = useState(true);
	const [showRegistration, setShowRegistration] = useState(false);
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation('registration');
  
	const HandleCancel = () => {
	  setUsername('');
	  setPassword('');
	  setConfirmPassword('');
	  setErrorMessage('');
	  onDecline();
	};
  
	const HandleGDPRAccept = () => {
	  setShowRegistration(true);
	};
  
	const HandleGDPRDecline = () => {
	  onDecline();
	};
  
	const HandleRegistration = async (e: React.FormEvent) => {
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

	try {
		await registerUser({
			username: username,
			password: password
		});

		setVisible(false);
		onAccept();
		
	} catch (error) {
		if (error) {
			setErrorMessage(`Registration failed. ${error}`);
			console.error(`${error}`);
		}
	  } finally {
		setIsLoading(false);
	  }
	}
  
	if (!visible) return null;

	if (showRegistration) {
		return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[600px] max-w-[90%] max-h-[80vh] flex flex-col overflow-hidden mx-auto">
        <div className="p-6 bg-[#4B0082] text-white">
          <h2 className="text-2xl font-bold font-mono">{t('registration')}</h2>
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
              {t('username')}
            </label>
            <input 
              type="text"
              id="username"
              placeholder={t('choose_username')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
			  disabled={isLoading}
			  required
			  maxLength={20}
            />
          </div>
          <div className="mb-4">
            <label 
              htmlFor="password" 
              className="block text-gray-700 font-mono mb-2"
            >
              {t('password')}
            </label>
            <input 
              type="password"
              id="password"
              placeholder={t('create_password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
			  disabled={isLoading}
			  required
			  minLength={8}
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="confirmPassword" 
              className="block text-gray-700 font-mono mb-2"
            >
              {t('confirm_password')}
            </label>
            <input 
              type="password"
              id="confirmPassword"
              placeholder={t('confirm_your_password')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800080]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
			  disabled={isLoading}
			  required
			  minLength={8}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button 
              type="button"
              className="px-5 py-2 rounded bg-gray-200 text-gray-800 font-mono transition-colors hover:bg-gray-300" 
              onClick={HandleCancel}
			  disabled={isLoading}
            >
              {t('cancel')}
		</button>
		<button 
              type="submit"
              className="flex items-center justify-center px-5 py-2 rounded bg-[#800080] text-white font-mono transition-colors hover:bg-[#4B0082]"
			  disabled={isLoading}
			>
			{isLoading ? (
				<span className="inline-block animate-spin mr-2">↻</span>
			): null}
      		{t('register')}
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
			  <h2 className="text-2xl font-bold font-mono">{t('terms_heading')}</h2>
			</div>
			<div className="px-9 p-5 overflow-y-auto max-h-[500px] flex-grow">
			<p className="gdpr">{t('terms1')}</p>
			  <p className="gdpr">{t('terms2')}</p>
			  <p className="gdpr">{t('terms3')}</p>
			  <p className="gdpr">{t('terms4')}</p>
			  <p className="gdpr">{t('terms5')}</p>
			  <p className="gdpr">{t('terms6')}</p>
			  <p className="gdpr">{t('terms7')}</p>
			  <p className="gdpr">{t('terms8')}</p>
			  <p className="gdpr">{t('terms9')}</p>
			  <p className="gdpr">{t('terms10')}</p>
			  <p className="gdpr">{t('terms11')}</p>
			  <p className="gdpr">{t('terms12')}</p>
			  <p className="gdpr">{t('terms13')}</p>
			  <p className="gdpr">{t('terms14')}</p>
			  <p className="gdpr">{t('terms15')}</p>
			  <p className="gdpr">{t('terms16')}</p>
			  <p className="gdpr">{t('terms17')}</p>
			  <p className="gdpr">{t('terms18')}</p>
			  <p className="gdpr">{t('terms19')}</p>
			  <p className="gdpr">{t('terms20')}</p>
			  <p className="gdpr">{t('terms21')}</p>
			  <p className="gdpr"> {t('terms22')}</p>
			  <p className="gdpr"> {t('terms23')}</p>
			  <p className="gdpr">{t('terms24')}</p>
			  <p className="texts">{t('terms25')}</p>
			  <p className="texts">{t('terms26')}</p>
			</div>
			<div className="flex justify-end p-5 border-t border-gray-200 gap-2">
			  <button 
				className="px-5 py-2 rounded bg-red-600 text-white font-mono transition-colors hover:bg-red-700" 
				onClick={HandleGDPRDecline}
			  >
				{t('decline')}
			  </button>
			  <button 
				className="px-5 py-2 rounded bg-green-600 text-white font-mono transition-colors hover:bg-green-700" 
				onClick={HandleGDPRAccept}
			  >
				{t('accept')}
			  </button>
			</div>
		  </div>
		</div>
	  );
};


