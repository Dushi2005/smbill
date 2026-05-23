import { recipes, productCatalog } from './recipeData';

export interface TotalIngredient {
    name: string;
    totalWeight: number; // in grams
    pricePerKg: number;
    totalPrice: number;
    unit: 'kg' | 'pcs';
    recipeCount: number; // how many recipes use this ingredient
}

/**
 * Aggregates all ingredients from all recipes and calculates their total quantities and prices
 * based on the Indian market prices from the product catalog.
 */
export const getTotalIngredientsWithPricing = (): TotalIngredient[] => {
    // Map to store aggregated ingredients
    const ingredientMap = new Map<string, { totalWeight: number; recipeCount: number }>();

    // Aggregate ingredients from all recipes
    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            const normalizedName = normalizeIngredientName(ingredient.name);

            if (ingredientMap.has(normalizedName)) {
                const existing = ingredientMap.get(normalizedName)!;
                ingredientMap.set(normalizedName, {
                    totalWeight: existing.totalWeight + ingredient.targetWeightGrams,
                    recipeCount: existing.recipeCount + 1
                });
            } else {
                ingredientMap.set(normalizedName, {
                    totalWeight: ingredient.targetWeightGrams,
                    recipeCount: 1
                });
            }
        });
    });

    // Convert to array and add pricing information
    const totalIngredients: TotalIngredient[] = [];

    ingredientMap.forEach((data, ingredientName) => {
        const product = findMatchingProduct(ingredientName);

        if (product) {
            let totalPrice = 0;

            if (product.unit === 'kg') {
                // Convert grams to kg and calculate price
                totalPrice = (data.totalWeight / 1000) * product.price;
            } else {
                // For pieces, estimate based on average weight
                // This is a rough estimation - you might want to refine this
                const estimatedPieces = Math.ceil(data.totalWeight / 100); // Assuming 100g per piece
                totalPrice = estimatedPieces * product.price;
            }

            totalIngredients.push({
                name: ingredientName,
                totalWeight: data.totalWeight,
                pricePerKg: product.price,
                totalPrice: totalPrice,
                unit: product.unit,
                recipeCount: data.recipeCount
            });
        } else {
            // If no matching product found, use a default price
            const defaultPricePerKg = 50; // Default price in INR
            totalIngredients.push({
                name: ingredientName,
                totalWeight: data.totalWeight,
                pricePerKg: defaultPricePerKg,
                totalPrice: (data.totalWeight / 1000) * defaultPricePerKg,
                unit: 'kg',
                recipeCount: data.recipeCount
            });
        }
    });

    // Sort by total price descending
    return totalIngredients.sort((a, b) => b.totalPrice - a.totalPrice);
};

/**
 * Normalize ingredient names to match with product catalog
 */
const normalizeIngredientName = (name: string): string => {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        // Handle common variations
        .replace(/^fresh\s+/, '')
        .replace(/\s+leaves?$/, ' Leaves')
        .replace(/\s+powder$/, ' Powder')
        .replace(/\s+paste$/, ' Paste')
        .replace(/\s+seeds?$/, ' Seeds');
};

/**
 * Find matching product from catalog
 */
const findMatchingProduct = (ingredientName: string) => {
    const normalized = ingredientName.toLowerCase().trim();

    // Direct match
    let product = productCatalog.find(p =>
        p.name.toLowerCase().trim() === normalized
    );

    if (product) return product;

    // Partial match - ingredient contains product name or vice versa
    product = productCatalog.find(p => {
        const productName = p.name.toLowerCase().trim();
        return normalized.includes(productName) || productName.includes(normalized);
    });

    if (product) return product;

    // Special mappings for common variations
    const specialMappings: { [key: string]: string } = {
        'tomato': 'Tomato',
        'potato': 'Potato',
        'onion': 'Onion',
        'garlic': 'Garlic',
        'ginger': 'Ginger',
        'paneer': 'Paneer',
        'butter': 'Butter',
        'cream': 'Milk', // Approximate
        'fresh cream': 'Milk',
        'oil': 'Cooking Oil',
        'ghee': 'Ghee',
        'salt': 'Salt',
        'rice': 'Rice',
        'basmati rice': 'Basmati Rice',
        'wheat flour': 'Wheat Flour',
        'curd': 'Curd',
        'chicken': 'Paneer', // Approximate price (no chicken in catalog)
        'prawns': 'Paneer', // Approximate
        'egg': 'Paneer', // Approximate
        'dosa batter': 'Rice', // Approximate
        'idli batter': 'Rice',
        'potato filling': 'Potato',
        'mixed veggies': 'Carrot', // Average vegetable price
        'spinach': 'Spinach',
        'chickpeas': 'White Chana',
        'toor dal': 'Toor Dal',
        'mint leaves': 'Mint Leaves',
        'curry leaves': 'Curry Leaves',
        'coriander': 'Coriander Leaves',
        'green chili': 'Green Chili',
        'capsicum': 'Capsicum',
        'ladyfinger': 'Lady Finger',
        'lady finger': 'Lady Finger',
        'drumstick': 'Drumstick',
        'tamarind': 'Tamarind',
        'mustard seeds': 'Mustard Seeds',
        'cumin seeds': 'Cumin Seeds',
        'garam masala': 'Turmeric Powder', // Approximate
        'red chili powder': 'Red Chili Powder',
        'chili powder': 'Red Chili Powder',
        'biryani masala': 'Turmeric Powder',
        'chole masala': 'Turmeric Powder',
        'sambar powder': 'Turmeric Powder',
        'masala': 'Turmeric Powder',
        'ginger garlic paste': 'Ginger',
        'coconut milk': 'Coconut',
        'lemon juice': 'Lemon',
        'cooked rice': 'Rice',
        'water': 'Salt', // Minimal cost
    };

    const mappedName = specialMappings[normalized];
    if (mappedName) {
        return productCatalog.find(p => p.name === mappedName);
    }

    return null;
};

/**
 * Get summary statistics
 */
export const getTotalIngredientsSummary = () => {
    const ingredients = getTotalIngredientsWithPricing();

    const totalCost = ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);
    const totalWeight = ingredients.reduce((sum, ing) => sum + ing.totalWeight, 0);
    const uniqueIngredients = ingredients.length;

    return {
        totalCost,
        totalWeight,
        uniqueIngredients,
        ingredients
    };
};
