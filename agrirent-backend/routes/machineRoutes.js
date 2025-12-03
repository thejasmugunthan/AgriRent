import express from "express";
import {
  addMachine,
  getMachineById,
  getMachines,
  deleteMachine,
  rateMachine,
  upload
} from "../controllers/machineController.js";

const router = express.Router();

// Add Machine
router.post("/", upload.single("image"), addMachine);

// Get all machines
router.get("/", getMachines);

// ⭐ Rate Machine
router.post("/rate-machine/:machineId", rateMachine);

// Delete Machine
router.delete("/:id", deleteMachine);

// ⭐ KEEP THIS LAST — avoids route conflicts
router.get("/:id", getMachineById);

export default router;
