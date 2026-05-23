import mongoose from "mongoose";

const weightReadingSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    weight: { type: Number, required: true }, // in grams or kg (you decide)
    unit: { type: String, default: "g" },     // "g" or "kg"
  },
  { timestamps: true }
);

export const WeightReading = mongoose.model("WeightReading", weightReadingSchema);
