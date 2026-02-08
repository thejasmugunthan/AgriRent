// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


//REGISTER USER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password with bcrypt
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

//LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Safety: if somehow password is missing in DB
    if (!user.password) {
      console.error(
        "LOGIN ERROR: User has no password hash stored in DB",
        user._id
      );
      return res.status(500).json({
        message:
          "Account is corrupted (no password set). Please re-register this user.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        photo: user.photo || null,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

//GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

// UPDATE PROFILE
   
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const updates = { ...req.body };
    // never allow direct password change here
    delete updates.password;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    return res.status(500).json({ message: "Profile update failed" });
  }
};
