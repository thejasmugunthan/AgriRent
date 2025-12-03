import React, { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import "../css/RentMachine.css";

export default function RentMachine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    api.get(`/machines/${id}`).then((res) => setMachine(res.data));
  }, [id]);

  const book = async () => {
    await api.post("/rentals", {
      machineId: id,
      startDate: start,
      endDate: end,
    });

    alert("Booking successful!");
    navigate("/my-rentals");
  };

  if (!machine) return <h2>Loading machine...</h2>;

  return (
    <>
      <Navbar />
      <div className="rm-container">
        <div className="rm-card">
          <h2>{machine.name}</h2>
          <p className="rate">₹{machine.rentPerHour}/hour</p>

          <label>Start Date</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />

          <label>End Date</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />

          <button className="book-btn" onClick={book}>Confirm Booking</button>
        </div>
      </div>
    </>
  );
}
