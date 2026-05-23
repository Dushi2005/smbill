import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { recipes, productCatalog } from './services/recipeData';
import { Ingredient } from './backend/models/Ingredient.js';
import { Recipe } from './backend/models/Recipe.js';

dotenv.config({ path: './backend.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('MongoDB connected');
        populateDB();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function populateDB() {
    try {
        console.log('Starting population...');

        // 1. Populate Ingredients
        await Ingredient.deleteMany({});
        console.log('Cleared existing ingredients');

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
        console.log(`Populated ${productCatalog.length} ingredients`);

        // 2. Populate Recipes
        await Recipe.deleteMany({});
        console.log('Cleared existing recipes');

        for (const recipe of recipes) {
            const ingredients = recipe.ingredients.map(ing => {
                let ingredientId = null;
                // Simple direct match
                if (ingredientMap[ing.name.toLowerCase()]) {
                    ingredientId = ingredientMap[ing.name.toLowerCase()];
                }

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
        console.log(`Populated ${recipes.length} recipes`);

        console.log('Database population complete');
        process.exit(0);
    } catch (error) {
        console.error('Population Error:', error);
        process.exit(1);
    }
}
