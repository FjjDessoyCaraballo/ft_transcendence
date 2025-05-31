import React, { useState, useEffect } from 'react';
import { RegistrationPopup } from './Registration';
import { LoginPopup } from './Login'
import { SettingsPopup } from './Settings'
import { getLoggedInUserData, checkIsLoggedIn, getMatchHistoryByID } from '../services/userService';
import { User } from './UserManager';
import { useNavigate } from 'react-router-dom';


interface HeaderProps {
  onHeaderLogOut: () => void;
  onHeaderLogIn: () => void;
  AppLogStatus: boolean;
}

export interface WindowManager {
  onAccept: () => void;
  onDecline: () => void;
}

export const Header: React.FC<HeaderProps> = ( {onHeaderLogOut, onHeaderLogIn, AppLogStatus} ) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [loggedInUserData, setLoggedInUserData] = useState<User | null>(null);
  const navigate = useNavigate();


 useEffect(() => {
  	const checkLoginStatus = async () => {
		try {
			const userData = await getLoggedInUserData();
			if (userData)
				setLoggedInUserData(userData);
			setIsLoggedIn(true);
		} catch (err) {
			setIsLoggedIn(false);
		}
  };

  checkLoginStatus();

  window.addEventListener('loginStatusChanged', checkLoginStatus);

  return () => {
    window.removeEventListener('loginStatusChanged', checkLoginStatus);
  };
}, [AppLogStatus]);

  const handleLogout = () => {

	console.log('HEADER: Executing OnLogOut');

	onHeaderLogOut();
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
  }

  return (
    <>
	<header className="w-full bg-[url('../assets/header.png')] bg-cover bg-no-repeat bg-center shadow-md z-[200]">
		{/* Full-width container so background spans fully */}
		<div className="w-full px-4 py-2 flex justify-between items-center max-w-screen-2xl mx-auto">
			<div className="flex flex-col">
			<h1 className="p-1 pb-1 m-0 text-4xl font-mono font-bold text-[#4B0082]">
				Transcendence
			</h1>
			<h4 className="p-2 pt-0 m-0 text-1xl font-mono font-bold text-[#4B0082]">
				A Dads and Coders Inc. product
			</h4>
			</div>
			<div className="buttonsDiv flex flex-wrap gap-1 justify-end overflow-x-auto">
			{isLoggedIn ? (
				<>
				<button className="buttonsStyle" onClick={() => navigate('/')}>Game</button>
				<button className="buttonsStyle" onClick={() => navigate(`/dashboard/${loggedInUserData?.username}`)}>Dashboard</button>
				<button className="buttonsStyle" onClick={() => navigate('/playerlist')}>Players</button>
				<button className="buttonsStyle" onClick={HandleSettingsClick}>Settings</button>
				</>
			) : (
				<>
				<button className="buttonsStyle" onClick={HandleLoginClick}>Login</button>
				<button className="buttonsStyle px-1" onClick={HandleRegistrationClick}>Registration</button>
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
			onHeaderLogIn();
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
