// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import "../css/Dashboard.css";
import {
  FaTachometerAlt,
  FaTractor,
  FaMoneyBillWave,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import api from "../api";

export default function OwnerDashboard() {
  const ownerId = localStorage.getItem("userId");

  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);

  // Load Pending
  const loadPending = useCallback(async () => {
    if (!ownerId) return;
    try {
      const res = await api.get(`/rentals/owner/${ownerId}/pending`);
      setPending(res.data.rentals || []);
    } catch (err) {
      console.error("Error loading pending:", err);
    }
  }, [ownerId]);

  // Load Active Rentals
  const loadActive = useCallback(async () => {
    if (!ownerId) return;
    try {
      const res = await api.get(`/rentals/owner/${ownerId}/active`);
      setActive(res.data.rentals || []);
    } catch (err) {
      console.error("Error loading active:", err);
    }
  }, [ownerId]);

  useEffect(() => {
    loadPending();
    loadActive();
  }, [loadPending, loadActive]);

  // Approve Rental
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

  // Deny Rental
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

  // Complete Rental
  const completeRental = async (id) => {
    if (!window.confirm("Mark this rental as completed?")) return;

    try {
      await api.patch(`/rentals/${id}/complete`);
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
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="flat-sidebar">
        <div className="sidebar-top">
          <h2 className="sidebar-logo">
            <FaTractor className="logo-icon" /> AgriRent
          </h2>

          <nav className="sidebar-menu">
            {/* home link now has real href */}
            <a href="/owner-dashboard" className="nav-item active">
              <FaTachometerAlt /> Dashboard
            </a>

            <a href="/my-machines" className="nav-item">
              <FaTractor /> My Machines
            </a>

            <a href="/earnings" className="nav-item">
              <FaMoneyBillWave /> Earnings
            </a>

            <a href="/analytics" className="nav-item">
              📊 Analytics
            </a>

            {/* turned into button instead of invalid href="#" */}
            <button className="nav-item" type="button">
              Map
            </button>

            <button
              className="nav-item"
              type="button"
              onClick={() => (window.location.href = "/chat")}
            >
              Chat Support
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <a href="/profile" className="nav-item profile">
            <FaUserCircle /> Profile
          </a>
          <button onClick={logout} className="nav-item profile" type="button">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-title">Welcome Back, Owner 👋</h1>

        {/* Summary Cards */}
        <div className="card-grid">
          <div className="summary-card">
            <h3>Pending Requests</h3>
            <p className="value">{pending.length}</p>
            <span>Awaiting approval</span>
          </div>

          <div className="summary-card">
            <h3>Active Rentals</h3>
            <p className="value">{active.length}</p>
            <span>Currently rented out</span>
          </div>

          <div className="summary-card">
            <h3>Total Machines</h3>
            <p className="value">12</p>
            <span>Available for rent</span>
          </div>
        </div>

        <div className="data-section">
          {/* Pending Requests */}
          <div className="data-card">
            <h2 className="pending-title">
              Pending Requests ({pending.length})
            </h2>

            {pending.length === 0 ? (
              <p className="empty">✅ All requests approved!</p>
            ) : (
              pending.map((req) => (
                <div key={req._id} className="request-row">
                  <p>
                    <b>{req.renterId?.name}</b> requested{" "}
                    {req.machineId?.name}
                  </p>
                  <div>
                    <button
                      className="btn approve"
                      type="button"
                      onClick={() => approveRequest(req._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn deny"
                      type="button"
                      onClick={() => denyRequest(req._id)}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Rentals */}
          <div className="data-card">
            <h2>Active Rentals ({active.length})</h2>

            {active.length === 0 && <p>No active rentals yet.</p>}

            {active.map((r) => (
              <div key={r._id} className="rental-row">
                <b>{r.machineId?.name}</b> ({r.renterId?.name}) — Due:{" "}
                <span className="due">
                  {new Date(r.endTime).toLocaleDateString()}
                </span>

                <button
                  className="btn chat-btn"
                  type="button"
                  onClick={() =>
                    (window.location.href = `/chat?rentalId=${r._id}&otherId=${r.renterId._id}&otherName=${encodeURIComponent(
                      r.renterId.name
                    )}&otherRole=renter`)
                  }
                >
                  Chat
                </button>

                <button
                  className="btn complete-btn"
                  type="button"
                  onClick={() => completeRental(r._id)}
                >
                  Mark Completed
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
