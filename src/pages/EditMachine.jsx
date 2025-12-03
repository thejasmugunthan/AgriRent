import React, { useEffect, useState } from "react";
import { getMachines, updateMachine } from "../api";
import api from "../api";
import "../css/AddMachine.css";
import { useParams, useNavigate } from "react-router-dom";

export default function EditMachine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=> {
    const load = async ()=> {
      try {
        const res = await api.get(`/machines`);
        const m = res.data.find(x => x._id === id);
        setMachine(m || null);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [id]);

  if (!machine) return <div style={{padding:20}}>Loading...</div>;

  const handleChange = (e) => setMachine({...machine, [e.target.name]: e.target.value });

  const onFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(machine).forEach(k => {
        if (["__v","createdAt","updatedAt","_id"].includes(k)) return;
        fd.append(k, machine[k] ?? "");
      });
      if (file) fd.append("image", file);

      const res = await updateMachine(id, fd);
      alert("Updated");
      navigate("/my-machines");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="addmachine-container">
      <h2>Edit Machine</h2>
      <div className="form-card">
        <input name="name" value={machine.name || ""} onChange={handleChange} />
        <input name="type" value={machine.type || ""} onChange={handleChange} />
        <input name="horsepower" value={machine.horsepower || ""} onChange={handleChange} />
        <input name="ageYears" value={machine.ageYears || ""} onChange={handleChange} />
        <input name="hoursUsed" value={machine.hoursUsed || ""} onChange={handleChange} />
        <input name="maintenance_cost" value={machine.maintenance_cost || ""} onChange={handleChange} />
        <input name="fuel_price" value={machine.fuel_price || ""} onChange={handleChange} />
        <input name="rentPerHour" value={machine.rentPerHour || ""} onChange={handleChange} />
        <input type="file" accept="image/*" onChange={onFileChange} />
        {preview || machine.image_url ? (
          <img src={preview || machine.image_url} style={{maxWidth:200}} alt="img" />
        ) : null}
        <button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );
}
