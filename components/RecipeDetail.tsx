import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Ingredient } from '../types';
import { getRecipeInstructions } from '../services/geminiService';
import { useIoT } from '../App';
import { recipes } from '../services/recipeData';
import BackButton from './BackButton';
import Header from './Header';

const CountdownTimer: React.FC<{ duration: number; onComplete: () => void }> = ({ duration, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onComplete]);

    useEffect(() => {
        setTimeLeft(duration); // Reset timer when duration prop changes
    }, [duration]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="my-4 text-center p-4 bg-blue-900/50 border-2 border-blue-400 rounded-2xl animate-fadeIn flex flex-col items-center justify-center space-y-2">
            <p className="text-lg text-gray-300">Time Remaining</p>
            <p className="text-4xl font-mono font-bold text-yellow-300">{formatTime(timeLeft)}</p>
            <button
                onClick={onComplete}
                className="mt-2 px-4 py-1.5 bg-red-650 hover:bg-red-750 text-xs font-semibold text-white rounded-lg transition-all duration-205 shadow-md active:scale-95"
            >
                Skip Timer
            </button>
        </div>
    );
};

const SpeakerOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SpeakerOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
    </svg>
);


const RecipeDetail: React.FC = () => {
    const { recipeId } = useParams<{ recipeId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const servings = parseInt(queryParams.get('servings') || '1', 10);

    const recipe = recipes.find(r => r.id === recipeId);

    const [instructions, setInstructions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { weight, tare, connectToScale, isConnected } = useIoT();
    const [manualWeightOverride, setManualWeightOverride] = useState<number | null>(null);
    const [manualWeightInput, setManualWeightInput] = useState('');
    const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);
    const [isWeightMatched, setIsWeightMatched] = useState(false); // New state for visual feedback

    const [isWeighingPhase, setIsWeighingPhase] = useState(true);
    const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
    const [timerDuration, setTimerDuration] = useState<number | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

    const effectiveWeight = manualWeightOverride ?? weight;

    const scaledIngredients = useMemo<Ingredient[]>(() => {
        if (!recipe) return [];
        return recipe.ingredients.map(ing => ({
            ...ing,
            targetWeightGrams: ing.targetWeightGrams * servings,
        }));
    }, [recipe, servings]);

    useEffect(() => {
        if (!isSpeechEnabled) {
            window.speechSynthesis.cancel();
            return;
        }

        let textToSpeak = '';
        if (isWeighingPhase && currentIngredientIndex < scaledIngredients.length) {
            const currentIngredient = scaledIngredients[currentIngredientIndex];
            textToSpeak = `${currentIngredient.name}, ${currentIngredient.targetWeightGrams} grams.`;
        } else if (!isWeighingPhase && instructions.length > 0 && currentInstructionIndex < instructions.length) {
            const instruction = instructions[currentInstructionIndex];
            textToSpeak = instruction.replace(/\s*\([^)]+\)/g, '').trim();
        }

        if (!textToSpeak) return;

        // Strip any remaining hash (#) or asterisk (*) characters to avoid SpeechSynthesis speaking them
        const cleanedTextToSpeak = textToSpeak.replace(/[#*]/g, '').trim();

        const speak = () => {
            const utterance = new SpeechSynthesisUtterance(cleanedTextToSpeak);
            const voices = window.speechSynthesis.getVoices();
            let femaleVoice = voices.find(voice => voice.lang.startsWith('en') && /female|zira|susan|karen/i.test(voice.name));
            if (!femaleVoice) {
                femaleVoice = voices.find(voice => voice.lang.startsWith('en'));
            }

            if (femaleVoice) utterance.voice = femaleVoice;

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = speak;
        } else {
            speak();
        }

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [currentIngredientIndex, currentInstructionIndex, isWeighingPhase, isSpeechEnabled, scaledIngredients, instructions]);


    const isWeightCorrect = (targetWeight: number, currentWeight: number) => {
        const tolerance = Math.max(5, targetWeight * 0.1); // 10% tolerance or 5g, whichever is larger
        return currentWeight >= targetWeight - tolerance && currentWeight <= targetWeight + tolerance;
    };

    useEffect(() => {
        if (!isWeighingPhase || currentIngredientIndex >= scaledIngredients.length) {
            setIsWeightMatched(false);
            return;
        }

        const currentIngredient = scaledIngredients[currentIngredientIndex];
        const isCorrect = isWeightCorrect(currentIngredient.targetWeightGrams, effectiveWeight);

        // Update visual state for immediate feedback
        setIsWeightMatched(isCorrect);

    }, [effectiveWeight, currentIngredientIndex, scaledIngredients, isWeighingPhase]);

    const handleNextIngredient = () => {
        if (currentIngredientIndex >= scaledIngredients.length - 1) {
            setIsWeighingPhase(false); // All ingredients weighed, move to cooking
        } else {
            setCurrentIngredientIndex(prev => prev + 1);
            tare(); // Tare the scale for the next ingredient
            setManualWeightOverride(null); // Also clear manual override
            setManualWeightInput('');
        }
    };

    const checkInstructionForTimer = (instruction: string) => {
        if (!instruction) {
            setTimerDuration(null);
            return;
        }
        const timerRegex = /\((\d+)\s+minutes?\)/i;
        const match = instruction.match(timerRegex);
        if (match && match[1]) {
            const minutes = parseInt(match[1], 10);
            setTimerDuration(minutes * 60);
            setIsTimerRunning(true);
        } else {
            setTimerDuration(null);
            setIsTimerRunning(false);
        }
    };

    const handleFetchInstructions = async () => {
        if (!recipe) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getRecipeInstructions(recipe.name, servings);
            const lines = result.split('\n')
                .map(line => line.replace(/[#*]/g, '').trim())
                .filter(line => line.length > 0);

            if (lines.length === 0) {
                setError("The model returned an empty response. Please try again.");
                setInstructions([]);
            } else {
                setInstructions(lines);
                checkInstructionForTimer(lines[0] || '');
            }
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unknown error occurred while fetching instructions.");
            }
            setInstructions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isWeighingPhase) {
            handleFetchInstructions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isWeighingPhase]);


    const getStatusIcon = (targetWeight: number, index: number) => {
        if (index < currentIngredientIndex) return <span title="Completed">✅</span>;
        if (index > currentIngredientIndex) return <span title="Pending">⚪️</span>;

        // Current ingredient status
        if (isWeightMatched) return <span title="Correct Weight!">👍</span>;
        if (effectiveWeight > targetWeight) return <span title="Overweight">⚠️</span>;
        return <span title="Underweight">⏳</span>;
    };

    const handleSetManualWeight = () => {
        const newWeight = parseFloat(manualWeightInput);
        if (!isNaN(newWeight) && newWeight >= 0) setManualWeightOverride(newWeight);
        else alert("Please enter a valid weight.");
    };

    const handleClearManualWeight = () => {
        setManualWeightOverride(null);
        setManualWeightInput('');
    };

    const handleNextInstruction = () => {
        if (currentInstructionIndex < instructions.length - 1) {
            const nextIndex = currentInstructionIndex + 1;
            setCurrentInstructionIndex(nextIndex);
            checkInstructionForTimer(instructions[nextIndex]);
        }
    };

    if (!recipe) {
        return <div className="text-white text-center p-10">Recipe not found</div>;
    }

    return (
        <div className="flex flex-col h-full relative">
            <BackButton />
            <Header title={`${recipe.name} (${servings} ${servings > 1 ? 'servings' : 'serving'})`}>
                <button
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    className="text-white p-2 rounded-full hover:bg-white/10"
                    aria-label={isSpeechEnabled ? "Disable voice guide" : "Enable voice guide"}
                >
                    {isSpeechEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
                </button>
            </Header>

            <div className="flex-grow p-4 space-y-2 animate-fadeIn overflow-y-auto">

                {isWeighingPhase ? (
                    <>
                        <div className="text-center p-2 rounded-lg bg-black/20 mb-4 space-y-2">
                            <h2 className="text-lg text-gray-300">Live Weight</h2>
                            <p className="text-3xl font-bold text-yellow-300">{effectiveWeight.toFixed(1)} g</p>
                            <div className="text-xs text-gray-400 pt-2">Manual Override</div>
                            <div className="flex items-center justify-center gap-2">
                                <input type="number" value={manualWeightInput} onChange={(e) => setManualWeightInput(e.target.value)} placeholder="Override weight" className="w-1/2 p-1 text-sm bg-white/10 rounded-md border border-white/20 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                <button onClick={handleSetManualWeight} className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700">Set</button>
                                <button onClick={handleClearManualWeight} className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-700">Clear</button>
                            </div>
                            <div className="text-sm text-gray-400">or</div>
                            <button
                                onClick={connectToScale}
                                className="w-full py-2 px-4 font-bold text-white bg-indigo-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                {isConnected ? 'Connected to Scale' : 'Connect to Bluetooth Scale'}
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-center mb-4 text-yellow-300">Weigh Your Ingredients</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {scaledIngredients.map((ingredient, index) => {
                                const isCurrent = index === currentIngredientIndex;
                                const isMatched = isCurrent && isWeightMatched;
                                return (
                                    <div
                                        key={ingredient.name + index}
                                        className={`flex flex-col items-center justify-center text-center p-4 rounded-xl shadow-lg transition-all duration-300 h-32
                                    ${isMatched ? 'bg-gradient-to-r from-green-500/80 to-teal-500/80 ring-2 ring-green-300' :
                                                isCurrent ? 'bg-gradient-to-r from-yellow-600/70 to-orange-600/70 ring-2 ring-yellow-300' :
                                                    'bg-gradient-to-r from-purple-800/50 to-indigo-800/50'}`
                                        }
                                    >
                                        <div className="flex-grow flex flex-col justify-center">
                                            <span className="text-lg font-bold text-white">{ingredient.name}</span>
                                            <span className="text-md text-gray-300 block mt-1">{ingredient.targetWeightGrams}g</span>
                                        </div>
                                        <div className="text-2xl h-8 flex items-center">
                                            {getStatusIcon(ingredient.targetWeightGrams, index)}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {isWeightMatched && (
                            <div className="mt-4">
                                <button
                                    onClick={handleNextIngredient}
                                    className="w-full py-3 px-6 text-lg font-bold text-white bg-green-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 animate-pulse"
                                >
                                    {currentIngredientIndex >= scaledIngredients.length - 1 ? 'All Done! Start Cooking' : 'Confirm & Next Ingredient'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-center mb-2 text-yellow-300">Cooking Instructions</h2>
                        {isLoading && <p className="text-center">Loading...</p>}

                        {error && (
                            <div className="p-4 bg-red-900/50 rounded-lg text-center text-white border border-red-600">
                                <p className="font-bold text-red-300">Error</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        )}

                        {!error && instructions.length > 0 && (
                            <div className="p-4 bg-black/30 rounded-lg min-h-[6rem] flex items-center justify-center">
                                <p className="text-xl text-center">{instructions[currentInstructionIndex]}</p>
                            </div>
                        )}

                        {timerDuration && isTimerRunning && (
                            <CountdownTimer
                                duration={timerDuration}
                                onComplete={() => setIsTimerRunning(false)}
                            />
                        )}

                        {!error && currentInstructionIndex < instructions.length - 1 ? (
                            <button
                                onClick={handleNextInstruction}
                                className="w-full mt-4 py-3 px-6 text-lg font-bold text-white bg-teal-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            >
                                Next Step
                            </button>
                        ) : (
                            !error && !isTimerRunning && instructions.length > 0 &&
                            <div className="mt-4 p-4 text-center bg-green-800/50 rounded-lg">
                                <p className="text-xl font-bold text-green-300">Recipe Complete! Enjoy!</p>
                            </div>
                        )}


                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeDetail;
