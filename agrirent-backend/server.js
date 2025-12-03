import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import Chat from "./models/Chat.js";

import http from "http";
import { Server } from "socket.io";
import { sendMessage } from "./controllers/chatController.js";

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api", priceRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-room", ({ rentalId }) => socket.join(rentalId));

  socket.on("chat:message", async (payload) => {
    const msg = await Chat.create(payload);
    io.to(payload.rentalId).emit("chat:message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(5000, () =>
  console.log("Server running on port 5000")
);
