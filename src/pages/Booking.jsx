/** FULL BOOKING.JSX - FINAL VERSION **/
import React, { useEffect, useState, useMemo } from "react";
import "../css/Booking.css";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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

  if (loading) return <div>Loading…</div>;

  return (
    <div className="booking-page">
      <h1>Booking</h1>

      <div className="booking-layout">
        {/* LEFT */}
        <div className="left">
          <div className="calendar-card">
            <Calendar
              onChange={setCalendarDate}
              value={calendarDate}
              tileDisabled={({ date }) => {
                const d = new Date();
                d.setHours(0, 0, 0, 0);
                return date < d;
              }}
              tileClassName={({ date }) => {
                if (date.getDay() === 0 || date.getDay() === 6) return null;
                return null;
              }}
            />
          </div>

          <div className="hour-grid">
            <h3>Hourly Slots</h3>

            <div className="hour-grid-container">
              {Array.from({ length: 24 }).map((_, h) => {
                const booked = isHourBooked(h);
                const past = isPastHour(h);

                let cls = "hour-slot ";
                if (booked) cls += " booked";
                else if (past) cls += " disabled";
                else cls += " free";

                return (
                  <button
                    key={h}
                    disabled={booked || past}
                    className={cls}
                    onClick={() => selectHour(h)}
                  >
                    {String(h).padStart(2, "0")}:00
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="time-card">
            <h3>Select Time</h3>

            <label>
              Start Time
              <input
                type="datetime-local"
                min={now.toISOString().slice(0, 16)}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={inputBlocked ? "blocked" : ""}
              />
            </label>

            <label>
              End Time
              <input
                type="datetime-local"
                min={now.toISOString().slice(0, 16)}
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={inputBlocked ? "blocked" : ""}
              />
            </label>
          </div>

          <div className="price-card">
            <p>Total Hours: {totalHours}</p>
            <h2>₹{totalPrice.toFixed(2)}</h2>
          </div>

          <button
            disabled={inputBlocked}
            className="confirm-btn"
            onClick={handleBook}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
