// routes/chatRoutes.js
import express from "express";
import {
  getChatByRental,
  sendMessage,
  markSeen,
} from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chat/:rentalId  -> load messages for that rental
router.get("/:rentalId", getChatByRental);

// POST /api/chat/send     -> send a new message
router.post("/send", sendMessage);

// POST /api/chat/:rentalId/seen  -> mark as seen (optional)
router.post("/:rentalId/seen", markSeen);

export default router;
