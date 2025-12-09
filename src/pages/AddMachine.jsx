import React, { useState } from "react";
import { addMachine, predictPrice } from "../api/machineApi";
import {
  FaTractor,
  FaTachometerAlt,
  FaMoneyBillWave,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
  FaCamera,
  FaClock,
  FaMapMarkerAlt,
  FaTools,
  FaGasPump,
  FaMagic,
  FaSave,
} from "react-icons/fa";

export default function AddMachine() {
  const userId = localStorage.getItem("userId");

  const MACHINE_TYPES = ["Tractor", "Harvester", "Rotavator", "Cultivator"];
  const HORSEPOWER_OPTIONS = [
    20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 75, 80, 90, 100,
  ];

  const [form, setForm] = useState({
    name: "",
    machine_type: "",
    horsepower: "",
    age_years: "",
    hours_used: "",
    pincode: "",
    maintenance_cost: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [dieselPrice, setDieselPrice] = useState(95);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  /* =====================================================
        ⭐ GET LIVE DIESEL PRICE
  ====================================================== */
  const fetchDieselPrice = async () => {
    try {
      const res = await fetch("http://localhost:5000/get_diesel");
      const data = await res.json();
      setDieselPrice(data.diesel_price);
      return data.diesel_price;
    } catch (err) {
      console.error("Diesel API failed:", err);
      return 95; // fallback value
    }
  };

  /* =====================================================
        ⭐ ML – Predict Price FastAPI
  ====================================================== */
  const handlePredict = async () => {
    if (!form.pincode || !form.machine_type || !form.horsepower)
      return alert("Select machine type, horsepower and enter pincode");

    setLoading(true);

    try {
      // 1) fetch diesel price first
      const liveDiesel = await fetchDieselPrice();

      // 2) build ML payload
      const payload = {
        machine_type: form.machine_type,
        horsepower: Number(form.horsepower),
        age_years: Number(form.age_years || 0),
        hours_used: Number(form.hours_used || 0),
        pincode: form.pincode,
        maintenance_cost: Number(form.maintenance_cost || 0),
        fuel_price: liveDiesel,
      };

      // 3) call ML API
      const res = await predictPrice(payload);

      const price = res.data?.price || res.data?.predicted_rental_price;
      if (!price) throw new Error("ML returned invalid response");

      setPredictedPrice(Number(price).toFixed(2));
    } catch (err) {
      console.error("PREDICT ERROR:", err);
      alert("Prediction failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
      ⭐ SAVE MACHINE (to Node Backend)
  ====================================================== */
  const handleSave = async () => {
    if (!userId) return alert("User not logged in!");
    if (!predictedPrice) return alert("Predict price first!");

    const fd = new FormData();
    fd.append("ownerId", userId);
    fd.append("name", form.name);
    fd.append("type", form.machine_type);
    fd.append("horsepower", form.horsepower);
    fd.append("ageYears", form.age_years);
    fd.append("hoursUsed", form.hours_used);
    fd.append("pincode", form.pincode);
    fd.append("maintenance_cost", form.maintenance_cost);
    fd.append("fuel_price", dieselPrice);
    fd.append("rentPerHour", predictedPrice);

    if (file) fd.append("image", file);

    try {
      await addMachine(fd);
      alert("Machine added successfully!");
      window.location.href = "/my-machines";
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Failed to save machine");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/welcome";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg flex flex-col min-h-screen">
        <div className="flex-1">
          <div className="p-6 border-b border-gray-200">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-green-700">
              <FaTractor className="text-3xl" /> AgriRent
            </h2>
          </div>

          <nav className="p-4 space-y-2">
            <a
              href="/owner-dashboard"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaTachometerAlt /> Dashboard
            </a>
            <a
              href="/my-machines"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaTractor /> My Machines
            </a>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
            >
              <FaTractor /> Add Machine
            </button>
            <a
              href="/earnings"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaMoneyBillWave /> Earnings
            </a>
            <a
              href="/analytics"
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              <FaChartLine /> Analytics
            </a>
          </nav>
        </div>

        <div className="p-4 space-y-2 border-t border-gray-200">
          <a
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            <FaUserCircle /> Profile
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Add New Machine</h1>
            <p className="text-gray-600">Fill in the details below to list your agricultural machine for rent</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              {/* Machine Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Machine Name
                </label>
                <input
                  name="name"
                  placeholder="e.g., John Deere 5050D"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Two Column Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Machine Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Machine Type
                  </label>
                  <select
                    name="machine_type"
                    onChange={handleChange}
                    value={form.machine_type}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select Machine Type</option>
                    {MACHINE_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Horsepower */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horsepower
                  </label>
                  <select
                    name="horsepower"
                    onChange={handleChange}
                    value={form.horsepower}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select Horsepower</option>
                    {HORSEPOWER_OPTIONS.map((hp) => (
                      <option key={hp} value={hp}>{hp} HP</option>
                    ))}
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-green-600" /> Age (Years)
                  </label>
                  <input
                    name="age_years"
                    type="number"
                    placeholder="e.g., 3"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Hours Used */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-green-600" /> Hours Used
                  </label>
                  <input
                    name="hours_used"
                    type="number"
                    placeholder="e.g., 500"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-600" /> Pincode
                  </label>
                  <input
                    name="pincode"
                    placeholder="e.g., 560001"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Maintenance Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaTools className="text-green-600" /> Maintenance Cost
                  </label>
                  <input
                    name="maintenance_cost"
                    type="number"
                    placeholder="e.g., 5000"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Diesel Price Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <FaGasPump className="text-xl" />
                  <span className="font-semibold">Live Diesel Price:</span>
                  <span className="text-2xl font-bold">₹{dieselPrice}</span>
                  <span className="text-sm">(Auto-fetched)</span>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaCamera className="text-green-600" /> Machine Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFile}
                    className="hidden"
                    id="file-upload"
                    accept="image/*"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="preview"
                          className="max-w-xs mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-green-600 font-medium">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FaCamera className="text-5xl text-gray-400 mx-auto" />
                        <p className="text-gray-600">Click to upload machine image</p>
                        <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Predict Button */}
              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Predicting Price...
                  </>
                ) : (
                  <>
                    <FaMagic className="text-xl" />
                    Predict Rental Price with AI
                  </>
                )}
              </button>

              {/* Prediction Result */}
              {predictedPrice && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 animate-slide-up">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 mb-2">AI Predicted Hourly Rental Price</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-5xl font-bold text-green-600">₹{predictedPrice}</span>
                      <span className="text-xl text-gray-600">/hour</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                  >
                    <FaSave className="text-xl" />
                    Save Machine & List for Rent
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
