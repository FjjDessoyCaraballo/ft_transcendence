import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../UI/Header';
import { GameCanvas } from '../UI/GameCanvas';
import { DashboardWrapper } from '../UI/DashboardWrapper';
import { PlayerList } from '../UI/PlayerList';
import { Instructions } from '../UI/Instructions';

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const onLogOut = () =>
  {
	setIsLoggedIn(false);
  }

  const onLogIn = () =>
  {
	setIsLoggedIn(true);
  }


  return (
	<>
		<Header onHeaderLogOut={onLogOut} onHeaderLogIn={onLogIn} />
		<main className="pt-0">
		<Routes>
			<Route path="/" element={<GameCanvas isLoggedIn={isLoggedIn} />} />
			<Route path="/dashboard/:username" element={<DashboardWrapper isLoggedIn={isLoggedIn} />} />
			<Route path="/playerlist" element={<PlayerList isLoggedIn={isLoggedIn} />} />
			<Route path="/instructions" element={<Instructions />} />
			{/* Catch-all route: redirect unknown routes to landing page */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
		</main>
	</>
);

}
