import React, { useState } from 'react';
import { Product } from '../types';
import Header from './Header';
import BackButton from './BackButton';

interface PriceEditorProps {
    products: Product[];
    onUpdatePrices: (updatedProducts: Product[]) => void;
}

const PriceEditor: React.FC<PriceEditorProps> = ({ products, onUpdatePrices }) => {
    const [priceChanges, setPriceChanges] = useState<Record<string, string>>({});

    const handlePriceChange = (productId: string, newPrice: string) => {
        setPriceChanges(prev => ({ ...prev, [productId]: newPrice }));
    };

    const handleSaveChanges = () => {
        const updatedProducts = products.map(product => {
            const changedPriceStr = priceChanges[product.id];
            if (changedPriceStr !== undefined && changedPriceStr.trim() !== '') {
                const newPrice = parseFloat(changedPriceStr);
                if (!isNaN(newPrice) && newPrice >= 0) {
                    return { ...product, price: newPrice };
                }
            }
            return product;
        });

        onUpdatePrices(updatedProducts);
        setPriceChanges({});
    };

    return (
        <div className="flex flex-col h-full relative">
            <BackButton />
            <Header title="Price Editor" />
            <div className="flex-grow p-4 animate-fadeIn overflow-y-auto">
                <div className="bg-black/20 p-4 rounded-xl space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center font-bold text-red-300 pb-2 border-b border-white/20 mb-2">
                        <span>Item</span>
                        <span>Current Price</span>
                        <span>New Price</span>
                    </div>
                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                        {products.sort((a, b) => a.name.localeCompare(b.name)).map(product => (
                            <div key={product.id} className="grid grid-cols-3 items-center gap-2 py-2 border-b border-white/10">
                                <span className="truncate text-left">{product.name}</span>
                                <span className="text-center text-gray-400">₹ {product.price.toFixed(2)}</span>
                                <input
                                    type="number"
                                    placeholder="Set new"
                                    value={priceChanges[product.id] ?? ''}
                                    onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                    className="p-1 bg-white/10 rounded-md border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
                                    step="0.01"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4 bg-black/30 backdrop-blur-sm">
                <button
                    onClick={handleSaveChanges}
                    className="w-full py-3 px-6 text-lg font-bold text-white bg-green-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                    Save All Changes
                </button>
            </div>
        </div>
    );
};

export default PriceEditor;
