
import React from 'react';
import { PencilSquareIcon, ChatBubbleLeftRightIcon, SparklesIcon } from './Icons';

type ShowcaseType = 'text' | 'chat';

interface SidebarProps {
  activeShowcase: ShowcaseType;
  setActiveShowcase: (showcase: ShowcaseType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeShowcase, setActiveShowcase }) => {
  const navItems = [
    { id: 'text', label: 'Text Generation', icon: PencilSquareIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <nav className="w-16 md:w-64 bg-gem-navy border-r border-gem-slate/50 flex flex-col">
      <div className="flex items-center justify-center md:justify-start p-4 h-[73px] border-b border-gem-slate/50">
        <SparklesIcon className="w-8 h-8 text-gem-teal md:mr-3"/>
        <span className="hidden md:inline text-xl font-bold text-gem-light">Showcases</span>
      </div>
      <ul className="flex-1 p-2 md:p-4 space-y-2">
        {navItems.map(item => (
          <li key={item.id}>
            <button
              onClick={() => setActiveShowcase(item.id as ShowcaseType)}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gem-teal/50 ${
                activeShowcase === item.id
                  ? 'bg-gem-teal/20 text-gem-teal'
                  : 'text-gem-light/70 hover:bg-gem-slate/50 hover:text-gem-light'
              }`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className="hidden md:inline ml-4 font-semibold">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="p-4 border-t border-gem-slate/50 text-center text-xs text-gem-slate">
        <p className="hidden md:block">Powered by Google Gemini</p>
      </div>
    </nav>
  );
};

export default Sidebar;
