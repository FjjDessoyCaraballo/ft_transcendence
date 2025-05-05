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

  const HandleRegistrationClick = () => {
    setShowGDPR(true);
  };

  const HandleLoginClick = () => {
    setShowLogin(true);
  }

  const HandleSettingsClick = () => {
    setShowSettings(true);
  }

  if (showSettings) {
      return (
        <>
          <header className="fixed top-0 left-0 w-full bg-[url('../assets/header.png')] bg-cover bg-no-repeat bg-center z-[9999] shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="p-5 pb-2 m-0 text-4xl font-mono font-bold text-[#4B0082]">
                Transcendence
              </h1>
              <div className="space-x-8 place-items-right flex">
                <button
                className="px-4 py-2 bg-[#4B0082] text-[#C8A2C8] font-mono rounded hover:bg-[#800080] transition-colors"
                onClick={HandleSettingsClick}>
                  Settings
                </button>
              </div>
            </div>
          </header>
          {
            showSettings && (
              <SettingsPopup
                  onClick={() => {
                  console.log('Settings clicked');
                  setShowSettings(false);
                }}
              />
            )}
        </>
      );
  } else if (!showSettings) {
    return (
      <>
        <header className="fixed top-0 left-0 w-full bg-[url('../assets/header.png')] bg-cover bg-no-repeat bg-center z-[9999] shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="p-5 pb-2 m-0 text-4xl font-mono font-bold text-[#4B0082]">
              Transcendence
            </h1>
            <div className="space-x-8 place-items-right flex">
              <button className="px-4 py-2 bg-[#4B0082] text-[#C8A2C8] font-mono rounded hover:bg-[#800080] transition-colors"
              onClick={HandleLoginClick}>
                Login
              </button>
              <button 
                className="px-1 py-2 bg-[#4B0082] text-[#C8A2C8] font-mono rounded hover:bg-[#800080] transition-colors"
                onClick={HandleRegistrationClick}>
                Registration
              </button>
            </div>
          </div>
        </header>
        
        {
          showGDPR && (
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
        {
          showLogin && (
            <LoginPopup
              onAccept={() => {
                console.log('Login successful');
                setShowLogin(false);
              }}
                onDecline={() => {
                console.log('Login failed/canceled');
                setShowLogin(false);
              }}
            />
          )}
      </>
    );
  }
};
