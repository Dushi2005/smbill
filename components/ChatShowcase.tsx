
import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import ShowcaseContainer from './ShowcaseContainer';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon } from './Icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatShowcase: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat
  useEffect(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a helpful and creative assistant. Be concise but friendly.',
        }
      });
      setChat(chatInstance);
    } catch(err: any) {
        setError(`Failed to initialize chat: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when history changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, isLoading]);


  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: currentMessage };
    setHistory(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setError(null);
    
    // Add a placeholder for the model's response
    setHistory(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const responseStream = await chat.sendMessageStream({ message: currentMessage });
      
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if(lastMessage.role === 'model') {
            lastMessage.text += chunkText;
          }
          return newHistory;
        });
      }

    } catch (err: any) {
      setError(`An error occurred: ${err.message}`);
      // Remove the placeholder on error
      setHistory(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, isLoading, chat]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };


  return (
    <ShowcaseContainer
      title="Conversational Chat"
      description="Engage in a conversation with Gemini. The model remembers the history of your chat session."
    >
      <div className="flex flex-col h-[65vh]">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gem-deep-blue/50 rounded-t-lg">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 flex-shrink-0 bg-gem-teal rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-gem-deep-blue"/>
                </div>
              )}
              <div className={`max-w-md md:max-w-lg lg:max-w-2xl px-4 py-2 rounded-xl ${
                  msg.role === 'user'
                    ? 'bg-gem-teal text-gem-deep-blue rounded-br-none'
                    : 'bg-gem-slate/80 text-gem-light rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                 {isLoading && index === history.length - 1 && <span className="inline-block w-2 h-4 bg-gem-light ml-1 animate-pulse-fast"></span>}
              </div>
               {msg.role === 'user' && (
                <div className="w-8 h-8 flex-shrink-0 bg-gem-slate rounded-full flex items-center justify-center">
                    <UserCircleIcon className="w-6 h-6 text-gem-light"/>
                </div>
              )}
            </div>
          ))}
           {!history.length && (
            <div className="text-center text-gem-slate pt-8">
              <p>Start the conversation by sending a message.</p>
            </div>
          )}
        </div>
        {error && (
            <div className="bg-gem-pink/20 border-t border-b border-gem-pink text-gem-pink px-4 py-2" role="alert">
                <p className="text-sm">{error}</p>
            </div>
        )}
        <div className="p-4 bg-gem-navy/80 border-t border-gem-slate/50 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !chat}
              className="flex-1 bg-gem-deep-blue border border-gem-slate rounded-full py-2 px-4 text-gem-light focus:ring-2 focus:ring-gem-teal focus:border-gem-teal transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !currentMessage.trim() || !chat}
              className="p-2 rounded-full bg-gem-teal text-gem-deep-blue hover:bg-opacity-90 disabled:bg-gem-slate disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 disabled:scale-100"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </ShowcaseContainer>
  );
};

export default ChatShowcase;
