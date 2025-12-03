import Machine from "../models/Machine.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const name = Date.now() + "_" + file.originalname.replace(/\s+/g, "_");
    cb(null, name);
  },
});

export const upload = multer({ storage });

/* ===========================
      ADD MACHINE
=========================== */
export const addMachine = async (req, res) => {
  try {
    const machine = new Machine({
      ...req.body,
      horsepower: Number(req.body.horsepower) || 0,
      ageYears: Number(req.body.ageYears) || 0,
      hoursUsed: Number(req.body.hoursUsed) || 0,
      maintenance_cost: Number(req.body.maintenance_cost) || 0,
      fuel_price: Number(req.body.fuel_price) || 0,
      rentPerHour: Number(req.body.rentPerHour) || 0,
    });

    if (req.file) {
      machine.image_url = `/uploads/${req.file.filename}`;
    }

    await machine.save();
    res.json({ success: true, machine });
  } catch (err) {
    console.error("Add machine error:", err);
    res.status(500).json({ message: "Add machine failed" });
  }
};

/* ===========================
      GET MACHINE BY ID
=========================== */
// GET one machine
export const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    res.json(machine);  // ✔ Must return full machine including rentPerHour
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===========================
      GET ALL MACHINES
=========================== */
export const getMachines = async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (err) {
    console.error("Get machines error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ===========================
      DELETE MACHINE
=========================== */
export const deleteMachine = async (req, res) => {
  try {
    await Machine.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete machine error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ===========================
      ⭐ RATE MACHINE
=========================== */
export const rateMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { renterId, rating, review } = req.body;

    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    // Prevent multiple ratings by same person
    const alreadyRated = machine.ratings.find(
      (r) => r.renterId.toString() === renterId
    );

    if (alreadyRated)
      return res.status(400).json({ message: "You already rated this machine" });

    machine.ratings.push({ renterId, rating, review });

    // Calculate average
    const total = machine.ratings.reduce((sum, r) => sum + r.rating, 0);
    machine.averageRating = total / machine.ratings.length;

    await machine.save();

    res.json({ success: true, machine });
  } catch (err) {
    console.error("Rate machine error:", err);
    res.status(500).json({ message: "Rating failed" });
  }
};
