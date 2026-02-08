// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  FaTachometerAlt,
  FaTractor,
  FaMoneyBillWave,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaCheck,
  FaTimes,
  FaComments,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../api";

export default function OwnerDashboard() {
  const ownerId = localStorage.getItem("userId");

  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [totalMachines, setTotalMachines] = useState(0); // ⭐ NEW

  const loadPending = useCallback(async () => {
    if (!ownerId) return;
    try {
      const res = await api.get(`/rentals/owner/${ownerId}/pending`);
      setPending(res.data.rentals || []);
    } catch (err) {
      console.error("Error loading pending:", err);
    }
  }, [ownerId]);
  const loadActive = useCallback(async () => {
    if (!ownerId) return;
    try {
      const res = await api.get(`/rentals/owner/${ownerId}/active`);
      setActive(res.data.rentals || []);
    } catch (err) {
      console.error("Error loading active:", err);
    }
  }, [ownerId]);

  const loadTotalMachines = useCallback(async () => {
    if (!ownerId) return;
    try {
      const res = await api.get(`/machines/owner/${ownerId}`);
      setTotalMachines(res.data.machines?.length || 0);
    } catch (err) {
      console.error("Error loading machines:", err);
    }
  }, [ownerId]);

  useEffect(() => {
    loadPending();
    loadActive();
    loadTotalMachines(); 
  }, [loadPending, loadActive, loadTotalMachines]);

  const approveRequest = async (id) => {
    try {
      await api.patch(`/rentals/${id}/status`, { status: "active" });
      setPending((prev) => prev.filter((p) => p._id !== id));
      loadActive();
      alert("Approved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to approve");
    }
  };

  const denyRequest = async (id) => {
    try {
      await api.patch(`/rentals/${id}/status`, { status: "cancelled" });
      setPending((prev) => prev.filter((p) => p._id !== id));
      alert("Request denied");
    } catch (err) {
      console.error(err);
      alert("Failed to deny");
    }
  };

  const completeRental = async (id) => {
    if (!window.confirm("Mark this rental as completed?")) return;

    try {
      await api.patch(`/rentals/complete/${id}`);
      alert("Rental marked as completed");
      loadActive();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as completed");
    }
  };

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
              <a
                href="/owner-dashboard"
                className="flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
              >
                <FaTachometerAlt /> Dashboard
              </a>
              <a
                href="/my-machines"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <FaTractor /> My Machines
              </a>
              <a
                href="/earnings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <FaMoneyBillWave /> Earnings
              </a>
            </nav>
          </div>

          <div className="p-4 space-y-2 border-t border-gray-200">
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaUserCircle /> Profile
            </a>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              type="button"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome Back, Owner 👋</h1>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-medium mb-2">Pending Requests</h3>
                <p className="text-4xl font-bold text-yellow-600 mb-2">{pending.length}</p>
                <span className="text-sm text-gray-500">Awaiting approval</span>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-medium mb-2">Active Rentals</h3>
                <p className="text-4xl font-bold text-green-600 mb-2">{active.length}</p>
                <span className="text-sm text-gray-500">Currently rented out</span>
              </div>

              {/* REAL TOTAL MACHINES COUNT */}
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                <h3 className="text-gray-600 font-medium mb-2">Total Machines</h3>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {totalMachines}
                </p>
                <span className="text-sm text-gray-500">Available for rent</span>
              </div>
            </div>

            {/* Requests + Active Rentals */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Pending Requests */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Pending Requests ({pending.length})
                </h2>

                {pending.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">All requests approved!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pending.map((req) => (
                      <div
                        key={req._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <p className="text-gray-800 mb-3">
                          <span className="font-bold text-green-700">{req.renterId?.name}</span>{" "}
                          requested <span className="font-semibold">{req.machineId?.name}</span>
                        </p>
                        <div className="flex gap-3">
                          <button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            type="button"
                            onClick={() => approveRequest(req._id)}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            type="button"
                            onClick={() => denyRequest(req._id)}
                          >
                            <FaTimes /> Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Rentals */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active Rentals ({active.length})
                </h2>

                {active.length === 0 ? (
                  <div className="text-center py-12">
                    <FaTractor className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No active rentals yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {active.map((r) => (
                      <div
                        key={r._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3">
                          <p className="font-bold text-gray-800 text-lg">{r.machineId?.name}</p>
                          <p className="text-sm text-gray-600">
                            Rented by: <span className="font-medium">{r.renterId?.name}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Due: <span className="font-medium text-red-600">
                              {new Date(r.endTime).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            type="button"
                            onClick={() =>
                              (window.location.href = `/chat?rentalId=${r._id}&otherId=${r.renterId._id}&otherName=${encodeURIComponent(
                                r.renterId.name
                              )}&otherRole=renter`)
                            }
                          >
                            <FaComments /> Chat
                          </button>
                          <button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            type="button"
                            onClick={() => completeRental(r._id)}
                          >
                            <FaCheckCircle /> Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
