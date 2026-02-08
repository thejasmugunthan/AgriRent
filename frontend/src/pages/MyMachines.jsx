import React, { useEffect, useState } from "react";
import { getOwnerMachines, deleteMachine } from "../api/machineApi";
import {
  FaTractor,
  FaTachometerAlt,
  FaMoneyBillWave,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function MyMachines() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);

  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const ownerId = localStorage.getItem("userId") || parsedUser?._id || null;

  const PINCODE_MAP = {
    "560001": "Bangalore",
    "570001": "Mysuru",
    "571401": "Mandya",
    "573201": "Hassan",
  };

  const load = async () => {
    try {
      if (!ownerId) {
        alert("User not found. Please login again.");
        return;
      }

      const res = await getOwnerMachines(ownerId);
      const arr = Array.isArray(res.data)
        ? res.data
        : res.data.machines || [];

      setMachines(arr);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      alert("Failed to load machines");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this machine?")) return;
    try {
      await deleteMachine(id);
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleEdit = (machineId) => {
    navigate(`/edit-machine/${machineId}`);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/welcome";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* ================= SIDEBAR ================= */}
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

              <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
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

              <button
                onClick={() => navigate("/analytics")}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
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

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  My Machines
                </h1>
                <p className="text-gray-600">
                  Manage your agricultural machines
                </p>
              </div>

              <button
                onClick={() => navigate("/add-machine")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-6 py-3 rounded-lg shadow-md flex items-center gap-2"
              >
                <FaPlus /> Add Machine
              </button>
            </div>

            {/* Empty State */}
            {machines.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-md">
                <FaTractor className="text-8xl text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No machines added yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start by adding your first machine
                </p>
                <button
                  onClick={() => navigate("/add-machine")}
                  className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <FaPlus /> Add Machine
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {machines.map((m) => (
                  <div
                    key={m._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-green-100 flex items-center justify-center">
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaTractor className="text-6xl text-green-600" />
                      )}

                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            m.available
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {m.available ? "Available" : "Rented Out"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {m.name}
                      </h3>

                      <div className="text-gray-600 mb-2 flex items-center gap-2">
                        <FaTractor className="text-green-600" />
                        {m.type}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span>Rent/hour</span>
                          <span className="text-lg font-bold text-green-600">
                            ₹{m.rentPerHour}
                          </span>
                        </div>

                        {m.pincode && (
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-green-600" />
                            {PINCODE_MAP[m.pincode] || m.pincode}
                          </div>
                        )}

                        {m.ageYears && (
                          <div className="flex items-center gap-2">
                            <FaClock className="text-green-600" />
                            {m.ageYears} years old
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(m._id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(m._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
