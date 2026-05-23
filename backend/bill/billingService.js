import { Bill } from '../models/bill.js';

// In a real app, this would interact with a database model.
// For now, we'll mock the persistence or just return the calculated object.

export const createBill = async (billData) => {
    const { billNo, items, taxPercent = 0 } = billData;

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
        const total = item.quantity * item.unitPrice; // Assuming quantity is in standard units or handled
        // If the AI provides totalPrice, we could use that, but recalculating is safer.
        // However, the prompt asks for AI to provide totalPrice. Let's trust the input for now but ensure consistency if needed.
        // For this implementation, let's assume the input items have the correct totalPrice or we calculate it.
        // Let's rely on the input for flexibility, but validate.

        // Actually, let's recalculate to be safe if unitPrice and quantity are present.
        // If not, use provided totalPrice.
        const calculatedTotal = (item.unitPrice && item.quantity) ? (item.unitPrice * (item.quantity / 1000)) * 1000 : item.totalPrice;
        // Wait, quantity unit? The prompt says "quantity (standardized units: grams/ml/pieces)".
        // And "unitPrice" usually implies per unit (e.g. per kg or per piece).
        // Let's assume the AI gives us a total price for the line item to simplify, 
        // OR we just sum up the `totalPrice` fields provided by the AI.

        subtotal += item.totalPrice || 0;
        return item;
    });

    const taxAmount = subtotal * (taxPercent / 100);
    const grandTotal = subtotal + taxAmount;

    const bill = {
        billNo,
        items: processedItems,
        subtotal,
        taxPercent,
        taxAmount,
        grandTotal,
        createdAt: new Date()
    };

    // Save to MongoDB
    const newBill = new Bill(bill);
    await newBill.save();

    console.log("Bill created:", bill);

    return bill;
};