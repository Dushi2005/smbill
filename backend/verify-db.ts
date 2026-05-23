import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Ingredient } from './models/Ingredient.js';
import { Recipe } from './models/Recipe.js';

dotenv.config({ path: './backend.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const ingredientCount = await Ingredient.countDocuments();
        const recipeCount = await Recipe.countDocuments();
        console.log(`Ingredients: ${ingredientCount}`);
        console.log(`Recipes: ${recipeCount}`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
