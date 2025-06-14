import React, { useState } from 'react';
import { WindowManager } from './Header';
import { setToken, getToken } from '../services/TokenService';
import { loginUser, getPreferredLanguage } from '../services/userService';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useNavigate } from 'react-router-dom';

export const LoginPopup: React.FC<WindowManager> = ({ onAccept, onDecline }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useTranslation('login');
  const navigate = useNavigate();

  const HandleCancel = () => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
    sessionStorage.setItem('logged-in', 'false');
    onDecline();
  };

  const HandleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }

    try {
      const response = await loginUser({
        username: username,
        password: password,
      });

      if (response && response.token) {
        await setToken(response.token);
        const stored = await getToken();

        // Fetch preferred language and update i18next language
        try {
          const langResp = await getPreferredLanguage();
          if (langResp.language) {
            localStorage.setItem('preferredLanguage', langResp.language);
            i18n.changeLanguage(langResp.language);
            console.log('Language changed to:', langResp.language);
          }
        } catch (langErr) {
          console.warn('Failed to fetch preferred language:', langErr);
        }

      } else {
        console.error('No token received from server.');
      }

      sessionStorage.setItem('logged-in', 'true');

      window.dispatchEvent(new Event('loginStatusChanged'));
      onAccept();
      navigate('/');
    } catch (error) {
      setErrorMessage('Login failed.');
      console.error('Login failed.', error);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[400px] max-w-[90%] overflow-hidden mx-auto">
        <div className="p-6 bg-[#4B0082] text-white">
          <h2 className="text-2xl font-bold font-mono">{t('login')}</h2>
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
              {t('username')}
            </label>
            <input
              type="text"
              id="username"
              placeholder={t('enter_username')}
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
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              placeholder={t('enter_password')}
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
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#800080] text-white font-mono transition-colors hover:bg-[#4B0082]"
            >
              {t('login')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
