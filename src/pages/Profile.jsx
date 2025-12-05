import React, { useEffect, useState } from "react";
import api from "../api";
import "../css/Profile.css";

export default function Profile() {
  const userId = localStorage.getItem("userId");

  const [user, setUser] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    machines: 0,
    earnings: 0,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/auth/profile/${userId}`);
      setUser(res.data.user);
      setPhotoPreview(res.data.user.photo);
    } catch {
      setError("Failed to load profile");
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get(`/rentals/owner/${userId}/earnings`);
      setStats({
        machines: res.data.completedRentals.length || 0,
        earnings: res.data.totalEarnings || 0,
      });
    } catch {}
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("photo", file);

    const res = await api.post("/upload/profile", form);
    setPhotoPreview(res.data.fileUrl);

    await api.put(`/auth/profile/${userId}`, {
      photo: res.data.fileUrl,
    });

    loadProfile();
  };

  const updateField = (key, value) => {
    setUser((u) => ({ ...u, [key]: value }));
  };

  const saveProfile = async () => {
    await api.put(`/auth/profile/${userId}`, user);
    alert("Profile updated successfully!");
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container fade-in">
      <div className="profile-header">
        <div className="avatar-wrap">
          <img
            src={photoPreview || "/default-avatar.png"}
            className="avatar"
            alt="Profile"
          />

          <label className="upload-btn">
            Upload Photo
            <input type="file" onChange={handlePhotoUpload} hidden />
          </label>
        </div>

        <div className="profile-role">{user.role?.toUpperCase()}</div>
      </div>

      {error && <p className="error-box">{error}</p>}

      {/* Stats Box */}


      {/* Form */}
      <div className="profile-form">
        <label>Name</label>
        <input value={user.name} onChange={(e) => updateField("name", e.target.value)} />

        <label>Email (read only)</label>
        <input value={user.email} disabled />

        <label>Phone</label>
        <input value={user.phone || ""} onChange={(e) => updateField("phone", e.target.value)} />

        <label>Address</label>
        <input value={user.address || ""} onChange={(e) => updateField("address", e.target.value)} />

        <label>Pincode</label>
        <input value={user.pincode || ""} onChange={(e) => updateField("pincode", e.target.value)} />

        <label>District</label>
        <input value={user.district || ""} onChange={(e) => updateField("district", e.target.value)} />

        <label>State</label>
        <input value={user.state || ""} onChange={(e) => updateField("state", e.target.value)} />

        <button className="save-btn" onClick={saveProfile}>
          Save Profile
        </button>
      </div>
    </div>
  );
}
