import { useState } from "react";
import { addMachine, predictPrice } from "../api/machineApi";
import {
  Fuel,
  Camera,
  Sparkles,
  Save,
  Clock,
  MapPin,
  Wrench,
  Gauge,
  AlertCircle,
} from "lucide-react";
import "../css/AddMachine.css";

const MACHINE_TYPES = [
  "Tractor",
  "Harvester",
  "Pump",
  "Trailer",
  "Sprayer",
  "Weeder",
];

const OPTIONS = {
  horsepower: [20, 25, 30, 40, 50, 60, 75, 90, 100],
  attachment_type: ["Rotavator", "Cultivator", "Plough"],
  harvester_type: ["Self-propelled", "Tractor-mounted"],
  crop_type: ["Paddy", "Wheat", "Maize", "Sugarcane"],
  pump_type: ["Electric", "Diesel", "Solar"],
  capacity_hp: [1, 2, 3, 5, 7.5, 10, 15],
  trailer_type: ["Single Axle", "Double Axle", "Hydraulic"],
  load_type: ["Grain", "Sand", "Fertilizer"],
  sprayer_type: ["Manual", "Power", "Boom"],
  tank_capacity: [16, 20, 25, 50, 100, 200],
  weeder_type: ["Mini", "Heavy-duty"],
};

const FIELD_CONFIG = {
  Tractor: [
    "horsepower",
    "attachment_type",
    "ageYears",
    "hoursUsed",
    "pincode",
    "maintenance_cost",
  ],
  Harvester: ["harvester_type", "crop_type", "ageYears", "pincode"],
  Pump: ["pump_type", "capacity_hp", "pincode"],
  Trailer: ["trailer_type", "load_type", "pincode"],
  Sprayer: ["sprayer_type", "tank_capacity", "ageYears", "pincode"],
  Weeder: ["weeder_type", "horsepower", "ageYears", "pincode"],
};

const FIELD_LABELS = {
  horsepower: { label: "Horsepower", placeholder: "Select Horsepower" },
  attachment_type: {
    label: "Attachment Type",
    placeholder: "Select Attachment",
  },
  ageYears: { label: "Age (Years)", placeholder: "e.g., 3" },
  hoursUsed: { label: "Hours Used", placeholder: "e.g., 500" },
  pincode: { label: "Pincode", placeholder: "e.g., 560001" },
  maintenance_cost: {
    label: "Maintenance Cost",
    placeholder: "e.g., 5000",
  },
  harvester_type: { label: "Harvester Type", placeholder: "Select Type" },
  crop_type: { label: "Crop Type", placeholder: "Select Crop" },
  pump_type: { label: "Pump Type", placeholder: "Select Pump" },
  capacity_hp: { label: "Capacity (HP)", placeholder: "Select Capacity" },
  trailer_type: { label: "Trailer Type", placeholder: "Select Trailer" },
  load_type: { label: "Load Type", placeholder: "Select Load" },
  sprayer_type: { label: "Sprayer Type", placeholder: "Select Sprayer" },
  tank_capacity: {
    label: "Tank Capacity (L)",
    placeholder: "Select Capacity",
  },
  weeder_type: { label: "Weeder Type", placeholder: "Select Weeder" },
};

export default function AddMachine() {
  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({ name: "", machine_type: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [editablePrice, setEditablePrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handlePredict = async () => {
    if (!form.machine_type || !form.pincode) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      let payload = {};

      if (form.machine_type === "Tractor") {
        payload = {
          horsepower: Number(form.horsepower),
          attachment_type: form.attachment_type,
          age_years: Number(form.ageYears || 0),
          hours_used: Number(form.hoursUsed || 0),
          pincode: Number(form.pincode),
          maintenance_cost: Number(form.maintenance_cost || 0),
        };
      }

      if (form.machine_type === "Harvester") {
        payload = {
          harvester_type: form.harvester_type,
          crop_type: form.crop_type,
          age_years: Number(form.ageYears || 0),
          pincode: Number(form.pincode),
        };
      }

      if (form.machine_type === "Pump") {
        payload = {
          pump_type: form.pump_type,
          capacity_hp: Number(form.capacity_hp),
          pincode: Number(form.pincode),
        };
      }

      if (form.machine_type === "Trailer") {
        payload = {
          trailer_type: form.trailer_type,
          load_type: form.load_type,
          pincode: Number(form.pincode),
        };
      }

      if (form.machine_type === "Sprayer") {
        payload = {
          sprayer_type: form.sprayer_type,
          tank_capacity: Number(form.tank_capacity),
          age_years: Number(form.ageYears || 0),
          pincode: Number(form.pincode),
        };
      }

      if (form.machine_type === "Weeder") {
        payload = {
          weeder_type: form.weeder_type,
          horsepower: Number(form.horsepower),
          age_years: Number(form.ageYears || 0),
          pincode: Number(form.pincode),
        };
      }

      const res = await predictPrice(
        `/predict/${form.machine_type.toLowerCase()}`,
        payload
      );

      setPredictedPrice(res.data.final_price);
      setEditablePrice(res.data.final_price);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      alert("User not logged in");
      return;
    }

    if (!form.name.trim()) {
      alert("Machine name is required");
      return;
    }

    if (!editablePrice) {
      alert("Price is required");
      return;
    }

    const fd = new FormData();

    fd.set("ownerId", userId);
    fd.set("name", form.name.trim());
    fd.set("type", form.machine_type);
    fd.set("rentPerHour", editablePrice);

    Object.entries(form).forEach(([k, v]) => {
      if (v && !["name", "machine_type"].includes(k)) {
        fd.set(k, v);
      }
    });

    if (file) fd.append("image", file);

    try {
      await addMachine(fd);
      alert("Machine added successfully");
      window.location.href = "/my-machines";
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  const currentFields = FIELD_CONFIG[form.machine_type] || [];

  return (
    <div className="page">
      <div className="container">
        <h1>Add New Machine</h1>
        <p className="subtitle">Fill details to list your machine for rent</p>

        <div className="card">
          <label>Machine Name</label>
          <input
            name="name"
            onChange={handleChange}
            placeholder="John Deere 5050D"
          />

          <label>Machine Type</label>
          <select name="machine_type" onChange={handleChange}>
            <option value="">Select Machine Type</option>
            {MACHINE_TYPES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <div className="grid">
            {currentFields.map((field) => {
              const cfg = FIELD_LABELS[field];
              return OPTIONS[field] ? (
                <div key={field}>
                  <label>{cfg.label}</label>
                  <select name={field} onChange={handleChange}>
                    <option value="">{cfg.placeholder}</option>
                    {OPTIONS[field].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div key={field}>
                  <label>{cfg.label}</label>
                  <input
                    name={field}
                    placeholder={cfg.placeholder}
                    onChange={handleChange}
                  />
                </div>
              );
            })}
          </div>

          <div className="diesel">
            <Fuel /> Live Diesel Price: ₹95
          </div>

          <label className="upload">
            <Camera /> Upload Image
            <input type="file" hidden onChange={handleFile} />
          </label>

          {preview && <img src={preview} className="preview" />}

          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn-primary"
          >
            <Sparkles /> {loading ? "Predicting..." : "Predict Price"}
          </button>

          {predictedPrice && (
            <div className="result">
              <label>Rent Price (₹ / hour)</label>

              <input
                type="number"
                value={editablePrice}
                onChange={(e) => setEditablePrice(e.target.value)}
                className="price-input"
              />

              <small className="hint">
                ML suggested: ₹{predictedPrice}/hr
              </small>

              <button className="btn-success" onClick={handleSave}>
                <Save /> Save Machine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
