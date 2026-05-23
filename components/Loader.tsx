
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="mt-12 flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg text-gray-300 font-semibold">Conjuring the cosmos...</p>
      <p className="text-sm text-gray-500">This can take a moment, great art needs patience!</p>
    </div>
  );
};
