import { WeightReading } from "../models/WeightReading.js";

export async function saveReading(deviceId, weight, unit = "g") {
  if (!deviceId || typeof weight !== "number") {
    throw new Error("deviceId and numeric weight are required.");
  }

  const reading = await WeightReading.create({ deviceId, weight, unit });
  return reading;
}

export async function getLatestReading(deviceId) {
  if (!deviceId) throw new Error("deviceId is required.");

  const reading = await WeightReading.findOne({ deviceId })
    .sort({ createdAt: -1 })
    .lean();

  return reading;
}

export async function getHistory(deviceId, limit = 50) {
  if (!deviceId) throw new Error("deviceId is required.");

  const readings = await WeightReading.find({ deviceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return readings;
}
