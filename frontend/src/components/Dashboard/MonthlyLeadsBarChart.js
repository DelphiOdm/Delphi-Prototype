import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyLeadsBarChart({ data }) {
  // Map data to the 12-month array
  const counts = new Array(12).fill(0);
  data.forEach(d => {
    // Safety check in case d.month is 0 or undefined
    if (d.month >= 1 && d.month <= 12) {
      counts[d.month - 1] = d.lead_count;
    }
  });

  // Modern Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows height to be controlled by container
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false }, // Cleaner look without vertical lines
        ticks: { color: "#64748b", font: { size: 12 } }
      },
      y: {
        border: { display: false }, // Remove axis border
        grid: { color: "#f1f5f9", borderDash: [5, 5] }, // Subtle dashed lines
        ticks: { color: "#64748b", padding: 10 }
      }
    }
  };

  const chartData = {
    labels: months,
    datasets: [{
      label: "Leads",
      data: counts,
      backgroundColor: "#4361ee", // Modern primary blue
      hoverBackgroundColor: "#3a56d4",
      borderRadius: 6, // Rounded bar tops
      barThickness: "flex",
      maxBarThickness: 40,
    }]
  };

  return (
    <div style={{ height: "320px", width: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}