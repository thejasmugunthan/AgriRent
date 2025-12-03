import React, { useState, useEffect } from "react";
import "../css/BrowseMachines.css";
import api from "../api";
import {
  FaHeart,
  FaRegHeart,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BrowseMachines() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");

  const [ratingFilter, setRatingFilter] = useState("all"); // ⭐ NEW

  const [filter, setFilter] = useState({
    location: "",
    type: "",
    availability: "",
    minPrice: "",
    maxPrice: "",
  });

  // 🔥 PINCODE → LOCATION MAP
  const PINCODE_MAP = {
    "560001": "Bangalore",
    "570001": "Mysuru",
    "571401": "Mandya",
    "573201": "Hassan",
  };

  // ✅ FETCH ALL MACHINES
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const { data } = await api.get("/machines");

        const mappedMachines = data.map((m) => ({
          id: m._id,
          name: m.name,
          type: m.type?.trim() || "Machine",
          rentPerHour: m.rentPerHour || 0,
          location: PINCODE_MAP[m.pincode] || "Unknown",
          available: m.available,
          image: m.image_url || "",
          averageRating: m.averageRating || 0,
          reviewsCount: m.ratings?.length || 0,
        }));

        setMachines(mappedMachines);
      } catch (err) {
        console.error("Error fetching machines:", err);
        setMachines([]);
      }
    };

    loadMachines();
  }, []);

  // ⭐ APPLY FILTERS + SORT + RATING FILTER
  const filteredMachines = machines
    .filter((m) =>
      (filter.location === "" || m.location === filter.location) &&
      (filter.type === "" ||
        m.type.toLowerCase().trim() === filter.type.toLowerCase().trim()) &&
      (filter.availability === "" ||
        (filter.availability === "Available" && m.available) ||
        (filter.availability === "Booked" && !m.available)) &&
      (filter.minPrice === "" || m.rentPerHour >= Number(filter.minPrice)) &&
      (filter.maxPrice === "" || m.rentPerHour <= Number(filter.maxPrice))
    )
    // ⭐ STAR FILTER (1–5 stars)
    .filter((m) => {
      if (ratingFilter === "all") return true;
      return m.averageRating >= Number(ratingFilter);
    })
    // ⭐ SORT BY PRICE
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.rentPerHour - b.rentPerHour
        : b.rentPerHour - a.rentPerHour
    );

  // ❤️ Favorite toggle
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="dashboard-container">
      
      {/* LEFT SIDEBAR */}
      <aside className="flat-sidebar">
        <div className="sidebar-top">
          <h2 className="sidebar-logo">🚜 AgriRent</h2>

          <nav className="sidebar-menu">
            <button className="nav-item" onClick={() => navigate("/renter-dashboard")}>
              About
            </button>

            <button className="nav-item active">Browse Machines</button>

            <button className="nav-item" onClick={() => navigate("/my-rentals")}>
              My Rentals
            </button>

            <button className="nav-item" onClick={() => navigate("/renter-analytics")}>
              Analytics
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

      {/* MAIN SECTION */}
      <main className="main-content">
        <section className="browse-section">
          <h1 className="page-title">Browse Machines 🚜</h1>
          <p className="machine-subtitle">
            Find the perfect agricultural machine for your work. Use filters below to refine results.
          </p>

          {/* FILTER SECTION */}
          <div className="filter-section">

            {/* LOCATION */}
            <select
              value={filter.location}
              onChange={(e) =>
                setFilter({ ...filter, location: e.target.value })
              }
            >
              <option value="">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mysuru">Mysuru</option>
              <option value="Mandya">Mandya</option>
              <option value="Hassan">Hassan</option>
            </select>

            {/* TYPE */}
            <select
              value={filter.type}
              onChange={(e) =>
                setFilter({ ...filter, type: e.target.value })
              }
            >
              <option value="">All Types</option>
              <option value="Tractor">Tractor</option>
              <option value="Harvester">Harvester</option>
              <option value="Rotavator">Rotavator</option>
              <option value="Tiller">Tiller</option>
              <option value="Cultivator">Cultivator</option>
            </select>

            {/* AVAILABILITY */}
            <select
              value={filter.availability}
              onChange={(e) =>
                setFilter({ ...filter, availability: e.target.value })
              }
            >
              <option value="">All Availability</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
            </select>

            {/* PRICE */}
            <input
              type="number"
              placeholder="Min ₹/hour"
              value={filter.minPrice}
              onChange={(e) =>
                setFilter({ ...filter, minPrice: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Max ₹/hour"
              value={filter.maxPrice}
              onChange={(e) =>
                setFilter({ ...filter, maxPrice: e.target.value })
              }
            />

            {/* ⭐ STAR FILTER */}
            <select
              className="rating-filter-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
              <option value="4">⭐⭐⭐⭐☆ (4+ stars)</option>
              <option value="3">⭐⭐⭐☆☆ (3+ stars)</option>
              <option value="2">⭐⭐☆☆☆ (2+ stars)</option>
              <option value="1">⭐☆☆☆☆ (1+ stars)</option>
            </select>

            {/* SORT BUTTON */}
            <button
              className="sort-btn"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? (
                <>
                  <FaSortAmountDown /> Sort: Low → High
                </>
              ) : (
                <>
                  <FaSortAmountUp /> Sort: High → Low
                </>
              )}
            </button>
          </div>

          {/* MACHINE GRID */}
          <div className="card-grid">
            {filteredMachines.length === 0 ? (
              <p className="empty">No machines found.</p>
            ) : (
              filteredMachines.map((m) => (
                <div className="summary-card" key={m.id}>

                  <div className="card-header">
                    <h3>{m.name}</h3>

                    <button className="fav-btn" onClick={() => toggleFavorite(m.id)}>
                      {favorites.includes(m.id) ? (
                        <FaHeart className="fav filled" />
                      ) : (
                        <FaRegHeart className="fav" />
                      )}
                    </button>
                  </div>

                  <p className="value">₹{m.rentPerHour}/hour</p>
                  <p className="location">📍 {m.location}</p>
                  <p className="type">🛠 {m.type}</p>

                  {/* ⭐ STAR RATING DISPLAY */}
                  <div className="rating-stars">
                    {"★".repeat(Math.round(m.averageRating))}
                    {"☆".repeat(5 - Math.round(m.averageRating))}
                    <span className="rating-number">({m.reviewsCount} reviews)</span>
                  </div>

                  <span
                    className={`status ${m.available ? "available" : "unavailable"}`}
                  >
                    {m.available ? "Available ✔" : "Booked ✖"}
                  </span>

                  <button
                    className="rent-btn"
                    disabled={!m.available}
                    onClick={() => navigate(`/rent-machine/${m.id}`)}
                  >
                    Rent Now
                  </button>

                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
