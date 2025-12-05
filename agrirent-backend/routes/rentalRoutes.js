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

/* =============================================
   IMPORTANT — STATIC ROUTES FIRST
   (otherwise /:rentalId/status catches /cancel)
============================================= */

// COMPLETE rental
router.patch("/complete/:id", completeRental);

// CANCEL rental
router.patch("/cancel/:rentalId", cancelRental);

// EXTEND rental
router.patch("/extend/:rentalId", extendRental);

/* =============================================
   DYNAMIC GENERIC ROUTE GOES LAST ALWAYS ❗
============================================= */
router.patch("/:rentalId/status", updateRentalStatus);


export default router;
