import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Analytics.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register Chart.js Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function RenterAnalytics() {
  const renterId = localStorage.getItem("userId");

  const [data, setData] = useState({
    monthlyRentals: {},
    monthlySpending: {},
    mostRentedTypes: [],
  });

  const [rentalList, setRentalList] = useState([]); // <-- NEW

  useEffect(() => {
    // Analytics data
    api
      .get(`/rentals/renter/${renterId}/analytics`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));

    // Full rental list
    api
      .get(`/rentals/my/${renterId}`)
      .then((res) => setRentalList(res.data.rentals || []))
      .catch((err) => console.error("Rental list error:", err));
  }, [renterId]);

  const months = Object.keys(data.monthlyRentals).reverse();
  const rentals = Object.values(data.monthlyRentals).reverse();
  const spending = Object.values(data.monthlySpending).reverse();

  const machineLabels = data.mostRentedTypes.map((t) => t.type);
  const machineCounts = data.mostRentedTypes.map((t) => t.count);

  return (
    <div className="analytics-page">

      <h1 className="analytics-title">📊 Your Rental Analytics</h1>

      {/* CHARTS GRID */}
      <div className="analytics-grid">

        {/* Monthly Rentals */}
        <div className="chart-card">
          <h2 className="chart-title">Monthly Rentals</h2>
          <div className="chart-wrapper">
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Rentals",
                    data: rentals,
                    borderColor: "#4b7bec",
                    backgroundColor: "rgba(75, 123, 236, 0.3)",
                    tension: 0.4,
                  },
                ],
              }}
            />
          </div>
        </div>

        {/* Monthly Spending */}
        <div className="chart-card">
          <h2 className="chart-title">Monthly Spending</h2>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: months,
                datasets: [
                  {
                    label: "Spending (₹)",
                    data: spending,
                    backgroundColor: "rgba(46, 204, 113, 0.6)",
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>

      {/* RENTED MACHINE TYPES */}
      <div className="chart-card">
        <h2 className="chart-title">Most Rented Machine Types</h2>
        <div className="chart-wrapper" style={{ height: "300px" }}>
          <Doughnut
            data={{
              labels: machineLabels,
              datasets: [
                {
                  label: "Count",
                  data: machineCounts,
                  backgroundColor: [
                    "#4b7bec",
                    "#ff7675",
                    "#55efc4",
                    "#fdcb6e",
                    "#a29bfe",
                  ],
                },
              ],
            }}
          />
        </div>
      </div>

      {/* ================================
          📦 FULL RENTAL HISTORY SECTION
      ================================== */}
      <div className="chart-card" style={{ marginTop: "30px" }}>
        <h2 className="chart-title">📦 Rental History</h2>

        {rentalList.length === 0 ? (
          <p>No rentals found.</p>
        ) : (
          <div className="rental-history-table">
            {rentalList.map((r) => (
              <div key={r._id} className="rental-row-analytics">
                
                <div className="rental-col">
                  <b>{r.machineId?.name}</b>
                  <div className="small-text">Owner: {r.ownerId?.name}</div>
                </div>

                <div className="rental-col">
                  <div className="small-text">
                    {new Date(r.startTime).toLocaleDateString()} →{" "}
                    {new Date(r.endTime).toLocaleDateString()}
                  </div>
                </div>

                <div className="rental-col">
                  <b>₹{r.totalPrice}</b>
                </div>

                <div className="rental-col">
                  <span className={`status-badge ${r.status}`}>
                    {r.status.toUpperCase()}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
