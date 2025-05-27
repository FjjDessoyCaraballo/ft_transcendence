import React, { useState, useEffect } from 'react';
import { Dashboard } from './Dashboard'
import { GameCanvas } from './GameCanvas';
import { RegistrationPopup } from './Registration';
import { LoginPopup } from './Login'
import { SettingsPopup } from './Settings'
import { getLoggedInUserData, checkIsLoggedIn, getMatchHistoryByID } from '../services/userService';
import { User } from './UserManager';

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


 useEffect(() => {
  	const checkLoginStatus = async () => {
		try {
			await checkIsLoggedIn();
			setIsLoggedIn(true);
		} catch (err) {
			console.log('HEADER: No one is logged in');
			setIsLoggedIn(false);
			setIsGameVisible(true);
			setIsDashboardVisible(false);
			setDashboardUserData(null);
			setButtonText('Dashboard');
		}
  };

  checkLoginStatus();

  window.addEventListener('loginStatusChanged', checkLoginStatus);

  return () => {
    window.removeEventListener('loginStatusChanged', checkLoginStatus);
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

  // Dashboard state change functions
  const handleDashboardClick = async () => {

	try {
		const userData = await getLoggedInUserData();

		if (userData)
		{
			userData.match_history = await getMatchHistoryByID(userData.id);
		}

		setDashboardUserData(userData);
		setIsGameVisible(false);
		setIsDashboardVisible(true);
		setButtonText('To Game');
	} catch {
		alert("Error while fetching user data for Dashboard; are you sure you're logged in...?");
		console.log("Error while fetching user data for Dashboard");
	}
  };

  const handleBackToGameClick = () => {
	setDashboardUserData(null);
    setIsGameVisible(true);
    setIsDashboardVisible(false);
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
				<button
  				className="buttonsStyle"
  				onClick={isGameVisible ? handleDashboardClick : handleBackToGameClick}>
  				{buttonText}
				</button>
              
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
        />
      )}

	<main className="pt-32"> {/* or adjust to match header height */}
	{isGameVisible && <GameCanvas isLoggedIn={isLoggedIn} />}
	{isDashboardVisible && dashboardUserData && <Dashboard userData={dashboardUserData}/>}
	</main>
	
    </>

  );
};
