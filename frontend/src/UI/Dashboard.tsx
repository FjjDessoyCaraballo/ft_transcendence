// Dashboard.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const Dashboard: React.FC = () => {
  // Dummy chart data
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May'],  // X-axis labels
    datasets: [
      {
        label: 'Sales Data',
        data: [12, 19, 3, 5, 2],  // Y-axis data points
        backgroundColor: '#800080',  // Purple background
        borderColor: '#4B0082',  // Dark purple border
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
	maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Sales Dashboard',
        font: {
          size: 20,
        },
        color: '#4B0082',
      },
      tooltip: {
        backgroundColor: '#800080',
        titleColor: '#fff',
        bodyColor: '#fff',
      },
    },
    scales: {
      x: {
        grid: {
          color: '#4B0082',
        },
        ticks: {
          color: '#4B0082',
        },
      },
      y: {
        grid: {
          color: '#4B0082',
        },
        ticks: {
          color: '#4B0082',
        },
      },
    },
  };

  return (
  <div className="p-4">
    <h2 className="text-2xl font-mono text-[red] mb-4">Dashboard</h2>
    <div className="w-full h-[500px]"> {/* Tailwind: 100% width, 500px height */}
      <Bar data={data} options={options} />
    </div>
  </div>
);
};
