import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["owner", "renter"], default: "renter" },

    rentals: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Rental" }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
