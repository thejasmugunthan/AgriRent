// controllers/rentalController.js
import Rental from "../models/Rental.js";
import User from "../models/User.js";
import Machine from "../models/Machine.js";

/* ============================================================
   🔹 UTILITY: GET OWNER MACHINE IDS
============================================================ */
const getOwnerMachineIds = async (ownerId) => {
  const machines = await Machine.find({ ownerId }).select("_id");
  return machines.map((m) => m._id);
};

/* ============================================================
   🔹 CREATE RENTAL  (status: pending)
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

    if (!machineId || !renterId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    if (String(machine.ownerId) === String(renterId)) {
      return res.status(400).json({ message: "Owner cannot rent own machine" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ message: "End time must be after start" });
    }

    // Overlap check (active + pending)
    const overlap = await Rental.findOne({
      machineId,
      status: { $in: ["pending", "active"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (overlap) {
      return res
        .status(400)
        .json({ message: "Machine already booked for that time range" });
    }

    // Compute price (always server-side)
    const diffMs = end - start;
    const rawHours = diffMs / (1000 * 60 * 60);
    const computedHours = Math.ceil(rawHours * 10) / 10;
    const price = computedHours * (machine.rentPerHour || 0);

    const rental = new Rental({
      machineId,
      renterId,
      ownerId: machine.ownerId,
      startTime: start,
      endTime: end,
      totalHours: totalHours || computedHours,
      totalPrice: totalPrice || price,
      status: "pending",
    });

    await rental.save();

    await User.findByIdAndUpdate(renterId, {
      $push: { rentals: rental._id },
    });

    return res.json({ success: true, rental });
  } catch (err) {
    console.error("CREATE RENTAL ERROR:", err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

/* ============================================================
   🔹 GET BOOKED SLOTS (ONLY active rentals block)
============================================================ */
export const getBookedSlots = async (req, res) => {
  try {
    const { machineId } = req.params;

    const rentals = await Rental.find({
      machineId,
      status: "active",
    }).select("startTime endTime status");

    res.json({ success: true, slots: rentals });
  } catch (err) {
    console.error("BOOKED SLOTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch booked slots" });
  }
};

/* ============================================================
   🔹 RENTER — GET MY RENTALS
============================================================ */
export const getMyRentals = async (req, res) => {
  try {
    const { renterId } = req.params;

    const rentals = await Rental.find({ renterId })
      .sort({ createdAt: -1 })
      .populate("machineId", "name type image_url rentPerHour")
      .populate("ownerId", "name phone");

    res.json({ success: true, rentals });
  } catch (err) {
    console.error("GET MY RENTALS ERROR:", err);
    res.status(500).json({ message: "Failed to load rentals" });
  }
};

/* ============================================================
   🔹 BACKWARD COMPATIBILITY ROUTE (old apps)
============================================================ */
export const getRentalsForRenter = async (req, res) => {
  try {
    const renterId = req.params.userId;

    const rentals = await Rental.find({ renterId })
      .populate("machineId")
      .populate("ownerId", "name phone");

    res.json({ success: true, rentals });
  } catch (err) {
    console.error("OLD RENTER ROUTE ERROR:", err);
    res.status(500).json({ message: "Failed to load rentals" });
  }
};

/* ============================================================
   🔹 OWNER — PENDING RENTALS
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
      .populate("renterId")
      .populate("machineId");

    res.json({ success: true, rentals });
  } catch (err) {
    console.error("OWNER PENDING ERROR:", err);
    res.status(500).json({ message: "Failed to load pending rentals" });
  }
};

/* ============================================================
   🔹 OWNER — ACTIVE RENTALS
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
      .populate("renterId")
      .populate("machineId");

    res.json({ success: true, rentals });
  } catch (err) {
    console.error("OWNER ACTIVE ERROR:", err);
    res.status(500).json({ message: "Failed to load active rentals" });
  }
};

/* ============================================================
   🔹 UPDATE RENTAL STATUS (approve / cancel / completed)
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

    res.json({ success: true, rental });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/* ============================================================
   🔹 MARK RENTAL AS COMPLETED (Backend)
============================================================ */
export const completeRental = async (req, res) => {
  try {
    const { id } = req.params;

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    if (rental.status !== "active") {
      return res.status(400).json({ message: "Rental is not active" });
    }

    rental.status = "completed";
    await rental.save();

    return res.json({ success: true, message: "Rental marked as completed" });
  } catch (err) {
    console.error("COMPLETE RENTAL ERROR:", err);
    return res.status(500).json({ message: "Failed to complete rental" });
  }
};


/* ============================================================
   🔹 CANCEL RENTAL
============================================================ */
// CANCEL RENTAL (STATUS → cancelled)
export const cancelRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    if (!rentalId) {
      return res.status(400).json({
        success: false,
        message: "Rental ID is required",
      });
    }

    const rental = await Rental.findById(rentalId);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Do not allow cancelling a completed rental
    if (rental.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed rental",
      });
    }

    // Update the rental status
    rental.status = "cancelled";
    await rental.save();

    return res.json({
      success: true,
      message: "Rental cancelled successfully",
      rental,
    });

  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel rental",
    });
  }
};

/* ============================================================
   🔹 EXTEND RENTAL
============================================================ */
export const extendRental = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const { extraDays, dailyRate } = req.body;

    const rental = await Rental.findById(rentalId);
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const days = Number(extraDays) || 0;
    const rate = Number(dailyRate) || 0;

    const newEnd = new Date(rental.endTime);
    newEnd.setDate(newEnd.getDate() + days);

    rental.endTime = newEnd;
    rental.totalPrice = Number(rental.totalPrice) + rate * days;

    await rental.save();

    res.json({ success: true, rental });
  } catch (err) {
    console.error("EXTEND ERROR:", err);
    res.status(500).json({ message: "Failed to extend" });
  }
};

/* ============================================================
   🔹 RATE MACHINE
============================================================ */
export const rateMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { renterId, rating, review } = req.body;

    if (!rating) return res.status(400).json({ message: "Rating required" });

    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    machine.ratings.push({ renterId, rating, review });

    const avg =
      machine.ratings.reduce((s, r) => s + Number(r.rating), 0) /
      machine.ratings.length;

    machine.averageRating = avg;

    await machine.save();

    res.json({ success: true, message: "Rating submitted", machine });
  } catch (err) {
    console.error("RATE ERROR:", err);
    res.status(500).json({ message: "Failed to rate machine" });
  }
};

/* ============================================================
   🔹 OWNER ANALYTICS
============================================================ */
export const getOwnerAnalytics = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const machineIds = await getOwnerMachineIds(ownerId);

    const rentals = await Rental.find({
      machineId: { $in: machineIds },
      status: "completed",
    }).populate("machineId");

    const earnings = {};
    const counts = {};
    const totals = {};

    // init past 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("default", { month: "short", year: "numeric" });
      earnings[key] = 0;
      counts[key] = 0;
    }

    rentals.forEach((r) => {
      const key = new Date(r.endTime).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (earnings[key] !== undefined) {
        earnings[key] += Number(r.totalPrice);
        counts[key] += 1;
      }

      const name = r.machineId?.name || "Unknown";
      totals[name] = (totals[name] || 0) + Number(r.totalPrice);
    });

    const topMachines = Object.entries(totals)
      .map(([name, earnings]) => ({ name, earnings }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    res.json({
      success: true,
      monthlyEarnings: earnings,
      monthlyRentals: counts,
      topMachines,
    });
  } catch (err) {
    console.error("OWNER ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};

/* ============================================================
   🔹 OWNER EARNINGS
============================================================ */
export const getOwnerEarnings = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const machineIds = await getOwnerMachineIds(ownerId);

    const rentals = await Rental.find({
      machineId: { $in: machineIds },
      status: "completed",
    })
      .populate("machineId", "name")
      .populate("renterId", "name")
      .sort({ endTime: -1 });

    const totalEarnings = rentals.reduce(
      (sum, r) => sum + Number(r.totalPrice),
      0
    );

    res.json({ success: true, totalEarnings, completedRentals: rentals });
  } catch (err) {
    console.error("OWNER EARNINGS ERROR:", err);
    res.status(500).json({ message: "Failed to load earnings" });
  }
};

/* ============================================================
   🔹 RENTER ANALYTICS
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

    // init past 12 months
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("default", { month: "short", year: "numeric" });
      monthlyRentals[key] = 0;
      monthlySpending[key] = 0;
    }

    rentals.forEach((r) => {
      const key = new Date(r.startTime).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      monthlyRentals[key] += 1;
      monthlySpending[key] += Number(r.totalPrice || 0);

      const type = r.machineId?.type || "Other";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    res.json({
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
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
