import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import "../css/RentMachine.css";

export default function RentMachine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const renterId = localStorage.getItem("userId");

  const [machine, setMachine] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    api
      .get(`/machines/${id}`)
      .then((res) => setMachine(res.data))
      .catch(() => alert("Failed to load machine"));
  }, [id]);

  //Booking logic with validation
  const book = async () => {
    if (!start || !end) {
      alert("Please select both start and end date/time");
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();

    if (startDate < now) {
      alert("Start time must be in the future");
      return;
    }

    if (endDate <= startDate) {
      alert("End time must be after start time");
      return;
    }

    try {
      setLoading(true);

      await api.post("/rentals", {
        machineId: id,
        renterId,
        startDate: start,
        endDate: end,
      });

      alert("Booking successful!");
      navigate("/my-rentals");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
        "Booking failed. Time slot may already be booked."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!machine) return <h2 className="rm-loading">Loading machine...</h2>;

  return (
    <>
      <Navbar />
      <div className="rm-container">
        <div className="rm-card">
          <h2>{machine.name}</h2>
          <p className="rate">₹{machine.rentPerHour}/hour</p>

          <label>Start Date & Time</label>
          <input
            type="datetime-local"
            value={start}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setStart(e.target.value)}
          />

          <label>End Date & Time</label>
          <input
            type="datetime-local"
            value={end}
            min={start}
            onChange={(e) => setEnd(e.target.value)}
          />

          <button
            className="book-btn"
            onClick={book}
            disabled={loading}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </>
  );
}
