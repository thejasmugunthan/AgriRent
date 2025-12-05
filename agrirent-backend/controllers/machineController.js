// controllers/machineController.js
import Machine from "../models/Machine.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// --------- Multer config ----------
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safeName = Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, safeName);
  },
});

export const upload = multer({ storage });

/* ===========================
      ADD MACHINE
=========================== */
export const addMachine = async (req, res) => {
  try {
    const {
      ownerId,
      name,
      type,
      horsepower,
      ageYears,
      hoursUsed,
      pincode,
      maintenance_cost,
      fuel_price,
      rentPerHour,
    } = req.body;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: "ownerId required" });
    }

    const machine = new Machine({
      ownerId,
      name,
      type,
      horsepower: Number(horsepower) || 0,
      ageYears: Number(ageYears) || 0,
      hoursUsed: Number(hoursUsed) || 0,
      pincode,
      maintenance_cost: Number(maintenance_cost) || 0,
      fuel_price: Number(fuel_price) || 0,
      rentPerHour: Number(rentPerHour) || 0,
    });

    if (req.file) {
      machine.image_url = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    await machine.save();
    return res.json({ success: true, machine });
  } catch (err) {
    console.error("ADD MACHINE ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Add machine failed", error: err.message });
  }
};

/* ===========================
      GET ALL MACHINES
   (for Browse page)
=========================== */
export const getMachines = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    return res.json({ success: true, machines });
  } catch (err) {
    console.error("GET MACHINES ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load machines" });
  }
};

/* ===========================
      GET MACHINES BY OWNER
   (for My Machines)
=========================== */
export const getMachinesByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    if (!ownerId) {
      return res.status(400).json({ success: false, message: "ownerId required" });
    }

    const machines = await Machine.find({ ownerId }).sort({ createdAt: -1 });
    return res.json({ success: true, machines });
  } catch (err) {
    console.error("GET OWNER MACHINES ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load machines" });
  }
};

/* ===========================
      GET MACHINE BY ID
=========================== */
export const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }
    return res.json({ success: true, machine });
  } catch (err) {
    console.error("GET MACHINE BY ID ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

/* ===========================
      DELETE MACHINE
=========================== */
export const deleteMachine = async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE MACHINE ERROR:", err);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};

/* ===========================
      RATE MACHINE
=========================== */
export const rateMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { renterId, rating, review } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: "Rating is required" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ success: false, message: "Machine not found" });
    }

    const alreadyRated = machine.ratings.find(
      (r) => r.renterId?.toString() === renterId
    );
    if (alreadyRated) {
      return res
        .status(400)
        .json({ success: false, message: "You already rated this machine" });
    }

    machine.ratings.push({ renterId, rating, review });

    const total = machine.ratings.reduce((sum, r) => sum + r.rating, 0);
    machine.averageRating = total / machine.ratings.length;

    await machine.save();
    return res.json({ success: true, machine });
  } catch (err) {
    console.error("RATE MACHINE ERROR:", err);
    return res.status(500).json({ success: false, message: "Rating failed" });
  }
};
