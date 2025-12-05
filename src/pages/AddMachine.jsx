import React, { useState } from "react";
import { addMachine, predictPrice } from "../api/machineApi";
import "../css/AddMachine.css";

export default function AddMachine() {
  const userId = localStorage.getItem("userId"); // ✔ FIXED
  const [form, setForm] = useState({
    name: "",
    type: "",
    horsepower: "",
    ageYears: "",
    hoursUsed: "",
    pincode: "",
    maintenance_cost: "",
    fuel_price: 95,
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  /* =======================================================
     ⭐ ML Prediction (FastAPI)
  ======================================================= */
  const handlePredict = async () => {
    if (!form.pincode || !form.type || !form.horsepower)
      return alert("Fill pincode, type, horsepower first");

    setLoading(true);

    const payload = {
      pincode: form.pincode,
      machine_type: form.type.toUpperCase(), // ✔ FIXED
      horsepower: Number(form.horsepower),
      hours_used: Number(form.hoursUsed || 0),
      age_years: Number(form.ageYears || 0),
      maintenance_cost: Number(form.maintenance_cost || 0),
      fuel_price: Number(form.fuel_price || 95),

      // ML context fields
      created_at: new Date().toISOString(),
      bookings_7d: 0,
      cancellations_7d: 0,
      stock_on_hand: 1,
      duration_days: 1,
      advance_days: 0,
      hours_per_day: 1,
    };

    try {
      const res = await predictPrice(payload); // ✔ FIXED route
      const price =
        res.data?.predicted_rental_price ?? res.data?.price ?? null;

      if (price === null) throw new Error("Invalid ML Response");

      setPredictedPrice(Number(price).toFixed(2));
    } catch (err) {
      console.error("PREDICT ERROR:", err);
      alert("Price prediction failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     ⭐ Save Machine to Backend
  ======================================================= */
  const handleSave = async () => {
    if (!userId) return alert("User not logged in!");
    if (!predictedPrice) return alert("Predict price first!");

    const fd = new FormData();
    fd.append("ownerId", userId);
    fd.append("name", form.name);
    fd.append("type", form.type);
    fd.append("horsepower", form.horsepower);
    fd.append("ageYears", form.ageYears);
    fd.append("hoursUsed", form.hoursUsed);
    fd.append("pincode", form.pincode);
    fd.append("maintenance_cost", form.maintenance_cost || 0);
    fd.append("fuel_price", form.fuel_price || 95);
    fd.append("rentPerHour", predictedPrice); // ✔ FIXED

    if (file) fd.append("image", file);

    try {
      await addMachine(fd);
      alert("Machine added successfully!");
      window.location.href = "/my-machines";
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Failed to save machine");
    }
  };

  return (
    <div className="add-machine-container">
      <h2>Add New Machine</h2>

      <div className="form-card">
        {/* NAME + TYPE */}
        <div className="grid-2">
          <input
            name="name"
            placeholder="Machine Name"
            onChange={handleChange}
          />
          <input
            name="type"
            placeholder="Type (Tractor / Harvester)"
            onChange={handleChange}
          />
        </div>

        {/* HP + AGE */}
        <div className="grid-2">
          <input
            name="horsepower"
            placeholder="Horsepower (HP)"
            onChange={handleChange}
          />
          <input
            name="ageYears"
            placeholder="Age (Years)"
            onChange={handleChange}
          />
        </div>

        {/* Hours Used */}
        <input
          name="hoursUsed"
          placeholder="Hours Used"
          onChange={handleChange}
        />

        {/* Pincode */}
        <input
          name="pincode"
          placeholder="Pincode"
          onChange={handleChange}
        />

        {/* Maintenance + Fuel */}
        <div className="grid-2">
          <input
            name="maintenance_cost"
            placeholder="Maintenance Cost"
            onChange={handleChange}
          />
          <input
            name="fuel_price"
            placeholder="Fuel Price"
            value={form.fuel_price}
            onChange={handleChange}
          />
        </div>

        {/* Image */}
        <input type="file" onChange={handleFile} />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: 200, marginTop: 10 }}
          />
        )}

        {/* Predict */}
        <button className="predict-btn" onClick={handlePredict} disabled={loading}>
          {loading ? "Predicting..." : "🔮 Predict Price"}
        </button>

        {/* Prediction Output */}
        {predictedPrice && (
          <div className="prediction-box">
            <p>Predicted Hourly Price:</p>
            <h2>₹ {predictedPrice}</h2>

            <button className="save-btn" onClick={handleSave}>
              💾 Save Machine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
