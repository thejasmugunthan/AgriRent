import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  machineAge: Number,
  rentalDuration: Number,
  basePrice: Number,
  predictedPrice: Number,
  recommendedPrice: Number,
  upliftApplied: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Prediction", predictionSchema);
