import React, { useState } from "react";
import { addMachine, predictPrice } from "../api/machineApi";
import "../css/AddMachine.css";

export default function AddMachine() {
  const user = JSON.parse(localStorage.getItem("user"));

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

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});
  const handleFile = (e) => { const f = e.target.files[0]; setFile(f); if (f) setPreview(URL.createObjectURL(f)); };

  const handlePredict = async () => {
    // basic validation
    if (!form.pincode || !form.type || !form.horsepower) return alert("Fill pincode/type/HP");

    setLoading(true);

    const payload = {
      pincode: form.pincode,
      machine_type: form.type.toUpperCase(),
      horsepower: Number(form.horsepower),
      hours_used: Number(form.hoursUsed || 0),
      age_years: Number(form.ageYears || 0),
      maintenance_cost: Number(form.maintenance_cost || 0),
      fuel_price: Number(form.fuel_price || 95),
      // context defaults
      created_at: new Date().toISOString(),
      bookings_7d: 0, cancellations_7d: 0, stock_on_hand: 1,
      duration_days: 1, advance_days:0, hours_per_day:1
    };

    try {
      const res = await predictPrice(payload);
      const price = res.data?.price ?? res.data?.predicted_rental_price;
      if (!price && price !== 0) throw new Error("No price returned");
      setPredictedPrice(Number(price).toFixed(2));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !user._id) return alert("User not logged in!");
    if (!predictedPrice) return alert("Predict price first");

    const fd = new FormData();
    fd.append("ownerId", user._id);
    fd.append("name", form.name);
    fd.append("type", form.type);
    fd.append("horsepower", form.horsepower);
    fd.append("ageYears", form.ageYears);
    fd.append("hoursUsed", form.hoursUsed);
    fd.append("pincode", form.pincode);
    fd.append("maintenance_cost", form.maintenance_cost || 0);
    fd.append("fuel_price", form.fuel_price || 95);
    fd.append("rentPerHour", predictedPrice);

    if (file) fd.append("image", file);

    try {
      await addMachine(fd);
      alert("Machine saved");
      window.location.href = "/my-machines";
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  return (
    <div className="add-machine-container">
      <h2>Add New Machine</h2>

      <div className="form-card">
        <div className="grid-2">
          <input name="name" placeholder="Machine Name" onChange={handleChange}/>
          <input name="type" placeholder="Type (Tractor / Harvester)" onChange={handleChange}/>
        </div>

        <div className="grid-2">
          <input name="horsepower" placeholder="Horsepower (HP)" onChange={handleChange}/>
          <input name="ageYears" placeholder="Age (Years)" onChange={handleChange}/>
        </div>

        <input name="hoursUsed" placeholder="Hours Used" onChange={handleChange}/>
        <input name="pincode" placeholder="Pincode" onChange={handleChange}/>
        <div className="grid-2">
          <input name="maintenance_cost" placeholder="Maintenance Cost" onChange={handleChange}/>
          <input name="fuel_price" placeholder="Fuel Price" value={form.fuel_price} onChange={handleChange}/>
        </div>

        <input type="file" onChange={handleFile}/>
        {preview && <img src={preview} alt="preview" style={{maxWidth:200, marginTop:10}} />}

        <button className="predict-btn" onClick={handlePredict} disabled={loading}>
          {loading ? "Predicting..." : "🔮 Predict Price"}
        </button>

        {predictedPrice && (
          <div className="prediction-box">
            <p>Predicted Hourly Price:</p>
            <h2>₹ {predictedPrice}</h2>
            <button className="save-btn" onClick={handleSave}>💾 Save Machine</button>
          </div>
        )}
      </div>
    </div>
  );
}
