import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: { type: String, required: true },
    type: { type: String, required: true },

    horsepower: { type: Number, default: 0 },
    ageYears: { type: Number, default: 0 },
    hoursUsed: { type: Number, default: 0 },

    pincode: { type: String, required: true },

    maintenance_cost: { type: Number, default: 0 },
    fuel_price: { type: Number, default: 0 },

    rentPerHour: { type: Number, required: true },

    meta: { type: Object, default: {} }, // dynamic ML fields

    image_url: { type: String },
    ratings: [
      {
        renterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Machine", machineSchema);
