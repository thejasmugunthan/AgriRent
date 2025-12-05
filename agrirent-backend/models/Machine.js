// models/Machine.js
import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String },
  },
  { _id: false }
);

const machineSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { type: String, required: true },
    type: { type: String, required: true }, // Tractor, Harvester, etc.

    horsepower: { type: Number, default: 0 },
    ageYears: { type: Number, default: 0 },
    hoursUsed: { type: Number, default: 0 },

    pincode: { type: String, required: true },

    maintenance_cost: { type: Number, default: 0 },
    fuel_price: { type: Number, default: 0 },

    rentPerHour: { type: Number, required: true },

    image_url: { type: String },

    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Machine = mongoose.model("Machine", machineSchema);
export default Machine;
