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

// All machines (for Browse Machines)
router.get("/", getMachines);

// Machines for a specific owner (My Machines)
router.get("/owner/:ownerId", getMachinesByOwner);

// Single machine by id
router.get("/:id", getMachineById);

// Delete machine
router.delete("/:id", deleteMachine);

// Rate machine
router.post("/rate-machine/:machineId", rateMachine);

export default router;
