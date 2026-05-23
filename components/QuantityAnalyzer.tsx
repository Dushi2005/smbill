import React, { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import BackButton from './BackButton';
import { useIoT } from '../App';
import { QuantityHistoryItem } from '../types';

const QuantityAnalyzer: React.FC = () => {
    const { weight, tare, connectToScale, isConnected } = useIoT();

    // States for single item weight
    const [itemWeight, setItemWeight] = useState<number | null>(null);
    const [manualItemWeightInput, setManualItemWeightInput] = useState('');
    const [placeholderWeight, setPlaceholderWeight] = useState(0.0);

    // States for total weight override
    const [manualTotalWeightInput, setManualTotalWeightInput] = useState('');
    const [totalWeightOverride, setTotalWeightOverride] = useState<number | null>(null);

    const [history, setHistory] = useState<QuantityHistoryItem[]>([]);

    const effectiveTotalWeight = totalWeightOverride ?? weight;

    useEffect(() => {
        if (itemWeight !== null) return; // Don't run if a weight is already set

        const interval = setInterval(() => {
            // A more "natural" fluctuation
            setPlaceholderWeight(prev => {
                const change = (Math.random() - 0.5) * 0.1;
                const newWeight = prev + change;
                if (newWeight < 0 || newWeight > 0.5) return prev - change; // reverse if out of bounds
                return newWeight;
            });
        }, 1200);

        return () => clearInterval(interval);
    }, [itemWeight]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('quantityHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const quantity = useMemo(() => {
        const total = effectiveTotalWeight;
        const item = itemWeight;

        if (item && !isNaN(total) && !isNaN(item) && item > 0) {
            return Math.floor(total / item);
        }
        return 0;
    }, [effectiveTotalWeight, itemWeight]);

    const handleSetItemWeightFromManual = () => {
        const manualVal = parseFloat(manualItemWeightInput);
        if (!isNaN(manualVal) && manualVal > 0) {
            setItemWeight(manualVal);
        } else {
            alert("Please enter a valid, positive weight.");
        }
    }

    const resetItemWeight = () => {
        setItemWeight(null);
        setManualItemWeightInput('');
    }

    // Handlers for manual total weight
    const handleSetTotalWeightFromManual = () => {
        const manualVal = parseFloat(manualTotalWeightInput);
        if (!isNaN(manualVal) && manualVal >= 0) {
            setTotalWeightOverride(manualVal);
        } else {
            alert("Please enter a valid, non-negative weight.");
        }
    };

    const clearTotalWeightOverride = () => {
        setTotalWeightOverride(null);
        setManualTotalWeightInput('');
    };


    const handleSave = () => {
        if (quantity > 0 && itemWeight && itemWeight > 0) {
            const newEntry: QuantityHistoryItem = {
                id: new Date().toISOString(),
                totalWeight: parseFloat(effectiveTotalWeight.toFixed(2)),
                itemWeight: itemWeight,
                quantity,
                timestamp: new Date().toLocaleString()
            };
            const updatedHistory = [newEntry, ...history];
            setHistory(updatedHistory);
            localStorage.setItem('quantityHistory', JSON.stringify(updatedHistory));
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            <BackButton />
            <Header title="Quantity Analyzer" />
            <div className="flex-grow flex flex-col items-center justify-start p-6 space-y-6 animate-fadeIn overflow-y-auto">

                <div className="w-full max-w-xs text-center p-4 bg-blue-900/50 border-2 border-blue-400 rounded-2xl space-y-3">
                    <p className="text-lg text-gray-300">Total Weight</p>
                    <div className="text-white text-3xl font-bold my-2">{effectiveTotalWeight.toFixed(2)} g</div>
                    <div className="text-xs text-gray-400 pt-1">Manual Override</div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={manualTotalWeightInput}
                            onChange={(e) => setManualTotalWeightInput(e.target.value)}
                            placeholder="Enter total weight"
                            className="w-full p-2 bg-white/10 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button onClick={handleSetTotalWeightFromManual} className="py-2 px-4 bg-blue-600 rounded-md font-semibold hover:bg-blue-700">Set</button>
                    </div>
                    {totalWeightOverride !== null && (
                        <button onClick={clearTotalWeightOverride} className="text-sm text-yellow-400 hover:underline pt-2">
                            Use Live Scale Weight
                        </button>
                    )}
                    <div className="text-sm text-gray-400">or</div>
                    <button
                        onClick={connectToScale}
                        className="w-full py-3 px-4 font-bold text-white bg-indigo-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        {isConnected ? 'Connected to Scale' : 'Connect to Bluetooth Scale'}
                    </button>
                </div>

                <div className="w-full max-w-xs text-center p-4 bg-blue-900/50 border-2 border-blue-400 rounded-2xl space-y-3">
                    <p className="text-lg text-gray-300">Single Item Weight</p>
                    {itemWeight !== null ? (
                        <>
                            <div className="text-white text-3xl font-bold my-2">{itemWeight} g</div>
                            <button onClick={resetItemWeight} className="text-sm text-yellow-400 hover:underline">
                                Reset
                            </button>
                        </>
                    ) : (
                        <div className="text-gray-400 text-3xl font-mono h-[52px] flex items-center justify-center">{placeholderWeight.toFixed(2)} g</div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="number"
                            value={manualItemWeightInput}
                            onChange={(e) => setManualItemWeightInput(e.target.value)}
                            placeholder="Enter weight in g"
                            className="w-full p-2 bg-white/10 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button onClick={handleSetItemWeightFromManual} className="py-2 px-4 bg-blue-600 rounded-md font-semibold hover:bg-blue-700">Set</button>
                    </div>

                    <div className="text-sm text-gray-400">or</div>

                    <button
                        onClick={connectToScale}
                        className="w-full py-3 px-4 font-bold text-white bg-indigo-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                        {isConnected ? 'Connected to Scale' : 'Connect to Bluetooth Scale'}
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-2xl text-yellow-300 font-semibold">
                        Estimated Quantity: <span className="font-bold text-4xl">{quantity}</span>
                    </p>
                </div>

                <div className="w-full max-w-xs flex space-x-2">
                    <button
                        onClick={tare}
                        className="flex-1 py-3 px-4 text-md font-bold text-white bg-red-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        TARE
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 text-md font-bold text-white bg-green-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        SAVE RESULT
                    </button>
                </div>

                <div className="w-full max-w-md pt-4">
                    <h3 className="text-lg font-bold text-center mb-2">History</h3>
                    <div className="bg-black/20 p-2 rounded-lg max-h-48 overflow-y-auto">
                        {history.length > 0 ? history.map(entry => (
                            <div key={entry.id} className="text-sm p-2 border-b border-white/10">
                                <p><strong>Qty:</strong> {entry.quantity} | <strong>Total W:</strong> {entry.totalWeight}g | <strong>Item W:</strong> {entry.itemWeight}g</p>
                                <p className="text-xs text-gray-400">{entry.timestamp}</p>
                            </div>
                        )) : <p className="text-center text-gray-400">No history yet.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default QuantityAnalyzer;
