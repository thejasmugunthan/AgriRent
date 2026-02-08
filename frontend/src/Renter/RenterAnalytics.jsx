import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  FaTractor,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaSearch,
  FaCalculator,
  FaHome,
  FaHistory,
} from "react-icons/fa";

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
import "../css/RentMachine.css";
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
  const navigate = useNavigate();
  const renterId = localStorage.getItem("userId");

  const [data, setData] = useState({
    monthlyRentals: {},
    monthlySpending: {},
    mostRentedTypes: [],
  });

  const [rentalList, setRentalList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!renterId) return;

    api
      .get(`/rentals/renter/${renterId}/analytics`)
      .then((res) => {
        setData(
          res.data || {
            monthlyRentals: {},
            monthlySpending: {},
            mostRentedTypes: [],
          }
        );
      })
      .catch((err) => console.error("Analytics error:", err))
      .finally(() => setLoading(false));

    api
      .get(`/rentals/my/${renterId}`)
      .then((res) => setRentalList(res.data?.rentals || []))
      .catch((err) => console.error("Rental list error:", err));
  }, [renterId]);
  const normalizeMonthlyData = (rentalsData, spendingData) => {
    let months = [];
    let rentals = [];
    let spending = [];

    // Rentals
    if (Array.isArray(rentalsData)) {
      months = rentalsData.map((r) => r.month);
      rentals = rentalsData.map((r) => r.count || 0);
    } else if (typeof rentalsData === "object") {
      months = Object.keys(rentalsData);
      rentals = Object.values(rentalsData);
    }

    // Spending
    if (Array.isArray(spendingData)) {
      spending = spendingData.map((s) => s.total || 0);
    } else if (typeof spendingData === "object") {
      spending = Object.values(spendingData);
    }

    return { months, rentals, spending };
  };

  const { months, rentals, spending } = normalizeMonthlyData(
    data.monthlyRentals || {},
    data.monthlySpending || {}
  );

  const machineLabels =
    data.mostRentedTypes?.map((t) => t.type) || [];
  const machineCounts =
    data.mostRentedTypes?.map((t) => t.count) || [];

  const logout = () => {
    localStorage.clear();
    navigate("/welcome");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
          <div className="flex-1">
            <div className="p-6 border-b border-gray-200">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-green-700">
                <FaTractor className="text-3xl" /> AgriRent
              </h2>
            </div>

            <nav className="p-4 space-y-2">
              <button onClick={() => navigate("/renter-dashboard")} className="sidebar-btn">
                <FaHome /> About
              </button>

              <button onClick={() => navigate("/browse-machines")} className="sidebar-btn">
                <FaSearch /> Browse Machines
              </button>

              <button onClick={() => navigate("/price-predictor")} className="sidebar-btn">
                <FaCalculator /> Price Predictor
              </button>

              <button onClick={() => navigate("/my-rentals")} className="sidebar-btn">
                <FaTractor /> My Rentals
              </button>

              <button className="sidebar-btn bg-green-100 text-green-700">
                <FaChartLine /> Analytics
              </button>
            </nav>
          </div>

          <div className="p-4 border-t space-y-2">
            <button onClick={() => navigate("/profile")} className="sidebar-btn">
              <FaUserCircle /> Profile
            </button>

            <button onClick={logout} className="sidebar-btn text-red-600">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <FaChartLine className="text-green-600" /> Your Rental Analytics
              </h1>
              <p className="text-gray-600">
                Track your rental spending and patterns
              </p>
            </div>

            {/* CHARTS */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Monthly Rentals */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Monthly Rentals</h2>
                <div className="h-64">
                  <Line
                    data={{
                      labels: months,
                      datasets: [
                        {
                          label: "Rentals",
                          data: rentals,
                          borderColor: "#10b981",
                          backgroundColor: "rgba(16,185,129,0.15)",
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              {/* Monthly Spending */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Monthly Spending</h2>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: months,
                      datasets: [
                        {
                          label: "Spending (₹)",
                          data: spending,
                          backgroundColor: "rgba(59,130,246,0.7)",
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>

            {/* MOST RENTED TYPES */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">
                Most Rented Machine Types
              </h2>

              {machineCounts.length === 0 ? (
                <p className="text-center text-gray-600">No data available</p>
              ) : (
                <div className="h-80">
                  <Doughnut
                    data={{
                      labels: machineLabels,
                      datasets: [
                        {
                          data: machineCounts,
                          backgroundColor: [
                            "#10b981",
                            "#3b82f6",
                            "#f59e0b",
                            "#ec4899",
                            "#a855f7",
                          ],
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              )}
            </div>

            {/* RENTAL HISTORY */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaHistory className="text-green-600" /> Rental History
              </h2>

              {rentalList.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  No rentals found.
                </p>
              ) : (
                <div className="space-y-3">
                  {rentalList.map((r) => (
                    <div
                      key={r._id}
                      className="flex justify-between p-5 border rounded-lg hover:shadow-md"
                    >
                      <div>
                        <h3 className="font-bold">{r.machineId?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Owner: {r.ownerId?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(r.startTime).toLocaleDateString()} →{" "}
                          {new Date(r.endTime).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{r.totalPrice}
                        </p>
                        <span className="text-xs font-semibold">
                          {r.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
