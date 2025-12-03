import React, { useState } from "react";
import "../css/Profile.css";
import defaultAvatar from "../assets/default-avatar.png";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "Ramesh Gowda",
    email: "rameshgowda@gmail.com",
    phone: "+91 9876543210",
    address: "Mysuru, Karnataka",
    farm: "GreenField Rentals",
    experience: "5 Years",
    photo: defaultAvatar,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfile({ ...profile, photo: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-container">
      <h1>My Profile 👨‍🌾</h1>
      <p className="sub">Manage and update your profile information below.</p>

      <div className="profile-card">
        <div className="profile-photo-section">
          <img src={profile.photo} alt="Profile" className="profile-photo" />
          {isEditing && (
            <label className="upload-btn">
              Change Photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
            </label>
          )}
        </div>

        <div className="profile-details">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone:</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={profile.address}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Farm / Company Name:</label>
            <input
              type="text"
              name="farm"
              value={profile.farm}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Experience:</label>
            <input
              type="text"
              name="experience"
              value={profile.experience}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="profile-actions">
        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
