import React from "react";
import "../css/Dashboard.css";

export default function MachineModal({
  isOpen,
  onClose,
  onSave,
  editData,
  setEditData,
  isEdit,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEdit ? "Edit Machine" : "Add Machine"}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          <input
            type="text"
            placeholder="Machine Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Machine Type"
            value={editData.type}
            onChange={(e) => setEditData({ ...editData, type: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Rent/Day (₹)"
            value={editData.rent}
            onChange={(e) => setEditData({ ...editData, rent: e.target.value })}
            required
          />
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
          >
            <option>Available</option>
            <option>Rented</option>
            <option>Maintenance</option>
          </select>

          <div className="modal-actions">
            <button type="button" className="cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
