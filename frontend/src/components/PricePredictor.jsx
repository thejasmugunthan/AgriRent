import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getWeatherByPincode } from "../api/weatherApi";
import { getCropInfo } from "../api/cropLogic";
import "../css/PricePredictor.css";
import {
  FaArrowLeft,
  FaTractor,
  FaCloudSun,
  FaSeedling,
  FaRupeeSign,
  FaCalculator,
  FaMapMarkerAlt,
  FaClock,
  FaInfoCircle
} from "react-icons/fa";
import "../css/PricePredictor.css";

const API = "http://127.0.0.1:8000";

export default function PricePredictor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    machine_type: "",
    season: "Monsoon",
    crop_type: "Rice",
    pincode: "",
    duration_hours: 1,
  });

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [demandIndex, setDemandIndex] = useState(null);
  const [weather, setWeather] = useState(null);
  const [cropInfo, setCropInfo] = useState(null);
  const [error, setError] = useState(null);

  const machineTypes = ["Tractor", "Harvester", "Pump", "Trailer", "Sprayer", "Weeder"];
  const seasons = ["Summer", "Monsoon", "Winter", "Harvest"];
  const crops = ["Rice", "Wheat", "Sugarcane", "Maize", "Cotton", "Vegetables"];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handlePredict = async (e) => {
    e.preventDefault();
    setError(null);
    setPrice(null);
    setWeather(null);
    setCropInfo(null);
    setDemandIndex(null);

    if (!form.machine_type || !form.pincode) {
      setError("Please select machine type and enter pincode.");
      return;
    }

    setLoading(true);
    try {
      const w = await getWeatherByPincode(form.pincode);
      setWeather(w);

      const crop = getCropInfo(form.crop_type, form.season);
      setCropInfo(crop);

      const demand_index = Number(
        (0.7 * crop.demandMultiplier + 0.3).toFixed(2)
      );
      setDemandIndex(demand_index);

      let endpoint = "";
      let payload = { pincode: Number(form.pincode) };

      switch (form.machine_type) {
        case "Tractor":
          endpoint = "/predict/tractor";
          payload = {
            horsepower: 50,
            attachment_type: "Rotavator",
            age_years: 3,
            hours_used: form.duration_hours * 8,
            maintenance_cost: 4000,
            pincode: Number(form.pincode),
          };
          break;

        case "Harvester":
          endpoint = "/predict/harvester";
          payload = {
            harvester_type: "Combine",
            crop_type: form.crop_type,
            age_years: 3,
            pincode: Number(form.pincode),
          };
          break;

        case "Pump":
          endpoint = "/predict/pump";
          payload = {
            pump_type: "diesel",
            capacity_hp: 5,
            pincode: Number(form.pincode),
          };
          break;

        case "Trailer":
          endpoint = "/predict/trailer";
          payload = {
            trailer_type: "Single Axle",
            load_type: "Grain",
            pincode: Number(form.pincode),
          };
          break;

        case "Sprayer":
          endpoint = "/predict/sprayer";
          payload = {
            sprayer_type: "Power",
            tank_capacity: 400,
            age_years: 2,
            pincode: Number(form.pincode),
          };
          break;

        case "Weeder":
          endpoint = "/predict/weeder";
          payload = {
            weeder_type: "Mini",
            horsepower: 8,
            age_years: 2,
            pincode: Number(form.pincode),
          };
          break;

        default:
          throw new Error("Unsupported machine type");
      }

      const res = await axios.post(`${API}${endpoint}`, payload);
      setPrice(res.data.final_price);

    } catch (err) {
      console.error(err);
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="predictor-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="header-card">
        <FaCalculator />
        <div>
          <h1>Smart Price Predictor</h1>
          <p>AI-powered agricultural machinery rental pricing</p>
        </div>
      </div>

      <div className="layout">
        {/* FORM */}
        <form className="form-card" onSubmit={handlePredict}>
          <h2><FaTractor /> Enter Details</h2>

          <select name="machine_type" value={form.machine_type} onChange={handleChange}>
            <option value="">Select Machine</option>
            {machineTypes.map(m => <option key={m}>{m}</option>)}
          </select>

          <input type="number" name="duration_hours" value={form.duration_hours} onChange={handleChange} />
          <select name="season" value={form.season} onChange={handleChange}>
            {seasons.map(s => <option key={s}>{s}</option>)}
          </select>

          <select name="crop_type" value={form.crop_type} onChange={handleChange}>
            {crops.map(c => <option key={c}>{c}</option>)}
          </select>

          <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" />

          <button type="submit">{loading ? "Predicting..." : "Predict Price"}</button>
        </form>

        {/* RESULT */}
        <div className="result-area">
          {price && (
            <div className="price-card">
              <FaRupeeSign />
              <span>₹ {price.toFixed(2)}</span>
              <small>Estimated rental price</small>
            </div>
          )}

          {(weather || cropInfo) && (
            <div className="explain-card">
              <h3><FaInfoCircle /> Why this price?</h3>
              <ul>
                <li>Machine type <b>{form.machine_type}</b> determines base cost</li>
                <li>Season <b>{form.season}</b> affects demand</li>
                <li>Crop <b>{form.crop_type}</b> influences urgency</li>
                <li>Location demand estimated via pincode <b>{form.pincode}</b></li>

                {weather && (
                  <>
                    <li>Temperature: {weather.temp}°C</li>
                    <li>Rainfall: {weather.rain} mm</li>
                    <li>Humidity: {weather.humidity}%</li>
                  </>
                )}

                {demandIndex && (
                  <li>Final demand index: <b>{demandIndex}</b></li>
                )}
              </ul>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}
        </div>
      </div>
    </div>
  );
}
