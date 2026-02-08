// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
// Models
import Chat from "./models/Chat.js";

dotenv.config();

// Initialize App
const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Static folder for uploaded images
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/rentals", rentalRoutes);
// Price Prediction API
app.use("/api/price", priceRoutes);
// Chat API 
app.use("/api/chat", chatRoutes);
// File Uploads 
app.use("/api/upload", uploadRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join-room", ({ rentalId }) => {
    socket.join(rentalId);
  });
  socket.on("chat:message", async (payload) => {
    try {
      const msg = await Chat.create(payload);
      io.to(payload.rentalId).emit("chat:message", msg);
    } catch (err) {
      console.error("Chat save error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
