import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '../UI/Header';
import { GameCanvas } from '../UI/GameCanvas';
import { DashboardWrapper } from '../UI/DashboardWrapper';
import { PlayerList } from '../UI/PlayerList';
import { Instructions } from '../UI/Instructions';
import { User } from '../UI/UserManager';
import { getLoggedInUserData, getMatchHistoryByID } from '../services/userService';

export default function App() {
  const [dashboardUserData, setDashboardUserData] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // Fetch user data whenever the route is /dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (location.pathname === '/dashboard') {
        try {
			const user = await getLoggedInUserData();
			if (user)
				user.match_history = await getMatchHistoryByID(user.id);
			setDashboardUserData(user);
			setIsLoggedIn(true);
        } catch (err) {
			console.error('Failed to fetch user data', err);
			setIsLoggedIn(false);
        }
      }
    };

    fetchDashboardData();
  }, [location.pathname, isLoggedIn]);

  const onLogOut = () =>
  {
	console.log('APP: Executing OnLogOut');

	setIsLoggedIn(false);
	setDashboardUserData(null);
  }

  const onLogIn = () =>
  {
	console.log('APP: Executing OnLogIn');

	setIsLoggedIn(true);
  }

  const handleShowDashboard = async () => {
	try {
		const user = await getLoggedInUserData();
		if (user)
			user.match_history = await getMatchHistoryByID(user.id);
		setDashboardUserData(user);
		setIsLoggedIn(true);
	} catch (err) {
		console.error('Error showing dashboard:', err);
		setIsLoggedIn(false);
	}
  };

  return (
    <>
      <Header onHeaderLogOut={onLogOut} onHeaderLogIn={onLogIn}/>
      <main className="pt-32">
        <Routes>
          <Route path="/" element={<GameCanvas isLoggedIn={isLoggedIn} />} />
          <Route
            path="/dashboard/:username"
            element={ <DashboardWrapper /> }
          />
          <Route
            path="/playerlist"
            element={<PlayerList onShowDashboard={handleShowDashboard} />}
          />
          <Route path="/instructions" element={<Instructions />}/>
        </Routes>
      </main>
    </>
  );
}
