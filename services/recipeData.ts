import { Recipe, Product, Ingredient } from '../types';
import React from 'react';

// --- RECIPE DATA ---

// Raw data parsed from user's document
const rawRecipeData = [
    { recipeName: 'Paneer Butter Masala', ingredient: 'Paneer', weight: 150 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Tomato', weight: 100 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Onion', weight: 60 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Butter', weight: 20 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Fresh Cream', weight: 25 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Garlic', weight: 10 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Ginger', weight: 8 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Garam Masala', weight: 5 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Red Chili Powder', weight: 3 },
    { recipeName: 'Paneer Butter Masala', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Chicken Biryani', ingredient: 'Basmati Rice', weight: 120 },
    { recipeName: 'Chicken Biryani', ingredient: 'Chicken', weight: 200 },
    { recipeName: 'Chicken Biryani', ingredient: 'Onion', weight: 80 },
    { recipeName: 'Chicken Biryani', ingredient: 'Tomato', weight: 60 },
    { recipeName: 'Chicken Biryani', ingredient: 'Curd', weight: 50 },
    { recipeName: 'Chicken Biryani', ingredient: 'Ghee', weight: 9 },
    { recipeName: 'Chicken Biryani', ingredient: 'Ginger Garlic Paste', weight: 15 },
    { recipeName: 'Chicken Biryani', ingredient: 'Biryani Masala', weight: 8 },
    { recipeName: 'Chicken Biryani', ingredient: 'Mint Leaves', weight: 5 },
    { recipeName: 'Chicken Biryani', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Chapati', ingredient: 'Wheat Flour', weight: 100 },
    { recipeName: 'Chapati', ingredient: 'Water', weight: 60 },
    { recipeName: 'Chapati', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Chapati', ingredient: 'Ghee', weight: 5 },
    { recipeName: 'Dosa', ingredient: 'Dosa Batter', weight: 150 },
    { recipeName: 'Dosa', ingredient: 'Oil', weight: 5 },
    { recipeName: 'Dosa', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Dosa', ingredient: 'Water', weight: 10 },
    { recipeName: 'Tomato Rice', ingredient: 'Rice', weight: 120 },
    { recipeName: 'Tomato Rice', ingredient: 'Tomato', weight: 100 },
    { recipeName: 'Tomato Rice', ingredient: 'Onion', weight: 60 },
    { recipeName: 'Tomato Rice', ingredient: 'Oil', weight: 10 },
    { recipeName: 'Tomato Rice', ingredient: 'Mustard Seeds', weight: 3 },
    { recipeName: 'Tomato Rice', ingredient: 'Curry Leaves', weight: 2 },
    { recipeName: 'Tomato Rice', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Aloo Paratha', ingredient: 'Wheat Flour', weight: 100 },
    { recipeName: 'Aloo Paratha', ingredient: 'Potato', weight: 120 },
    { recipeName: 'Aloo Paratha', ingredient: 'Butter', weight: 10 },
    { recipeName: 'Aloo Paratha', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Aloo Paratha', ingredient: 'Coriander', weight: 5 },
    { recipeName: 'Aloo Paratha', ingredient: 'Chili Powder', weight: 3 },
    { recipeName: 'Aloo Paratha', ingredient: 'Water', weight: 30 },
    { recipeName: 'Chole Masala', ingredient: 'Chickpeas', weight: 100 },
    { recipeName: 'Chole Masala', ingredient: 'Tomato', weight: 80 },
    { recipeName: 'Chole Masala', ingredient: 'Onion', weight: 60 },
    { recipeName: 'Chole Masala', ingredient: 'Ginger Garlic Paste', weight: 10 },
    { recipeName: 'Chole Masala', ingredient: 'Oil', weight: 10 },
    { recipeName: 'Chole Masala', ingredient: 'Chole Masala', weight: 5 },
    { recipeName: 'Chole Masala', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Palak Paneer', ingredient: 'Spinach', weight: 150 },
    { recipeName: 'Palak Paneer', ingredient: 'Paneer', weight: 100 },
    { recipeName: 'Palak Paneer', ingredient: 'Onion', weight: 50 },
    { recipeName: 'Palak Paneer', ingredient: 'Tomato', weight: 60 },
    { recipeName: 'Palak Paneer', ingredient: 'Cream', weight: 20 },
    { recipeName: 'Palak Paneer', ingredient: 'Garlic', weight: 8 },
    { recipeName: 'Palak Paneer', ingredient: 'Ghee', weight: 10 },
    { recipeName: 'Palak Paneer', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Veg Pulao', ingredient: 'Basmati Rice', weight: 120 },
    { recipeName: 'Veg Pulao', ingredient: 'Mixed Veggies', weight: 100 },
    { recipeName: 'Veg Pulao', ingredient: 'Ghee', weight: 8 },
    { recipeName: 'Veg Pulao', ingredient: 'Onion', weight: 50 },
    { recipeName: 'Veg Pulao', ingredient: 'Tomato', weight: 60 },
    { recipeName: 'Veg Pulao', ingredient: 'Garam Masala', weight: 5 },
    { recipeName: 'Veg Pulao', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Onion Uttapam', ingredient: 'Dosa Batter', weight: 150 },
    { recipeName: 'Onion Uttapam', ingredient: 'Onion', weight: 60 },
    { recipeName: 'Onion Uttapam', ingredient: 'Tomato', weight: 40 },
    { recipeName: 'Onion Uttapam', ingredient: 'Green Chili', weight: 5 },
    { recipeName: 'Onion Uttapam', ingredient: 'Oil', weight: 5 },
    { recipeName: 'Onion Uttapam', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Sambar', ingredient: 'Toor Dal', weight: 100 },
    { recipeName: 'Sambar', ingredient: 'Tamarind', weight: 15 },
    { recipeName: 'Sambar', ingredient: 'Tomato', weight: 80 },
    { recipeName: 'Sambar', ingredient: 'Drumstick', weight: 60 },
    { recipeName: 'Sambar', ingredient: 'Onion', weight: 50 },
    { recipeName: 'Sambar', ingredient: 'Sambar Powder', weight: 10 },
    { recipeName: 'Sambar', ingredient: 'Oil', weight: 8 },
    { recipeName: 'Sambar', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Masala Dosa', ingredient: 'Dosa Batter', weight: 150 },
    { recipeName: 'Masala Dosa', ingredient: 'Potato Filling', weight: 100 },
    { recipeName: 'Masala Dosa', ingredient: 'Onion', weight: 40 },
    { recipeName: 'Masala Dosa', ingredient: 'Oil', weight: 5 },
    { recipeName: 'Masala Dosa', ingredient: 'Mustard Seeds', weight: 3 },
    { recipeName: 'Masala Dosa', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Dal Tadka', ingredient: 'Toor Dal', weight: 100 },
    { recipeName: 'Dal Tadka', ingredient: 'Tomato', weight: 60 },
    { recipeName: 'Dal Tadka', ingredient: 'Onion', weight: 50 },
    { recipeName: 'Dal Tadka', ingredient: 'Ghee', weight: 10 },
    { recipeName: 'Dal Tadka', ingredient: 'Garlic', weight: 8 },
    { recipeName: 'Dal Tadka', ingredient: 'Cumin Seeds', weight: 5 },
    { recipeName: 'Dal Tadka', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Paneer Tikka', ingredient: 'Paneer', weight: 150 },
    { recipeName: 'Paneer Tikka', ingredient: 'Curd', weight: 50 },
    { recipeName: 'Paneer Tikka', ingredient: 'Chili Powder', weight: 5 },
    { recipeName: 'Paneer Tikka', ingredient: 'Lemon Juice', weight: 10 },
    { recipeName: 'Paneer Tikka', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Paneer Tikka', ingredient: 'Oil', weight: 5 },
    { recipeName: 'Paneer Tikka', ingredient: 'Capsicum', weight: 40 },
    { recipeName: 'Paneer Tikka', ingredient: 'Onion', weight: 40 },
    { recipeName: 'Butter Chicken', ingredient: 'Chicken', weight: 200 },
    { recipeName: 'Butter Chicken', ingredient: 'Butter', weight: 20 },
    { recipeName: 'Butter Chicken', ingredient: 'Tomato', weight: 100 },
    { recipeName: 'Butter Chicken', ingredient: 'Cream', weight: 25 },
    { recipeName: 'Butter Chicken', ingredient: 'Ginger Garlic Paste', weight: 10 },
    { recipeName: 'Butter Chicken', ingredient: 'Garam Masala', weight: 5 },
    { recipeName: 'Butter Chicken', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Curd Rice', ingredient: 'Cooked Rice', weight: 150 },
    { recipeName: 'Curd Rice', ingredient: 'Curd', weight: 100 },
    { recipeName: 'Curd Rice', ingredient: 'Mustard Seeds', weight: 3 },
    { recipeName: 'Curd Rice', ingredient: 'Oil', weight: 5 },
    { recipeName: 'Curd Rice', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Curd Rice', ingredient: 'Coriander', weight: 5 },
    { recipeName: 'Idli', ingredient: 'Idli Batter', weight: 150 },
    { recipeName: 'Idli', ingredient: 'Oil', weight: 5 },
    { recipeName: 'Idli', ingredient: 'Salt', weight: 2 },
    { recipeName: 'Prawn Curry', ingredient: 'Prawns', weight: 200 },
    { recipeName: 'Prawn Curry', ingredient: 'Coconut Milk', weight: 100 },
    { recipeName: 'Prawn Curry', ingredient: 'Onion', weight: 60 },
    { recipeName: 'Prawn Curry', ingredient: 'Tomato', weight: 60 },
    { recipeName: 'Prawn Curry', ingredient: 'Oil', weight: 10 },
    { recipeName: 'Prawn Curry', ingredient: 'Curry Leaves', weight: 5 },
    { recipeName: 'Prawn Curry', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Egg Curry', ingredient: 'Egg', weight: 120 },
    { recipeName: 'Egg Curry', ingredient: 'Tomato', weight: 100 },
    { recipeName: 'Egg Curry', ingredient: 'Onion', weight: 60 },
    { recipeName: 'Egg Curry', ingredient: 'Oil', weight: 10 },
    { recipeName: 'Egg Curry', ingredient: 'Ginger Garlic Paste', weight: 10 },
    { recipeName: 'Egg Curry', ingredient: 'Masala', weight: 5 },
    { recipeName: 'Egg Curry', ingredient: 'Salt', weight: 3 },
    { recipeName: 'Bhindi Fry', ingredient: 'Ladyfinger', weight: 150 },
    { recipeName: 'Bhindi Fry', ingredient: 'Onion', weight: 50 },
    { recipeName: 'Bhindi Fry', ingredient: 'Oil', weight: 10 },
    { recipeName: 'Bhindi Fry', ingredient: 'Chili Powder', weight: 4 },
    { recipeName: 'Bhindi Fry', ingredient: 'Salt', weight: 2 },
];

// Process raw recipe data into the required format
const recipesMap = new Map<string, Ingredient[]>();
rawRecipeData.forEach(item => {
    if (!recipesMap.has(item.recipeName)) {
        recipesMap.set(item.recipeName, []);
    }
    recipesMap.get(item.recipeName)!.push({
        name: item.ingredient,
        quantity: `${item.weight}g`,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(item.ingredient)}/100`,
        targetWeightGrams: item.weight,
    });
});

export const recipes: Recipe[] = Array.from(recipesMap.entries()).map(([name, ingredients]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    // Icon is defined in the component to avoid passing JSX from a non-component file.
    icon: null,
    ingredients,
}));

// --- PRODUCT CATALOG DATA ---
// Updated with December 2024 Indian market prices

const rawProductData: { nameRaw: string, id: string, cost: number }[] = [
    { nameRaw: 'Paneer (1kg)', id: 'P101', cost: 400 },
    { nameRaw: 'Tomato (1kg)', id: 'P102', cost: 30 },
    { nameRaw: 'Onion (1kg)', id: 'P103', cost: 35 },
    { nameRaw: 'Butter (1kg)', id: 'P104', cost: 550 },
    { nameRaw: 'Fresh Cream (1kg)', id: 'P105', cost: 268 },
    { nameRaw: 'Cream (1kg)', id: 'P106', cost: 268 },
    { nameRaw: 'Garlic (1kg)', id: 'P107', cost: 180 },
    { nameRaw: 'Ginger (1kg)', id: 'P108', cost: 100 },
    { nameRaw: 'Garam Masala (1kg)', id: 'P109', cost: 900 },
    { nameRaw: 'Red Chili Powder (1kg)', id: 'P110', cost: 750 },
    { nameRaw: 'Chili Powder (1kg)', id: 'P111', cost: 750 },
    { nameRaw: 'Salt (1kg)', id: 'P112', cost: 28 },
    { nameRaw: 'Basmati Rice (1kg)', id: 'P113', cost: 90 },
    { nameRaw: 'Rice (1kg)', id: 'P114', cost: 50 },
    { nameRaw: 'Cooked Rice (1kg)', id: 'P115', cost: 50 },
    { nameRaw: 'Chicken (1kg)', id: 'P116', cost: 280 },
    { nameRaw: 'Curd (1kg)', id: 'P117', cost: 90 },
    { nameRaw: 'Ghee (1kg)', id: 'P118', cost: 650 },
    { nameRaw: 'Ginger Garlic Paste (1kg)', id: 'P119', cost: 300 },
    { nameRaw: 'Biryani Masala (1kg)', id: 'P120', cost: 1100 },
    { nameRaw: 'Mint Leaves (1kg)', id: 'P121', cost: 100 },
    { nameRaw: 'Wheat Flour (1kg)', id: 'P122', cost: 58 },
    { nameRaw: 'Water (1kg)', id: 'P123', cost: 2 },
    { nameRaw: 'Dosa Batter (1kg)', id: 'P124', cost: 90 },
    { nameRaw: 'Oil (1kg)', id: 'P125', cost: 135 },
    { nameRaw: 'Mustard Seeds (1kg)', id: 'P126', cost: 150 },
    { nameRaw: 'Curry Leaves (1kg)', id: 'P127', cost: 80 },
    { nameRaw: 'Potato (1kg)', id: 'P128', cost: 28 },
    { nameRaw: 'Coriander (1kg)', id: 'P129', cost: 100 },
    { nameRaw: 'Chickpeas (1kg)', id: 'P130', cost: 120 },
    { nameRaw: 'Chole Masala (1kg)', id: 'P131', cost: 1100 },
    { nameRaw: 'Spinach (1kg)', id: 'P132', cost: 60 },
    { nameRaw: 'Mixed Veggies (1kg)', id: 'P133', cost: 160 },
    { nameRaw: 'Green Chili (1kg)', id: 'P134', cost: 60 },
    { nameRaw: 'Toor Dal (1kg)', id: 'P135', cost: 160 },
    { nameRaw: 'Tamarind (1kg)', id: 'P136', cost: 200 },
    { nameRaw: 'Drumstick (1kg)', id: 'P137', cost: 70 },
    { nameRaw: 'Sambar Powder (1kg)', id: 'P138', cost: 950 },
    { nameRaw: 'Potato Filling (1kg)', id: 'P139', cost: 80 },
    { nameRaw: 'Cumin Seeds (1kg)', id: 'P140', cost: 350 },
    { nameRaw: 'Lemon Juice (1kg)', id: 'P141', cost: 120 },
    { nameRaw: 'Capsicum (1kg)', id: 'P142', cost: 60 },
    { nameRaw: 'Idli Batter (1kg)', id: 'P143', cost: 90 },
    { nameRaw: 'Prawns (1kg)', id: 'P144', cost: 450 },
    { nameRaw: 'Coconut Milk (1kg)', id: 'P145', cost: 275 },
    { nameRaw: 'Egg (1kg)', id: 'P146', cost: 150 },
    { nameRaw: 'Ladyfinger (1kg)', id: 'P147', cost: 40 },
    { nameRaw: 'Masala (1kg)', id: 'P148', cost: 800 },
];

export const productCatalog: Product[] = rawProductData.map(({ nameRaw, id, cost }) => {
    let name = nameRaw.replace(/\s*\([^)]*\)\s*/, '').trim();
    let unit: 'kg' | 'pcs' = 'kg';
    let price = cost;

    const match = nameRaw.match(/\(([^)]+)\)/);
    if (match) {
        const unitStr = match[1].toLowerCase();

        if (unitStr.includes('pc') || unitStr.includes('bunch') || unitStr.includes('roll')) {
            unit = 'pcs';
            const pcsMatch = unitStr.match(/(\d+)/);
            if (pcsMatch) {
                price = cost / parseInt(pcsMatch[1], 10);
            }
        } else if (unitStr.includes('dozen')) {
            unit = 'pcs';
            price = cost / 12;
        } else if (unitStr.includes('kg')) {
            unit = 'kg';
        } else if (unitStr.includes('g') || unitStr.includes('ml')) {
            // Assuming 1ml = 1g for simplicity
            unit = 'kg';
            const weightMatch = unitStr.match(/(\d+)/);
            if (weightMatch) {
                const grams = parseInt(weightMatch[1], 10);
                price = (cost / grams) * 1000;
            }
        } else if (unitStr.includes('l')) {
            unit = 'kg'; // Assuming 1L = 1kg
        }
    } else {
        // Default for items with no specified unit (e.g., Biscuit Pack)
        unit = 'pcs';
    }

    // Correct a specific item name if needed
    if (nameRaw.includes('Lady Finger')) name = 'Lady Finger';

    return {
        id,
        name,
        price,
        unit,
    };
});
