// controllers/rentalController.js
import Rental from "../models/Rental.js";
import User from "../models/User.js";
import Machine from "../models/Machine.js";

/* ============================================================
   📌 CREATE RENTAL  (initial status = "pending")
   - attaches ownerId from Machine
============================================================ */
export const createRental = async (req, res) => {
  try {
    const {
      machineId,
      renterId,
      startTime,
      endTime,
      totalHours,
      totalPrice,
    } = req.body;

    if (!machineId || !renterId) {
      return res
        .status(400)
        .json({ message: "Missing machineId or renterId" });
    }

    // Get machine in order to attach ownerId
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    const rental = new Rental({
      machineId,
      renterId,
      ownerId: machine.ownerId, // ⭐ attach ownerId from machine
      startTime,
      endTime,
      totalHours: Number(totalHours) || 0,
      totalPrice: Number(totalPrice) || 0,
      status: "pending", // waiting for owner approval
    });

    await rental.save();

    // Link rental to renter user (optional but useful)
    await User.findByIdAndUpdate(renterId, {
      $push: { rentals: rental._id },
    });

    return res.json({ success: true, rental });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

/* ============================================================
   📌 MY RENTALS (Renter)
   GET /api/rentals/my/:renterId
============================================================ */
export const getMyRentals = async (req, res) => {
  try {
    const { renterId } = req.params;

    const rentals = await Rental.find({ renterId })
      .sort({ createdAt: -1 })
      .populate("machineId", "name type image_url rentPerHour")
      .populate("ownerId", "name phone");

    return res.json({ success: true, rentals });
  } catch (err) {
    console.error("GET MY RENTALS ERROR:", err);
    res.status(500).json({ message: "Error fetching rentals" });
  }
};

/* 
  Optional alias used by some old routes.
  If your rentalRoutes uses getRentalsForRenter, this keeps it working.
*/
export const getRentalsForRenter = async (req, res) => {
  try {
    const renterId = req.params.userId;   // FIXED

    const rentals = await Rental.find({ renterId })
      .populate("machineId")
      .populate("ownerId", "name phone"); // include phone for chat

    res.status(200).json({ success: true, rentals });
  } catch (err) {
    console.error("Load renter rentals error:", err);
    res.status(500).json({ error: "Failed to load rentals" });
  }
};


/* ============================================================
   📌 HELPER — GET OWNER MACHINE IDs
============================================================ */
const getOwnerMachineIds = async (ownerId) => {
  const machines = await Machine.find({ ownerId }).select("_id");
  return machines.map((m) => m._id);
};

/* ============================================================
   📌 OWNER — PENDING RENTALS
   GET /api/rentals/owner/:ownerId/pending
============================================================ */
export const getOwnerPendingRentals = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const machineIds = await getOwnerMachineIds(ownerId);

    const rentals = await Rental.find({
      machineId: { $in: machineIds },
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("machineId")
      .populate("renterId");

    return res.json({ success: true, rentals });
  } catch (err) {
    console.error("PENDING RENTALS ERROR:", err);
    res.status(500).json({ message: "Error fetching pending rentals" });
  }
};

/* ============================================================
   📌 OWNER — ACTIVE RENTALS
   GET /api/rentals/owner/:ownerId/active
============================================================ */
export const getOwnerActiveRentals = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const machineIds = await getOwnerMachineIds(ownerId);

    const rentals = await Rental.find({
      machineId: { $in: machineIds },
      status: "active",
    })
      .sort({ createdAt: -1 })
      .populate("machineId")
      .populate("renterId");

    return res.json({ success: true, rentals });
  } catch (err) {
    console.error("ACTIVE RENTALS ERROR:", err);
    res.status(500).json({ message: "Error fetching active rentals" });
  }
};

/* ============================================================
   📌 UPDATE RENTAL STATUS (Approve / Complete / Cancel etc.)
   PATCH /api/rentals/:rentalId/status
============================================================ */
export const updateRentalStatus = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "active", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const rental = await Rental.findByIdAndUpdate(
      rentalId,
      { status },
      { new: true }
    );

    return res.json({ success: true, rental });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Error updating status" });
  }
};

/* ============================================================
   📌 OWNER — MANUAL COMPLETION
   PATCH /api/rentals/:id/complete
============================================================ */
export const completeRental = async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    rental.status = "completed";
    await rental.save();

    // Mark machine available again
    await Machine.findByIdAndUpdate(rental.machineId, { available: true });

    return res.json({ success: true, message: "Rental marked as completed" });
  } catch (err) {
    console.error("COMPLETE RENTAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ============================================================
   📌 CANCEL RENTAL
   PATCH /api/rentals/:rentalId/cancel
============================================================ */
export const cancelRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    const rental = await Rental.findByIdAndUpdate(
      rentalId,
      { status: "cancelled" },
      { new: true }
    );

    return res.json({ success: true, rental });
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

/* ============================================================
   📌 EXTEND RENTAL
   PATCH /api/rentals/:rentalId/extend
============================================================ */
export const extendRental = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { extraDays, dailyRate } = req.body;

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const days = Number(extraDays) || 0;
    const rate = Number(dailyRate) || 0;

    const newEndDate = new Date(rental.endTime);
    newEndDate.setDate(newEndDate.getDate() + days);

    rental.endTime = newEndDate;
    rental.totalPrice = Number(rental.totalPrice || 0) + rate * days;

    await rental.save();

    return res.json({ success: true, rental });
  } catch (err) {
    console.error("EXTEND ERROR:", err);
    res.status(500).json({ message: "Extend failed" });
  }
};

/* ============================================================
   📌 RATE MACHINE (Renter)
   POST /api/rentals/rate/:machineId
============================================================ */
export const rateMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { renterId, rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Rating required" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    // Add rating
    machine.ratings.push({
      renterId,
      rating,
      review,
    });

    // Update average rating
    const avg =
      machine.ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
      machine.ratings.length;

    machine.averageRating = avg;

    await machine.save();

    return res.json({ success: true, message: "Rating added", machine });
  } catch (err) {
    console.error("RATE MACHINE ERROR:", err);
    res.status(500).json({ message: "Server error while rating" });
  }
};

/* ============================================================
   📌 OWNER ANALYTICS
   GET /api/rentals/analytics/owner/:ownerId
============================================================ */
export const getOwnerAnalytics = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const machineIds = await getOwnerMachineIds(ownerId);

    const rentals = await Rental.find({
      machineId: { $in: machineIds },
      status: "completed",
    }).populate("machineId");

    const monthlyEarnings = {};
    const monthlyRentals = {};
    const machineTotals = {};

    // init last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyEarnings[key] = 0;
      monthlyRentals[key] = 0;
    }

    rentals.forEach((r) => {
      const key = new Date(r.endTime).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (monthlyEarnings[key] !== undefined) {
        monthlyEarnings[key] += Number(r.totalPrice || 0);
        monthlyRentals[key] += 1;
      }

      const name = r.machineId?.name || "Unknown";
      machineTotals[name] = (machineTotals[name] || 0) + Number(r.totalPrice || 0);
    });

    const topMachines = Object.entries(machineTotals)
      .map(([name, earnings]) => ({ name, earnings }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    return res.json({
      success: true,
      monthlyEarnings,
      monthlyRentals,
      topMachines,
    });
  } catch (err) {
    console.error("OWNER ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};

// =========================
// OWNER EARNINGS SUMMARY
// =========================
export const getOwnerEarnings = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Get all machines owned by this owner
    const machines = await Machine.find({ ownerId }).select("_id");

    const machineIds = machines.map((m) => m._id);

    // Get all completed rentals for these machines
    const rentals = await Rental.find({
      machineId: { $in: machineIds },
      status: "completed",
    })
      .populate("machineId", "name")
      .populate("renterId", "name")
      .sort({ endTime: -1 });

    const totalEarnings = rentals.reduce(
      (sum, r) => sum + Number(r.totalPrice || 0),
      0
    );

    res.json({
      success: true,
      totalEarnings,
      completedRentals: rentals,
    });
  } catch (err) {
    console.error("OWNER EARNINGS ERROR:", err);
    res.status(500).json({ message: "Error fetching earnings" });
  }
};

/* ============================================================
   📌 RENTER ANALYTICS
   GET /api/rentals/analytics/renter/:renterId
============================================================ */
export const getRenterAnalytics = async (req, res) => {
  try {
    const { renterId } = req.params;

    const rentals = await Rental.find({ renterId })
      .populate("machineId")
      .sort({ createdAt: 1 });

    const monthlyRentals = {};
    const monthlySpending = {};
    const typeCount = {};

    // init last 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthlyRentals[key] = 0;
      monthlySpending[key] = 0;
    }

    rentals.forEach((r) => {
      const key = new Date(r.startTime).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (monthlyRentals[key] !== undefined) {
        monthlyRentals[key] += 1;
        monthlySpending[key] += Number(r.totalPrice || 0);
      }

      const type = r.machineId?.type || "Other";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return res.json({
      success: true,
      monthlyRentals,
      monthlySpending,
      mostRentedTypes: Object.entries(typeCount).map(([type, count]) => ({
        type,
        count,
      })),
    });
  } catch (err) {
    console.error("RENTER ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Analytics fetch failed" });
  }
};
