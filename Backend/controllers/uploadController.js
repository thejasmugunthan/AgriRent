// controllers/uploadController.js
import User from "../models/User.js";

export const uploadProfilePhoto = async (req, res) => {
  try {
    const { userId } = req.body; 

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `/uploads/${req.file.filename}`;

    if (!userId) {
      return res.json({ success: true, fileUrl: filePath });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { photo: filePath },
      { new: true }
    ).select("-password");

    return res.json({ success: true, fileUrl: filePath, user: updated });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
