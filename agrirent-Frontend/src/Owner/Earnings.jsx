// src/pages/Earnings.jsx
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
  FaFilter,
  FaCheckCircle,
  FaPlus,
} from "react-icons/fa";

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
  const navigate = useNavigate();
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
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
            >
              <FaMoneyBillWave /> Earnings
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
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
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Earnings Dashboard</h1>
            <p className="text-gray-600">Track your rental income and performance</p>
          </div>

          {/* Total Earnings Card */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-lg mb-2">Total Earnings</p>
                <h2 className="text-5xl font-bold">₹{totalEarnings.toFixed(2)}</h2>
              </div>
              <FaMoneyBillWave className="text-8xl opacity-20" />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
              <FaFilter /> Filters
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              </select>

              <select
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
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
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Start Date"
              />

              <input
                type="date"
                value={endFilter}
                onChange={(e) => setEndFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="End Date"
              />
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Monthly Earnings */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Earnings</h3>
              <Line
                data={{
                  labels: earningsLabels,
                  datasets: [
                    {
                      label: "Earnings ₹",
                      data: earningsValues,
                      borderWidth: 3,
                      borderColor: "#10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      tension: 0.4,
                    },
                  ],
                }}
                options={{
                  animation: { duration: 1200 },
                  responsive: true,
                  maintainAspectRatio: true,
                }}
              />
            </div>

            {/* Monthly Rentals */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Rentals</h3>
              <Bar
                data={{
                  labels: rentalsLabels,
                  datasets: [
                    {
                      label: "Rentals",
                      data: rentalsValues,
                      backgroundColor: "rgba(59, 130, 246, 0.8)",
                    },
                  ],
                }}
                options={{
                  animation: { duration: 1200 },
                  responsive: true,
                  maintainAspectRatio: true,
                }}
              />
            </div>

            {/* Top Machine Bar */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Top Machines by Earnings</h3>
              <Bar
                data={{
                  labels: topLabels,
                  datasets: [
                    {
                      label: "Earnings (₹)",
                      data: topValues,
                      backgroundColor: "rgba(245, 158, 11, 0.8)",
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: true,
                }}
              />
            </div>

            {/* PIE CHART */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Machine Types Rented</h3>
              <Pie
                data={{
                  labels: pieLabels,
                  datasets: [
                    {
                      data: pieValues,
                      backgroundColor: [
                        "#10b981",
                        "#f59e0b",
                        "#3b82f6",
                        "#a855f7",
                        "#ec4899",
                      ],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                }}
              />
            </div>
          </div>

          {/* Completed Rentals */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaCheckCircle className="text-green-600" /> Completed Rentals
            </h2>

            {filteredCompleted.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No rentals match filters.</p>
            ) : (
              <div className="space-y-4">
                {filteredCompleted.map((r) => (
                  <div
                    key={r._id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{r.machineId?.name}</h3>
                      <span className="text-2xl font-bold text-green-600">₹{r.totalPrice}</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p><span className="font-medium">Renter:</span> {r.renterId?.name}</p>
                      <p><span className="font-medium">Completed:</span> {new Date(r.endTime).toLocaleString()}</p>
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
