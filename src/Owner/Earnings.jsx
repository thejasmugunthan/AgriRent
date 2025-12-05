// src/pages/Earnings.jsx
import "../css/Earnings.css";
import React, { useEffect, useState } from "react";
import api from "../api";
import { logout } from "../utils/auth";

import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register chart.js
ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ArcElement
);

export default function Earnings() {
  const ownerId = localStorage.getItem("userId");

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedRentals, setCompletedRentals] = useState([]);

  const [monthlyEarnings, setMonthlyEarnings] = useState({});
  const [monthlyRentals, setMonthlyRentals] = useState({});
  const [topMachines, setTopMachines] = useState([]);
  const [machineTypeData, setMachineTypeData] = useState({});

  // Filters
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [machineFilter, setMachineFilter] = useState("all");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");

  /* ======================================================
      LOAD OWNER EARNINGS FROM BACKEND
  ====================================================== */
  useEffect(() => {
    if (!ownerId) return;

    api
      .get(`/rentals/owner/${ownerId}/earnings`)
      .then((res) => {
        setTotalEarnings(res.data.totalEarnings || 0);
        setCompletedRentals(res.data.completedRentals || []);

        setMonthlyEarnings(res.data.monthlyEarnings || {});
        setMonthlyRentals(res.data.monthlyRentals || {});
        setTopMachines(res.data.topMachines || []);

        // Build machine type dataset
        const typeCounts = {};
        res.data.completedRentals.forEach((r) => {
          const type = r.machineId?.type || "Other";
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        setMachineTypeData(typeCounts);
      })
      .catch((err) => console.error("Earnings load error:", err));
  }, [ownerId]);

  /* ======================================================
      FILTER HANDLERS
  ====================================================== */
  const filteredCompleted = completedRentals.filter((r) => {
    const rentalDate = new Date(r.endTime);

    if (yearFilter && rentalDate.getFullYear() !== Number(yearFilter))
      return false;

    if (machineFilter !== "all" && r.machineId?.name !== machineFilter)
      return false;

    if (startFilter) {
      const s = new Date(startFilter);
      if (rentalDate < s) return false;
    }

    if (endFilter) {
      const e = new Date(endFilter);
      if (rentalDate > e) return false;
    }

    return true;
  });

  /* ======================================================
      CHART DATA
  ====================================================== */
  const earningsLabels = Object.keys(monthlyEarnings).reverse();
  const earningsValues = Object.values(monthlyEarnings).reverse();

  const rentalsLabels = Object.keys(monthlyRentals).reverse();
  const rentalsValues = Object.values(monthlyRentals).reverse();

  const pieLabels = Object.keys(machineTypeData);
  const pieValues = Object.values(machineTypeData);

  const topLabels = topMachines.map((m) => m.name);
  const topValues = topMachines.map((m) => m.earnings);

  return (
    <div className="earnings-page">

      {/* HEADER */}
      <header className="earnings-header">
        <h1>Earnings Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {/* TOP CARD */}
      <div className="earnings-top-card">
        <h2>Total Earnings</h2>
        <p>₹ {totalEarnings.toFixed(2)}</p>
      </div>

      {/* FILTERS */}
      <div className="filter-container">
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
          <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
        </select>

        <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)}>
          <option value="all">All Machines</option>
          {topMachines.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startFilter}
          onChange={(e) => setStartFilter(e.target.value)}
        />

        <input
          type="date"
          value={endFilter}
          onChange={(e) => setEndFilter(e.target.value)}
        />
      </div>

      {/* CHARTS */}
      <div className="charts-section">
        
        {/* Monthly Earnings */}
        <div className="chart-box">
          <h3>Monthly Earnings</h3>
          <Line
            data={{
              labels: earningsLabels,
              datasets: [
                {
                  label: "Earnings ₹",
                  data: earningsValues,
                  borderWidth: 3,
                  borderColor: "#1e90ff",
                  backgroundColor: "rgba(30,144,255,0.3)",
                  tension: 0.4,
                },
              ],
            }}
            options={{
              animation: { duration: 1200 },
            }}
          />
        </div>

        {/* Monthly Rentals */}
        <div className="chart-box">
          <h3>Monthly Rentals</h3>
          <Bar
            data={{
              labels: rentalsLabels,
              datasets: [
                {
                  label: "Rentals",
                  data: rentalsValues,
                  backgroundColor: "rgba(40,167,69,0.8)",
                },
              ],
            }}
            options={{
              animation: { duration: 1200 },
            }}
          />
        </div>

        {/* Top Machine Bar */}
        <div className="chart-box">
          <h3>Top Machines by Earnings</h3>
          <Bar
            data={{
              labels: topLabels,
              datasets: [
                {
                  label: "Earnings (₹)",
                  data: topValues,
                  backgroundColor: "rgba(255,152,0,0.8)",
                },
              ],
            }}
            options={{ indexAxis: "y" }}
          />
        </div>

        {/* PIE CHART */}
        <div className="chart-box">
          <h3>Machine Types Rented</h3>
          <Pie
            data={{
              labels: pieLabels,
              datasets: [
                {
                  data: pieValues,
                  backgroundColor: [
                    "#1e90ff",
                    "#ff9800",
                    "#4caf50",
                    "#9c27b0",
                    "#e91e63",
                  ],
                },
              ],
            }}
          />
        </div>

      </div>

      {/* Completed Rentals */}
      <h2>Completed Rentals</h2>

      {filteredCompleted.length === 0 && <p>No rentals match filters.</p>}

      {filteredCompleted.map((r) => (
        <div key={r._id} className="rental-card">
          <h3>{r.machineId?.name}</h3>
          <p>Renter: {r.renterId?.name}</p>
          <p>Total Earned: ₹ {r.totalPrice}</p>
          <p>Completed: {new Date(r.endTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
