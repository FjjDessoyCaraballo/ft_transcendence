import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistrationPopup } from './Registration';
import { LoginPopup } from './Login';
import { SettingsPopup } from './Settings';

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
          <div className="buttonsDiv place-items-right">
            {isLoggedIn ? (
              <>
                <button className="buttonsStyle" onClick={() => navigate('/')}>Game</button>
                <button className="buttonsStyle" onClick={() => navigate('/instructions')}>Instructions</button>
                <button className="buttonsStyle" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="buttonsStyle" onClick={() => navigate('/playerlist')}>Players</button>
                <button className="buttonsStyle" onClick={HandleSettingsClick}>Settings</button>
              </>
            ) : (
              <>
                <button className="buttonsStyle" onClick={HandleLoginClick}>
                  Login
                </button>
                <button className="buttonsStyle px-1" onClick={HandleRegistrationClick}>
                  Registration
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
