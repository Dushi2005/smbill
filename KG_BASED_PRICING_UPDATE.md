# Recipe Bill Generator - Updated to KG-Based Pricing

## Changes Made

### Summary

Updated the Recipe Bill Generator to display **all weights in kilograms (kg)** and **all prices per kilogram (₹/kg)** for consistency and clarity.

## What Changed

### 1. **Service Layer** (`recipeBillingService.ts`)

#### Updated Interface

```typescript
// OLD
export interface RecipeBillItem {
    name: string;
    quantity: number; // in grams or pieces
    unit: 'kg' | 'pcs';
    unitPrice: number; // price per kg or per piece
    totalPrice: number;
}

// NEW
export interface RecipeBillItem {
    name: string;
    quantityKg: number; // quantity in kilograms
    pricePerKg: number; // price per kilogram
    totalPrice: number;
}
```

#### Updated Logic

- **All quantities** converted to kg: `quantityKg = grams / 1000`
- **All prices** shown per kg
- **Piece-based items** converted to kg pricing: `pricePerKg = pricePerPiece × 10` (assuming 100g per piece)

### 2. **UI Component** (`RecipeBillGenerator.tsx`)

#### Table Display

- **Header**: Changed from "Qty" and "Price" to "Qty (kg)" and "Price/kg"
- **Quantity Column**: Shows `{item.quantityKg.toFixed(3)} kg`
- **Price Column**: Shows `₹{item.pricePerKg.toFixed(2)}/kg`

#### CSV Export

- **Headers**: Updated to "Quantity (kg)" and "Price per Kg (₹)"
- **Data**: Uses `quantityKg` and `pricePerKg` properties

## Example Output

### Before

```
Item              | Qty      | Price        | Total
Paneer            | 600g     | ₹80.00/kg    | ₹48.00
Tomato            | 400g     | ₹35.00/kg    | ₹14.00
Onion             | 240g     | ₹40.00/kg    | ₹9.60
```

### After

```
Item              | Qty (kg) | Price/kg     | Total
Paneer            | 0.600 kg | ₹80.00/kg    | ₹48.00
Tomato            | 0.400 kg | ₹35.00/kg    | ₹14.00
Onion             | 0.240 kg | ₹40.00/kg    | ₹9.60
```

## Benefits

1. **Consistency**: All measurements in the same unit (kg)
2. **Clarity**: Easy to understand pricing structure
3. **Professional**: Standard format for commercial billing
4. **Comparison**: Easier to compare prices across items
5. **Accuracy**: 3 decimal places for precise quantities (e.g., 0.008 kg for 8g of salt)

## Technical Details

### Quantity Display

- Uses `.toFixed(3)` for 3 decimal places
- Examples:
  - 600g → 0.600 kg
  - 40g → 0.040 kg
  - 8g → 0.008 kg
  - 1.5kg → 1.500 kg

### Price Conversion

For items originally priced per piece:

- **Assumption**: 100g per piece (average)
- **Conversion**: `pricePerKg = pricePerPiece × 10`
- **Example**: Egg @ ₹5/piece → ₹50/kg

### CSV Format

```csv
Item,Quantity (kg),Price per Kg (₹),Total Price (₹)
Paneer,0.600,80.00,48.00
Tomato,0.400,35.00,14.00
Onion,0.240,40.00,9.60
```

## Files Modified

1. **`services/recipeBillingService.ts`**
   - Updated `RecipeBillItem` interface
   - Modified bill generation logic
   - Added kg conversion for all items

2. **`components/RecipeBillGenerator.tsx`**
   - Updated table headers
   - Changed quantity display format
   - Modified price display format
   - Updated CSV export headers and data

## Usage

The feature works exactly the same way from the user's perspective:

1. Select a recipe
2. Enter number of servings
3. Click "Generate Bill"
4. View bill with **all quantities in kg** and **all prices per kg**

## Example Bill

**Paneer Butter Masala (4 servings):**

```
Recipe: Paneer Butter Masala
Servings: 4
Bill No: Paneer-Butter-Masala-4srv-1733143390123
Date: 12/2/2025, 6:03:10 PM

Ingredients:
# | Item              | Qty (kg) | Price/kg   | Total
--|-------------------|----------|------------|--------
1 | Paneer            | 0.600 kg | ₹80.00/kg  | ₹48.00
2 | Tomato            | 0.400 kg | ₹35.00/kg  | ₹14.00
3 | Onion             | 0.240 kg | ₹40.00/kg  | ₹9.60
4 | Butter            | 0.080 kg | ₹290.00/kg | ₹23.20
5 | Fresh Cream       | 0.100 kg | ₹60.00/kg  | ₹6.00
6 | Garlic            | 0.040 kg | ₹45.00/kg  | ₹1.80
7 | Ginger            | 0.032 kg | ₹30.00/kg  | ₹0.96
8 | Garam Masala      | 0.020 kg | ₹45.00/kg  | ₹0.90
9 | Red Chili Powder  | 0.012 kg | ₹80.00/kg  | ₹0.96
10| Salt              | 0.008 kg | ₹25.00/kg  | ₹0.20

Subtotal:           ₹105.62
Tax (5%):           ₹5.28
Grand Total:        ₹110.90
```

---

**Note**: All prices remain based on the Indian market product catalog. The only change is the display format - everything is now consistently shown in kilograms with per-kg pricing.
