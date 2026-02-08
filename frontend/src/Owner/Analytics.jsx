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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler, 
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
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
    if (!ownerId) return;

    api
      .get(`/rentals/owner/${ownerId}/analytics`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Analytics error:", err));
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
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                <FaTachometerAlt /> Dashboard
              </button>

              <button
                onClick={() => navigate("/my-machines")}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                <FaTractor /> My Machines
              </button>

              <button
                onClick={() => navigate("/add-machine")}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                <FaPlus /> Add Machine
              </button>

              <button
                onClick={() => navigate("/earnings")}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                <FaMoneyBillWave /> Earnings
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                <FaChartLine /> Analytics
              </button>
            </nav>
          </div>

          <div className="p-4 space-y-2 border-t border-gray-200">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              <FaUserCircle /> Profile
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <FaChartLine className="text-green-600" /> Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Track your rental performance and trends
              </p>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Monthly Earnings */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Monthly Earnings</h2>
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
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              {/* Rentals */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Rentals Per Month</h2>
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
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>
            </div>

            {/* Top Machines */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaTrophy className="text-yellow-500" /> Top Performing Machines
              </h2>

              {data.topMachines.length === 0 ? (
                <p className="text-center text-gray-600">No data yet.</p>
              ) : (
                data.topMachines.map((m, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-4 border rounded-lg mb-3"
                  >
                    <h3 className="font-bold">{m.name}</h3>
                    <span className="text-green-600 font-bold">
                      ₹{m.earnings}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
