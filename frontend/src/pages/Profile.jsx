import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  FaTractor,
  FaTachometerAlt,
  FaMoneyBillWave,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaSearch,
  FaCalculator,
  FaCamera,
  FaSave,
  FaPlus,
  FaHome,
} from "react-icons/fa";

export default function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/auth/profile/${userId}`);
      const u = res.data.user;

      setUser(u);
      setPhotoPreview(
        u.photo ? `http://localhost:5000${u.photo}` : null
      );
    } catch {
      setError("Failed to load profile");
    }
  };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const form = new FormData();
      form.append("photo", file);
      form.append("userId", userId);

      const res = await api.post("/upload/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const fileUrl = `http://localhost:5000${res.data.fileUrl}`;

        setPhotoPreview(fileUrl);
        await api.put(`/auth/profile/${userId}`, {
          photo: res.data.fileUrl,
        });

        loadProfile();
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Photo upload failed!");
    }
  };

  const updateField = (key, value) => {
    setUser((u) => ({ ...u, [key]: value }));
  };

  const saveProfile = async () => {
    await api.put(`/auth/profile/${userId}`, user);
    alert("Profile updated successfully!");
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/welcome";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const isOwner = user.role === "owner";

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
              {isOwner ? (
                <>
                  <button onClick={() => navigate("/owner-dashboard")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaTachometerAlt /> Dashboard
                  </button>
                  <button onClick={() => navigate("/my-machines")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaTractor /> My Machines
                  </button>
                  <button onClick={() => navigate("/add-machine")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaPlus /> Add Machine
                  </button>
                  <button onClick={() => navigate("/earnings")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaMoneyBillWave /> Earnings
                  </button>
                  <button onClick={() => navigate("/analytics")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaChartLine /> Analytics
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate("/renter-dashboard")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaHome /> About
                  </button>
                  <button onClick={() => navigate("/browse-machines")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaSearch /> Browse Machines
                  </button>
                  <button onClick={() => navigate("/price-predictor")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaCalculator /> Price Predictor
                  </button>
                  <button onClick={() => navigate("/my-rentals")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaTractor /> My Rentals
                  </button>
                  <button onClick={() => navigate("/renter-analytics")} className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <FaChartLine /> Analytics
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="p-4 space-y-2 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium transition-colors">
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
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your account settings and personal information</p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">

              {/* Profile Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8">
                <div className="flex items-center gap-6">

                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg">

                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-8xl text-gray-400" />
                      )}
                    </div>

                    {/* Upload Button */}
                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-colors">
                      <FaCamera />
                      <input
                        type="file"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-2">{user.name}</h2>
                    <p className="text-green-100 text-lg capitalize">{user.role}</p>
                  </div>

                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Profile Form */}
              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      value={user.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      value={user.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input
                      value={user.pincode || ""}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                    <input
                      value={user.district || ""}
                      onChange={(e) => updateField("district", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      value={user.state || ""}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={user.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveProfile}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaSave /> Save Profile
                </button>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
