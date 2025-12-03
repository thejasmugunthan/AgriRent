import express from "express";
import {
  createRental,
  getMyRentals,
  getRentalsForRenter,
  getOwnerEarnings,
  getOwnerPendingRentals,
  getOwnerActiveRentals,
  updateRentalStatus,
  getOwnerAnalytics,
  getRenterAnalytics,
  cancelRental,
  completeRental,
  extendRental,
  rateMachine
} from "../controllers/rentalController.js";

const router = express.Router();

/* ============================================================
   RENTER ROUTES
============================================================ */

// Create rental
router.post("/", createRental);

// Renter: My Rentals (used in MyRentals.jsx)
router.get("/my/:renterId", getMyRentals);

// Renter: All rentals with full populate (optional)
router.get("/renter/:renterId", getRentalsForRenter);

// Renter: Analytics
router.get("/renter/:renterId/analytics", getRenterAnalytics);


/* ============================================================
   OWNER ROUTES
============================================================ */

// Owner: Pending Rentals
router.get("/owner/:ownerId/pending", getOwnerPendingRentals);

// Owner: Active Rentals
router.get("/owner/:ownerId/active", getOwnerActiveRentals);

// Owner: Analytics
router.get("/owner/:ownerId/analytics", getOwnerAnalytics);


/* ============================================================
   RENTAL MANAGEMENT
============================================================ */

// Update rental status (approve / reject / complete)
router.patch("/:rentalId/status", updateRentalStatus);

// Cancel Rental
router.patch("/:rentalId/cancel", cancelRental);

// Extend Rental
router.patch("/:rentalId/extend", extendRental);

// Mark Rental Completed (owner)
router.patch("/:rentalId/complete", completeRental);

router.get("/owner/:ownerId/earnings", getOwnerEarnings);

/* ============================================================
   MACHINE RATING
============================================================ */
router.post("/rate-machine/:machineId", rateMachine);


export default router;
