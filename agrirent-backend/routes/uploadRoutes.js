import express from "express";
import multer from "multer";
import { uploadProfilePhoto } from "../controllers/uploadController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/profile", upload.single("photo"), uploadProfilePhoto);

export default router;
