import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import aiRoutes from './ai/aiController.js';
import billingRoutes from './bill/billingController.js';
import recipeRoutes from './recipe/recipeController.js';

dotenv.config({ path: './backend.env' });

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));
} else {
    console.warn('MONGODB_URI not found in environment variables');
}

app.use('/api/ai', aiRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/recipes', recipeRoutes);

app.get('/', (req, res) => {
    res.send('Smart Weigh Hub Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});