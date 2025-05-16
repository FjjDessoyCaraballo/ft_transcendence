// Dashboard.tsx
import React, { useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { panuMatchHistory } from './PANU_TEST_DATA';
import { User, MatchData } from './UserManager';
import MatchStatsPopup from './MatchStatsPopup';
import 'chart.js/auto';


// Plugin for Charts
const chartBackgroundPlugin = {
  id: 'custom_canvas_background_color',
  beforeDraw: (chart: any) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fef9ff'; // soft purple/white background
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

// Register chart components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  chartBackgroundPlugin
);

type DashboardProps = {
  userData: User;
};

export const Dashboard: React.FC<DashboardProps> = ({ userData }) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);

  // A test for now, because the match history API is not ready!!
  userData.match_history = panuMatchHistory;

  const user = userData;
  const matchHistory = user.match_history;

  // --- Win/Loss Pie Chart ---
  const winLossPie = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [user.wins_pong + user.wins_blockbattle, user.losses_pong + user.losses_blockbattle],
        backgroundColor: ['#BA55D3', '#E6CCEC'], // softer purple
        borderColor: ['#998b99', '#998b99'],
        borderWidth: 2,
      },
    ],
  };

  // --- Ranking Progression Line Chart ---
  const rankingLine = {
    labels: matchHistory.map((match) =>
      match.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Ranking Points',
        data: matchHistory.map((match) =>
          match.player1_id === 0 ? match.player1_rank : match.player2_rank
        ),
        borderColor: '#BA55D3',
        backgroundColor: '#BA55D3',
        pointBackgroundColor: '#fff',
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const, // Tooltip only appears when hovering over the nearest point
      intersect: true,          // Tooltip will only appear if the cursor directly intersects the point
    },
    plugins: {
      legend: {
        labels: { color: '#7e22ce' },
      },
      custom_canvas_background_color: {},
      tooltip: {
        mode: 'nearest' as const, // Make sure tooltip shows for nearest point
        intersect: true,          // Only show tooltip on point hover
      },
    },
    scales: {
      x: {
        ticks: { color: '#7e22ce' },
        grid: {
          color: '#d8b4fe',
          drawOnChartArea: true,
          drawTicks: true,
          borderColor: '#7e22ce',
        },
      },
      y: {
        ticks: { color: '#7e22ce' },
        grid: {
          color: '#d8b4fe',
          drawOnChartArea: true,
          drawTicks: true,
          borderColor: '#7e22ce',
        },
      },
    },
  };

  // ==== Game Type Breakdown ====
  const gameTypeBar = {
    labels: ['Pong', 'Blockbattle'],
    datasets: [
      {
        label: 'Games Played',
        data: [user.games_played_pong, user.games_played_blockbattle],
        backgroundColor: ['#800080', '#4B0082'],
      },
    ],
  };

  // ==== Match History Cards ====
  const matchCards = user.match_history.map((match) => {
    const isWinner = match.winner_id === user.id;
    const opponentId =
      match.player1_id === user.id ? match.player2_id : match.player1_id;
    const matchDate = new Date(match.date).toLocaleDateString();

    return (
      <div
        key={match.id}
        className={`p-4 mb-2 mt-2 min-w-[600px] max-w-[700px] rounded shadow-md ${
          isWinner ? 'bg-green-100' : 'bg-red-100'
        }`}
      >
        <p className="texts">
			<span className="inline-block mr-2">{match.game_type === 'pong' ? '🏓' : '⚔️'}</span>
			<strong className="inline-block">{match.game_type.toUpperCase()}</strong> — {matchDate}
			<span className="inline-block ml-2">{match.game_type === 'pong' ? '🏓' : '⚔️'}</span>
		</p>
        <p className="font-mono text-lg"><strong>Opponent:</strong> Player #{opponentId}</p>
        <p className="font-mono text-lg"><strong>Duration:</strong> {match.game_duration}s</p>
        <p className="font-mono text-lg">{isWinner ? '✅ Win' : '❌ Loss'}</p>
        <button
          onClick={() => setSelectedMatch(match)}
          className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          View Details
        </button>
      </div>
    );
  });

  // Handle closing popup
  const handleClosePopup = () => setSelectedMatch(null);

  // Calculate Matches Played
  const matchesPlayed = user.games_played_pong + user.games_played_blockbattle;

  // Calculate Average Games Per Day
  let daysSinceJoined = Math.floor(
    (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24)
  );

  if (daysSinceJoined === 0)
		daysSinceJoined++;

  const avgGamesPerDay = (matchesPlayed / daysSinceJoined).toFixed(2);

  // Determine Favorite Game
  const favoriteGame = user.games_played_pong > user.games_played_blockbattle ? 'Pong' : 'Blockbattle';

  return (
    <div className="p-6 flex flex-col w-full">
    {/* Player Info Panel */}
      <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-purple-100 via-white to-purple-100 p-6 rounded-xl border border-purple-300 shadow-lg">
        <h2 className="titles text-[#6B21A8] mb-4">
          Welcome to Dashboard, <span className="font-semibold">{user.username}</span> 👋
        </h2>
        <div className="flex flex-wrap justify-center gap-12">
          <div className="texts">🎖️ Current ranking: <strong>{user.ranking_points.toFixed(2)}</strong></div>
          <div className="texts">📅 Joined: {new Date(user.created_at).toLocaleDateString()}</div>
        </div>
      </div>

    {/* Ranking Progression Chart */}
      <div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-md">
        <h3 className="texts font-bold text-[#6B21A8] mb-4 text-2xl">📈 Ranking Progression</h3>
        <div className="w-full h-[400px] p-2 border border-[#4B0082] rounded-md bg-white shadow-sm">
          <Line data={rankingLine} options={lineOptions} />
        </div>
      </div>

    {/* Match Statistics */}
		<div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-md">
			<h3 className="texts font-bold text-[#6B21A8] mb-4 text-2xl">📊 Match Statistics</h3>
			<div className="flex flex-wrap justify-between gap-12">
				
				{/* Stats Box */}
				<div className="flex flex-col justify-center w-full md:w-2/5 p-6 bg-white rounded-md border border-[#4B0082] shadow-sm">
					<div className="texts mb-2">📊 Matches Played: <strong>{matchesPlayed}</strong></div>
					<div className="texts mb-2">📅 Avg Games Per Day: <strong>{avgGamesPerDay}</strong></div>
					<div className="texts mb-2">🎮 Favorite Game: <strong>{favoriteGame}</strong></div>
				</div>

				{/* Win/Loss Pie Chart */}
				<div className="w-full md:w-2/5 p-2 border border-[#4B0082] rounded-md bg-white shadow-sm flex flex-col justify-center">
					<div className="flex justify-center items-center w-full h-full">
						<Pie data={winLossPie} options={{ responsive: true, maintainAspectRatio: false }} />
					</div>
				</div>
			</div>

			{/* Game Type Breakdown */}
			<div className="w-full max-w-[400px] mx-auto mt-6 p-2 border border-[#4B0082] rounded-md bg-white shadow-sm">
				<div className="flex justify-center items-center w-full h-full">
					<Bar data={gameTypeBar} options={{ responsive: true, maintainAspectRatio: false }} />
				</div>
			</div>
		</div>

    {/* Match History Cards */}
		<div className="w-full max-w-6xl min-w-[800px] mx-auto mb-8 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 p-6 rounded-xl border border-pink-200 shadow-md">
			<h3 className="titles text-[#6B21A8] mb-4 text-2xl">📜 Match History</h3>
			<div className="flex flex-wrap justify-between gap-12 overflow-y-auto max-h-[600px] border border-[#4B0082]">
				<div className="flex flex-col items-center w-full">{matchCards}</div>
			</div>
		</div>

	{/* Match Stats Popup */}
		{selectedMatch && (
			<MatchStatsPopup match={selectedMatch} onClose={handleClosePopup} />
		)}

    </div>
  );
};
