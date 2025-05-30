import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Dashboard } from "./Dashboard";
import { User } from "./UserManager";
import { getMatchHistoryByID, getUserDataByUsername } from "../services/userService";

interface DashboardProp {
  isLoggedIn: boolean;
}

export const DashboardWrapper: React.FC<DashboardProp> = ( {isLoggedIn} ) => {
  const { username } = useParams();
  const [dashboardUserData, setDashboardUserData] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (username) {
          const user = await getUserDataByUsername(username);
          if (user) {
            user.match_history = await getMatchHistoryByID(user.id);
            setDashboardUserData(user);
          }
        }
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      }
    };

    fetchData();
  }, [username, isLoggedIn]);

	if (error)
	{
		return (
		<div className="max-w-screen-xl mx-auto my-6 p-4 bg-[#F3E8FF] border border-[#6B21A8] rounded-lg shadow-md text-[#6B21A8] font-mono font-bold text-center text-lg">
			Failed to fetch user data. <br/> This might be because of connection issues, so please log out and try to log in again!
		</div>
	)
	}

  return dashboardUserData ? (
    <Dashboard userData={dashboardUserData} />
  ) : (
    <div>Loading... if this takes too long, please verify that you are correctly logged in</div>
  );
};