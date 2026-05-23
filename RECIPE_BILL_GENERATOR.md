# Recipe Bill Generator Feature

## Overview

The **Recipe Bill Generator** is a new feature that allows you to select any recipe and specify the number of servings to generate a detailed, itemized bill based on **Indian market prices** from your product catalog.

## Key Differences from Existing Features

### vs. AI-Generated Bills (in RecipeDetail)

- **Old Method**: Uses AI (Gemini) to estimate ingredient prices
- **New Method**: Uses **actual product catalog prices** for accurate billing
- **Advantage**: More accurate, consistent, and doesn't require AI API calls

### vs. Total Ingredients View

- **Total Ingredients**: Shows aggregated data across **all recipes**
- **Recipe Bill Generator**: Shows detailed bill for **one specific recipe** with custom servings

## Features

### 1. Recipe Selection

- Dropdown menu with all 20 available recipes
- Easy-to-use interface

### 2. Servings Configuration

- Input field for number of servings (1-100)
- Automatically scales all ingredient quantities

### 3. Detailed Bill Display

- **Bill Header**: Recipe name, bill number, servings, timestamp
- **Itemized Ingredients Table**:
  - Item number
  - Ingredient name
  - Quantity (in grams or kg)
  - Unit price (₹/kg or ₹/pcs)
  - Total price per ingredient
- **Bill Summary**:
  - Subtotal
  - Tax (5% default)
  - Grand Total

### 4. Export Options

- **Download CSV**: Export bill data for Excel/Sheets
- **Print Bill**: Print-friendly format
- **Generate Another**: Reset and create new bill

## How It Works

### Backend Logic (`recipeBillingService.ts`)

1. **Recipe Lookup**: Finds recipe by ID from recipe database
2. **Scaling**: Multiplies ingredient quantities by servings
3. **Price Matching**:
   - Normalizes ingredient names
   - Matches with product catalog
   - Uses special mappings for variations
   - Falls back to default ₹50/kg if no match
4. **Calculation**:
   - For kg-based items: `(grams / 1000) × price per kg`
   - For piece-based items: `estimated pieces × price per piece`
5. **Tax & Total**: Calculates subtotal, tax (5%), and grand total

### Ingredient Matching Algorithm

The service uses a sophisticated 3-tier matching system:

1. **Direct Match**: Exact name comparison

   ```
   "Tomato" → "Tomato" ✓
   ```

2. **Partial Match**: Substring matching

   ```
   "Fresh Cream" → "Cream" → "Milk" ✓
   ```

3. **Special Mappings**: Predefined mappings for common variations

   ```
   "Ginger Garlic Paste" → "Ginger" ✓
   "Dosa Batter" → "Rice" ✓
   "Chicken" → "Paneer" (approximate) ✓
   ```

## Usage Example

### Scenario: Paneer Butter Masala for 4 Servings

**Input:**

- Recipe: Paneer Butter Masala
- Servings: 4

**Output Bill:**

```
Recipe: Paneer Butter Masala
Servings: 4
Bill No: Paneer-Butter-Masala-4srv-1733142123456
Date: 12/2/2025, 5:55:23 PM

Ingredients:
# | Item              | Qty    | Price      | Total
--|-------------------|--------|------------|--------
1 | Paneer            | 600g   | ₹80.00/kg  | ₹48.00
2 | Tomato            | 400g   | ₹35.00/kg  | ₹14.00
3 | Onion             | 240g   | ₹40.00/kg  | ₹9.60
4 | Butter            | 80g    | ₹290.00/kg | ₹23.20
5 | Fresh Cream       | 100g   | ₹60.00/kg  | ₹6.00
6 | Garlic            | 40g    | ₹45.00/kg  | ₹1.80
7 | Ginger            | 32g    | ₹30.00/kg  | ₹0.96
8 | Garam Masala      | 20g    | ₹45.00/kg  | ₹0.90
9 | Red Chili Powder  | 12g    | ₹80.00/kg  | ₹0.96
10| Salt              | 8g     | ₹25.00/kg  | ₹0.20

Subtotal:           ₹105.62
Tax (5%):           ₹5.28
Grand Total:        ₹110.90
```

## Navigation

### From Home Screen

```
Home → "🧾 RECIPE BILL" button → Recipe Bill Generator
```

### Direct URL

```
http://localhost:5173/recipe-bill-generator
```

## Files Created/Modified

### Created

1. **`services/recipeBillingService.ts`** - Core billing logic
2. **`components/RecipeBillGenerator.tsx`** - UI component

### Modified

1. **`App.tsx`** - Added route and import
2. **`types.ts`** - Added RECIPE_BILL_GENERATOR page type
3. **`components/HomeScreen.tsx`** - Added navigation button

## Benefits

### For Users

- **Accurate Pricing**: Based on real market rates
- **Budget Planning**: Know exact cost before cooking
- **Scalable**: Calculate for any number of servings
- **Exportable**: Download or print for reference

### For Business

- **No AI Costs**: Doesn't use Gemini API
- **Consistent**: Same recipe always gives same price
- **Customizable**: Prices update when catalog updates
- **Professional**: Clean, itemized bills

## Technical Specifications

### Data Flow

```
User Input (Recipe + Servings)
    ↓
recipeBillingService.generateRecipeBillFromCatalog()
    ↓
Recipe Lookup → Ingredient Scaling → Price Matching
    ↓
Bill Calculation (Subtotal + Tax)
    ↓
RecipeBill Object
    ↓
UI Display (Table + Summary)
```

### Bill Object Structure

```typescript
interface RecipeBill {
  recipeName: string;
  servings: number;
  billNo: string;
  items: RecipeBillItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  timestamp: string;
}
```

## Future Enhancements

Potential improvements:

1. **Customizable Tax**: Let users set tax percentage
2. **Multiple Recipes**: Generate combined bill for multiple recipes
3. **Discount System**: Apply discounts or coupons
4. **Email Bill**: Send bill via email
5. **Save History**: Store generated bills in database
6. **Compare Prices**: Show price variations over time
7. **Vendor Selection**: Choose different price sources

## Comparison with AI Method

| Feature | AI Method (Old) | Catalog Method (New) |
|---------|----------------|---------------------|
| Accuracy | Variable | Consistent |
| Speed | Slower (API call) | Instant |
| Cost | API usage fees | Free |
| Offline | No | Yes |
| Customizable | No | Yes (via Price Editor) |
| Reliability | Depends on AI | 100% reliable |

## Example Use Cases

1. **Home Cooking**: Calculate ingredient cost before shopping
2. **Catering**: Price quotes for events with multiple servings
3. **Meal Planning**: Budget weekly meal costs
4. **Recipe Comparison**: Compare costs of different recipes
5. **Inventory Management**: Track ingredient expenses

---

**Note**: All prices are based on the Indian market product catalog. Admins can update prices using the Price Editor feature (username: 123, password: dushi).
