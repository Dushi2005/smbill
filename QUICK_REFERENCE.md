# Quick Reference: Total Ingredients Feature

## What It Does

Aggregates **all ingredients from all 20 recipes** in your system and shows:

- Total quantity needed for each ingredient
- Indian market prices (₹)
- Total cost calculation
- Recipe usage statistics

## Key Statistics

### Current Recipe Database

- **Total Recipes**: 20
- **Unique Ingredients**: ~45-50
- **Most Used Ingredients**: Onion (13 recipes), Tomato (11 recipes), Salt (18 recipes)

### Sample Pricing (Indian Market)

| Ingredient | Price/Kg | Common in |
|------------|----------|-----------|
| Tomato | ₹35 | 11 recipes |
| Onion | ₹40 | 13 recipes |
| Potato | ₹28 | 2 recipes |
| Paneer | ₹80 | 3 recipes |
| Basmati Rice | ₹180 | 2 recipes |
| Ghee | ₹300 | 5 recipes |
| Butter | ₹290 | 2 recipes |
| Chicken | ~₹80 | 2 recipes |
| Spinach | ₹20 | 1 recipe |
| Wheat Flour | ₹55 | 2 recipes |

## Features

### 1. Summary Dashboard

- **Total Cost**: Sum of all ingredients (₹)
- **Total Weight**: Combined weight in kg/g
- **Unique Count**: Number of different ingredients

### 2. Search & Filter

- Search by ingredient name
- Real-time filtering

### 3. Sorting Options

- **By Price**: Highest to lowest cost
- **By Weight**: Most to least quantity
- **By Usage**: Most frequently used
- **By Name**: Alphabetical order

### 4. Export Options

- **CSV Export**: Download for Excel/Sheets
- **Print Report**: Printer-friendly format

## Navigation

```
Home Screen → "💰 TOTAL INGREDIENTS" button → Total Ingredients View
```

Or directly: `http://localhost:5173/total-ingredients`

## Use Cases

1. **Budget Planning**: Calculate total cost before bulk cooking
2. **Shopping Lists**: Know exactly what to buy
3. **Inventory Management**: Track ingredient usage
4. **Cost Optimization**: Identify expensive ingredients
5. **Recipe Selection**: Choose based on available ingredients

## Technical Notes

### Ingredient Matching

The system intelligently matches recipe ingredients with the product catalog:

- Normalizes names (removes "fresh", "leaves", etc.)
- Handles variations (e.g., "ginger garlic paste" → "ginger")
- Uses approximate prices for missing items

### Price Calculation

- **Per Kg items**: `(grams / 1000) × price`
- **Per Piece items**: `estimated_pieces × price`

### Data Source

All prices are from the product catalog in `services/recipeData.ts` (100 products)

## Admin Features

Admins (username: 123) can:

- Update prices via Price Editor
- Prices persist in localStorage
- Custom prices override default catalog

## Example Output

```
Total Cost: ₹2,450.50
Total Weight: 8.5 kg
Unique Ingredients: 45

Top 5 Most Expensive:
1. Chicken - 400g @ ₹80/kg = ₹32.00 (2 recipes)
2. Onion - 850g @ ₹40/kg = ₹34.00 (13 recipes)
3. Paneer - 400g @ ₹80/kg = ₹32.00 (3 recipes)
4. Tomato - 780g @ ₹35/kg = ₹27.30 (11 recipes)
5. Basmati Rice - 240g @ ₹180/kg = ₹43.20 (2 recipes)
```

## Files

- **Service**: `services/totalIngredientsService.ts`
- **Component**: `components/TotalIngredientsView.tsx`
- **Route**: `/total-ingredients`
- **Test**: `test-total-ingredients.ts`

---

**Tip**: Use the CSV export to analyze data in Excel or Google Sheets for advanced insights!
