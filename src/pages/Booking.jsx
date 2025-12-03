import React, { useEffect, useState } from "react";
import "../css/Booking.css";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

export default function Booking() {
  const { machineId } = useParams();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [totalHours, setTotalHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // -----------------------------
  // Load machine (FIXED URL)
  // -----------------------------
  useEffect(() => {
    const loadMachine = async () => {
      try {
        const { data } = await api.get(`/machines/${machineId}`); // ✔ FIXED
        setMachine(data);
      } catch (err) {
        console.error("Machine fetch failed:", err);
      }
      setLoading(false);
    };

    loadMachine();
  }, [machineId]);

  // -----------------------------
  // Auto calculate when dates change
  // -----------------------------
  useEffect(() => {
    if (!machine || !machine.rentPerHour || !start || !end) return;

    const s = new Date(start);
    const e = new Date(end);
    const diff = (e - s) / (1000 * 60 * 60); // hours

    if (diff > 0) {
      const hours = Number(diff.toFixed(2));
      const price = Number((hours * Number(machine.rentPerHour)).toFixed(2));

      setTotalHours(hours);
      setTotalPrice(price);
    } else {
      setTotalHours(0);
      setTotalPrice(0);
    }
  }, [start, end, machine]);

  // -----------------------------
  // Confirm Booking
  // -----------------------------
  const handleBooking = async () => {
    if (totalHours <= 0) {
      return alert("Please select valid date & time");
    }

    try {
      await api.post("/rentals", {
        machineId,
        renterId: localStorage.getItem("userId"),
        startTime: start,
        endTime: end,
        totalHours,
        totalPrice,
      });

      alert("Booking successful!");
      navigate("/my-rentals");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed");
    }
  };

  if (loading) return <h2>Loading machine...</h2>;
  if (!machine) return <h2>Machine not found</h2>;

  return (
    <div className="booking-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>Book {machine.name}</h1>
      <p className="rate">Rate: ₹{machine.rentPerHour}/hour</p>

      <div className="machine-card">
        {machine.image_url && (
          <img src={machine.image_url} alt="machine" className="machine-img" />
        )}
        <div className="details">
          <h3>{machine.type}</h3>
          <p>📍 Pincode: {machine.pincode}</p>
          <p>⚙ Horsepower: {machine.horsepower} HP</p>
          <p>✔ Available</p>
        </div>
      </div>

      <div className="date-section">
        <label>Start Date & Time</label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <label>End Date & Time</label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      <div className="price-card">
        <p>Rate per Hour: ₹{machine.rentPerHour}</p>
        <p>Total Hours: {totalHours}</p>
        <hr />
        <h2>Total Price: ₹{totalPrice}</h2>
      </div>

      <button className="confirm-btn" onClick={handleBooking}>
        ✔ Confirm Booking
      </button>
    </div>
  );
}
