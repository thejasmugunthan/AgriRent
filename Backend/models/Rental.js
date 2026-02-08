import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema({
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: "Machine", required: true },

  startTime: Date,
  endTime: Date,

  totalPrice: Number,
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Rental", rentalSchema);
