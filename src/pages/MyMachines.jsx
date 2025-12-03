import React, { useEffect, useState } from "react";
import { getMachines, deleteMachine } from "../api/machineApi";
import "../css/MyMachines.css";

export default function MyMachines() {
  const [machines, setMachines] = useState([]);

  const load = async () => {
    try {
      const res = await getMachines();
      setMachines(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load machines");
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this machine?")) return;
    try {
      await deleteMachine(id);
      load();
    } catch (err) { console.error(err); alert("Delete failed"); }
  };

  return (
    <div className="machines-container">
      <div className="machines-header">
        <h2>My Machines</h2>
        <button onClick={() => (window.location.href = "/add-machine")} className="add-btn">➕ Add Machine</button>
      </div>

      <div className="table-card">
        <table className="machines-table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>HP</th><th>Rent/hr</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {machines.length === 0 ? (
              <tr><td colSpan="5">No machines added yet</td></tr>
            ) : machines.map(m => (
              <tr key={m._id}>
                <td>{m.name}</td>
                <td>{m.type}</td>
                <td>{m.horsepower}</td>
                <td>₹ {m.rentPerHour}</td>
                <td><button className="del" onClick={() => handleDelete(m._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
