import React, { useState, useEffect } from "react";
import api from "../api";
import {
  FaHeart,
  FaRegHeart,
  FaSortAmountDown,
  FaSortAmountUp,
  FaTractor,
  FaMapMarkerAlt,
  FaFilter,
  FaStar,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function BrowseMachines() {
  const navigate = useNavigate();

  const [machines, setMachines] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");

  const [ratingFilter, setRatingFilter] = useState("all");

  const [filter, setFilter] = useState({
    location: "",
    type: "",
    availability: "",
    minPrice: "",
    maxPrice: "",
  });

  // 📌 PINCODE → LOCATION MAP
  const PINCODE_MAP = {
    "560001": "Bangalore",
    "570001": "Mysuru",
    "571401": "Mandya",
    "573201": "Hassan",
  };

  // ✅ FETCH ALL MACHINES SAFELY
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const { data } = await api.get("/machines");

        // SAFE FIX (VERY IMPORTANT)
        const machineArray = Array.isArray(data)
          ? data // backend returned raw array
          : data.machines || []; // backend returned { machines: [...] }

        const mappedMachines = machineArray.map((m) => ({
          id: m._id,
          name: m.name,
          type: m.type?.trim() || "Machine",
          rentPerHour: m.rentPerHour || 0,
          location: PINCODE_MAP[m.pincode] || "Unknown",
          available: m.available !== undefined ? m.available : true,
          image: m.image_url || "",
          averageRating: m.averageRating || 0,
          reviewsCount: Array.isArray(m.ratings) ? m.ratings.length : 0,
        }));

        setMachines(mappedMachines);
      } catch (err) {
        console.error("Error fetching machines:", err);
        setMachines([]);
      }
    };

    loadMachines();
  }, []);

  // ⭐ APPLY FILTERS + SORT + RATING
  const filteredMachines = machines
    .filter((m) => {
      return (
        (filter.location === "" || m.location === filter.location) &&
        (filter.type === "" ||
          m.type.toLowerCase().trim() ===
            filter.type.toLowerCase().trim()) &&
        (filter.availability === "" ||
          (filter.availability === "Available" && m.available) ||
          (filter.availability === "Booked" && !m.available)) &&
        (filter.minPrice === "" ||
          m.rentPerHour >= Number(filter.minPrice)) &&
        (filter.maxPrice === "" ||
          m.rentPerHour <= Number(filter.maxPrice))
      );
    })
    .filter((m) => {
      if (ratingFilter === "all") return true;
      return m.averageRating >= Number(ratingFilter);
    })
    .sort((a, b) =>
      sortOrder === "asc"
        ? a.rentPerHour - b.rentPerHour
        : b.rentPerHour - a.rentPerHour
    );

  // ❤️ FAVORITES
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
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
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/renter-dashboard")}
            >
              About
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium transition-colors">
              <FaTractor /> Browse Machines
            </button>

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/my-rentals")}
            >
              My Rentals
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Machines 🚜</h1>
            <p className="text-gray-600">
              Find the perfect agricultural machine for your work. Use filters below to refine results.
            </p>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
              <FaFilter /> Filters & Sorting
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">

              {/* Location Filter */}
              <select
                value={filter.location}
                onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">All Locations</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Mandya">Mandya</option>
                <option value="Hassan">Hassan</option>
              </select>

              {/* Type Filter */}
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">All Types</option>
                <option value="Tractor">Tractor</option>
                <option value="Harvester">Harvester</option>
                <option value="Rotavator">Rotavator</option>
                <option value="Tiller">Tiller</option>
                <option value="Cultivator">Cultivator</option>
              </select>

              {/* Availability Filter */}
              <select
                value={filter.availability}
                onChange={(e) => setFilter({ ...filter, availability: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">All Availability</option>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
              </select>

              {/* Min Price */}
              <input
                type="number"
                placeholder="Min ₹/hour"
                value={filter.minPrice}
                onChange={(e) => setFilter({ ...filter, minPrice: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />

              {/* Max Price */}
              <input
                type="number"
                placeholder="Max ₹/hour"
                value={filter.maxPrice}
                onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
                <option value="1">1+ stars</option>
              </select>
            </div>

            {/* Sort Button */}
            <div className="mt-4">
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                {sortOrder === "asc" ? (
                  <>
                    <FaSortAmountDown /> Price: Low → High
                  </>
                ) : (
                  <>
                    <FaSortAmountUp /> Price: High → Low
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Machine Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMachines.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FaTractor className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No machines found matching your criteria</p>
              </div>
            ) : (
              filteredMachines.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Machine Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    {m.image ? (
                      <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaTractor className="text-6xl text-green-600" />
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(m.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      {favorites.includes(m.id) ? (
                        <FaHeart className="text-red-500 text-xl" />
                      ) : (
                        <FaRegHeart className="text-gray-600 text-xl" />
                      )}
                    </button>

                    {/* Availability Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          m.available
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {m.available ? "Available" : "Booked"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{m.name}</h3>

                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-green-600">₹{m.rentPerHour}</span>
                      <span className="text-gray-600">/hour</span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="text-green-600" />
                        <span>{m.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaTractor className="text-green-600" />
                        <span>{m.type}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`${
                                i < Math.round(m.averageRating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({m.reviewsCount} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Rent Button */}
                    <button
                      disabled={!m.available}
                      onClick={() => navigate(`/rent-machine/${m.id}`)}
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        m.available
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {m.available ? "Rent Now" : "Not Available"}
                    </button>
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
