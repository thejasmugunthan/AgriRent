import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Welcome.css";
import bg from "../assets/tractor-bg.jpg";
import trac from "../assets/01.png";
import harv from "../assets/02.png";
import spry from "../assets/03.png";
import plough from "../assets/04.png";


const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome" style={{ backgroundImage: `url(${bg})` }}>
      <div className="welcome__overlay" />

      {/*NAVBAR SECTION */}
      <nav className="navbar">
        <div className="navbar__container">
          <div className="navbar__brand" onClick={() => navigate("/")}>
            🚜 <span>AgriRent</span>
          </div>

        

          <div className="navbar__actions">
            <button
              className="nav-btn nav-btn--outline"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
            <button
              className="nav-btn nav-btn--filled"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </nav>
      <hr  />
      <hr />

      {/*HERO SECTION */}
      <div className="welcome__container">
        <h1 className="welcome__title">AgriRent 🚜</h1>
        <p className="welcome__tagline">
          The smarter way for <span>farmers</span> to rent machines and for{" "}
          <em>owners</em> to earn income.  
          <br />
          Your trusted partner in simplifying agricultural equipment rentals.
        </p>

        <div className="welcome__actions">
          <button
            className="btn btn--owner"
            onClick={() => navigate("/owner-dashboard")}
          >
            🌿 I’m a Machine Owner
          </button>
          <button
            className="btn btn--renter"
            onClick={() => navigate("/renter-dashboard")}
          >
            🌾 I’m a Farmer / Renter
          </button>
        </div>

        {/* HOW IT WORKS */}
        <section className="howitworks">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="icon">🧑‍🌾</div>
              <h3>1. Sign Up</h3>
              <p>
                Create your free account as a <strong>Farmer</strong> or{" "}
                <strong>Machine Owner</strong> in just a few clicks.
              </p>
            </div>
            <div className="step">
              <div className="icon">🚜</div>
              <h3>2. Add or Find Machines</h3>
              <p>
                Owners can list tractors, harvesters, or other equipment, while
                farmers can browse and book instantly.
              </p>
            </div>
            <div className="step">
              <div className="icon">💳</div>
              <h3>3. Book & Pay Securely</h3>
              <p>
                Book by date, confirm availability, and make safe payments using
                your preferred method.
              </p>
            </div>
            <div className="step">
              <div className="icon">🌱</div>
              <h3>4. Farm Smarter</h3>
              <p>
                Save costs, increase yield, and contribute to sustainable farming
                with shared resources.
              </p>
            </div>
          </div>
        </section>

        
          <section className="machines">
            <h2>Popular Machines Available</h2>
            <div className="machine__grid">
              <div className="machine__card">
                <img src={trac} alt="A compact tractor designed for various agricultural tasks, set against a backdrop of a green field." />
                <h3>Tractors</h3>
                <p>From compact to heavy-duty — perfect for every type of land.</p>
              </div>
              <div className="machine__card">
                <img src={harv} alt="A modern harvester in action, efficiently collecting crops in a golden field under a clear blue sky." />
                <h3>Harvesters</h3>
                <p>Modern harvesters for faster and efficient crop collection.</p>
              </div>
              <div className="machine__card">
                <img src={spry} alt="A high-capacity crop sprayer operating in a lush green field, ensuring healthy crops." />
                <h3>Crop Sprayers</h3>
                <p>High-capacity sprayers to ensure your fields stay healthy.</p>
              </div>
              <div className="machine__card">
                <img src={plough} alt="A durable plough being used in a freshly tilled field, preparing the soil for planting." />
                <h3>Ploughs</h3>
                <p>Durable ploughs for soil preparation and better yield.</p>
              </div>
            </div>
          </section>
{/* WHY CHOOSE AGRIRENT */}
<section className="why">
  <h2 className="why__title">Why Choose AgriRent?</h2>

  <div className="why__grid">
    <div className="why__card">
      <span className="why__icon">🌱</span>
      <h3>For Farmers</h3>
      <p>
        Get machines on-demand near you, reduce expenses, and save valuable
        time during peak farming seasons.
      </p>
    </div>

    <div className="why__card">
      <span className="why__icon">💰</span>
      <h3>For Owners</h3>
      <p>
        Earn steady income by renting idle agricultural equipment safely
        to verified users.
      </p>
    </div>

      <div className="why__card">
        <span className="why__icon">⚙️</span>
        <h3>Smart Management</h3>
        <p>
          Track bookings, payments, analytics, and machine status
          all from one powerful dashboard.
        </p>
      </div>

      <div className="why__card">
        <span className="why__icon">🌍</span>
        <h3>Sustainable Growth</h3>
        <p>
          Promote resource sharing, reduce carbon footprint,
          and empower local farming communities.
        </p>
      </div>
    </div>
  </section>


        {/* FOOTER */}
        <footer className="footer">
          <div className="footer__content">
            <h3>Contact Us</h3>
            <p>📧 support@agrirent.com | ☎️ +91 98765 43210</p>
            <div className="socials">
              <a href="#">🌐</a>
              <a href="#">📘</a>
              <a href="#">🐦</a>
              <a href="#">📸</a>
            </div>
          </div>
          <p className="welcome__footer">
            © {new Date().getFullYear()} AgriRent • Empowering Agriculture Together 🌿
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
