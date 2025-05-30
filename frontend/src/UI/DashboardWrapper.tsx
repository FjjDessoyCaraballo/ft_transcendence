import { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { Dashboard } from "./Dashboard";
import { User } from "./UserManager";
import { getMatchHistoryByID, getUserDataByUsername } from "../services/userService";

export const DashboardWrapper: React.FC = () => {
  const { username } = useParams();
  const [dashboardUserData, setDashboardUserData] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
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
		navigate('/');
      }
    };

    fetchData();
  }, [username]);

  if (error) return <div>{error}</div>;

  return dashboardUserData ? (
    <Dashboard userData={dashboardUserData} />
  ) : (
    <div>Loading... if this takes too long, please verify that you are correctly logged in</div>
  );
};