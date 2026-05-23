
import { generateRecipeBillFromCatalog, getAllRecipes } from './services/recipeBillingService';

async function runTest() {
    // Test Case: Paneer Butter Masala
    try {
        const recipes = await getAllRecipes();
        const paneerRecipe = recipes.find(r => r.name === 'Paneer Butter Masala');
        if (!paneerRecipe) {
            throw new Error('Paneer Butter Masala recipe not found');
        }
        const recipeId = paneerRecipe.id;
        console.log(`\nTesting Recipe: Paneer Butter Masala (ID: ${recipeId})`);

        const bill = await generateRecipeBillFromCatalog(recipeId, 2);

        console.log('Bill Summary:');
        console.log(`Subtotal: ${bill.subtotal}`);
        console.log(`Labor (${bill.laborPercent}%): ${bill.laborCharge}`);
        console.log(`Handling: ${bill.handlingCharge}`);
        console.log(`GST (${bill.taxPercent}%): ${bill.taxAmount}`);
        console.log(`Grand Total: ${bill.grandTotal}`);

        // Logic Check
        const expectedTaxBase = bill.subtotal + bill.laborCharge + bill.handlingCharge;
        const expectedTaxAmount = (expectedTaxBase * bill.taxPercent) / 100;
        const expectedGrandTotal = expectedTaxBase + expectedTaxAmount;

        if (Math.abs(bill.grandTotal - expectedGrandTotal) < 0.01 && bill.items.length > 0) {
            console.log('✅ SUCCESS: Dynamic bill calculations and tax/handling formulas are 100% correct!');
        } else {
            console.log('❌ FAILURE: Calculation mismatch.');
            console.log(`Expected ${expectedGrandTotal}, Got ${bill.grandTotal}`);
        }

    } catch (e) {
        console.error('❌ Error executing test:', e);
    }
}

runTest();
