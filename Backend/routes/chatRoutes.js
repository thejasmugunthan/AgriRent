// routes/chatRoutes.js
import express from "express";
import {
  getChatByRental,
  sendMessage,
  markSeen,
} from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chat/:rentalId 
router.get("/:rentalId", getChatByRental);

// POST /api/chat/send 
router.post("/send", sendMessage);

// POST /api/chat/:rentalId/seen 
router.post("/:rentalId/seen", markSeen);

export default router;
