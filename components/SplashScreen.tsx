
import React from 'react';

const ScaleIcon = () => (
    <svg className="w-40 h-40 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18M3 21h18M7 21v-3a2 2 0 012-2h6a2 2 0 012 2v3" />
        <path d="M12 16V6" />
        <path d="M10 6h4" />
        <path d="M12 6a4 4 0 00-4 4" />
        <path d="M12 6a4 4 0 014 4" />
    </svg>
);


const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full animate-fadeIn">
       <div className="relative flex items-center justify-center">
            <ScaleIcon />
            <h1 className="absolute text-6xl font-bold text-white tracking-widest animate-pulse">
                DS
            </h1>
        </div>
      <div className="text-center p-8">
        <p className="text-2xl md:text-3xl font-thin text-gray-300 tracking-wider">
          Smart Weigh Hub
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
