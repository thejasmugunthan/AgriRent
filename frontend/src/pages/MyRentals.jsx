// src/pages/MyRentals.jsx
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
  FaComments,
  FaEye,
  FaTimes,
  FaPlus,
  FaStar,
  FaClock,
  FaHome,
} from "react-icons/fa";

export default function MyRentals() {
  const renterId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  useEffect(() => {
    if (!renterId) return;

    api
      .get(`/rentals/my/${renterId}`)
      .then((res) => {
        setRentals(res.data.rentals || []);
      })
      .catch((err) => console.error("Load rentals error:", err));
  }, [renterId]);
  const filteredRentals = rentals.filter((r) => r.status === activeTab);
  const handleChat = (r) => {
    if (r.status !== "active") {
      alert("Owner has not accepted the rental yet.");
      return;
    }

    if (!r.ownerId || !r.ownerId._id) {
      alert("Chat not available. Owner info missing.");
      return;
    }

    navigate(
      `/chat?rentalId=${r._id}&otherId=${r.ownerId._id}&otherName=${encodeURIComponent(
        r.ownerId.name
      )}&otherRole=owner`
    );
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
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
            >
              <FaTractor /> My Rentals
            </button>

            <button
              onClick={() => navigate("/renter-analytics")}
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
          <h1 className="text-4xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <FaTractor className="text-green-600" /> My Rentals
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === "pending"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaClock /> Pending
            </button>

            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === "active"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaTractor /> Active
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === "completed"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Completed
            </button>

            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === "cancelled"
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FaTimes /> Cancelled
            </button>
          </div>

          {/* Rentals List */}
          <div className="space-y-6">
            {filteredRentals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <FaTractor className="text-8xl text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600 font-medium">No rentals in this section.</p>
              </div>
            ) : (
              filteredRentals.map((r) => (
                <div
                  key={r._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="md:flex">
                    {/* Left side - Machine Info */}
                    <div className="md:w-2/3 p-6 border-r border-gray-200">
                      <div className="flex items-start gap-4 mb-4">
                        {r.machineId?.image_url && (
                          <img
                            src={r.machineId.image_url}
                            alt={r.machineId.name}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        )}

                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-1">
                            {r.machineId?.name || "Machine"}
                          </h3>
                          {r.machineId?.type && (
                            <p className="text-green-600 font-medium mb-2">{r.machineId.type}</p>
                          )}
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
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

                      <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                        <div>
                          <p className="text-sm text-gray-500">Owner</p>
                          <p className="font-semibold">
                            {r.status === "pending"
                              ? "Waiting..."
                              : r.ownerId?.name || "Unknown"}
                          </p>
                        </div>

                        {r.status !== "pending" && r.ownerId?.phone && (
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-semibold">{r.ownerId.phone}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-semibold">
                            {new Date(r.startTime).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-semibold">
                            {new Date(r.endTime).toLocaleDateString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500">Total Price</p>
                          <p className="text-2xl font-bold text-green-600">₹{r.totalPrice}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="md:w-1/3 p-6 bg-gray-50 flex flex-col gap-3">
                      {/* Chat */}
                      <button
                        onClick={() => handleChat(r)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <FaComments /> Chat
                      </button>

                      {/* View Machine */}
                      <button
                            onClick={() => {
    const machineId =
      r.machineId?._id || r.machineId?.id || r.machineId;

    if (!machineId) {
      console.error("Invalid machineId:", r.machineId);
      alert("Machine ID missing.");
      return;
    }

    navigate(`/machine/${machineId}`);
  }}
  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
>
  <FaEye /> View Machine
</button>

                      {/* Cancel Rental */}
                      {(r.status === "active" || r.status === "pending") && (
                        <button
                          onClick={async () => {
                            if (!window.confirm("Cancel this rental?")) return;

                            try {
                              await api.patch(`/rentals/cancel/${r._id}`);
                              alert("Rental cancelled.");
                              window.location.reload();
                            } catch (err) {
                              alert("Cancel failed");
                              console.error(err);
                            }
                          }}
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <FaTimes /> Cancel Rental
                        </button>
                      )}

                      {/* Extend Rental */}
                      {r.status === "active" && (
                        <button
                          onClick={async () => {
                            const extraDays = prompt("How many extra days?");
                            if (!extraDays || isNaN(extraDays))
                              return alert("Invalid number");

                            const dailyRate = r.machineId?.rentPerHour || 0;

                            try {
                              await api.patch(`/rentals/extend/${r._id}`, {
                                extraDays: Number(extraDays),
                                dailyRate,
                              });

                              alert("Rental extended!");
                              window.location.reload();
                            } catch (err) {
                              alert("Extend failed");
                              console.error(err);
                            }
                          }}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <FaPlus /> Extend Rental
                        </button>
                      )}

                      {/* Rate Rental */}
                      {r.status === "completed" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/rate-machine/${r.machineId?._id}?rentalId=${r._id}`
                            )
                          }
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <FaStar /> Rate Machine
                        </button>
                      )}
                    </div>
                  </div>
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
