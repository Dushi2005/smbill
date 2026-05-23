import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import Header from './Header';
import { useIoT } from '../App';

// --- Premium SVGs ---
const BleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V3m0 0l5.5 5.5-11 5 11 5.5L12 21" />
  </svg>
);

const SerialIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const SimulatorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const ClearIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const BluetoothScanner: React.FC = () => {
  const navigate = useNavigate();
  const { 
    weight, 
    tare, 
    connectToScale, 
    disconnectFromScale, 
    isConnected, 
    deviceName,
    connectionType,
    connectToSerialScale,
    disconnectFromSerialScale,
    rawLog,
    clearRawLog,
    simulateWeightUpdate
  } = useIoT();

  const [activeTab, setActiveTab] = useState<'ble' | 'serial' | 'simulator'>('ble');
  const [sliderVal, setSliderVal] = useState<number>(0);
  const [customText, setCustomText] = useState<string>('wt: 145.2 g');
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll developer terminal to the bottom when new logs arrive
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [rawLog]);

  // Sync simulator slider to live weight if simulator mode is actively selected
  useEffect(() => {
    if (connectionType === 'simulated') {
      setSliderVal(Math.round(weight * 10) / 10);
    }
  }, [weight, connectionType]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSliderVal(val);
    simulateWeightUpdate(`${val}`);
  };

  const handleCustomTextSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      simulateWeightUpdate(customText);
    }
  };

  const injectQuickWeight = (val: number) => {
    const newVal = Math.max(0, parseFloat((weight + val).toFixed(1)));
    simulateWeightUpdate(`${newVal}`);
  };

  return (
    <div className="flex flex-col h-full relative text-slate-100 font-sans">
      <BackButton />
      <Header title="Scale Telemetry Hub" />

      <div className="flex-grow p-4 animate-fadeIn overflow-y-auto space-y-5 pb-8">
        
        {/* ================= GAUGE SECTION ================= */}
        <div className="w-full glass-premium-strong p-6 rounded-3xl border border-white/10 flex flex-col items-center relative overflow-hidden shadow-layered">
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

          <span className="text-[10px] text-cyan-400 tracking-[0.25em] uppercase font-bold mb-3 font-heading">
            Active Weight Telemetry
          </span>

          {/* Glowing Circular Gauge */}
          <div className={`relative w-44 h-44 rounded-full bg-black/60 border-4 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] transition-all duration-500 ${
            isConnected 
              ? connectionType === 'ble' 
                ? 'border-cyan-500/40 shadow-[0_0_25px_rgba(34,211,238,0.25)]' 
                : connectionType === 'serial'
                  ? 'border-violet-500/40 shadow-[0_0_25px_rgba(139,92,246,0.25)]'
                  : 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
              : 'border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          }`}>
            
            {/* Spinning ring only when connected to a hardware device */}
            {isConnected && connectionType !== 'simulated' && (
              <div className={`absolute inset-0 rounded-full border-t-2 animate-spin ${
                connectionType === 'ble' ? 'border-t-cyan-400' : 'border-t-violet-400'
              }`} style={{ animationDuration: '3s' }} />
            )}

            <span className="text-4xl font-black font-heading text-white tracking-wide">
              {weight.toFixed(1)}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              isConnected 
                ? connectionType === 'ble' 
                  ? 'text-cyan-400' 
                  : connectionType === 'serial'
                    ? 'text-violet-400'
                    : 'text-amber-400'
                : 'text-gray-500'
            }`}>
              Grams
            </span>
          </div>

          {/* Scale Status Bar */}
          <div className="w-full mt-5 flex flex-col items-center space-y-2">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isConnected 
                  ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' 
                  : 'bg-red-500/80 shadow-[0_0_6px_#ef4444]'
              }`} />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                {isConnected ? `${deviceName}` : 'Telemetry Status: Offline'}
              </span>
            </div>
            
            {isConnected && (
              <div className="flex gap-2">
                <button
                  onClick={tare}
                  className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg transition-all"
                >
                  Tare Scale (Zero)
                </button>
                <button
                  onClick={() => {
                    if (connectionType === 'ble') disconnectFromScale();
                    else if (connectionType === 'serial') disconnectFromSerialScale();
                  }}
                  className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-600/20 hover:bg-red-600/35 border border-red-500/30 text-red-300 rounded-lg transition-all"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= CONTROLLER TABS ================= */}
        <div className="flex bg-black/50 p-1.5 rounded-2xl border border-white/5 relative">
          <button
            onClick={() => setActiveTab('ble')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl tracking-wider transition-all duration-300 ${
              activeTab === 'ble' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BleIcon />
            <span>BLE UART</span>
          </button>
          
          <button
            onClick={() => setActiveTab('serial')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl tracking-wider transition-all duration-300 ${
              activeTab === 'serial' 
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <SerialIcon />
            <span>COM SERIAL</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl tracking-wider transition-all duration-300 ${
              activeTab === 'simulator' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <SimulatorIcon />
            <span>SIMULATOR</span>
          </button>
        </div>

        {/* ================= TAB MAIN BODY ================= */}
        <div className="glass-premium p-5 rounded-3xl border border-white/10 shadow-layered min-h-[220px] flex flex-col justify-center">
          
          {/* --- TAB 1: BLE SCANNER --- */}
          {activeTab === 'ble' && (
            <div className="space-y-4 text-center animate-fadeIn">
              <div className="mx-auto w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                <BleIcon className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-cyan-300">Web Bluetooth BLE UART</h4>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Best for mobile apps emulating a Bluetooth Low Energy Nordic UART peripheral (e.g. Serial Bluetooth Terminal in BLE mode).
                </p>
              </div>
              
              <div className="pt-2 flex justify-center">
                {isConnected && connectionType === 'ble' ? (
                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl w-full max-w-xs">
                    <p className="text-xs text-gray-400">Successfully connected to BLE peripheral:</p>
                    <p className="font-bold text-cyan-300 text-sm mt-1">{deviceName}</p>
                  </div>
                ) : (
                  <button
                    onClick={connectToScale}
                    className="w-full max-w-xs py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.25)] uppercase font-heading"
                  >
                    Scan BLE Serial Devices
                  </button>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 2: SERIAL / COM SCANNER --- */}
          {activeTab === 'serial' && (
            <div className="space-y-4 text-center animate-fadeIn">
              <div className="mx-auto w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
                <SerialIcon className="h-6 w-6 text-violet-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-violet-300">Virtual COM Port (Bluetooth Classic / USB)</h4>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Pair your mobile phone with Windows via standard Bluetooth Classic. Windows will assign a Virtual COM port. Connect directly to it here!
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                {isConnected && connectionType === 'serial' ? (
                  <div className="p-3 bg-violet-950/20 border border-violet-500/20 rounded-2xl w-full max-w-xs">
                    <p className="text-xs text-gray-400">Listening to incoming Serial connection on:</p>
                    <p className="font-bold text-violet-300 text-sm mt-1">{deviceName}</p>
                  </div>
                ) : (
                  <button
                    onClick={connectToSerialScale}
                    className="w-full max-w-xs py-3 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold text-xs tracking-wider rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.25)] uppercase font-heading"
                  >
                    Scan Virtual COM Ports
                  </button>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 3: DEVELOPER SIMULATOR BOARD --- */}
          {activeTab === 'simulator' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Scale Tester Board</span>
                <span className="text-[10px] text-gray-400">Offline Debug Mode</span>
              </div>
              
              {/* Range Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-gray-400">
                  <span>Slide to Weigh:</span>
                  <span className="text-amber-400 font-bold">{sliderVal.toFixed(1)} g</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="0.5"
                  value={sliderVal}
                  onChange={handleSliderChange}
                  className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Quick Increment Buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  onClick={() => injectQuickWeight(50)}
                  className="py-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all text-slate-300"
                >
                  +50g
                </button>
                <button
                  onClick={() => injectQuickWeight(200)}
                  className="py-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all text-slate-300"
                >
                  +200g
                </button>
                <button
                  onClick={() => injectQuickWeight(500)}
                  className="py-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all text-slate-300"
                >
                  +500g
                </button>
                <button
                  onClick={() => injectQuickWeight(-100)}
                  className="py-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all text-red-400"
                >
                  -100g
                </button>
                <button
                  onClick={tare}
                  className="py-1.5 text-[10px] font-bold bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-500/30 transition-all text-red-300 uppercase tracking-widest font-heading"
                >
                  Tare
                </button>
              </div>

              {/* Arbitrary ASCII Injector Form */}
              <form onSubmit={handleCustomTextSend} className="pt-2 border-t border-white/5">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="e.g. wt: 154.6 g"
                      className="w-full text-xs input-premium py-2 text-white placeholder-gray-500 focus:outline-none pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-500 font-mono">ASCII</span>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all"
                  >
                    Inject
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 italic mt-1.5 pl-1 leading-relaxed">
                  Sends raw string format to test the regex extraction engine. Try letters, spaces, or raw decimals!
                </p>
              </form>
            </div>
          )}

        </div>

        {/* ================= HACKER TELEMETRY CONSOLE ================= */}
        <div className="glass-premium p-5 rounded-3xl border border-white/10 shadow-layered flex flex-col h-64 relative overflow-hidden">
          
          {/* Header Controls */}
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <h3 className="text-xs font-bold text-cyan-300 font-heading uppercase tracking-wider">
                Live Data Terminal Monitor
              </h3>
            </div>
            
            <button
              onClick={clearRawLog}
              disabled={rawLog.length === 0}
              className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ClearIcon />
              <span>Clear Console</span>
            </button>
          </div>

          {/* Scrollable logs */}
          <div className="flex-grow overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1 pr-1 custom-scrollbar bg-black/40 p-3 rounded-2xl border border-white/5">
            {rawLog.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 italic text-center text-[10px]">
                Waiting for serial data stream activity...<br />
                (Select Simulator tab above to test immediately)
              </div>
            ) : (
              rawLog.map((log, index) => (
                <div key={index} className={`leading-relaxed break-all truncate py-0.5 border-b border-white/[0.02] ${
                  log.includes('[BLE RX]') || log.includes('[Serial RX]') 
                    ? 'text-emerald-400' 
                    : log.includes('[BLE Error]') || log.includes('Error') 
                      ? 'text-red-400 font-bold' 
                      : log.includes('[Scale Command]') 
                        ? 'text-purple-400 font-bold'
                        : log.includes('Parsed')
                          ? 'text-cyan-300 font-semibold'
                          : 'text-gray-400'
                }`}>
                  {log}
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default BluetoothScanner;