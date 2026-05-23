import { getTotalIngredientsSummary } from './services/totalIngredientsService';

// Test the total ingredients service
const summary = getTotalIngredientsSummary();

console.log('=== TOTAL INGREDIENTS SUMMARY ===');
console.log(`Total Cost: ₹${summary.totalCost.toFixed(2)}`);
console.log(`Total Weight: ${summary.totalWeight.toFixed(0)}g`);
console.log(`Unique Ingredients: ${summary.uniqueIngredients}`);
console.log('\n=== TOP 10 MOST EXPENSIVE INGREDIENTS ===');

summary.ingredients.slice(0, 10).forEach((ing, index) => {
    console.log(`${index + 1}. ${ing.name}: ${ing.totalWeight.toFixed(0)}g @ ₹${ing.pricePerKg.toFixed(2)}/${ing.unit} = ₹${ing.totalPrice.toFixed(2)} (used in ${ing.recipeCount} recipes)`);
});
