import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../css/Booking.css";
import { 
  FaArrowLeft, 
  FaClock, 
  FaRupeeSign, 
  FaCheckCircle, 
  FaCalendarAlt,
  FaExclamationTriangle
} from "react-icons/fa";

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

  const formatInput = (d) => {
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - offset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  useEffect(() => {
    const loadMachine = async () => {
      try {
        const res = await api.get(`/machines/${machineId}`);
        setMachine(res.data.machine || res.data);
      } catch {
        setError("Failed to load machine details.");
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
      } catch (err) {
        console.error("Could not load slots", err);
      }
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
    d.setHours(hour + 1, 0, 0, 0); 
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
    (end && new Date(end) < now) ||
    (start && end && new Date(start) >= new Date(end));

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
      setError("Booking failed. Please try again.");
    }
  };

  if (loading) return <div className="loading-screen">Loading Machine Details...</div>;

  return (
    <div className="booking-page">
      <div className="booking-container">
        
        {/* HEADER */}
        <div className="booking-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FaArrowLeft /> Back
          </button>
          
          <div>
            <h1 className="header-title">
              Book Machine
            </h1>
            {machine && (
               <div className="machine-subtitle">
                 Checking availability for: {machine.name}
               </div>
            )}
          </div>
        </div>

        <div className="booking-grid">
          
          {/* LEFT COLUMN: Calendar & Slots */}
          <div className="left-col">
            
            {/* Calendar Card */}
            <div className="glass-card mb-6">
              <h3 className="card-title">
                <FaCalendarAlt /> Select Date
              </h3>
              <Calendar
                onChange={setCalendarDate}
                value={calendarDate}
                minDate={new Date()}
                tileDisabled={({ date }) => {
                   const future = new Date();
                   future.setMonth(future.getMonth() + 3);
                   return date > future;
                }}
              />
            </div>

            {/* Slots Grid Card */}
            <div className="glass-card">
              <h3 className="card-title">
                <FaClock /> Availability for {calendarDate.toLocaleDateString()}
              </h3>
              
              <div className="slot-grid">
                {Array.from({ length: 24 }).map((_, h) => {
                  const booked = isHourBooked(h);
                  const past = isPastHour(h);
                  let statusClass = "";
                  
                  if (booked) statusClass = "booked";
                  else if (past) statusClass = "past";

                  return (
                    <button
                      key={h}
                      disabled={booked || past}
                      className={`slot-btn ${statusClass}`}
                      onClick={() => selectHour(h)}
                    >
                      {String(h).padStart(2, "0")}:00
                    </button>
                  );
                })}
              </div>

              <div className="legend">
                <span><span className="dot green"></span>Available</span>
                <span><span className="dot red"></span>Booked</span>
                <span><span className="dot gray"></span>Past</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Actions */}
          <div className="right-col">
            <div className="glass-card sticky-card">
              <h3 className="card-title">Booking Details</h3>

              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="datetime-local"
                  min={now.toISOString().slice(0, 16)}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="datetime-local"
                  min={start || now.toISOString().slice(0, 16)}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="glass-input"
                />
              </div>

              {inputBlocked && start && end && (
                <div className="blocked-alert">
                  <FaExclamationTriangle />
                  <span>Selected time is unavailable or invalid.</span>
                </div>
              )}

              <div className="summary-section">
                <div className="summary-row">
                  <span>Rate per hour</span>
                  <span><FaRupeeSign /> {machine?.rentPerHour}</span>
                </div>
                <div className="summary-row">
                  <span>Duration</span>
                  <span>{totalHours} hrs</span>
                </div>
                
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <div className="price-tag">
                    <FaRupeeSign size={20} />
                    {totalPrice.toFixed(0)}
                  </div>
                </div>
              </div>

              <button
                disabled={inputBlocked || !start || !end || totalHours <= 0}
                className="book-btn"
                onClick={handleBook}
              >
                <FaCheckCircle /> Confirm Booking
              </button>

              {error && (
                <div className="mt-4 text-center text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}