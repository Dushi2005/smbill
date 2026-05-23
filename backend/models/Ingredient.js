import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        cost: { type: Number, required: true },
        unit: { type: String, default: 'kg' }, // 'kg', 'pcs', 'l'
        category: { type: String }, // 'Vegetable', 'Fruit', 'Spice', etc.
    },
    { timestamps: true }
);

export const Ingredient = mongoose.model("Ingredient", ingredientSchema);
