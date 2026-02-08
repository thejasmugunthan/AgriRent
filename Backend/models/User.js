import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["owner", "renter"], default: "renter" },

    phone: String,
    address: String,
    pincode: String,
    district: String,
    state: String,

    photo: { type: String, default: "" }, 
    rentals: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rental" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
