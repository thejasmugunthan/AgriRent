import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaArrowLeft, FaClock, FaRupeeSign, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";

export default function Booking() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const now = new Date();

  const [machine, setMachine] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");

  const [totalHours, setTotalHours] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const formatInput = (d) =>
    d.toISOString().slice(0, 16);

  const dateKey = (d) => {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  useEffect(() => {
    const loadMachine = async () => {
      try {
        const res = await api.get(`/machines/${machineId}`);
        setMachine(res.data.machine || res.data);
      } catch {
        setError("Failed to load machine");
      } finally {
        setLoading(false);
      }
    };
    loadMachine();
  }, [machineId]);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const res = await api.get(`/rentals/booked/${machineId}`);
        setBookedSlots(res.data.slots || []);
      } catch {}
    };
    loadSlots();
  }, [machineId]);

  const slotsForDate = useMemo(() => {
    const ds = new Date(calendarDate);
    ds.setHours(0, 0, 0, 0);

    const de = new Date(ds);
    de.setHours(23, 59, 59, 999);

    return bookedSlots.filter((slot) => {
      const s = new Date(slot.startTime);
      const e = new Date(slot.endTime);
      return s < de && e > ds;
    });
  }, [calendarDate, bookedSlots]);

  const isHourBooked = (hour) => {
    const hStart = new Date(calendarDate);
    hStart.setHours(hour, 0, 0, 0);

    const hEnd = new Date(hStart);
    hEnd.setHours(hour + 1);

    return slotsForDate.some((slot) => {
      const s = new Date(slot.startTime);
      const e = new Date(slot.endTime);
      return hStart < e && hEnd > s;
    });
  };

  const isPastHour = (hour) => {
    const d = new Date(calendarDate);
    d.setHours(hour, 0, 0, 0);
    return d < now;
  };

  const selectHour = (hour) => {
    if (isHourBooked(hour) || isPastHour(hour)) return;

    const s = new Date(calendarDate);
    s.setHours(hour, 0, 0, 0);

    const e = new Date(s);
    e.setHours(hour + 1);

    setStart(formatInput(s));
    setEnd(formatInput(e));
  };

  const isOverlapping = () => {
    if (!start || !end) return false;

    const s = new Date(start);
    const e = new Date(end);

    return bookedSlots.some((slot) => {
      const bs = new Date(slot.startTime);
      const be = new Date(slot.endTime);
      return s < be && e > bs;
    });
  };

  const inputBlocked =
    isOverlapping() ||
    (start && new Date(start) < now) ||
    (end && new Date(end) < now);

  useEffect(() => {
    if (!start || !end || !machine) return;

    if (inputBlocked) {
      setTotalHours(0);
      setTotalPrice(0);
      return;
    }

    const diff = new Date(end) - new Date(start);
    if (diff <= 0) return;

    const hrs = diff / 3600000;
    const rounded = Math.round(hrs * 10) / 10;

    setTotalHours(rounded);
    setTotalPrice(rounded * machine.rentPerHour);
  }, [start, end, inputBlocked, machine]);

  const handleBook = async () => {
    if (inputBlocked) return;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return navigate("/login");

    try {
      const res = await api.post("/rentals", {
        machineId,
        renterId: user._id,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
        totalHours,
        totalPrice,
      });

      if (res.data.success) navigate("/my-rentals");
      else setError(res.data.message);
    } catch {
      setError("Booking failed");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl font-semibold text-gray-600">Loading…</div>
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

      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaCalendarAlt /> Book Your Machine
          </h1>
          <p className="text-green-50 mt-2">Select your preferred date and time slot</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT - Calendar & Slots */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" /> Select Date
              </h3>
              <Calendar
                onChange={setCalendarDate}
                value={calendarDate}
                tileDisabled={({ date }) => {
                  const d = new Date();
                  d.setHours(0, 0, 0, 0);
                  return date < d;
                }}
                className="w-full border-0 rounded-lg"
              />
            </div>

            {/* Hour Grid Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClock className="text-green-600" /> Available Time Slots
              </h3>

              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {Array.from({ length: 24 }).map((_, h) => {
                  const booked = isHourBooked(h);
                  const past = isPastHour(h);

                  let btnClass = "px-4 py-3 rounded-lg font-medium transition-all ";
                  if (booked) {
                    btnClass += "bg-red-100 text-red-600 cursor-not-allowed";
                  } else if (past) {
                    btnClass += "bg-gray-100 text-gray-400 cursor-not-allowed";
                  } else {
                    btnClass += "bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md";
                  }

                  return (
                    <button
                      key={h}
                      disabled={booked || past}
                      className={btnClass}
                      onClick={() => selectHour(h)}
                    >
                      {String(h).padStart(2, "0")}:00
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span className="text-gray-600">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Past</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Time Selection & Price */}
          <div className="space-y-6">
            {/* Time Selection Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Select Time Range</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    min={now.toISOString().slice(0, 16)}
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      inputBlocked
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    min={now.toISOString().slice(0, 16)}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      inputBlocked
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                  />
                </div>
              </div>

              {inputBlocked && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    ⚠️ This time slot is unavailable or in the past
                  </p>
                </div>
              )}
            </div>

            {/* Price Summary Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-100">Total Hours:</span>
                  <span className="text-2xl font-bold">{totalHours}h</span>
                </div>

                <div className="border-t border-green-400 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-100">Total Price:</span>
                    <div className="flex items-center gap-1">
                      <FaRupeeSign className="text-2xl" />
                      <span className="text-3xl font-bold">{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              disabled={inputBlocked || !start || !end}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                inputBlocked || !start || !end
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
              }`}
              onClick={handleBook}
            >
              <FaCheckCircle /> Confirm Booking
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
