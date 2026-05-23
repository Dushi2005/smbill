
import React from 'react';

interface ShowcaseContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ShowcaseContainer: React.FC<ShowcaseContainerProps> = ({ title, description, children }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gem-light">{title}</h2>
        <p className="mt-2 text-gem-slate text-lg">{description}</p>
      </div>
      <div className="bg-gem-navy/60 p-4 sm:p-6 rounded-xl border border-gem-slate/50 shadow-2xl shadow-gem-deep-blue/50">
        {children}
      </div>
    </div>
  );
};

export default ShowcaseContainer;
