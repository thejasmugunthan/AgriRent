import axios from "axios";
import Machine from "../models/Machine.js";
import dotenv from "dotenv";
dotenv.config();

export const predictPrice = async (req, res) => {
  try {
    const body = req.body || {};
    const pincode = body.pincode;
    const machine_type = (body.machine_type || "").trim();
    const machines = await Machine.find({ pincode, type: machine_type });

    let marketTrend = 1.0;
    if (machines.length >= 1) {
      const avgCurrent = machines.reduce((sum, m) => sum + (m.rentPerHour || 0), 0) / machines.length;
      const avgLast = machines.reduce((sum, m) => sum + (m.last_year_price || avgCurrent), 0) / machines.length;
      const growth = (avgCurrent - avgLast) / (avgLast || 1);
      marketTrend = 1 + Math.max(-0.20, Math.min(0.20, growth * 0.25));
    }

    const mlPayload = {
      ...body,
      market_trend_score: marketTrend,
      created_at: body.created_at || new Date().toISOString(),
    };

    const mlUrl = process.env.ML_SERVICE_URL || "http://127.0.0.1:5001/predict";

    const mlRes = await axios.post(mlUrl, mlPayload, { timeout: 120000 });
    const price = mlRes.data?.predicted_rental_price ?? mlRes.data?.predicted_price ?? mlRes.data?.price;
    if (!price && price !== 0) {
      return res.status(500).json({ success: false, message: "ML did not return price", raw: mlRes.data });
    }

    return res.json({
      success: true,
      price: Number(price),
      demand_index: mlRes.data?.demand_index,
      market_trend_score: marketTrend,
      note: mlRes.data?.note || "OK",
    });

  } catch (err) {
    console.error("🔥 BACKEND ML ERROR:", err.message || err);
    return res.status(500).json({ success: false, message: "Prediction failed", error: err.message });
  }
};
