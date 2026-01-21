import React, { useState } from "react";
import {
  FaMoneyBillWave,
  FaSignOutAlt,
  FaTractor,
  FaUserCircle,
  FaChartLine,
  FaSearch,
  FaCalculator
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import aboutImg from "../assets/about-farm.jpg";

export default function RenterDashboard() {
  const [view, setView] = useState("about");
  const navigate = useNavigate();

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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                view === "about"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setView("about")}
            >
              About
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/browse-machines")}
            >
              <FaSearch /> Browse Machines
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/price-predictor")}
            >
              <FaCalculator /> Price Predictor
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/my-rentals")}
            >
              <FaTractor /> My Rentals
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/renter-analytics")}
            >
              <FaChartLine /> Analytics
            </button>
          </nav>
        </div>

        <div className="p-4 space-y-2 border-t border-gray-200">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            onClick={() => navigate("/profile")}
          >
            <FaUserCircle /> Profile
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
            onClick={() => navigate("/welcome")}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {view === "about" && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 md:p-12 text-white mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to AgriRent 👨‍🌾
              </h1>
              <p className="text-lg md:text-xl text-green-50 max-w-3xl">
                AgriRent is your one-stop platform to rent agricultural machines like tractors,
                harvesters, tillers, and rotavators. Whether you're a farmer looking for reliable
                equipment or a machine owner seeking to earn more —{" "}
                <span className="font-bold">AgriRent connects you effortlessly.</span>
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-green-500">
                <div className="text-4xl mb-4">🌾</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Easy Renting</h3>
                <p className="text-gray-600">
                  Find nearby machines, compare prices, and rent instantly with just a few clicks.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-blue-500">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Trusted Network</h3>
                <p className="text-gray-600">
                  All owners and renters are verified for safe and secure transactions.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-yellow-500">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Affordable Rates</h3>
                <p className="text-gray-600">
                  Save up to 40% with daily or weekly rental options tailored to your needs.
                </p>
              </div>
            </div>

            {/* About Image Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <img
                src={aboutImg}
                alt="AgriRent farming"
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <button
                onClick={() => navigate("/browse-machines")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
              >
                <FaTractor className="text-2xl" />
                Start Renting Now
              </button>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
