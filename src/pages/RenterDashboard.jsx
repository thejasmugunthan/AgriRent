import React, { useState } from "react";
import "../css/RenterDashboard.css";
import { FaMoneyBillWave, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import aboutImg from "../assets/about-farm.jpg"; // Ensure this exists

export default function RenterDashboard() {
  const [view, setView] = useState("about");
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="flat-sidebar">
        <div className="sidebar-top">
          <h2 className="sidebar-logo">🚜 AgriRent</h2>

          <nav className="sidebar-menu">
            {/* About */}
            <button
              className={`nav-item ${view === "about" ? "active" : ""}`}
              onClick={() => setView("about")}
            >
              About
            </button>

            {/* Browse Machines */}
            <button className="nav-item" onClick={() => navigate("/browse-machines")}>
              Browse Machines
            </button>

            {/* Price Predictor */}
            <button className="nav-item" onClick={() => navigate("/price-predictor")}>
              Price Predictor
            </button>

            {/* My Rentals */}
            <button className="nav-item" onClick={() => navigate("/my-rentals")}>
              My Rentals
            </button>

            {/* Chat Support */}
            <button className="nav-item" onClick={() => navigate("/chat")}>
              Chat Support
            </button>

            {/* ⭐ NEW: Renter Analytics */}
            <button className="nav-item" onClick={() => navigate("/renter-analytics")}>
              📊 Rental Analytics
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => navigate("/profile")}>
            Profile
          </button>

          <button className="nav-item" onClick={() => navigate("/welcome")}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {view === "about" && (
          <section className="about-section">
            <div className="about-header">
              <div>
                <h1>
                  Welcome to <span className="highlight">AgriRent</span> 👨‍🌾
                </h1>
                <p>
                  AgriRent is your one-stop platform to rent agricultural machines like tractors,
                  harvesters, tillers, and rotavators. Whether you’re a farmer looking for reliable
                  equipment or a machine owner seeking to earn more — 
                  <b> AgriRent connects you effortlessly.</b>
                </p>
              </div>
            </div>

            <div className="about-body">
              <div className="features">
                <div className="feature-card">
                  <h3>🌾 Easy Renting</h3>
                  <p>Find nearby machines, compare prices, and rent instantly.</p>
                </div>

                <div className="feature-card">
                  <h3>🤝 Trusted Network</h3>
                  <p>All owners and renters are verified for safe and secure transactions.</p>
                </div>

                <div className="feature-card">
                  <h3>💰 Affordable Rates</h3>
                  <p>Save up to 40% with daily or weekly rental options.</p>
                </div>
              </div>

              <div className="about-image">
                <img
                  src={aboutImg}
                  alt="AgriRent About"
                />
              </div>
            </div>

            <div className="about-footer">
              <button className="start-btn" onClick={() => navigate("/browse-machines")}>
                Start Renting 🚜
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
