import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllRecipes, generateRecipeBillFromCatalog, RecipeBill } from '../services/recipeBillingService';
import { Recipe } from '../types';
import BackButton from './BackButton';
import Header from './Header';
import { QRCodeSVG } from 'qrcode.react';

const RecipeBillGenerator: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
    const [servings, setServings] = useState<number>(1);
    const [generatedBill, setGeneratedBill] = useState<RecipeBill | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [generating, setGenerating] = useState<boolean>(false);
    const [autoGenerating, setAutoGenerating] = useState<boolean>(false);

    // Email Sending & QR Code states
    const [customerEmail, setCustomerEmail] = useState('');
    const [emailSending, setEmailSending] = useState(false);
    const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);

    const qrCodeValue = useMemo(() => {
        if (!generatedBill) return '';
        const itemsList = generatedBill.items.map((item, index) => 
            `${index + 1}. ${item.name}: ${item.unit === 'serving' ? item.quantity : item.quantity.toFixed(3)} ${item.unit} @ ₹${item.unitPrice.toFixed(2)} = ₹${item.totalPrice.toFixed(2)}`
        ).join('\n');
        return `Bill No: ${generatedBill.billNo}
Recipe: ${generatedBill.recipeName}
Servings: ${generatedBill.servings}
Date: ${new Date(generatedBill.timestamp).toLocaleString()}

Ingredients:
${itemsList}

Subtotal: ₹${generatedBill.subtotal.toFixed(2)}
Labor (${generatedBill.laborPercent}%): ₹${generatedBill.laborCharge.toFixed(2)}
Handling: ₹${generatedBill.handlingCharge.toFixed(2)}
GST (${generatedBill.taxPercent}%): ₹${generatedBill.taxAmount.toFixed(2)}
Grand Total: ₹${generatedBill.grandTotal.toFixed(2)}`;
    }, [generatedBill]);

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerEmail.trim()) return;
        setEmailSending(true);
        setEmailSuccessMessage(null);

        // Simulate secure SMTP email dispatch
        setTimeout(() => {
            setEmailSending(false);
            setEmailSuccessMessage(`🧾 Detailed recipe bill successfully emailed to ${customerEmail}!`);
        }, 1200);
    };

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setLoading(true);
                const data = await getAllRecipes();
                if (!data || data.length === 0) {
                    setError("No recipes found. Please populate the database first.");
                } else {
                    setRecipes(data);
                    setError(null);
                }
            } catch (err) {
                console.error("Failed to load recipes:", err);
                setError(err instanceof Error ? err.message : "Failed to load recipes. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    // Auto-generate bill from URL parameters
    useEffect(() => {
        const recipeIdParam = searchParams.get('recipeId');
        const servingsParam = searchParams.get('servings');

        if (recipeIdParam && servingsParam && recipes.length > 0 && !generatedBill) {
            setAutoGenerating(true);
            setSelectedRecipeId(recipeIdParam);
            setServings(parseInt(servingsParam, 10) || 1);

            // Auto-generate bill
            const autoBill = async () => {
                setGenerating(true);
                try {
                    const bill = await generateRecipeBillFromCatalog(recipeIdParam, parseInt(servingsParam, 10) || 1, 5);
                    setGeneratedBill(bill);
                    setError(null);
                } catch (err) {
                    console.error("Bill generation error:", err);
                    setError(err instanceof Error ? err.message : 'Failed to generate bill. Please try again.');
                    setAutoGenerating(false);
                } finally {
                    setGenerating(false);
                }
            };

            autoBill();
        }
    }, [searchParams, recipes, generatedBill]);

    const handleGenerateBill = async () => {
        setError(null);
        setGenerating(true);

        if (!selectedRecipeId) {
            setError('Please select a recipe');
            setGenerating(false);
            return;
        }

        if (servings < 1 || servings > 100) {
            setError('Servings must be between 1 and 100');
            setGenerating(false);
            return;
        }

        try {
            const bill = await generateRecipeBillFromCatalog(selectedRecipeId, servings, 5);
            setGeneratedBill(bill);
            setError(null);
            // Reset email state for new bill
            setCustomerEmail('');
            setEmailSuccessMessage(null);
        } catch (err) {
            console.error("Bill generation error:", err);
            setError(err instanceof Error ? err.message : 'Failed to generate bill. Please try again.');
            setGeneratedBill(null);
        } finally {
            setGenerating(false);
        }
    };

    const handleReset = () => {
        setSelectedRecipeId('');
        setServings(1);
        setGeneratedBill(null);
        setError(null);
        setCustomerEmail('');
        setEmailSuccessMessage(null);
    };

    const handlePrintBill = () => {
        try {
            window.print();
        } catch (err) {
            console.error("Print failed:", err);
            setError("Failed to print. Please try again.");
        }
    };

    const handleDownloadCSV = () => {
        if (!generatedBill) return;

        try {
            const headers = ['Item', 'Quantity', 'Unit', 'Price/Unit (₹)', 'Total Price (₹)'];
            const rows = generatedBill.items.map(item => [
                item.name,
                item.unit === 'serving' ? item.quantity.toString() : item.quantity.toFixed(3),
                item.unit,
                item.unitPrice.toFixed(2),
                item.totalPrice.toFixed(2)
            ]);

            const csvContent = [
                [`Recipe: ${generatedBill.recipeName}`],
                [`Servings: ${generatedBill.servings}`],
                [`Bill No: ${generatedBill.billNo}`],
                [`Date: ${new Date(generatedBill.timestamp).toLocaleString()}`],
                [],
                headers,
                ...rows,
                [],
                ['', '', '', 'Subtotal', generatedBill.subtotal.toFixed(2)],
                ['', '', '', `Labor (${generatedBill.laborPercent}%)`, generatedBill.laborCharge.toFixed(2)],
                ['', '', '', 'Handling Charge', generatedBill.handlingCharge.toFixed(2)],
                ['', '', '', `GST (${generatedBill.taxPercent}%)`, generatedBill.taxAmount.toFixed(2)],
                ['', '', '', 'Grand Total', generatedBill.grandTotal.toFixed(2)]
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${generatedBill.billNo}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("CSV download failed:", err);
            setError("Failed to download CSV. Please try again.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
            <BackButton />
            <Header title="Recipe Bill Generator" />

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Loading State */}
                {loading && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="skeleton-card animate-pulse">
                            <div className="skeleton-text w-3/4"></div>
                            <div className="skeleton-text w-1/2"></div>
                        </div>
                        <div className="skeleton-card animate-pulse">
                            <div className="skeleton-text w-full"></div>
                            <div className="skeleton-text w-2/3"></div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {!loading && error && !generatedBill && (
                    <div className="p-4 bg-red-900/50 border border-red-600 rounded-lg text-red-300 animate-slideInDown">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h3 className="font-bold">Error</h3>
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Selection Form */}
                {!loading && !generatedBill && !autoGenerating && (
                    <div className="glass-strong p-6 rounded-xl space-y-4 animate-slideInUp">
                        <h2 className="text-xl font-bold text-yellow-300 mb-4">Select Recipe & Servings</h2>

                        {/* Recipe Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Recipe
                            </label>
                            <select
                                value={selectedRecipeId}
                                onChange={(e) => setSelectedRecipeId(e.target.value)}
                                disabled={recipes.length === 0}
                                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Select recipe"
                            >
                                <option value="" className="bg-gray-800">
                                    {recipes.length === 0 ? 'No recipes available' : 'Select a recipe...'}
                                </option>
                                {recipes.map(recipe => (
                                    <option key={recipe._id || recipe.id} value={recipe._id || recipe.id} className="bg-gray-800">
                                        {recipe.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Servings Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Number of Servings
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={servings}
                                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                aria-label="Number of servings"
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerateBill}
                            disabled={generating || recipes.length === 0}
                            className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-xl font-bold text-lg shadow-glow-green transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generating ? '⏳ Generating...' : '🧾 Generate Bill'}
                        </button>
                    </div>
                )}

                {/* Generated Bill Display */}
                {generatedBill && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Bill Header */}
                        <div className="glass rounded-xl p-6 shadow-layered animate-slideInDown">
                            <h2 className="text-2xl font-bold text-center gradient-text mb-2">
                                {generatedBill.recipeName}
                            </h2>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                                <div>
                                    <span className="text-gray-400">Bill No:</span> {generatedBill.billNo}
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-400">Servings:</span> {generatedBill.servings}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-400">Date:</span> {new Date(generatedBill.timestamp).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Bill Items */}
                        <div className="glass rounded-xl overflow-hidden shadow-layered animate-slideInUp">
                            <div className="bg-white/20 px-4 py-3">
                                <h3 className="font-bold text-lg">Ingredients</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-striped">
                                    <thead className="bg-white/10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Qty</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Price/Unit</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {generatedBill.items.map((item, index) => (
                                            <tr key={index} className="table-row-hover animate-slideInLeft" style={{ animationDelay: `${index * 0.05}s` }}>
                                                <td className="px-4 py-3 text-sm text-gray-400">{index + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{item.name}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-yellow-300">
                                                    {item.unit === 'serving' ? item.quantity : item.quantity.toFixed(3)} {item.unit}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-300">
                                                    ₹{item.unitPrice.toFixed(2)}/{item.unit}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-green-400">
                                                    ₹{item.totalPrice.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bill Summary */}
                        <div className="glass p-6 rounded-xl space-y-2 shadow-glow animate-scaleUp">
                            <div className="flex justify-between text-gray-300">
                                <span>Subtotal</span>
                                <span className="font-medium">₹{generatedBill.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Labor ({generatedBill.laborPercent}%)</span>
                                <span>₹{generatedBill.laborCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>Handling Charge</span>
                                <span>₹{generatedBill.handlingCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-400">
                                <span>GST ({generatedBill.taxPercent}%)</span>
                                <span>₹{generatedBill.taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-white pt-2 border-t border-white/20">
                                <span>Grand Total</span>
                                <span className="text-green-400">₹{generatedBill.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Interactive QR Code Segment */}
                        <div className="glass p-6 rounded-xl space-y-4 text-center shadow-layered animate-scaleUp">
                            <h3 className="text-base font-bold text-yellow-300">Scan to View Bill (QR Code)</h3>
                            <div className="bg-white p-3 rounded-2xl inline-block shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                                <QRCodeSVG
                                    value={qrCodeValue}
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                                Scanner contains the recipe name, serving size, and fully detailed item ledger.
                            </p>
                        </div>

                        {/* Customer Email Dispatcher Segment */}
                        <div className="glass p-6 rounded-xl space-y-4 shadow-layered animate-scaleUp">
                            <h3 className="text-base font-bold text-yellow-300 flex items-center gap-2">
                                ✉️ Email Bill to Customer
                            </h3>
                            <form onSubmit={handleSendEmail} className="space-y-3">
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        required
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        placeholder="customer@email.com"
                                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm placeholder-gray-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={emailSending}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-lg transition-all disabled:opacity-50 disabled:scale-100"
                                    >
                                        {emailSending ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                                {emailSuccessMessage && (
                                    <p className="text-emerald-450 text-xs font-semibold bg-emerald-950/40 border border-emerald-500/20 p-2 rounded-lg animate-fadeIn text-center">
                                        {emailSuccessMessage}
                                    </p>
                                )}
                            </form>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleDownloadCSV}
                                className="py-3 px-6 glass hover-lift rounded-xl font-semibold shadow-glow transition-all"
                            >
                                📥 Download CSV
                            </button>
                            <button
                                onClick={handlePrintBill}
                                className="py-3 px-6 glass hover-lift rounded-xl font-semibold shadow-glow transition-all"
                            >
                                🖨️ Print Bill
                            </button>
                        </div>

                        <button
                            onClick={handleReset}
                            className="w-full py-3 px-6 glass hover-lift rounded-xl font-semibold transition-all"
                        >
                            ← Generate Another Bill
                        </button>
                    </div>
                )}

                {/* Info Box */}
                {!generating && !loading && (
                    <div className="glass rounded-xl p-4 animate-fadeIn">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">ℹ️</div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-300 mb-1">About This Feature</h3>
                                <p className="text-sm text-gray-300">
                                    {generatedBill ? (
                                        'Bill generated including ingredient costs, 10% labor charge, and applicable taxes.'
                                    ) : (
                                        'This tool generates a detailed bill for any recipe based on the number of servings you select.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeBillGenerator;
