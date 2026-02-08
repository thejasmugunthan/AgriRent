import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
  FaArrowLeft,
  FaStar,
  FaTractor,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaInfoCircle,
} from "react-icons/fa";

export default function ViewMachine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [machine, setMachine] = useState(null);
  const [owner, setOwner] = useState(null);
  useEffect(() => {
    if (!id || id === "undefined") {
      console.error("❌ Invalid machineId from URL:", id);
      return;
    }

    api
      .get(`/machines/${id}`)
      .then((res) => {
        setMachine(res.data.machine);
        setOwner(res.data.owner);
      })
      .catch((err) => console.error("Machine fetch error:", err));
  }, [id]);

  if (!machine)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-64 mx-auto"></div>
          </div>
          <p className="text-xl font-semibold text-gray-600 mt-4">
            Loading machine details...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg mb-6 shadow-sm transition-colors"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaTractor /> Machine Details
          </h1>
          <p className="text-green-50 mt-2">
            View complete information about this machine
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Machine Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Machine Image */}
                <img
                  src={
                    machine.image_url &&
                    !machine.image_url.toLowerCase().includes("profile")
                      ? machine.image_url
                      : "https://cdn-icons-png.flaticon.com/512/1995/1995503.png"
                  }
                  alt={machine.name}
                  className="w-full md:w-64 h-64 object-cover rounded-xl shadow-md"
                />

                {/* Machine Details */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FaTractor className="text-green-600" />
                    {machine.name}
                  </h2>

                  <p className="text-lg text-gray-600 mb-4">{machine.type}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-500">
                      {machine.averageRating > 0 ? (
                        [...Array(Math.round(machine.averageRating))].map(
                          (_, i) => <FaStar key={i} />
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">
                          No ratings yet
                        </span>
                      )}
                    </div>

                    {machine.averageRating > 0 && (
                      <span className="text-gray-700 font-medium">
                        {machine.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Rental Price</p>
                    <div className="flex items-center gap-2">
                      <FaRupeeSign className="text-2xl text-green-600" />
                      <span className="text-3xl font-bold text-green-600">
                        {machine.rentPerHour}
                      </span>
                      <span className="text-gray-600">/ hour</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {machine.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaInfoCircle className="text-green-600" />
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {machine.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Owner Info */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaUser className="text-green-600" />
                Owner Details
              </h3>

              {/* Owner Photo */}
              <div className="flex justify-center mb-6">
                <img
                  src={
                    owner?.photo ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Owner"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-100 shadow-md"
                />
              </div>

              {/* Owner Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaUser className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-800">
                      {owner?.name || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-800">
                      {owner?.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-800">
                      {owner?.district && owner?.state
                        ? `${owner.district}, ${owner.state}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => navigate(`/rent-machine/${id}`)}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Book This Machine
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
