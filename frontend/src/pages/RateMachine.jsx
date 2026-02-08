import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getMachineById, rateMachine } from "../api/machineApi";
import { FaArrowLeft, FaStar, FaTractor, FaCheckCircle } from "react-icons/fa";

export default function RateMachine() {
  const { machineId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const rentalId = params.get("rentalId");
  const renterId = localStorage.getItem("userId");

  const [machine, setMachine] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");


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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg mb-6 shadow-sm transition-colors"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaStar /> Rate This Machine
          </h1>
          <p className="text-green-50 mt-2">Share your experience to help other farmers</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {machine ? (
            <>
              {/* Machine Info */}
              <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-gray-200">
                <img
                  src={machine.image_url || "https://cdn-icons-png.flaticon.com/512/1995/1995503.png"}
                  alt={machine.name}
                  className="w-full md:w-48 h-48 object-cover rounded-xl shadow-md"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                    <FaTractor className="text-green-600" />
                    {machine.name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-3">{machine.type}</p>
                  {machine.averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-500">
                        {[...Array(Math.round(machine.averageRating))].map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                      <span className="text-gray-600">
                        {machine.averageRating.toFixed(1)} average rating
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating Section */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className="transition-all transform hover:scale-110"
                    >
                      <FaStar
                        className={`text-5xl ${
                          n <= rating ? "text-yellow-500" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-gray-600 mt-2">
                    You rated: <span className="font-bold text-green-600">{rating} star{rating > 1 ? "s" : ""}</span>
                  </p>
                )}
              </div>

              {/* Review Box */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Your Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience with this machine..."
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!rating}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  rating
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <FaCheckCircle />
                Submit Rating
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-48 mx-auto"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading machine details...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
