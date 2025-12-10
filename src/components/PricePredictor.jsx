import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWeatherByPincode } from "../api/weatherApi";
import { getCropInfo } from "../api/cropLogic";
import { smartPredict } from "../api/smartPredictApi";
import {
  FaArrowLeft,
  FaTractor,
  FaCloudSun,
  FaSeedling,
  FaRupeeSign,
  FaCalculator,
  FaMapMarkerAlt,
  FaClock
} from "react-icons/fa";

export default function PricePredictor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    machine_type: "",
    season: "Monsoon",
    crop_type: "Rice",
    pincode: "",
    duration_hours: 1, // renter gives HOURS (not days)
  });

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [mlBasePrice, setMlBasePrice] = useState(null);
  const [dieselPrice, setDieselPrice] = useState(null);
  const [demandIndex, setDemandIndex] = useState(null);

  const [weather, setWeather] = useState(null);
  const [cropInfo, setCropInfo] = useState(null);
  const [error, setError] = useState(null);

  const machineTypes = [
    "Tractor",
    "Harvester",
    "Rotavator",
    "Cultivator",
    "Sprayer",
    "Plough",
  ];

  const seasons = ["Summer", "Monsoon", "Winter", "Harvest"];
  const crops = ["Rice", "Wheat", "Sugarcane", "Maize", "Cotton", "Vegetables"];

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handlePredict = async (e) => {
    e.preventDefault();
    setError(null);
    setPrice(null);
    setWeather(null);
    setCropInfo(null);
    setMlBasePrice(null);
    setDemandIndex(null);
    setDieselPrice(null);

    if (!form.pincode || !form.machine_type) {
      setError("Please select machine type and enter pincode.");
      return;
    }

    setLoading(true);
    try {
      // 1) WEATHER
      const w = await getWeatherByPincode(form.pincode);
      setWeather(w);

      // 2) CROP INTELLIGENCE (pure frontend logic)
      const crop = getCropInfo(form.crop_type, form.season);
      setCropInfo(crop);

      // 3) WEATHER-BASED DEMAND (0.8–1.2 approx)
      const weatherDemand = (() => {
        if (!w || !w.ok) return 0.9;

        const t = w.temp ?? 0;
        const r = w.rain ?? 0;
        const h = w.humidity ?? 0;
        let factor = 1.0;

        if (r > 10) factor += 0.08;
        if (t > 35) factor -= 0.06;
        if (h > 80) factor += 0.03;

        return Number(factor.toFixed(2));
      })();

      // 4) FINAL DEMAND INDEX (crop + weather)
      const demand_index = Number(
        (0.7 * crop.demandMultiplier + 0.3 * weatherDemand).toFixed(2)
      );
      setDemandIndex(demand_index);

      // 5) BUILD PAYLOAD FOR /smart_predict
      const durationHours = Number(form.duration_hours) || 1;
      const duration_days = Math.max(1, Math.ceil(durationHours / 8)); // convert hours → approx days

      const payload = {
        machine_type: form.machine_type.toUpperCase(),
        pincode: form.pincode,
        duration_days,
        season: form.season,
        crop_type: form.crop_type,
        demand_index,
        weather_temp: w.temp ?? 0,
        weather_humidity: w.humidity ?? 0,
        weather_rain: w.rain ?? 0,
      };

      // 6) CALL BACKEND
      const res = await smartPredict(payload);
      const data = res.data;

      if (!data || data.success === false) {
        setError(data?.message || "Prediction failed.");
        return;
      }

      setPrice(data.price);
      setMlBasePrice(data.ml_base_price);
      setDieselPrice(data.diesel_price); // number, NOT object
    } catch (err) {
      console.error("SMART PREDICT ERROR:", err);
      setError("Server or network failure.");
    } finally {
      setLoading(false);
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
            <FaCalculator /> Smart Price Predictor
          </h1>
          <p className="text-green-50 mt-2 text-lg">
            Get AI-powered rental price predictions based on weather, crop demand & market trends
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaTractor className="text-green-600" /> Enter Details
              </h2>

              <form onSubmit={handlePredict} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaTractor className="inline mr-2 text-green-600" />
                    Machine Type
                  </label>
                  <select
                    name="machine_type"
                    value={form.machine_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  >
                    <option value="">Select machine</option>
                    {machineTypes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaClock className="inline mr-2 text-green-600" />
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    name="duration_hours"
                    min="1"
                    value={form.duration_hours}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCloudSun className="inline mr-2 text-green-600" />
                      Season
                    </label>
                    <select
                      name="season"
                      value={form.season}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      {seasons.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaSeedling className="inline mr-2 text-green-600" />
                      Crop Type
                    </label>
                    <select
                      name="crop_type"
                      value={form.crop_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    >
                      {crops.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2 text-green-600" />
                    Pincode (Location)
                  </label>
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="e.g., 560001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  <FaCalculator />
                  {loading ? "Predicting..." : "Predict Price"}
                </button>
              </form>
            </div>
          </div>

          {/* Right - Results */}
          <div className="space-y-6">
            {/* Weather & Crop Insights */}
            {(weather || cropInfo) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <FaCloudSun className="inline text-green-600 mr-2" />
                  Insights
                </h3>

                {weather && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-700 mb-2">Location Data</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Temperature: <span className="font-medium">{weather.temp}°C</span></p>
                      <p>Humidity: <span className="font-medium">{weather.humidity}%</span></p>
                      <p>Rainfall: <span className="font-medium">{weather.rain} mm</span></p>
                      {dieselPrice != null && (
                        <p>Diesel Price: <span className="font-medium">₹{Number(dieselPrice).toFixed(2)}</span></p>
                      )}
                    </div>
                  </div>
                )}

                {cropInfo && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">
                      <FaSeedling className="inline text-green-600 mr-1" />
                      Crop Intelligence
                    </p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{cropInfo.notes}</p>
                      {cropInfo.recommendedMachines && (
                        <p className="mt-2">
                          <span className="font-medium">Recommended:</span>{" "}
                          {cropInfo.recommendedMachines.join(", ")}
                        </p>
                      )}
                      {demandIndex != null && (
                        <p>
                          <span className="font-medium">Demand Index:</span> {demandIndex}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Result */}
            {price != null && (
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-3">Predicted Price</h3>

                <div className="flex items-center gap-2 mb-4">
                  <FaRupeeSign className="text-3xl" />
                  <span className="text-5xl font-bold">{Number(price).toFixed(2)}</span>
                  <span className="text-green-100 text-lg">/hour</span>
                </div>

                {mlBasePrice != null && (
                  <div className="text-sm text-green-100 space-y-1 border-t border-green-400 pt-3">
                    <p>Base ML Price: ₹{mlBasePrice.toFixed(2)}</p>
                    {demandIndex != null && (
                      <p>Demand Factor: {demandIndex}</p>
                    )}
                  </div>
                )}

                <p className="text-xs text-green-50 mt-4">
                  Price calculated using weather conditions, crop demand, diesel prices & local market trends
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
