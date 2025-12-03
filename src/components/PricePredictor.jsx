// src/pages/PricePredictor.jsx
import React, { useState } from "react";
import "../css/PricePredictor.css";
import { getWeatherByPincode } from "../api/weatherApi";
import { getCropInfo } from "../api/cropLogic";

export default function PricePredictor() {
  const [form, setForm] = useState({
    machine_type: "",
    season: "Monsoon",
    crop_type: "Rice",
    pincode: "",
    duration_days: 1,
  });

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [weather, setWeather] = useState(null);
  const [cropInfo, setCropInfo] = useState(null);
  const [error, setError] = useState(null);

  const machineTypes = [
    "Tractor",
    "Harvester",
    "Rotavator",
    "Cultivator",
    "Sprayer",
    "Plough",
  ];

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

    if (!form.pincode || !form.machine_type) {
      setError("Please select machine type and enter pincode.");
      return;
    }

    setLoading(true);
    try {
      // 1) fetch weather
      const w = await getWeatherByPincode(form.pincode);
      setWeather(w);

      // 2) get crop intelligence
      const crop = getCropInfo(form.crop_type, form.season);
      setCropInfo(crop);

      // 3) compute demand_index combining crop + weather + simple heuristics
      // base demand (0.6 - 1.2)
      const weatherDemand = (() => {
        // heavy rain or high temp influences demand:
        if (!w.ok && w.error) return 0.85;
        const t = w.temp;
        const r = w.rain;
        let wav = 1.0;
        if (r > 10) wav += 0.08;         // rain increases some machine demand (plough/harvesters)
        if (t > 35) wav -= 0.06;        // extreme heat reduces certain operations
        if (w.humidity > 80) wav += 0.03;
        return Number(wav.toFixed(2));
      })();

      const demand_index = Number(
        (0.7 * crop.demandMultiplier + 0.3 * weatherDemand).toFixed(2)
      );

      // 4) generate ML payload
      const payload = {
        pincode: form.pincode,
        machine_type: form.machine_type.toUpperCase(),
        horsepower: 50, // renter doesn't know HP; use a median default or you can add selection
        hours_used: 0,
        age_years: 3,
        maintenance_cost: 300,
        fuel_price: 95,
        duration_days: Number(form.duration_days) || 1,
        advance_days: 0,
        weekend: 0,
        hours_per_day: 8,
        created_at: new Date().toISOString(),
        bookings_7d: 2,
        cancellations_7d: 0,
        stock_on_hand: 10,
        // auto fields
        demand_index,
        weather_temp: w.temp,
        weather_humidity: w.humidity,
        weather_wind: w.wind,
        weather_rain: w.rain,
        crop_type: form.crop_type,
        season: form.season,
      };

      // 5) POST to your backend predict endpoint
      const resp = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!data.success) {
        setError(data.message || data.error || "Prediction failed");
      } else {
        // backend returns { success:true, price, ... }
        setPrice(data.price);
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error while predicting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-container">
      <h2 className="pp-title">Smart Machine Rental Price Predictor</h2>

      <form className="pp-form" onSubmit={handlePredict}>
        <div className="pp-field">
          <label>Machine Type</label>
          <select name="machine_type" onChange={handleChange} required>
            <option value="">Select machine</option>
            {machineTypes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="pp-field">
          <label>Season</label>
          <select name="season" onChange={handleChange} value={form.season}>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="pp-field">
          <label>Crop Type</label>
          <select name="crop_type" onChange={handleChange} value={form.crop_type}>
            {crops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="pp-field">
          <label>Pincode (Location)</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="560001" />
        </div>

        <div className="pp-field">
          <label>Duration (days)</label>
          <input type="number" name="duration_days" value={form.duration_days} onChange={handleChange} min="1" />
        </div>

        <button className="pp-btn" type="submit" disabled={loading}>
          {loading ? "Predicting..." : "🔮 Predict Price"}
        </button>
      </form>

      {/* Weather + Crop Info card */}
      {weather && (
        <div className="pp-result" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ margin: 0, color: "#2b2b2b", fontWeight: 700 }}>Weather @ {form.pincode}</p>
              <div style={{ color: "#3b3b3b" }}>
                <div>Temp: {weather.temp} °C</div>
                <div>Humidity: {weather.humidity} %</div>
                <div>Rain (mm): {weather.rain}</div>
                <div>Condition: {weather.condition}</div>
              </div>
            </div>

            <div>
              <p style={{ margin: 0, color: "#2b2b2b", fontWeight: 700 }}>Crop Insights</p>
              <div style={{ color: "#3b3b3b" }}>
                <div>{cropInfo?.notes}</div>
                <div>Recommended: {cropInfo?.recommendedMachines?.join(", ")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final predicted price */}
      {price !== null && (
        <div className="pp-result" style={{ marginTop: 16 }}>
          <p style={{ margin: 0, color: "#2b2b2b", fontWeight: 700 }}>Estimated Hourly Rent</p>
          <h2 style={{ margin: "8px 0", color: "#1b5e20" }}>₹ {Number(price).toFixed(2)}</h2>
          <div style={{ color: "#555" }}>
            <small>Price estimated using weather, crop demand & local market trend.</small>
          </div>
        </div>
      )}

      {error && <div className="pp-error" style={{ marginTop: 16 }}>{error}</div>}
    </div>
  );
}
