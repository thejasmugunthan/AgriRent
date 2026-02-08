import React, { useState, useEffect } from "react";
import api from "../api";
import "../css/BrowseMachines.css";
import {
  FaSortAmountDown,
  FaSortAmountUp,
  FaTractor,
  FaMapMarkerAlt,
  FaFilter,
  FaStar,
  FaSearch,
  FaCalculator,
  FaHome,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BrowseMachines() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [fromPincode, setFromPincode] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  const [filter, setFilter] = useState({
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  const detectPincodeFromGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await res.json();
          if (data?.address?.postcode) {
            setFromPincode(data.address.postcode);
          } else {
            alert("Pincode not found");
          }
        } catch (err) {
          alert("Failed to detect pincode");
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        alert("Location permission denied");
        setGpsLoading(false);
      }
    );
  };

  useEffect(() => {
    const loadMachines = async () => {
      try {
        const res = await api.get("/machines");
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.machines || [];

        setMachines(
          list.map((m) => ({
            id: m._id,
            name: m.name,
            type: m.type,
            rentPerHour: m.rentPerHour || 0,
            pincode: m.pincode,
            available: m.available !== false,
            image: m.image_url || "",
            averageRating: m.averageRating || 0,
            reviewsCount: m.ratings?.length || 0,
          }))
        );
      } catch (err) {
        console.error("Machine fetch error:", err);
      }
    };

    loadMachines();
  }, []);

  const filteredMachines = machines
    .filter((m) => {
      if (fromPincode && m.pincode !== fromPincode) return false;
      if (filter.type && m.type !== filter.type) return false;
      if (filter.minPrice && m.rentPerHour < Number(filter.minPrice))
        return false;
      if (filter.maxPrice && m.rentPerHour > Number(filter.maxPrice))
        return false;
      return true;
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.rentPerHour - b.rentPerHour
        : b.rentPerHour - a.rentPerHour
    );

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

          <div className="p-4 border-t space-y-2">
            <button className="sidebar-btn" onClick={() => navigate("/profile")}>
              <FaUserCircle /> Profile
            </button>
            <button
              className="sidebar-btn text-red-600"
              onClick={() => navigate("/welcome")}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold mb-6">Browse Machines 🚜</h1>

          {/* FILTERS */}
          <div className="filter-card mb-8">
            <h2 className="flex items-center gap-2 font-bold mb-4">
              <FaFilter /> Filters
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <input
                className="input"
                placeholder="From Pincode"
                maxLength={6}
                value={fromPincode}
                onChange={(e) => setFromPincode(e.target.value)}
              />

              <button className="gps-btn" onClick={detectPincodeFromGPS}>
                📍 {gpsLoading ? "Detecting..." : "Use My Location"}
              </button>

              <select
                className="input"
                onChange={(e) =>
                  setFilter({ ...filter, type: e.target.value })
                }
              >
                <option value="">All Types</option>
                <option value="Tractor">Tractor</option>
                <option value="Harvester">Harvester</option>
              </select>

              <button
                className="sort-btn"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
              >
                {sortOrder === "asc" ? (
                  <FaSortAmountDown />
                ) : (
                  <FaSortAmountUp />
                )}
                Sort Price
              </button>
            </div>
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMachines.map((m) => (
              <div key={m.id} className="machine-card">
                <div className="machine-image">
                  {m.image ? (
                    <img src={m.image} alt={m.name} />
                  ) : (
                    <FaTractor className="text-6xl text-green-600" />
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-xl font-bold text-gray-800">{m.name}</h3>

                  {/* Rating */}
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        color={
                          i < Math.round(m.averageRating)
                            ? "#facc15"
                            : "#e5e7eb"
                        }
                      />
                    ))}
                    <span className="text-gray-500 text-sm">
                      ({m.reviewsCount})
                    </span>
                  </div>

                  {/* Price */}
                  <p className="machine-price">₹{m.rentPerHour}/hr</p>

                  {/* Location */}
                  <p className="flex items-center gap-2 text-gray-600 text-sm">
                    <FaMapMarkerAlt /> {m.pincode}
                  </p>

                  {/* Action */}
                  <button
                    disabled={!m.available}
                    onClick={() => navigate(`/rent-machine/${m.id}`)}
                    className={`rent-btn ${
                      m.available ? "available" : "disabled"
                    }`}
                  >
                    {m.available ? "Rent Now" : "Not Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
