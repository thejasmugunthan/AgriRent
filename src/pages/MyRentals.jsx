// src/pages/MyRentals.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/MyRentals.css";
import { useNavigate } from "react-router-dom";

export default function MyRentals() {
  const renterId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  /* ============================================================
     LOAD RENTALS FOR RENTER
  ============================================================ */
  useEffect(() => {
    if (!renterId) return;

    api
      .get(`/rentals/my/${renterId}`)
      .then((res) => {
        setRentals(res.data.rentals || []);
      })
      .catch((err) => console.error("Load rentals error:", err));
  }, [renterId]);

  /* ============================================================
     FILTER RENTALS BY STATUS TAB
  ============================================================ */
  const filteredRentals = rentals.filter((r) => r.status === activeTab);

  /* ============================================================
     CHAT HANDLER — Only allowed when owner has ACCEPTED
  ============================================================ */
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

  return (
    <div className="rentals-container">
      <h1 className="rentals-title">📦 My Rentals</h1>

      {/* Tabs */}
      <div className="rentals-tabs">
        <button
          className={activeTab === "pending" ? "tab active" : "tab"}
          onClick={() => setActiveTab("pending")}
        >
          Pending ⏳
        </button>

        <button
          className={activeTab === "active" ? "tab active" : "tab"}
          onClick={() => setActiveTab("active")}
        >
          Active
        </button>

        <button
          className={activeTab === "completed" ? "tab active" : "tab"}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>

        <button
          className={activeTab === "cancelled" ? "tab active" : "tab"}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {/* Rentals */}
      <div className="rentals-list">
        {filteredRentals.length === 0 ? (
          <p className="empty-text">No rentals in this section.</p>
        ) : (
          filteredRentals.map((r) => (
            <div key={r._id} className="rental-card">
              {/* Left side */}
              <div className="rental-info">
                <div className="machine-header">
                  {r.machineId?.image_url && (
                    <img
                      src={r.machineId.image_url}
                      alt={r.machineId.name}
                      className="machine-thumb"
                    />
                  )}

                  <div>
                    <h3>{r.machineId?.name || "Machine"}</h3>
                    {r.machineId?.type && (
                      <p className="machine-type">{r.machineId.type}</p>
                    )}
                  </div>
                </div>

                <p>
                  <b>Owner:</b>{" "}
                  {r.status === "pending"
                    ? "Waiting..."
                    : r.ownerId?.name || "Unknown"}
                </p>

                {r.status !== "pending" && r.ownerId?.phone && (
                  <p>
                    <b>Phone:</b> {r.ownerId.phone}
                  </p>
                )}

                <p>
                  <b>Start:</b>{" "}
                  {new Date(r.startTime).toLocaleDateString()}
                </p>

                <p>
                  <b>End:</b>{" "}
                  {new Date(r.endTime).toLocaleDateString()}
                </p>

                <p>
                  <b>Total Price:</b> ₹{r.totalPrice}
                </p>
              </div>

              {/* Right: buttons */}
              <div className="rental-actions">

                {/* Chat */}
                <button className="btn chat-btn" onClick={() => handleChat(r)}>
                  Chat
                </button>

                {/* View Machine */}
                <button
                  className="btn details-btn"
                  onClick={() =>
                    navigate(`/machine/${r.machineId?._id}`)
                  }
                >
                  View Machine
                </button>

                {/* Cancel Rental */}
                {(r.status === "active" || r.status === "pending") && (
                  <button
                    className="btn cancel-btn"
                    onClick={async () => {
                      if (!window.confirm("Cancel this rental?")) return;
                      try {
                        await api.patch(`/rentals/${r._id}/cancel`);
                        alert("Rental cancelled.");
                        window.location.reload();
                      } catch (err) {
                        alert("Cancel failed");
                        console.error(err);
                      }
                    }}
                  >
                    Cancel Rental
                  </button>
                )}

                {/* Extend Rental */}
                {r.status === "active" && (
                  <button
                    className="btn extend-btn"
                    onClick={async () => {
                      const extraDays = prompt("How many extra days?");
                      if (!extraDays || isNaN(extraDays))
                        return alert("Invalid number");

                      const dailyRate = r.machineId?.rentPerHour || 0;

                      try {
                        await api.patch(`/rentals/${r._id}/extend`, {
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
                  >
                    Extend Rental
                  </button>
                )}

                {/* Rate Rental */}
                {r.status === "completed" && (
                  <button
                    className="btn rate-btn"
                    onClick={() =>
                      navigate(
                        `/rate-machine/${r.machineId?._id}?rentalId=${r._id}`
                      )
                    }
                  >
                    ⭐ Rate Machine
                  </button>
                )}

                {/* Status */}
                <span className={`status-badge ${r.status}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
