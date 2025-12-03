import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/agrirent";

export default function connectDB() {
  mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("✅ MongoDB connected successfully");
  }).catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
}
