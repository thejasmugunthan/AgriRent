// src/pages/PricePredictor.jsx
import React, { useState } from "react";
import "../css/PricePredictor.css";

import { getWeatherByPincode } from "../api/weatherApi";
import { getCropInfo } from "../api/cropLogic";
import { smartPredict } from "../api/smartPredictApi";

export default function PricePredictor() {
  const [form, setForm] = useState({
    machine_type: "",
    season: "Monsoon",
    crop_type: "Rice",
    pincode: "",
    duration_hours: 1, // renter gives HOURS (not days)
  });

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [mlBasePrice, setMlBasePrice] = useState(null);
  const [dieselPrice, setDieselPrice] = useState(null);
  const [demandIndex, setDemandIndex] = useState(null);

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
    setMlBasePrice(null);
    setDemandIndex(null);
    setDieselPrice(null);

    if (!form.pincode || !form.machine_type) {
      setError("Please select machine type and enter pincode.");
      return;
    }

    setLoading(true);
    try {
      // 1) WEATHER
      const w = await getWeatherByPincode(form.pincode);
      setWeather(w);

      // 2) CROP INTELLIGENCE (pure frontend logic)
      const crop = getCropInfo(form.crop_type, form.season);
      setCropInfo(crop);

      // 3) WEATHER-BASED DEMAND (0.8–1.2 approx)
      const weatherDemand = (() => {
        if (!w || !w.ok) return 0.9;

        const t = w.temp ?? 0;
        const r = w.rain ?? 0;
        const h = w.humidity ?? 0;
        let factor = 1.0;

        if (r > 10) factor += 0.08;
        if (t > 35) factor -= 0.06;
        if (h > 80) factor += 0.03;

        return Number(factor.toFixed(2));
      })();

      // 4) FINAL DEMAND INDEX (crop + weather)
      const demand_index = Number(
        (0.7 * crop.demandMultiplier + 0.3 * weatherDemand).toFixed(2)
      );
      setDemandIndex(demand_index);

      // 5) BUILD PAYLOAD FOR /smart_predict
      const durationHours = Number(form.duration_hours) || 1;
      const duration_days = Math.max(1, Math.ceil(durationHours / 8)); // convert hours → approx days

      const payload = {
        machine_type: form.machine_type.toUpperCase(),
        pincode: form.pincode,
        duration_days,
        season: form.season,
        crop_type: form.crop_type,
        demand_index,
        weather_temp: w.temp ?? 0,
        weather_humidity: w.humidity ?? 0,
        weather_rain: w.rain ?? 0,
      };

      // 6) CALL BACKEND
      const res = await smartPredict(payload);
      const data = res.data;

      if (!data || data.success === false) {
        setError(data?.message || "Prediction failed.");
        return;
      }

      setPrice(data.price);
      setMlBasePrice(data.ml_base_price);
      setDieselPrice(data.diesel_price); // number, NOT object
    } catch (err) {
      console.error("SMART PREDICT ERROR:", err);
      setError("Server or network failure.");
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
          <select
            name="machine_type"
            value={form.machine_type}
            onChange={handleChange}
            required
          >
            <option value="">Select machine</option>
            {machineTypes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="pp-field">
          <label>Duration (hours)</label>
          <input
            type="number"
            name="duration_hours"
            min="1"
            value={form.duration_hours}
            onChange={handleChange}
          />
        </div>

        <div className="pp-field">
          <label>Season</label>
          <select
            name="season"
            value={form.season}
            onChange={handleChange}
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="pp-field">
          <label>Crop Type</label>
          <select
            name="crop_type"
            value={form.crop_type}
            onChange={handleChange}
          >
            {crops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="pp-field">
          <label>Pincode (Location)</label>
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="560001"
          />
        </div>

        <button className="pp-btn" type="submit" disabled={loading}>
          {loading ? "Predicting..." : "🔮 Predict Price"}
        </button>
      </form>

      {/* WEATHER + CROP CARD */}
      {(weather || cropInfo) && (
        <div className="pp-result" style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {weather && (
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#2b2b2b",
                    fontWeight: 700,
                  }}
                >
                  Location Insights
                </p>
                <div style={{ color: "#3b3b3b" }}>
                  <div>Temperature: {weather.temp}°C</div>
                  <div>Humidity: {weather.humidity}%</div>
                  <div>Rainfall: {weather.rain} mm</div>
                  {dieselPrice != null && (
                    <div>Diesel Price: ₹ {Number(dieselPrice).toFixed(2)}</div>
                  )}
                </div>
              </div>
            )}

            {cropInfo && (
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#2b2b2b",
                    fontWeight: 700,
                  }}
                >
                  Crop Insights
                </p>
                <div style={{ color: "#3b3b3b" }}>
                  <div>{cropInfo.notes}</div>
                  {cropInfo.recommendedMachines && (
                    <div>
                      Recommended:{" "}
                      {cropInfo.recommendedMachines.join(", ")}
                    </div>
                  )}
                  {demandIndex != null && (
                    <div>Demand Index: {demandIndex}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FINAL PRICE CARD */}
      {price != null && (
        <div className="pp-result" style={{ marginTop: 16 }}>
          <p
            style={{
              margin: 0,
              color: "#2b2b2b",
              fontWeight: 700,
            }}
          >
            Estimated Hourly Rent
          </p>
          <h2 style={{ margin: "8px 0", color: "#1b5e20" }}>
            ₹ {Number(price).toFixed(2)}
          </h2>

          {mlBasePrice != null && (
            <div style={{ color: "#555", fontSize: 12 }}>
              <div>Base ML price (before demand factor): ₹ {mlBasePrice.toFixed(2)}</div>
              {demandIndex != null && (
                <div>Applied demand factor: {demandIndex}</div>
              )}
            </div>
          )}

          <div style={{ color: "#555", marginTop: 4 }}>
            <small>
              Price estimated using weather, crop demand, diesel price & local
              market trends.
            </small>
          </div>
        </div>
      )}

      {error && (
        <div className="pp-error" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}
    </div>
  );
}
