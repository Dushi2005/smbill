import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        ingredients: [
            {
                name: { type: String, required: true },
                quantity: { type: String, required: true }, // e.g., "200g", "2 pcs"
                targetWeightGrams: { type: Number, required: true }, // Normalized weight in grams
                ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }, // Link to product catalog
            },
        ],
    },
    { timestamps: true }
);

export const Recipe = mongoose.model("Recipe", recipeSchema);
