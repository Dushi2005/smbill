import React from 'react';

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

const BackArrowIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ title, children }) => {
  return (
    <header className="flex items-center justify-between p-4 sticky top-0 bg-black/30 backdrop-blur-sm z-10">
      <div className="w-10 h-10" /> {/* Spacer to keep title centered */}
      <h1 className="flex-1 text-center text-xl font-bold text-white uppercase tracking-wider truncate px-2">{title}</h1>
      <div className="w-10 h-10 flex items-center justify-center">
        {children}
      </div>
    </header>
  );
};

export default Header;