import express from "express";
import {
  createRental,
  getBookedSlots,
  getMyRentals,
  getRentalsForRenter,
  getOwnerPendingRentals,
  getOwnerActiveRentals,
  getOwnerEarnings,
  updateRentalStatus,
  completeRental,
  cancelRental,
  extendRental,
  getOwnerAnalytics,
  getRenterAnalytics,
} from "../controllers/rentalController.js";

const router = express.Router();

// Create rental
router.post("/", createRental);

// Get booked slots
router.get("/booked/:machineId", getBookedSlots);

// Renter routes
router.get("/my/:renterId", getMyRentals);
router.get("/user/:userId", getRentalsForRenter);

// Owner routes

router.get("/owner/:ownerId/pending", getOwnerPendingRentals);
router.get("/owner/:ownerId/active", getOwnerActiveRentals);
router.get("/owner/:ownerId/earnings", getOwnerEarnings);

// COMPLETE rental
router.patch("/complete/:id", completeRental);

// CANCEL rental
router.patch("/cancel/:rentalId", cancelRental);

// EXTEND rental
router.patch("/extend/:rentalId", extendRental);
router.patch("/:rentalId/status", updateRentalStatus);
router.get("/owner/:ownerId/analytics", getOwnerAnalytics);
router.get("/renter/:renterId/analytics", getRenterAnalytics);



export default router;
