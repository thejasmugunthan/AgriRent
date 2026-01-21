import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <div className="nav-left" onClick={() => navigate("/")}>
        🚜 <span>AgriRent</span>
      </div>

      <div className="nav-middle">
        <button onClick={() => navigate("/browse-machines")}>Browse</button>
        <button onClick={() => navigate("/my-rentals")}>My Rentals</button>
        <button onClick={() => navigate("/price-predictor")}>Predict Price</button>
      </div>

      <div className="nav-right">
        <button onClick={() => navigate("/profile")} className="profile-btn">
          Profile
        </button>
        <button onClick={() => navigate("/welcome")} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
