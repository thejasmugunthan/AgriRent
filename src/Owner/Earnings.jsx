import "../css/Earnings.css";
import React, { useEffect, useState } from "react";
import api from "../api";
import { logout } from "../utils/auth";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

export default function Earnings() {
  const ownerId = localStorage.getItem("userId");

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedRentals, setCompletedRentals] = useState([]);

  const [monthlyEarnings, setMonthlyEarnings] = useState({});
  const [monthlyRentals, setMonthlyRentals] = useState({});
  const [topMachines, setTopMachines] = useState([]);

  useEffect(() => {
    if (!ownerId) return;

    api
      .get(`/rentals/owner/${ownerId}/earnings`)
      .then((res) => {
        setTotalEarnings(res.data.totalEarnings);
        setCompletedRentals(res.data.completedRentals || []);
        setMonthlyEarnings(res.data.monthlyEarnings || {});
        setMonthlyRentals(res.data.monthlyRentals || {});
        setTopMachines(res.data.topMachines || []);
      })
      .catch((err) => console.error("earnings load error:", err));
  }, [ownerId]);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Earnings Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </header>

      {/* Summary */}
      <div className="summary-card">
        <h3>Total Earnings</h3>
        <p className="value">₹ {totalEarnings}</p>
      </div>

      {/* Charts */}
      <div className="charts">
        {/* Monthly Earnings */}
        <div className="chart-card">
          <h3>Monthly Earnings</h3>
          <Line
            data={{
              labels: Object.keys(monthlyEarnings).reverse(),
              datasets: [
                {
                  label: "Earnings (₹)",
                  data: Object.values(monthlyEarnings).reverse(),
                  borderColor: "#1e90ff",
                  backgroundColor: "rgba(30,144,255,0.3)",
                },
              ],
            }}
          />
        </div>

        {/* Monthly Rentals */}
        <div className="chart-card">
          <h3>Monthly Rentals</h3>
          <Bar
            data={{
              labels: Object.keys(monthlyRentals).reverse(),
              datasets: [
                {
                  label: "Rentals",
                  data: Object.values(monthlyRentals).reverse(),
                  backgroundColor: "#28a745",
                },
              ],
            }}
          />
        </div>

        {/* Top Machines */}
        <div className="chart-card">
          <h3>Top Machines</h3>
          <Bar
            data={{
              labels: topMachines.map((m) => m.name),
              datasets: [
                {
                  label: "Earnings (₹)",
                  data: topMachines.map((m) => m.earnings),
                  backgroundColor: "#ff9800",
                },
              ],
            }}
          />
        </div>
      </div>

      <h2>Completed Rentals</h2>
      {completedRentals.length === 0 && <p>No completed rentals.</p>}

      {completedRentals.map((r) => (
        <div key={r._id} className="card">
          <h3>{r.machineId?.name}</h3>
          <p>Renter: {r.renterId?.name}</p>
          <p>Hours: {r.totalHours}</p>
          <p>Total Earned: ₹ {r.totalPrice}</p>
          <p>Completed: {new Date(r.endTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
