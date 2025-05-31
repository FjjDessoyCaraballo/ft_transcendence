import React, { useState, useEffect } from 'react';
import { RegistrationPopup } from './Registration';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
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
  const { t } = useTranslation('header');


 useEffect(() => {
  	const checkLoginStatus = async () => {
		try {
			const userData = await getLoggedInUserData();
			if (userData)
				setLoggedInUserData(userData);
			setIsLoggedIn(true);
		} catch (err) {
			setIsLoggedIn(false);
	//		setIsGameVisible(true);
	//		setIsDashboardVisible(false);
	//		setDashboardUserData(null);
	//		setButtonText('Dashboard');
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

  /*
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
  }; */

  const onStartScreenLoginFail = () => {
	setIsLoggedIn(false);
//	setIsGameVisible(true);
//	setIsDashboardVisible(false);
//	setDashboardUserData(null);
//	setButtonText('Dashboard');
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
				<button className="buttonsStyle" onClick={() => navigate(`/dashboard/${loggedInUserData?.username}`)}>{t('dashboard')}</button>
				<button className="buttonsStyle" onClick={() => navigate('/playerlist')}>{t('players')}</button>
				<button className="buttonsStyle" onClick={HandleSettingsClick}>{t('settings')}</button>
				</>
			) : (
				<>
				<button className="buttonsStyle" onClick={HandleLoginClick}>{t('login')}</button>
				<button className="buttonsStyle px-1" onClick={HandleRegistrationClick}>{t('registration')}</button>
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
