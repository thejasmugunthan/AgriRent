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

  const logout = () => {
    localStorage.clear();
    window.location.href = "/welcome";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
        <div className="flex-1">
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-green-700">
              <FaTractor className="text-3xl" /> AgriRent
            </h2>
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={() => navigate("/renter-dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaHome /> About
            </button>

            <button
              onClick={() => navigate("/browse-machines")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaSearch /> Browse Machines
            </button>

            <button
              onClick={() => navigate("/price-predictor")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaCalculator /> Price Predictor
            </button>

            <button
              onClick={() => navigate("/my-rentals")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaTractor /> My Rentals
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
            >
              <FaChartLine /> Analytics
            </button>
          </nav>
        </div>

        <div className="p-4 space-y-2 border-t border-gray-200">
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            <FaUserCircle /> Profile
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <FaChartLine className="text-green-600" /> Your Rental Analytics
            </h1>
            <p className="text-gray-600">Track your rental spending and patterns</p>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Rentals */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Rentals</h2>
              <div className="h-64">
                <Line
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: "Rentals",
                        data: rentals,
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Monthly Spending */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Spending</h2>
              <div className="h-64">
                <Bar
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: "Spending (₹)",
                        data: spending,
                        backgroundColor: "rgba(59, 130, 246, 0.7)",
                        borderColor: "rgba(59, 130, 246, 1)",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: "top",
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Most Rented Machine Types */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Most Rented Machine Types</h2>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: machineLabels,
                  datasets: [
                    {
                      label: "Count",
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
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: "right",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Rental History */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaHistory className="text-green-600" /> Rental History
            </h2>

            {rentalList.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No rentals found.</p>
            ) : (
              <div className="space-y-3">
                {rentalList.map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{r.machineId?.name}</h3>
                      <p className="text-sm text-gray-600">Owner: {r.ownerId?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(r.startTime).toLocaleDateString()} → {new Date(r.endTime).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₹{r.totalPrice}</p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          r.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : r.status === "active"
                            ? "bg-green-100 text-green-700"
                            : r.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {r.status.toUpperCase()}
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
