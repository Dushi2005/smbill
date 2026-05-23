import express from 'express';
import { Recipe } from '../models/Recipe.js';
import { Ingredient } from '../models/Ingredient.js';

const router = express.Router();

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('ingredients.ingredientId');
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all ingredients (product catalog)
router.get('/ingredients', async (req, res) => {
    try {
        const ingredients = await Ingredient.find();
        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Populate DB from static data (Admin only)
router.post('/populate', async (req, res) => {
    try {
        const { recipes, productCatalog } = req.body;

        if (!recipes || !productCatalog) {
            return res.status(400).json({ error: 'Missing recipes or productCatalog data' });
        }

        // 1. Populate Ingredients
        await Ingredient.deleteMany({}); // Clear existing
        const ingredientMap = {};

        for (const product of productCatalog) {
            const newIngredient = new Ingredient({
                name: product.name,
                cost: product.price,
                unit: product.unit
            });
            const saved = await newIngredient.save();
            ingredientMap[product.name.toLowerCase()] = saved._id;
        }

        // 2. Populate Recipes
        await Recipe.deleteMany({}); // Clear existing

        for (const recipe of recipes) {
            const ingredients = recipe.ingredients.map(ing => {
                // Try to find matching ingredient
                // This logic mirrors the frontend matching logic but simpler for now
                // Ideally, we should use the same robust matching or ensure data consistency
                let ingredientId = null;

                // Simple direct match first
                if (ingredientMap[ing.name.toLowerCase()]) {
                    ingredientId = ingredientMap[ing.name.toLowerCase()];
                }
                // We can add more complex matching here if needed during population
                // For now, let's assume the frontend sends data that maps well or we handle it there

                return {
                    name: ing.name,
                    quantity: ing.quantity,
                    targetWeightGrams: ing.targetWeightGrams,
                    ingredientId: ingredientId
                };
            });

            const newRecipe = new Recipe({
                name: recipe.name,
                ingredients: ingredients
            });
            await newRecipe.save();
        }

        res.json({ message: 'Database populated successfully' });
    } catch (error) {
        console.error("Population Error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
