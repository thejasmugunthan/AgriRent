import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default function auth(req, res, next) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
