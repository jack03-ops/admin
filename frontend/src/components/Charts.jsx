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
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#f97316',
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
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
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
          color: '#94a3b8',
          font: {
            family: 'Inter',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
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
        backgroundColor: 'rgba(6, 182, 212, 0.85)',
        borderRadius: 6,
        hoverBackgroundColor: '#06b6d4',
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
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
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
        backgroundColor: ['#f97316', '#334155'],
        borderColor: '#0f172a',
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
          color: '#cbd5e1',
          font: { family: 'Inter', size: 11 },
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
