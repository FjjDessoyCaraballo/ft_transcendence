import React, { useState, useEffect } from 'react';
import { RegistrationPopup } from './Registration';
import { LoginPopup } from './Login'
import { SettingsPopup } from './Settings'
import { setLoggedInState, getToken, getAuthState, clearToken } from '../services/TokenService'

interface HeaderProps {
  onClick: () => void;
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

  // Function to check and update login status
  const checkLoginStatus = async () => {
    try {
      const authState = await getAuthState();
      console.log("Auth state:", authState);
      setIsLoggedIn(authState.isLoggedIn);

      const sessionStorageLoggedIn = sessionStorage.getItem('logged-in') === 'true';
      if (sessionStorageLoggedIn !== authState.isLoggedIn) {
        console.log("Auth state mismatch with sessionStorage, using sessionStorage value");
        setIsLoggedIn(sessionStorageLoggedIn);
      }
    } catch (error) {
      console.error('Error checking authstate: ', error);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    const handleLoginChange = () => {
      console.log("Login status changed event triggered");
      checkLoginStatus();
    };

    window.addEventListener('loginStatusChanged', handleLoginChange);

    return () => {
      window.removeEventListener('loginStatusChanged', handleLoginChange);
    };
  }, []);

  const HandleRegistrationClick = () => {
    if (windowOpen === false) {
      setWindowOpen(true);
      setShowRegistration(true);
    }
  };

  const HandleLoginClick = () => {
    if (windowOpen === false) {
      setWindowOpen(true)
      setShowLogin(true);
    }
  }

  const HandleSettingsClick = () => {
    setShowSettings(true);
  }

  console.warn("Rendering Header with isLoggedIn:", isLoggedIn);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[url('../assets/header.png')] bg-cover bg-no-repeat bg-center z-[9999] shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="p-5 pb-2 m-0 text-4xl font-mono font-bold text-[#4B0082]">
            Transcendence
          </h1>
          <h4 className="p-5 pb-2 m-0 text-1xl font-mono font-bold text-[#4B0082]">
            A Dads and Coders Inc. product
          </h4>
          <div className="buttonsDiv place-items-right">
            {isLoggedIn ? (
              <button
                className="buttonsStyle"
                onClick={HandleSettingsClick}>
                Settings
              </button>
            ) : (
              <>
                <button 
                  className="buttonsStyle"
                  onClick={HandleLoginClick}>
                  Login
                </button>
                <button 
                  className="buttonsStyle px-1"
                  onClick={HandleRegistrationClick}>
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
            console.log('GDPR accepted');
            setShowRegistration(false);
            setWindowOpen(false);
          }}
          onDecline={() => {
            console.log('GDPR declined');
            setShowRegistration(false);
            setWindowOpen(false);
          }}
        />
      )}
      {showLogin && (
        <LoginPopup
          onAccept={() => {
            console.log('Login successful');
            setShowLogin(false);
            setIsLoggedIn(true);
            sessionStorage.setItem('logged-in', 'true');
            window.dispatchEvent(new Event('loginStatusChanged'));
            setWindowOpen(false);
          }}
          onDecline={() => {
            console.log('Login failed/canceled');
            setShowLogin(false);
            setWindowOpen(false);
          }}
        />
      )}
      {showSettings && (
        <SettingsPopup
          onClick={() => {
            console.log('Settings closed');
            setShowSettings(false);
            checkLoginStatus();
          }}
        />
      )}
    </>
  );
};