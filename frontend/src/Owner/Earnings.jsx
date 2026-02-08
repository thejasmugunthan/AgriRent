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

export default function Earnings() {
  const navigate = useNavigate();
  const ownerId = localStorage.getItem("userId");
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [completedRentals, setCompletedRentals] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [machineFilter, setMachineFilter] = useState("all");
  const [startFilter, setStartFilter] = useState("");
  const [endFilter, setEndFilter] = useState("");

  useEffect(() => {
    if (!ownerId) return;

    api
      .get(`/rentals/owner/${ownerId}/earnings`)
      .then((res) => {
        setTotalEarnings(res.data.totalEarnings || 0);
        setCompletedRentals(res.data.completedRentals || []);
      })
      .catch((err) => console.error("Earnings load error:", err));
  }, [ownerId]);

  const filteredCompleted = completedRentals.filter((r) => {
    const completedDate = new Date(r.endTime);

    if (yearFilter && completedDate.getFullYear() !== Number(yearFilter))
      return false;

    if (machineFilter !== "all" && r.machineId?.name !== machineFilter)
      return false;

    if (startFilter && completedDate < new Date(startFilter)) return false;
    if (endFilter && completedDate > new Date(endFilter)) return false;

    return true;
  });

  const logout = () => {
    localStorage.clear();
    navigate("/welcome");
  };

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
              <button
                onClick={() => navigate("/owner-dashboard")}
                className="sidebar-btn"
              >
                <FaTachometerAlt /> Dashboard
              </button>

              <button
                onClick={() => navigate("/my-machines")}
                className="sidebar-btn"
              >
                <FaTractor /> My Machines
              </button>

              <button
                onClick={() => navigate("/add-machine")}
                className="sidebar-btn"
              >
                <FaPlus /> Add Machine
              </button>

              <button className="sidebar-btn bg-green-100 text-green-700">
                <FaMoneyBillWave /> Earnings
              </button>

              <button
                onClick={() => navigate("/analytics")}
                className="sidebar-btn"
              >
                <FaChartLine /> Analytics
              </button>
            </nav>
          </div>

          <div className="p-4 border-t space-y-2">
            <button
              onClick={() => navigate("/profile")}
              className="sidebar-btn"
            >
              <FaUserCircle /> Profile
            </button>

            <button
              onClick={logout}
              className="sidebar-btn text-red-600"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Earnings History</h1>
              <p className="text-gray-600">
                View completed rentals and earnings
              </p>
            </div>

            {/* TOTAL EARNINGS */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-lg mb-2">
                    Total Earnings
                  </p>
                  <h2 className="text-5xl font-bold">
                    ₹{totalEarnings.toFixed(2)}
                  </h2>
                </div>
                <FaMoneyBillWave className="text-8xl opacity-20" />
              </div>
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                <FaFilter /> Filters
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="input"
                >
                  <option value={new Date().getFullYear()}>
                    {new Date().getFullYear()}
                  </option>
                  <option value={new Date().getFullYear() - 1}>
                    {new Date().getFullYear() - 1}
                  </option>
                </select>

                <select
                  value={machineFilter}
                  onChange={(e) => setMachineFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Machines</option>
                  {[...new Set(completedRentals.map(r => r.machineId?.name))].map(
                    (name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    )
                  )}
                </select>

                <input
                  type="date"
                  value={startFilter}
                  onChange={(e) => setStartFilter(e.target.value)}
                  className="input"
                />

                <input
                  type="date"
                  value={endFilter}
                  onChange={(e) => setEndFilter(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            {/* COMPLETED RENTALS */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" /> Completed Rentals
              </h2>

              {filteredCompleted.length === 0 ? (
                <p className="text-center text-gray-600 py-8">
                  No rentals match filters.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredCompleted.map((r) => (
                    <div
                      key={r._id}
                      className="border rounded-lg p-5 hover:shadow-md"
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-bold">
                          {r.machineId?.name}
                        </h3>
                        <span className="text-xl font-bold text-green-600">
                          ₹{r.totalPrice}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 grid md:grid-cols-2 gap-2">
                        <p>
                          <strong>Renter:</strong>{" "}
                          {r.renterId?.name}
                        </p>
                        <p>
                          <strong>Completed:</strong>{" "}
                          {new Date(r.endTime).toLocaleString()}
                        </p>
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
