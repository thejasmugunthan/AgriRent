import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,   // <--- set required true
    },

    name: { type: String, required: true },
    type: { type: String, required: true },

    rentPerHour: { type: Number, required: true },

    horsepower: { type: Number, default: 0 },
    ageYears: { type: Number, default: 0 },
    hoursUsed: { type: Number, default: 0 },

    pincode: { type: String, default: "" },

    maintenance_cost: { type: Number, default: 0 },
    fuel_price: { type: Number, default: 0 },

    image_url: { type: String, default: "" },

    available: { type: Boolean, default: true },

    ratings: [
      {
        renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
      }
    ],

    averageRating: {
      type: Number,
      default: 0,
    }
  },

  { timestamps: true }
);

export default mongoose.model("Machine", machineSchema);
