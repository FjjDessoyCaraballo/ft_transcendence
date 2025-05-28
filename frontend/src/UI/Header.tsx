import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationPopup } from './Registration';
import { LoginPopup } from './Login';
import { SettingsPopup } from './Settings';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';


interface HeaderProps {
  onClick?: () => void;
}

export interface WindowManager {
  onAccept: () => void;
  onDecline: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('header');

  useEffect(() => {
    const checkLoginStatus = () => {
      const loginStatus = sessionStorage.getItem('logged-in');
      setIsLoggedIn(loginStatus === 'true');
    };

    checkLoginStatus();

    const handleLoginChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('loginStatusChanged', handleLoginChange);
    return () => {
      window.removeEventListener('loginStatusChanged', handleLoginChange);
    };
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('logged-in');
    navigate('/');
  };

  const HandleRegistrationClick = () => {
    if (!windowOpen) {
      setShowRegistration(true);
      setWindowOpen(true);
    }
  };

  const HandleLoginClick = () => {
    if (!windowOpen) {
      setShowLogin(true);
      setWindowOpen(true);
    }
  };

  const HandleSettingsClick = () => {
    setShowSettings(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[url('../assets/header.png')] bg-cover bg-no-repeat bg-center z-[200] shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="p-5 pb-2 m-0 text-4xl font-mono font-bold text-[#4B0082]">
            Transcendence
          </h1>
          <h4 className="p-5 pb-2 m-0 text-1xl font-mono font-bold text-[#4B0082]">
            A Dads and Coders Inc. product
          </h4>
            <div className="buttonsDiv place-items-right flex items-center gap-4">
            {/* Language switcher */}
            <div className="flex gap-2 items-center text-sm">
              <label htmlFor="language" className="text-[#4B0082] font-bold">🌐</label>
              <select
                id="language"
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value);
                  localStorage.setItem('preferredLanguage', e.target.value);
                }}
                className="border border-gray-300 rounded px-2 py-1"
                value={i18n.language}
              >
                <option value="en">EN</option>
                <option value="fi">FI</option>
                <option value="pt">PT</option>
              </select>
            </div>
            {isLoggedIn ? (
              <>
                <button className="buttonsStyle" onClick={() => navigate('/')}>{t('game')}</button>
                <button className="buttonsStyle" onClick={() => navigate('/instructions')}>{t('instructions')}</button>
                <button className="buttonsStyle" onClick={() => navigate('/dashboard')}>{t('dashboard')}</button>
                <button className="buttonsStyle" onClick={() => navigate('/playerlist')}>{t('players')}</button>
                <button className="buttonsStyle" onClick={HandleSettingsClick}>{t('settings')}</button>
              </>
            ) : (
              <>
                <button className="buttonsStyle" onClick={HandleLoginClick}>
                  {t('login')}
                </button>
                <button className="buttonsStyle px-1" onClick={HandleRegistrationClick}>
                  {t('registration')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Popups */}
      {showRegistration && (
        <RegistrationPopup
          onAccept={() => {
            setShowRegistration(false);
            setWindowOpen(false);
          }}
          onDecline={() => {
            setShowRegistration(false);
            setWindowOpen(false);
          }}
        />
      )}
      {showLogin && (
        <LoginPopup
          onAccept={() => {
            setShowLogin(false);
            setIsLoggedIn(true);
            sessionStorage.setItem('logged-in', 'true');
            window.dispatchEvent(new Event('loginStatusChanged'));
            setWindowOpen(false);
          }}
          onDecline={() => {
            setShowLogin(false);
            setWindowOpen(false);
          }}
        />
      )}
      {showSettings && (
        <SettingsPopup
          onClick={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};
