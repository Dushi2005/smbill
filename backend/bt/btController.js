import express from "express";
import { saveReading, getLatestReading, getHistory } from "./btService.js";

const router = express.Router();

// ESP32 / device will POST here
// POST /bt/reading
router.post("/reading", async (req, res) => {
  try {
    const { deviceId, weight, unit } = req.body;

    const parsedWeight = Number(weight);
    const reading = await saveReading(deviceId, parsedWeight, unit || "g");

    res.json({ success: true, data: reading });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Frontend: get latest reading
// GET /bt/latest/:deviceId
router.get("/latest/:deviceId", async (req, res) => {
  try {
    const reading = await getLatestReading(req.params.deviceId);
    res.json({ success: true, data: reading });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Frontend: history for charts / logs
// GET /bt/history/:deviceId?limit=50
router.get("/history/:deviceId", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const readings = await getHistory(req.params.deviceId, limit);
    res.json({ success: true, data: readings });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
