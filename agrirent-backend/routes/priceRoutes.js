import express from "express";
import { predictPrice } from "../controllers/priceController.js";
const router = express.Router();

router.post("/predict", predictPrice);

export default router;
