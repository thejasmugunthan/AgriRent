import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  FaTractor,
  FaTachometerAlt,
  FaMoneyBillWave,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaPlus,
  FaTrophy,
} from "react-icons/fa";

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
  const navigate = useNavigate();
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
              onClick={() => navigate("/owner-dashboard")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaTachometerAlt /> Dashboard
            </button>
            <button
              onClick={() => navigate("/my-machines")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaTractor /> My Machines
            </button>
            <button
              onClick={() => navigate("/add-machine")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaPlus /> Add Machine
            </button>
            <button
              onClick={() => navigate("/earnings")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaMoneyBillWave /> Earnings
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
              <FaChartLine className="text-green-600" /> Analytics Dashboard
            </h1>
            <p className="text-gray-600">Track your rental performance and trends</p>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Earnings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Earnings</h2>
              <div className="h-64">
                <Bar
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: "Earnings (₹)",
                        data: earnings,
                        backgroundColor: "rgba(16, 185, 129, 0.7)",
                        borderColor: "rgba(16, 185, 129, 1)",
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

            {/* Rentals per Month */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Rentals Per Month</h2>
              <div className="h-64">
                <Line
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: "Rentals",
                        data: rentals,
                        borderColor: "rgba(59, 130, 246, 0.8)",
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
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
          </div>

          {/* Top Machines */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" /> Top Performing Machines
            </h2>

            {data.topMachines.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No data yet.</p>
            ) : (
              <div className="space-y-4">
                {data.topMachines.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-blue-500"
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{m.name}</h3>
                        <p className="text-sm text-gray-600">Top earning machine</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-600">₹{m.earnings}</span>
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
