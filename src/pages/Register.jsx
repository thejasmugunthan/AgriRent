import React, { useState } from "react";
import "../css/Register.css";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import api from '../api';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
    role: "renter",
    photo: null,
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = { ...formData };
    const { data } = await api.post('/auth/register', payload);
    alert("✅ Registration successful!");
    navigate("/login");
  } catch (err) {
    alert(err?.response?.data?.message || "Registration failed");
  }
};


  return (
    
    <div className="register-page">
      <div className="register-card">
        <h2>🌾 Create Your AgriRent Account</h2>
        <p className="subtitle">
          Join AgriRent today to rent or list machines for farming efficiently.
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="profile-upload">
            <label htmlFor="photo" className="photo-label">
              {preview ? (
                <img src={preview} alt="Profile Preview" className="photo-preview" />
              ) : (
                <FaCamera className="camera-icon" />
              )}
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <p>Upload Profile Photo</p>
          </div>

          <div className="input-group">
            <FaUser />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaPhone />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaMapMarkerAlt />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="role-select">
            <label>
              <input
                type="radio"
                name="role"
                value="renter"
                checked={formData.role === "renter"}
                onChange={handleChange}
              />
              Renter (Looking to rent machines)
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="owner"
                checked={formData.role === "owner"}
                onChange={handleChange}
              />
              Machine Owner (List your machines)
            </label>
          </div>

          <button type="submit" className="register-btn">
            Register Now 🚜
          </button>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}
