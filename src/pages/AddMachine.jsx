import React, { useState } from "react";
import { addMachine, predictPrice } from "../api/machineApi";
import "../css/AddMachine.css";

export default function AddMachine() {
  const userId = localStorage.getItem("userId");

  const MACHINE_TYPES = ["Tractor", "Harvester", "Rotavator", "Cultivator"];
  const HORSEPOWER_OPTIONS = [
    20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 75, 80, 90, 100,
  ];

  const [form, setForm] = useState({
    name: "",
    machine_type: "",
    horsepower: "",
    age_years: "",
    hours_used: "",
    pincode: "",
    maintenance_cost: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [dieselPrice, setDieselPrice] = useState(95);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  /* =====================================================
        ⭐ GET LIVE DIESEL PRICE
  ====================================================== */
  const fetchDieselPrice = async () => {
    try {
      const res = await fetch("http://localhost:5000/get_diesel");
      const data = await res.json();
      setDieselPrice(data.diesel_price);
      return data.diesel_price;
    } catch (err) {
      console.error("Diesel API failed:", err);
      return 95; // fallback value
    }
  };

  /* =====================================================
        ⭐ ML – Predict Price FastAPI
  ====================================================== */
  const handlePredict = async () => {
    if (!form.pincode || !form.machine_type || !form.horsepower)
      return alert("Select machine type, horsepower and enter pincode");

    setLoading(true);

    try {
      // 1) fetch diesel price first
      const liveDiesel = await fetchDieselPrice();

      // 2) build ML payload
      const payload = {
        machine_type: form.machine_type,
        horsepower: Number(form.horsepower),
        age_years: Number(form.age_years || 0),
        hours_used: Number(form.hours_used || 0),
        pincode: form.pincode,
        maintenance_cost: Number(form.maintenance_cost || 0),
        fuel_price: liveDiesel,
      };

      // 3) call ML API
      const res = await predictPrice(payload);

      const price = res.data?.price || res.data?.predicted_rental_price;
      if (!price) throw new Error("ML returned invalid response");

      setPredictedPrice(Number(price).toFixed(2));
    } catch (err) {
      console.error("PREDICT ERROR:", err);
      alert("Prediction failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
      ⭐ SAVE MACHINE (to Node Backend)
  ====================================================== */
  const handleSave = async () => {
    if (!userId) return alert("User not logged in!");
    if (!predictedPrice) return alert("Predict price first!");

    const fd = new FormData();
    fd.append("ownerId", userId);
    fd.append("name", form.name);
    fd.append("type", form.machine_type);
    fd.append("horsepower", form.horsepower);
    fd.append("ageYears", form.age_years);
    fd.append("hoursUsed", form.hours_used);
    fd.append("pincode", form.pincode);
    fd.append("maintenance_cost", form.maintenance_cost);
    fd.append("fuel_price", dieselPrice);
    fd.append("rentPerHour", predictedPrice);

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

        {/* NAME */}
        <input
          name="name"
          placeholder="Machine Name"
          onChange={handleChange}
        />

        {/* MACHINE TYPE */}
        <select
          name="machine_type"
          onChange={handleChange}
          value={form.machine_type}
        >
          <option value="">Select Machine Type</option>
          {MACHINE_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* HORSEPOWER */}
        <select
          name="horsepower"
          onChange={handleChange}
          value={form.horsepower}
        >
          <option value="">Select Horsepower</option>
          {HORSEPOWER_OPTIONS.map((hp) => (
            <option key={hp} value={hp}>{hp} HP</option>
          ))}
        </select>

        {/* AGE + HOURS */}
        <div className="grid-2">
          <input
            name="age_years"
            placeholder="Age (Years)"
            onChange={handleChange}
          />
          <input
            name="hours_used"
            placeholder="Hours Used"
            onChange={handleChange}
          />
        </div>

        {/* PINCODE */}
        <input
          name="pincode"
          placeholder="Pincode"
          onChange={handleChange}
        />

        {/* MAINTENANCE ONLY */}
        <input
          name="maintenance_cost"
          placeholder="Maintenance Cost"
          onChange={handleChange}
        />

        {/* SHOW LIVE DIESEL PRICE */}
        <p style={{ fontWeight: 600, marginTop: 10 }}>
          Diesel Price (Auto): ₹ {dieselPrice}
        </p>

        {/* IMAGE UPLOAD */}
        <input type="file" onChange={handleFile} />
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: 200, marginTop: 10 }}
          />
        )}

        {/* PREDICT BUTTON */}
        <button className="predict-btn" onClick={handlePredict} disabled={loading}>
          {loading ? "Predicting..." : "🔮 Predict Price"}
        </button>

        {/* PREDICTION RESULT */}
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
