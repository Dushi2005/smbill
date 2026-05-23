import React, { useState, useMemo } from 'react';
import { getTotalIngredientsSummary, TotalIngredient } from '../services/totalIngredientsService';
import BackButton from './BackButton';
import Header from './Header';

const TotalIngredientsView: React.FC = () => {
    const [sortBy, setSortBy] = useState<'price' | 'weight' | 'name' | 'recipes'>('price');
    const [searchTerm, setSearchTerm] = useState('');

    const summary = useMemo(() => getTotalIngredientsSummary(), []);

    const filteredAndSortedIngredients = useMemo(() => {
        let ingredients = [...summary.ingredients];

        // Filter by search term
        if (searchTerm) {
            ingredients = ingredients.filter(ing =>
                ing.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        switch (sortBy) {
            case 'price':
                ingredients.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case 'weight':
                ingredients.sort((a, b) => b.totalWeight - a.totalWeight);
                break;
            case 'name':
                ingredients.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'recipes':
                ingredients.sort((a, b) => b.recipeCount - a.recipeCount);
                break;
        }

        return ingredients;
    }, [summary.ingredients, sortBy, searchTerm]);

    const formatWeight = (grams: number) => {
        if (grams >= 1000) {
            return `${(grams / 1000).toFixed(2)} kg`;
        }
        return `${grams.toFixed(0)} g`;
    };

    const formatPrice = (price: number) => {
        return `₹${price.toFixed(2)}`;
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            <BackButton />
            <Header title="Total Ingredients & Pricing" />

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-green-600/80 to-green-800/80 p-4 rounded-xl shadow-lg border border-green-400/30">
                        <div className="text-sm text-green-200">Total Cost</div>
                        <div className="text-3xl font-bold text-white mt-1">{formatPrice(summary.totalCost)}</div>
                        <div className="text-xs text-green-300 mt-1">Indian Market Prices</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 p-4 rounded-xl shadow-lg border border-blue-400/30">
                        <div className="text-sm text-blue-200">Total Weight</div>
                        <div className="text-3xl font-bold text-white mt-1">{formatWeight(summary.totalWeight)}</div>
                        <div className="text-xs text-blue-300 mt-1">Across All Recipes</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/80 to-purple-800/80 p-4 rounded-xl shadow-lg border border-purple-400/30">
                        <div className="text-sm text-purple-200">Unique Ingredients</div>
                        <div className="text-3xl font-bold text-white mt-1">{summary.uniqueIngredients}</div>
                        <div className="text-xs text-purple-300 mt-1">Different Items</div>
                    </div>
                </div>

                {/* Search and Sort Controls */}
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 space-y-3">
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setSortBy('price')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${sortBy === 'price'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Sort by Price
                        </button>
                        <button
                            onClick={() => setSortBy('weight')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${sortBy === 'weight'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Sort by Weight
                        </button>
                        <button
                            onClick={() => setSortBy('recipes')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${sortBy === 'recipes'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Sort by Usage
                        </button>
                        <button
                            onClick={() => setSortBy('name')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${sortBy === 'name'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                        >
                            Sort by Name
                        </button>
                    </div>
                </div>

                {/* Ingredients Table */}
                <div className="bg-white/10 rounded-xl border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/20">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">#</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Ingredient</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-200">Total Weight</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-200">Price/Kg</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-200">Total Price</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-200">Used In</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredAndSortedIngredients.map((ingredient, index) => (
                                    <tr
                                        key={ingredient.name}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-white">{ingredient.name}</div>
                                            <div className="text-xs text-gray-400">
                                                {ingredient.unit === 'kg' ? 'Per Kg' : 'Per Piece'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-medium text-yellow-300">
                                                {formatWeight(ingredient.totalWeight)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-300">
                                            {formatPrice(ingredient.pricePerKg)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-bold text-green-400">
                                                {formatPrice(ingredient.totalPrice)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-purple-600/50 text-purple-200 rounded-full">
                                                {ingredient.recipeCount} {ingredient.recipeCount === 1 ? 'recipe' : 'recipes'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredAndSortedIngredients.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            No ingredients found matching "{searchTerm}"
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">ℹ️</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-yellow-300 mb-1">About This Data</h3>
                            <p className="text-sm text-gray-300">
                                This table shows the total quantity of each ingredient needed across all {summary.ingredients.length} recipes in the system.
                                Prices are based on current Indian market rates (per kg or per piece). Some ingredients may use approximate prices
                                if exact matches aren't available in the product catalog.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="flex gap-3 pb-4">
                    <button
                        onClick={() => {
                            const csvContent = generateCSV(filteredAndSortedIngredients);
                            downloadCSV(csvContent, 'total-ingredients.csv');
                        }}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all"
                    >
                        📥 Export to CSV
                    </button>
                    <button
                        onClick={() => {
                            window.print();
                        }}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all"
                    >
                        🖨️ Print Report
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to generate CSV
const generateCSV = (ingredients: TotalIngredient[]): string => {
    const headers = ['#', 'Ingredient', 'Total Weight (g)', 'Price per Kg (₹)', 'Total Price (₹)', 'Used in Recipes'];
    const rows = ingredients.map((ing, index) => [
        index + 1,
        ing.name,
        ing.totalWeight.toFixed(2),
        ing.pricePerKg.toFixed(2),
        ing.totalPrice.toFixed(2),
        ing.recipeCount
    ]);

    const csvRows = [headers, ...rows];
    return csvRows.map(row => row.join(',')).join('\n');
};

// Helper function to download CSV
const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default TotalIngredientsView;
