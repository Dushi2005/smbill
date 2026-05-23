
import React, { useState, useCallback } from 'react';
import ShowcaseContainer from './ShowcaseContainer';
import { generateTextStream } from '../services/geminiService';
import { PaperAirplaneIcon } from './Icons';

const TextGenerationShowcase: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    const onChunk = (chunkText: string) => {
      setResponse(prev => prev + chunkText);
    };

    const onError = (err: Error) => {
      setError(`An error occurred: ${err.message}`);
    };

    const onComplete = () => {
      setIsLoading(false);
    };

    try {
      await generateTextStream(prompt, onChunk, onError, onComplete);
    } catch (err) {
       // The service handles calling onError, but we catch here as a fallback
       console.error(err);
       setError(`An error occurred while starting the stream.`);
       setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <ShowcaseContainer
      title="Text Generation (Stream)"
      description="Enter a prompt and watch Gemini generate a response in real-time. This demonstrates the streaming capabilities of the API."
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gem-teal mb-2">
            Your Prompt
          </label>
          <textarea
            id="prompt"
            rows={4}
            className="w-full bg-gem-deep-blue border border-gem-slate rounded-lg p-3 text-gem-light focus:ring-2 focus:ring-gem-teal focus:border-gem-teal transition-colors"
            placeholder="e.g., Write a short story about a robot who discovers music."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-gem-deep-blue bg-gem-teal hover:bg-opacity-90 disabled:bg-gem-slate disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
                <>
                 <PaperAirplaneIcon className="w-5 h-5 mr-2"/>
                 Generate
                </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-gem-pink/20 border border-gem-pink text-gem-pink px-4 py-3 rounded-lg" role="alert">
            <p>{error}</p>
          </div>
        )}

        {(response || isLoading) && (
          <div>
            <h3 className="text-lg font-semibold text-gem-teal mb-2">Gemini's Response</h3>
            <div className="prose prose-invert bg-gem-deep-blue border border-gem-slate/70 rounded-lg p-4 min-h-[120px] whitespace-pre-wrap">
              {response}
              {isLoading && !response && <div className="animate-pulse-fast text-gem-slate">Thinking...</div>}
              {isLoading && response && <span className="inline-block w-2 h-4 bg-gem-teal ml-1 animate-pulse-fast"></span>}
            </div>
          </div>
        )}
      </div>
    </ShowcaseContainer>
  );
};

export default TextGenerationShowcase;
