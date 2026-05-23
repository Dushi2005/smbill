import express from 'express';
import { createBill } from './billingService.js';

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const { billNo, items, taxPercent } = req.body;

        if (!billNo || !items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Invalid bill data' });
        }

        const bill = await createBill({ billNo, items, taxPercent });
        res.json(bill);
    } catch (error) {
        console.error("Billing Error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;