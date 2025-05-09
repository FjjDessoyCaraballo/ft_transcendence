// In Header.tsx
import React, { useState, useEffect } from 'react';
import { GDPRPopup } from './Registration';
import { LoginPopup } from './Login'
import { SettingsPopup } from './Settings'

interface HeaderProps {
  onClick: () => void;
}

export interface WindowManager {
  onAccept: () => void;
  onDecline: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [showGDPR, setShowGDPR] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const loginStatus = localStorage.getItem('logged-in');
    setIsLoggedIn(loginStatus === 'true');
    
    // Add event listener to detect changes in localStorage
    const handleStorageChange = () => {
      const currentLoginStatus = localStorage.getItem('logged-in');
      setIsLoggedIn(currentLoginStatus === 'true');
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for login status changes within the same window
    window.addEventListener('loginStatusChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginStatusChanged', handleStorageChange);
    };
  }, []);

  const HandleRegistrationClick = () => {
    setShowGDPR(true);
  };

  const HandleLoginClick = () => {
    setShowLogin(true);
  }

  const HandleSettingsClick = () => {
    setShowSettings(true);
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-[url('../assets/header.png')] bg-cover bg-no-repeat bg-center z-[9999] shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="p-5 pb-2 m-0 text-4xl font-mono font-bold text-[#4B0082]">
            Transcendence
          </h1>
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
              /* I had to override the container px because string was too large */
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
      {showGDPR && (
        <GDPRPopup
          onAccept={() => {
            console.log('GDPR accepted');
            setShowGDPR(false);
          }}
          onDecline={() => {
            console.log('GDPR declined');
            setShowGDPR(false);
          }}
        />
      )}
      {showLogin && (
        <LoginPopup
          onAccept={() => {
            console.log('Login successful');
            setShowLogin(false);
            setIsLoggedIn(true);
            window.dispatchEvent(new Event('loginStatusChanged'));
          }}
          onDecline={() => {
            console.log('Login failed/canceled');
            setShowLogin(false);
          }}
        />
      )}
      {showSettings && (
        <SettingsPopup
          onClick={() => {
            console.log('Settings clicked');
            setShowSettings(false);
          }}
        />
      )}
    </>
  );
};
