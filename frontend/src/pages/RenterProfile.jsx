import React, { useEffect, useState } from "react";
import "../css/RenterProfile.css";
import api from "../api";

export default function RenterProfile() {
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    totalSpent: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/auth/profile/${userId}`);
      setUser(res.data.user);
      setPhotoPreview(res.data.user.photo);
    } catch (err) {
      console.error("Failed to load renter profile:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get(`/rentals/my/${userId}`);
      const list = res.data.rentals || [];

      const totalSpent = list.reduce(
        (sum, r) => sum + Number(r.totalPrice || 0),
        0
      );

      setStats({
        totalRentals: list.length,
        activeRentals: list.filter((r) => r.status === "active").length,
        totalSpent,
      });
    } catch (err) {
      console.error("Failed to load rental stats", err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("photo", file);

    try {
      const res = await api.post("/upload/profile", form);
      setPhotoPreview(res.data.fileUrl);

      await api.put(`/auth/profile/${userId}`, {
        photo: res.data.fileUrl,
      });

      loadProfile();
    } catch (err) {
      console.error("Photo upload failed:", err);
    }
  };

  const updateField = (key, value) => {
    setUser((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put(`/auth/profile/${userId}`, user);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile save error:", err);
      alert("Failed to save profile");
    }
    setSaving(false);
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container fade-in">

      {/* ------------------- HEADER ------------------- */}
      <div className="profile-header">
        <div className="avatar-section">
          <img
            src={photoPreview || "/default-avatar.png"}
            className="profile-avatar"
            alt="Profile"
          />

          <label className="upload-btn">
            Upload Photo
            <input type="file" onChange={handlePhotoUpload} hidden />
          </label>
        </div>

        <div className="header-text">
          <h1>{user.name}</h1>
          <p className="role">Renter</p>
        </div>
      </div>

      {/* ------------------- STATS ------------------- */}
      <div className="profile-stats">
        <div className="stat-card">
          <h3>Total Rentals</h3>
          <p>{stats.totalRentals}</p>
        </div>

        <div className="stat-card">
          <h3>Active Rentals</h3>
          <p>{stats.activeRentals}</p>
        </div>

        <div className="stat-card">
          <h3>Total Spent</h3>
          <p>₹ {stats.totalSpent}</p>
        </div>
      </div>

      {/* ------------------- PROFILE FORM ------------------- */}
      <div className="profile-form">
        <label>Name</label>
        <input
          value={user.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
        />

        <label>Email</label>
        <input value={user.email} disabled />

        <label>Phone</label>
        <input
          value={user.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
        />

        <label>Address</label>
        <input
          value={user.address || ""}
          onChange={(e) => updateField("address", e.target.value)}
        />

        <label>Pincode</label>
        <input
          value={user.pincode || ""}
          onChange={(e) => updateField("pincode", e.target.value)}
        />

        <label>District</label>
        <input
          value={user.district || ""}
          onChange={(e) => updateField("district", e.target.value)}
        />

        <label>State</label>
        <input
          value={user.state || ""}
          onChange={(e) => updateField("state", e.target.value)}
        />

        <button className="save-btn" onClick={saveProfile} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
