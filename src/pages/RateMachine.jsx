// src/pages/RateMachine.jsx
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getMachineById, rateMachine } from "../api/machineApi";
import "../css/RateMachine.css";

export default function RateMachine() {
  const { machineId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const rentalId = params.get("rentalId");
  const renterId = localStorage.getItem("userId");

  const [machine, setMachine] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  // Load machine details
  useEffect(() => {
    if (!machineId) return;

    getMachineById(machineId)
      .then((res) => setMachine(res.data.machine))
      .catch((err) => console.error("Load machine error:", err));
  }, [machineId]);

  const handleSubmit = async () => {
    if (!rating) {
      alert("Please give a rating!");
      return;
    }

    try {
      await rateMachine(machineId, {
        renterId,
        rating,
        review,
      });

      alert("Thanks for rating!");
      navigate("/my-rentals");
    } catch (err) {
      console.error(err);
      alert("Rating failed!");
    }
  };

  return (
    <div className="rate-container">
      <h2 className="rate-title">⭐ Rate This Machine</h2>

      {machine ? (
        <div className="machine-card">
          <img
            src={machine.image_url}
            alt={machine.name}
            className="machine-img"
          />
          <h3>{machine.name}</h3>
          <p className="type">{machine.type}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* Rating Stars */}
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={n <= rating ? "star selected" : "star"}
            onClick={() => setRating(n)}
          >
            ★
          </span>
        ))}
      </div>

      {/* Review box */}
      <textarea
        className="review-box"
        placeholder="Write a review (optional)..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      <button className="submit-btn" onClick={handleSubmit}>
        Submit Rating
      </button>
    </div>
  );
}
