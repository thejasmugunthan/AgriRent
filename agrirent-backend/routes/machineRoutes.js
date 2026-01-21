// routes/machineRoutes.js
import express from "express";
import {
  upload,
  addMachine,
  getMachines,
  getMachinesByOwner,
  getMachineById,
  deleteMachine,
  rateMachine,
} from "../controllers/machineController.js";

const router = express.Router();

// Add machine (with image upload)
router.post("/", upload.single("image"), addMachine);

// All machines
router.get("/", getMachines);

// ⭐ FIX: Place BEFORE /:id route
router.post("/rate-machine/:machineId", rateMachine);

// Machines for specific owner
router.get("/owner/:ownerId", getMachinesByOwner);

// Single machine by ID
router.get("/:id", getMachineById);

// Delete machine
router.delete("/:id", deleteMachine);

export default router;
