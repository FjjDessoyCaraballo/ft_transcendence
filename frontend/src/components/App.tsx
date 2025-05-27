import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '../UI/Header';
import { GameCanvas, global_curUser } from '../UI/GameCanvas';
import { Dashboard } from '../UI/Dashboard';
import { PlayerList } from '../UI/PlayerList';
import { User } from '../UI/UserManager';
import { getUserDataByUsername } from '../services/userService';

export default function App() {
  const [dashboardUserData, setDashboardUserData] = useState<User | null>(null);

  // Load user data on route to Dashboard
  useEffect(() => {
    const fetchData = async () => {
      if (global_curUser) {
        try {
          const user = await getUserDataByUsername(global_curUser);
          setDashboardUserData(user);
        } catch (err) {
          console.error('Failed to fetch user data', err);
        }
      }
    };
    fetchData();
  }, []);

  const handleShowDashboard = async () => {
    if (global_curUser) {
      try {
        const user = await getUserDataByUsername(global_curUser);
        setDashboardUserData(user);
      } catch (err) {
        console.error('Error showing dashboard:', err);
      }
    }
  };

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<GameCanvas />} />
        <Route
          path="/dashboard"
          element={
            dashboardUserData ? (
              <Dashboard userData={dashboardUserData} />
            ) : (
              <div>Loading...</div>
            )
          }
        />
        <Route
          path="/playerlist"
          element={<PlayerList onShowDashboard={handleShowDashboard} />}
        />
      </Routes>
    </>
  );
}
