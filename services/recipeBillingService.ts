import { Recipe, Product } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface RecipeBillItem {
    name: string;
    quantityKg: number; // For backward compatibility also used as quantity value
    quantity: number;   // Generic quantity
    unit: string;       // Unit of measurement
    pricePerKg: number; // For backward compatibility also used as unit price
    unitPrice: number;  // Generic unit price
    totalPrice: number;
}

export interface RecipeBill {
    recipeName: string;
    servings: number;
    billNo: string;
    items: RecipeBillItem[];
    subtotal: number;
    laborPercent: number;
    laborCharge: number;
    handlingCharge: number;
    taxPercent: number;
    taxAmount: number;
    grandTotal: number;
    timestamp: string;
}

// Fixed prices per serving from user configuration
const RECIPE_FIXED_PRICES: { [key: string]: number } = {
    'Paneer Butter Masala': 120,
    'Chicken Biryani': 130,
    'Chapati': 18,        // 'Chapati (2 pcs)'
    'Dosa': 20,
    'Tomato Rice': 35,
    'Aloo Paratha': 35,   // 'Aloo Paratha (2 pcs)'
    'Chole Masala': 45,
    'Palak Paneer': 110,
    'Veg Pulao': 50,
    'Onion Uttapam': 35,
    'Sambar': 30,         // 'Sambar (1 bowl)'
    'Masala Dosa': 40,
    'Dal Tadka': 40,
    'Paneer Tikka': 150,
    'Butter Chicken': 160,
    'Curd Rice': 30,
    'Idli': 15,           // 'Idli (2 pcs)'
    'Prawn Curry': 200,
    'Egg Curry': 45,
    'Bhindi Fry': 45
};

/**
 * Fetch all recipes from the backend
 */
export const getAllRecipes = async (): Promise<Recipe[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`);
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        return data.map((recipe: any) => ({
            ...recipe,
            id: recipe._id || recipe.id // Ensure id is present
        }));
    } catch (error) {
        console.error("Error fetching recipes from database, using local data:", error);
        // Fallback to local recipe data
        const { recipes } = await import('./recipeData');
        return recipes.map(recipe => ({
            ...recipe,
            _id: recipe.id,
        }));
    }
};

/**
 * Fetch all ingredients (product catalog) from the backend
 */
export const getAllIngredients = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/ingredients`);
        if (!response.ok) {
            throw new Error('Failed to fetch ingredients');
        }
        // Map backend Ingredient model to frontend Product interface
        const ingredients = await response.json();
        return ingredients.map((ing: any) => ({
            id: ing._id,
            name: ing.name,
            price: ing.cost,
            unit: ing.unit
        }));
    } catch (error) {
        console.error("Error fetching ingredients from database, using local catalog:", error);
        // Fallback to local product catalog
        const { productCatalog } = await import('./recipeData');
        return productCatalog;
    }
};

/**
 * Find matching product from catalog
 */
const findMatchingProduct = (ingredientName: string, productCatalog: Product[]): Product | null => {
    const cleanName = ingredientName.toLowerCase().trim().replace(/\s+/g, ' ');

    // 1. Direct match (case-insensitive)
    let product = productCatalog.find(p => p.name.toLowerCase().trim() === cleanName);
    if (product) return product;

    // 2. Special mappings for variations/cleanups
    const specialMappings: { [key: string]: string } = {
        'fresh cream': 'Fresh Cream',
        'cream': 'Fresh Cream',
        'oil': 'Oil',
        'chili powder': 'Red Chili Powder',
        'ladyfinger': 'Ladyfinger',
        'lady finger': 'Ladyfinger',
        'cooked rice': 'Rice',
        'coriander': 'Coriander',
        'capsicum': 'Capsicum',
        'water': 'Water',
        'egg': 'Egg',
        'prawns': 'Prawns',
        'chicken': 'Chicken',
        'dosa batter': 'Dosa Batter',
        'idli batter': 'Idli Batter',
        'potato filling': 'Potato Filling',
        'mixed veggies': 'Mixed Veggies',
        'spinach': 'Spinach',
        'chickpeas': 'Chickpeas',
        'toor dal': 'Toor Dal',
        'basmati rice': 'Basmati Rice',
        'wheat flour': 'Wheat Flour',
        'curd': 'Curd',
        'ghee': 'Ghee',
        'salt': 'Salt',
        'rice': 'Rice',
        'tomato': 'Tomato',
        'potato': 'Potato',
        'onion': 'Onion',
        'garlic': 'Garlic',
        'ginger': 'Ginger',
        'paneer': 'Paneer',
        'butter': 'Butter',
        'mint leaves': 'Mint Leaves',
        'curry leaves': 'Curry Leaves',
        'green chili': 'Green Chili',
        'drumstick': 'Drumstick',
        'tamarind': 'Tamarind',
        'mustard seeds': 'Mustard Seeds',
        'cumin seeds': 'Cumin Seeds',
        'garam masala': 'Garam Masala',
        'red chili powder': 'Red Chili Powder',
        'biryani masala': 'Biryani Masala',
        'chole masala': 'Chole Masala',
        'sambar powder': 'Sambar Powder',
        'masala': 'Masala',
        'ginger garlic paste': 'Ginger Garlic Paste',
        'coconut milk': 'Coconut Milk',
        'lemon juice': 'Lemon Juice',
    };

    const mappedName = specialMappings[cleanName];
    if (mappedName) {
        product = productCatalog.find(p => p.name.toLowerCase().trim() === mappedName.toLowerCase().trim());
        if (product) return product;
    }

    // 3. Partial match (case-insensitive)
    product = productCatalog.find(p => {
        const productName = p.name.toLowerCase().trim();
        return cleanName.includes(productName) || productName.includes(cleanName);
    });

    return product || null;
};

/**
 * Generate a detailed bill for a specific recipe with given servings
 * Uses actual product catalog prices instead of AI estimation
 * All prices are shown per kg and all weights in kg
 */
export const generateRecipeBillFromCatalog = async (
    recipeId: string,
    servings: number,
    taxPercent: number = 5
): Promise<RecipeBill> => {
    // Fetch fresh data
    const [recipes, productCatalog] = await Promise.all([
        getAllRecipes(),
        getAllIngredients()
    ]);

    // Find the recipe
    const recipe = recipes.find(r => r.id === recipeId || r._id === recipeId);

    if (!recipe) {
        throw new Error(`Recipe with ID "${recipeId}" not found`);
    }

    // Default bill items
    const billItems: RecipeBillItem[] = [];

    // Bypass fixed pricing to always display ingredient details as requested by user
    const fixedPrice = undefined;

    if (fixedPrice !== undefined) {
        // Fixed price found, use single line item
        const totalPrice = fixedPrice * servings;

        billItems.push({
            name: recipe.name,
            quantityKg: servings, // overloading for compatibility
            quantity: servings,
            unit: 'serving',
            pricePerKg: fixedPrice, // overloading for compatibility
            unitPrice: fixedPrice,
            totalPrice: totalPrice
        });

    } else {
        // Fallback to ingredient-based calculation
        // Scale ingredients based on servings
        const scaledIngredients = recipe.ingredients.map(ing => ({
            ...ing,
            targetWeightGrams: ing.targetWeightGrams * servings,
        }));

        scaledIngredients.forEach(ingredient => {
            const product = findMatchingProduct(ingredient.name, productCatalog);
            const quantityKg = ingredient.targetWeightGrams / 1000; // Convert grams to kg

            if (product) {
                let pricePerKg = product.price;
                let unit = 'kg';

                // If product is priced per piece, convert to approximate per-kg price
                // Assuming average 100g per piece for estimation
                if (product.unit === 'pcs') {
                    pricePerKg = product.price * 10; // 10 pieces = 1kg (100g each)
                }

                const totalPrice = quantityKg * pricePerKg;

                billItems.push({
                    name: ingredient.name,
                    quantityKg: quantityKg,
                    quantity: quantityKg,
                    unit: unit,
                    pricePerKg: pricePerKg,
                    unitPrice: pricePerKg,
                    totalPrice: totalPrice
                });
            } else {
                // Use default pricing if no match found
                const defaultPricePerKg = 50;
                billItems.push({
                    name: ingredient.name,
                    quantityKg: quantityKg,
                    quantity: quantityKg,
                    unit: 'kg',
                    pricePerKg: defaultPricePerKg,
                    unitPrice: defaultPricePerKg,
                    totalPrice: quantityKg * defaultPricePerKg
                });
            }
        });
    }

    // Calculate totals
    const subtotal = billItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const laborPercent = 10;
    const laborCharge = (subtotal * laborPercent) / 100;
    const handlingCharge = 30; // Fixed handling charge

    // Calculate Tax (GST) on (Subtotal + Labor + Handling)
    // Standard practice is to tax the service charges as well
    const taxableAmount = subtotal + laborCharge + handlingCharge;
    const taxAmount = (taxableAmount * taxPercent) / 100;

    const grandTotal = taxableAmount + taxAmount;

    // Generate bill number
    const billNo = `${recipe.name.replace(/\s+/g, '-')}-${servings}srv-${Date.now()}`;

    return {
        recipeName: recipe.name,
        servings,
        billNo,
        items: billItems,
        subtotal,
        laborPercent,
        laborCharge,
        handlingCharge,
        taxPercent,
        taxAmount,
        grandTotal,
        timestamp: new Date().toISOString()
    };
};

/**
 * Get recipe by ID
 */
export const getRecipeById = async (recipeId: string): Promise<Recipe | undefined> => {
    const recipes = await getAllRecipes();
    return recipes.find(r => r.id === recipeId || r._id === recipeId);
};
