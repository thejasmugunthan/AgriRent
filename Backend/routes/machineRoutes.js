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
  updateMachine
} from "../controllers/machineController.js";

const router = express.Router();

// Add machine 
router.post("/", upload.single("image"), addMachine);

// All machines
router.get("/", getMachines);
router.post("/rate-machine/:machineId", rateMachine);

// Machines for specific owner
router.get("/owner/:ownerId", getMachinesByOwner);

// Single machine by ID
router.get("/:id", getMachineById);

// Delete machine
router.delete("/:id", deleteMachine);

// Update machine
router.put("/:id", upload.single("image"), updateMachine);

export default router;
