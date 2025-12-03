import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Analytics.css";

// === CHART.JS FIX ===
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Analytics() {
  const ownerId = localStorage.getItem("userId");

  const [data, setData] = useState({
    monthlyEarnings: {},
    monthlyRentals: {},
    topMachines: [],
  });

  useEffect(() => {
    api.get(`/rentals/owner/${ownerId}/analytics`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [ownerId]);

  const months = Object.keys(data.monthlyEarnings).reverse();
  const earnings = Object.values(data.monthlyEarnings).reverse();
  const rentals = Object.values(data.monthlyRentals).reverse();

  return (
    <div className="analytics-page">

      <h1 className="analytics-title">📊 Analytics Dashboard</h1>

      <div className="analytics-grid">

        {/* Monthly Earnings */}
        <div className="chart-card">
          <h2 className="chart-title">Monthly Earnings</h2>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Earnings (₹)",
                    data: earnings,
                    backgroundColor: "rgba(75, 123, 236, 0.6)",
                  },
                ],
              }}
            />
          </div>
        </div>

        {/* Rentals per Month */}
        <div className="chart-card">
          <h2 className="chart-title">Rentals Per Month</h2>
          <div className="chart-wrapper">
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Rentals",
                    data: rentals,
                    borderColor: "rgba(255, 99, 132, 0.8)",
                    backgroundColor: "rgba(255, 99, 132, 0.3)",
                  },
                ],
              }}
            />
          </div>
        </div>

      </div>

      {/* Top Machines */}
      <div className="top-machines-card">
        <h2>Top Performing Machines</h2>

        {data.topMachines.length === 0 && <p>No data yet.</p>}

        {data.topMachines.map((m, i) => (
          <div key={i} className="top-machine-item">
            <span>{i + 1}. {m.name}</span>
            <span className="earnings-value">₹ {m.earnings}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
