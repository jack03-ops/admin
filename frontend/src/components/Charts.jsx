import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function MembershipGrowthChart({ dataValues, labels }) {
  const chartData = {
    labels: labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'New Registrations',
        data: dataValues || [12, 19, 32, 25, 45, 52],
        borderColor: '#FF5F1F',
        backgroundColor: 'rgba(255, 95, 31, 0.05)',
        tension: 0.4,
        pointBackgroundColor: '#FF5F1F',
        pointBorderColor: '#fff',
        pointBorderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111111',
        titleColor: '#fff',
        bodyColor: '#e4e4e7',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(15, 23, 42, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}

export function RevenueChart({ dataValues, labels }) {
  const chartData = {
    labels: labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: dataValues || [5000, 7500, 10000, 6000, 12000, 15000, 9000],
        backgroundColor: 'rgba(255, 95, 31, 0.85)',
        borderRadius: 6,
        hoverBackgroundColor: '#FF5F1F',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#111111',
        titleColor: '#fff',
        bodyColor: '#e4e4e7',
        borderColor: '#27272a',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: { family: 'Inter', size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(15, 23, 42, 0.05)',
        },
        ticks: {
          color: '#6b7280',
          font: { family: 'Inter', size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}

export function MemberDistributionChart({ activeCount, inactiveCount }) {
  const chartData = {
    labels: ['Active Members', 'Inactive Members'],
    datasets: [
      {
        data: [activeCount || 75, inactiveCount || 25],
        backgroundColor: ['#FF5F1F', '#e4e4e7'],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#4b5563',
          font: { family: 'Inter', size: 11, weight: 'bold' },
          padding: 20,
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
