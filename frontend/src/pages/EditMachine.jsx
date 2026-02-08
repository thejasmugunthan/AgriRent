import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMachineById,
  updateMachine,
  predictPrice,
} from "../api/machineApi";
import { Fuel, Camera, Sparkles, Save } from "lucide-react";
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
  Tractor: ["horsepower", "attachment_type", "ageYears", "hoursUsed", "pincode", "maintenance_cost"],
  Harvester: ["harvester_type", "crop_type", "ageYears", "pincode"],
  Pump: ["pump_type", "capacity_hp", "pincode"],
  Trailer: ["trailer_type", "load_type", "pincode"],
  Sprayer: ["sprayer_type", "tank_capacity", "ageYears", "pincode"],
  Weeder: ["weeder_type", "horsepower", "ageYears", "pincode"],
};

const FIELD_LABELS = {
  horsepower: { label: "Horsepower" },
  attachment_type: { label: "Attachment Type" },
  ageYears: { label: "Age (Years)" },
  hoursUsed: { label: "Hours Used" },
  pincode: { label: "Pincode" },
  maintenance_cost: { label: "Maintenance Cost" },
  harvester_type: { label: "Harvester Type" },
  crop_type: { label: "Crop Type" },
  pump_type: { label: "Pump Type" },
  capacity_hp: { label: "Capacity (HP)" },
  trailer_type: { label: "Trailer Type" },
  load_type: { label: "Load Type" },
  sprayer_type: { label: "Sprayer Type" },
  tank_capacity: { label: "Tank Capacity (L)" },
  weeder_type: { label: "Weeder Type" },
};

export default function EditMachine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [editablePrice, setEditablePrice] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (id) loadMachine();
  }, [id]);

  const loadMachine = async () => {
    try {
      const res = await getMachineById(id);
      const m = res.data.machine;

      setForm({
        name: m.name || "",
        machine_type: m.type || "",
        horsepower: m.horsepower || "",
        attachment_type: m.meta?.attachment_type || "",
        ageYears: m.ageYears || "",
        hoursUsed: m.hoursUsed || "",
        pincode: m.pincode || "",
        maintenance_cost: m.maintenance_cost || "",
        harvester_type: m.meta?.harvester_type || "",
        crop_type: m.meta?.crop_type || "",
        pump_type: m.meta?.pump_type || "",
        capacity_hp: m.meta?.capacity_hp || "",
        trailer_type: m.meta?.trailer_type || "",
        load_type: m.meta?.load_type || "",
        sprayer_type: m.meta?.sprayer_type || "",
        tank_capacity: m.meta?.tank_capacity || "",
        weeder_type: m.meta?.weeder_type || "",
      });

      setEditablePrice(m.rentPerHour || "");
      if (m.image_url) setPreview(m.image_url);
    } catch {
      alert("Failed to load machine");
    }
  };

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
      alert("Required fields missing");
      return;
    }

    setLoading(true);

    try {
      let payload = {};
      const endpoint = `/predict/${form.machine_type.toLowerCase()}`;

      switch (form.machine_type) {
        case "Tractor":
          payload = {
            horsepower: Number(form.horsepower),
            attachment_type: form.attachment_type,
            age_years: Number(form.ageYears || 0),
            hours_used: Number(form.hoursUsed || 0),
            maintenance_cost: Number(form.maintenance_cost || 0),
            pincode: Number(form.pincode),
          };
          break;

        case "Harvester":
          payload = {
            harvester_type: form.harvester_type,
            crop_type: form.crop_type,
            age_years: Number(form.ageYears || 0),
            pincode: Number(form.pincode),
          };
          break;

        case "Pump":
          payload = {
            pump_type: form.pump_type,
            capacity_hp: Number(form.capacity_hp),
            pincode: Number(form.pincode),
          };
          break;

        case "Trailer":
          payload = {
            trailer_type: form.trailer_type,
            load_type: form.load_type,
            pincode: Number(form.pincode),
          };
          break;

        case "Sprayer":
          payload = {
            sprayer_type: form.sprayer_type,
            tank_capacity: Number(form.tank_capacity),
            age_years: Number(form.ageYears || 0),
            pincode: Number(form.pincode),
          };
          break;

        case "Weeder":
          payload = {
            weeder_type: form.weeder_type,
            horsepower: Number(form.horsepower),
            age_years: Number(form.ageYears || 0),
            pincode: Number(form.pincode),
          };
          break;

        default:
          throw new Error("Unsupported machine type");
      }

      const res = await predictPrice(endpoint, payload);
      setPredictedPrice(res.data.final_price);
      setEditablePrice(res.data.final_price);
    } catch {
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.name || !editablePrice) {
      alert("Name and price required");
      return;
    }

    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("type", form.machine_type);
    fd.set("rentPerHour", editablePrice);

    Object.entries(form).forEach(([k, v]) => {
      if (v && !["name", "machine_type"].includes(k)) fd.set(k, v);
    });

    if (file) fd.append("image", file);

    try {
      await updateMachine(id, fd);
      alert("Machine updated successfully");
      navigate("/my-machines");
    } catch {
      alert("Update failed");
    }
  };

  const currentFields = FIELD_CONFIG[form.machine_type] || [];

  return (
    <div className="page">
      <div className="container">
        <h1>Edit Machine</h1>
        <p className="subtitle">Update your machine details</p>

        <div className="card">
          <label>Machine Name</label>
          <input name="name" value={form.name || ""} onChange={handleChange} />

          <label>Machine Type</label>
          <select value={form.machine_type} disabled>
            {MACHINE_TYPES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <div className="grid">
            {currentFields.map((field) => (
              <div key={field}>
                <label>{FIELD_LABELS[field].label}</label>
                {OPTIONS[field] ? (
                  <select name={field} value={form[field] || ""} onChange={handleChange}>
                    <option value="">Select</option>
                    {OPTIONS[field].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input name={field} value={form[field] || ""} onChange={handleChange} />
                )}
              </div>
            ))}
          </div>

          <div className="diesel">
            <Fuel /> Live Diesel Price: ₹95
          </div>

          <label className="upload">
            <Camera /> Update Image
            <input type="file" hidden onChange={handleFile} />
          </label>

          {preview && <img src={preview} className="preview" alt="preview" />}

          <button onClick={handlePredict} className="btn-primary" disabled={loading}>
            <Sparkles /> {loading ? "Predicting..." : "Re-Predict Price"}
          </button>

          <div className="result">
            <label>Rent Price (₹ / hour)</label>
            <input
              type="number"
              value={editablePrice}
              onChange={(e) => setEditablePrice(e.target.value)}
              className="price-input"
            />

            {predictedPrice && (
              <small className="hint">ML suggested: ₹{predictedPrice}/hr</small>
            )}

            <button className="btn-success" onClick={handleUpdate}>
              <Save /> Update Machine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
