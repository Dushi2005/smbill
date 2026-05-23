import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true, unique: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
    servings: { type: Number },
    items: [
      {
        name: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    grandTotal: Number,
  },
  { timestamps: true }
);

export const Bill = mongoose.model("Bill", billSchema);
