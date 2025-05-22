import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard'
import { GameCanvas, global_curUser } from './GameCanvas';
import { RegistrationPopup } from './Registration';
import { LoginPopup } from './Login'
import { SettingsPopup } from './Settings'
import { getUserData } from '../services/userService';
import { User } from './UserManager';
import { PlayerList } from './PlayerList'

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

  // State management for Dashboard
  const [isGameVisible, setIsGameVisible] = useState(true);
  const [buttonText, setButtonText] = useState('Dashboard');
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [dashboardUserData, setDashboardUserData] = useState<User | null>(null);
  const [isPlayerListVisible, setIsPlayerListVisible] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsGameVisible(true);
    setIsDashboardVisible(false);
    setIsPlayerListVisible(false);
    setDashboardUserData(null);
    setButtonText('Dashboard');
  };  

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

  const HandleRegistrationClick = () => {
    if (windowOpen === false)
    {
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

  const handlePlayerListClick = () => {
    //console.log('Player List clicked');
    setIsGameVisible(false);
    setIsPlayerListVisible(true);
    setIsDashboardVisible(false);
    setButtonText('To Game');
  };

  // Dashboard state change functions
  const handleDashboardClick = async () => {

	if (!global_curUser)
		return ;
	
	try {
		const userData = await getUserData(global_curUser);
		setDashboardUserData(userData);
		setIsGameVisible(false);
		setIsDashboardVisible(true);
    setIsPlayerListVisible(false);
		setButtonText('To Game');
	} catch {
		alert("Error while fetching user data for Dashboard");
		console.log("Error while fetching user data for Dashboard");
	}
  };

  const handleBackToGameClick = () => {
	setDashboardUserData(null);
    setIsGameVisible(true);
    setIsDashboardVisible(false);
    setIsPlayerListVisible(false);
    setButtonText('Dashboard');
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
				{(isGameVisible || isDashboardVisible) && (
          <button
            className="buttonsStyle"
            onClick={isDashboardVisible ? handleBackToGameClick : handleDashboardClick}>
            {isDashboardVisible ? 'To Game' : 'Dashboard'}
          </button>
        )}

        {(isGameVisible || isPlayerListVisible) && (
          <button
            className="buttonsStyle"
            onClick={isPlayerListVisible ? handleBackToGameClick : handlePlayerListClick}>
            {isPlayerListVisible ? 'To Game' : 'Players'}
          </button>
        )}


              
              <button
              className="buttonsStyle"
              onClick={HandleSettingsClick}>
              Settings
            </button>
			</>
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
            console.log('Settings clicked');
            setShowSettings(false);
          }}
          onLogout={handleLogout} // ✅ This is the fix
        />
      )}


	<main className="pt-32"> {/* or adjust to match header height */}
	{isGameVisible && <GameCanvas />}
	{isDashboardVisible && dashboardUserData && <Dashboard userData={dashboardUserData}/>}
  {isPlayerListVisible && <PlayerList onShowDashboard={handleDashboardClick} />}
	</main>
	
    </>

  );
};