import React from 'react';
import { Page } from '../types';
import { useIoT } from '../App';

interface HomeScreenProps {
  onNavigate: (page: Page) => void;
}

// Premium high-tech SVG Icons
const QuantityIcon = () => (
  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const RecipeIcon = () => (
  <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ScaleIcon = () => (
  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const InvoiceIcon = () => (
  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const BluetoothIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 9.5l13 5-6.5 2.5v-10L18.5 4.5l-13 5z" />
  </svg>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { isConnected, deviceName } = useIoT();

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-6 pt-10 pb-8 space-y-6">
      {/* Dynamic Main Header */}
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-6xl font-black tracking-widest gradient-text-animated animate-bounceIn font-heading">
          DS
        </h1>
        <h2 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent font-heading">
          SMART WEIGH HUB
        </h2>
        <div className="h-[2px] w-20 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-semibold">
          Intelligent Kitchen IoT Dashboard
        </p>
      </div>

      {/* Grid Menu System of Premium Cards */}
      <div className="w-full max-w-sm space-y-4">
        
        {/* QUANTITY ANALYZER Card */}
        <button
          onClick={() => onNavigate('QUANTITY_ANALYZER')}
          className="w-full text-left p-4 glass-premium rounded-2xl border-l-4 border-l-cyan-400 transition-all duration-300 hover-lift shadow-glow hover:border-l-cyan-300 flex items-center gap-4 animate-slideInUp opacity-0"
        >
          <div className="p-3 bg-cyan-950/50 border border-cyan-800/50 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <QuantityIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-100 font-heading tracking-wide">
              QUANTITY ANALYZER
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Analyze deficits and calculate exact inventory scales.
            </p>
          </div>
          <span className="text-gray-500 font-semibold">&rarr;</span>
        </button>

        {/* RECIPE PROVIDER Card */}
        <button
          onClick={() => onNavigate('RECIPE_PROVIDER')}
          className="w-full text-left p-4 glass-premium rounded-2xl border-l-4 border-l-violet-500 transition-all duration-300 hover-lift shadow-glow hover:border-l-violet-400 flex items-center gap-4 animate-slideInUp delay-100 opacity-0"
        >
          <div className="p-3 bg-violet-950/50 border border-violet-850/50 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <RecipeIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-100 font-heading tracking-wide">
              RECIPE PROVIDER
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Browse recipes and adjust proportional ingredients.
            </p>
          </div>
          <span className="text-gray-500 font-semibold">&rarr;</span>
        </button>

        {/* SMART BILLING Card */}
        <button
          onClick={() => onNavigate('SMART_BILLING')}
          className="w-full text-left p-4 glass-premium rounded-2xl border-l-4 border-l-emerald-500 transition-all duration-300 hover-lift shadow-glow hover:border-l-emerald-400 flex items-center gap-4 animate-slideInUp delay-200 opacity-0"
        >
          <div className="p-3 bg-emerald-950/50 border border-emerald-850/50 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ScaleIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-100 font-heading tracking-wide">
              SMART BILLING
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Checkout dynamically using real-time scale metrics.
            </p>
          </div>
          <span className="text-gray-500 font-semibold">&rarr;</span>
        </button>

        {/* RECIPE BILL GENERATOR Card */}
        <button
          onClick={() => onNavigate('RECIPE_BILL_GENERATOR')}
          className="w-full text-left p-4 glass-premium rounded-2xl border-l-4 border-l-indigo-500 transition-all duration-300 hover-lift shadow-glow hover:border-l-indigo-400 flex items-center gap-4 animate-slideInUp delay-300 opacity-0"
        >
          <div className="p-3 bg-indigo-950/50 border border-indigo-850/50 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <InvoiceIcon />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-100 font-heading tracking-wide">
              RECIPE BILL GENERATOR
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Convert scaling recipes into raw billing details.
            </p>
          </div>
          <span className="text-gray-500 font-semibold">&rarr;</span>
        </button>

      </div>

      {/* IoT Bluetooth Dashboard Panel */}
      <button
        onClick={() => onNavigate('BLUETOOTH_SCANNER')}
        className="w-full max-w-sm mt-4 p-4 glass-premium-strong rounded-2xl text-left border border-white/10 hover-lift shadow-glow transition-all duration-300 animate-slideInUp delay-500 opacity-0"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
              <BluetoothIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-heading">IoT Weight Telemetry</h3>
              <p className="text-[10px] text-gray-500">Hardware Scale Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full border border-white/5">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-red-500'}`} />
            <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-black/30 p-2 rounded-xl border border-white/5">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Scale State</span>
            <span className={`font-semibold mt-1 block ${isConnected ? 'text-cyan-400' : 'text-gray-400'}`}>
              {isConnected ? 'Ready for Weigh' : 'Not Connected'}
            </span>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-white/5">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider block">Device Identifier</span>
            <span className="font-semibold text-slate-200 mt-1 block truncate">
              {isConnected ? deviceName : 'None'}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default HomeScreen;

