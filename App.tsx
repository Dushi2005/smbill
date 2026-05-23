import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Page, Recipe, User, Product } from './types';

import HomeScreen from './components/HomeScreen';
import QuantityAnalyzer from './components/QuantityAnalyzer';
import RecipeProvider from './components/RecipeProvider';
import RecipeDetail from './components/RecipeDetail';
import SmartBilling from './components/SmartBilling';
import PriceEditor from './components/PriceEditor';
import BluetoothScanner from './components/BluetoothScanner';
import RecipeBillGenerator from './components/RecipeBillGenerator';
import { productCatalog as defaultProductCatalog } from './services/recipeData';

// --- IoT Context ---
// This context manages the connection to a real IoT weighing scale via Web Bluetooth or Web Serial.
interface IoTContextType {
  weight: number;
  tare: () => void;
  connectToScale: () => Promise<boolean>;
  disconnectFromScale: () => void;
  isConnected: boolean;
  deviceName: string | null;
  connectionType: 'ble' | 'serial' | 'simulated' | null;
  connectToSerialScale: () => Promise<boolean>;
  disconnectFromSerialScale: () => void;
  rawLog: string[];
  clearRawLog: () => void;
  simulateWeightUpdate: (value: string) => void;
}

const IoTContext = createContext<IoTContextType>({
  weight: 0,
  tare: () => { },
  connectToScale: async () => false,
  disconnectFromScale: () => { },
  isConnected: false,
  deviceName: null,
  connectionType: null,
  connectToSerialScale: async () => false,
  disconnectFromSerialScale: () => { },
  rawLog: [],
  clearRawLog: () => { },
  simulateWeightUpdate: () => { },
});

export const useIoT = () => useContext(IoTContext);

const IoTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weight, setWeight] = useState(0);
  const [bluetoothDevice, setBluetoothDevice] = useState<any | null>(null);
  const characteristicRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'ble' | 'serial' | 'simulated' | null>(null);
  const [rawLog, setRawLog] = useState<string[]>([]);
  
  const serialPortRef = useRef<any | null>(null);
  const serialReaderRef = useRef<any | null>(null);
  const isSerialReadingRef = useRef<boolean>(false);

  const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  const CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRawLog(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  };

  const clearRawLog = () => setRawLog([]);

  const handleWeightUpdate = (event: any) => {
    try {
      const decoder = new TextDecoder();
      const value = decoder.decode(event.target.value);
      const cleanValue = value.trim();
      addLog(`[BLE RX] Raw: "${cleanValue}"`);
      
      const match = cleanValue.match(/[-+]?[0-9]*\.?[0-9]+/);
      if (match) {
        const parsedWeight = parseFloat(match[0]);
        if (!isNaN(parsedWeight)) {
          setWeight(parsedWeight);
          addLog(`[BLE RX] Parsed Weight: ${parsedWeight} g`);
        }
      } else {
        addLog(`[BLE RX] No number found in "${cleanValue}"`);
      }
    } catch (err: any) {
      addLog(`[BLE Error] Data parsing failed: ${err.message}`);
    }
  };

  const onDisconnected = () => {
    console.log('Device disconnected');
    addLog("Device disconnected.");
    setIsConnected(false);
    setBluetoothDevice(null);
    setDeviceName(null);
    setConnectionType(null);
    if (characteristicRef.current) {
      characteristicRef.current.removeEventListener('characteristicvaluechanged', handleWeightUpdate);
      characteristicRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (bluetoothDevice && bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
      }
      isSerialReadingRef.current = false;
      if (serialReaderRef.current) {
        serialReaderRef.current.cancel().catch(() => {});
      }
    }
  }, [bluetoothDevice]);

  const connectToScale = async (): Promise<boolean> => {
    if (!(navigator as any).bluetooth) {
      alert("Web Bluetooth API is not available on this browser. Try Chrome/Edge/Opera over HTTPS or localhost.");
      addLog("Bluetooth Error: navigator.bluetooth not supported");
      return false;
    }
    try {
      addLog("Requesting Bluetooth devices (filtering Nordic UART & name prefixes)...");
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: "SmartWeigh_BLE" },
          { namePrefix: "SmartWeigh" },
          { namePrefix: "Serial" },
          { services: [SERVICE_UUID] }
        ],
        optionalServices: [SERVICE_UUID],
      });

      addLog(`Selected device: "${device.name || 'Unnamed BLE device'}"`);
      device.addEventListener('gattserverdisconnected', onDisconnected);
      setBluetoothDevice(device);
      setDeviceName(device.name || 'SmartWeigh BLE');
      setConnectionType('ble');

      addLog("Connecting to GATT Server...");
      const server = await device.gatt.connect();

      addLog("Discovering UART Primary Service...");
      const service = await server.getPrimaryService(SERVICE_UUID);

      addLog("Discovering TX Characteristic...");
      const char = await service.getCharacteristic(CHARACTERISTIC_UUID);
      characteristicRef.current = char;

      addLog("Enabling TX Notifications...");
      await char.startNotifications();
      char.addEventListener(
        "characteristicvaluechanged",
        handleWeightUpdate
      );

      setIsConnected(true);
      addLog("Connected successfully to Bluetooth BLE!");
      return true;
    } catch (error: any) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        addLog("Bluetooth scanner dialog closed.");
      } else {
        addLog(`Bluetooth connection error: ${error.message}`);
        console.error("Bluetooth connection failed:", error);
      }
      onDisconnected(); // Reset state on failure
      return false;
    }
  };

  const disconnectFromScale = () => {
    addLog("Disconnecting BLE device...");
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.removeEventListener('gattserverdisconnected', onDisconnected);
      bluetoothDevice.gatt.disconnect();
    }
    onDisconnected();
  };

  const connectToSerialScale = async (): Promise<boolean> => {
    if (!(navigator as any).serial) {
      alert("Web Serial API is not available on this browser. Use Chrome/Edge/Opera.");
      addLog("Serial Error: navigator.serial not supported");
      return false;
    }

    try {
      addLog("Requesting Serial/COM Port selection...");
      const port = await (navigator as any).serial.requestPort();
      
      addLog("Opening Serial Port (9600 Baud)...");
      await port.open({ baudRate: 9600 });
      serialPortRef.current = port;
      setDeviceName("Serial COM Device");
      setConnectionType('serial');
      setIsConnected(true);
      addLog("Serial Port Connected!");

      isSerialReadingRef.current = true;
      readSerialData(port);
      return true;
    } catch (err: any) {
      if (err instanceof DOMException && err.name === 'NotFoundError') {
        addLog("Serial selection dialog closed.");
      } else {
        addLog(`Serial connection failed: ${err.message}`);
      }
      disconnectFromSerialScale();
      return false;
    }
  };

  const readSerialData = async (port: any) => {
    addLog("Listening to Serial RX Stream...");
    try {
      while (port.readable && isSerialReadingRef.current) {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        serialReaderRef.current = reader;

        try {
          let buffer = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              addLog("Serial stream completed/closed.");
              break;
            }
            if (value) {
              buffer += value;
              if (buffer.includes("\n") || buffer.includes("\r")) {
                const lines = buffer.split(/[\r\n]+/);
                buffer = lines.pop() || "";
                
                for (const line of lines) {
                  const cleanLine = line.trim();
                  if (cleanLine) {
                    addLog(`[Serial RX] Raw: "${cleanLine}"`);
                    
                    const match = cleanLine.match(/[-+]?[0-9]*\.?[0-9]+/);
                    if (match) {
                      const parsedWeight = parseFloat(match[0]);
                      if (!isNaN(parsedWeight)) {
                        setWeight(parsedWeight);
                        addLog(`[Serial RX] Parsed Weight: ${parsedWeight} g`);
                      }
                    } else {
                      addLog(`[Serial RX] Non-numeric line: "${cleanLine}"`);
                    }
                  }
                }
              }
            }
          }
        } catch (error: any) {
          addLog(`Serial reading error: ${error.message}`);
        } finally {
          reader.releaseLock();
          await readableStreamClosed.catch(() => {});
        }
      }
    } catch (error: any) {
      addLog(`Serial buffer setup error: ${error.message}`);
      setIsConnected(false);
      setConnectionType(null);
      setDeviceName(null);
    }
  };

  const disconnectFromSerialScale = async () => {
    addLog("Closing Serial Port...");
    isSerialReadingRef.current = false;
    
    if (serialReaderRef.current) {
      try {
        await serialReaderRef.current.cancel();
      } catch (e) {}
      serialReaderRef.current = null;
    }

    if (serialPortRef.current) {
      try {
        await serialPortRef.current.close();
      } catch (e) {}
      serialPortRef.current = null;
    }

    setIsConnected(false);
    setDeviceName(null);
    setConnectionType(null);
    addLog("Serial Connection Closed.");
  };

  const simulateWeightUpdate = (value: string) => {
    setConnectionType('simulated');
    setIsConnected(true);
    setDeviceName("SmartWeigh Simulator");
    
    const cleanLine = value.trim();
    addLog(`[Mock RX] Input string: "${cleanLine}"`);
    
    const match = cleanLine.match(/[-+]?[0-9]*\.?[0-9]+/);
    if (match) {
      const parsedWeight = parseFloat(match[0]);
      if (!isNaN(parsedWeight)) {
        setWeight(parsedWeight);
        addLog(`[Mock RX] Updated Simulated Weight to ${parsedWeight} g`);
      }
    } else {
      addLog(`[Mock RX] Could not extract weight from input: "${cleanLine}"`);
    }
  };

  const tare = () => {
    setWeight(0);
    addLog("[Scale Command] Tared scale value to 0g");
  };

  return (
    <IoTContext.Provider value={{
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
    }}>
      {children}
    </IoTContext.Provider>
  );
};
// --- End IoT Context ---

// --- Auth Components ---

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PriceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a1 1 0 011 1v10a1 1 0 01-1 1h-4v-1m-4-10v10a1 1 0 001 1h4v-1" />
  </svg>
);


const UserInfo: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="absolute top-4 left-4 z-20" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-white/10 transition-colors"
        aria-label="Open user menu"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 origin-top-left bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-white/10 focus:outline-none animate-fadeIn" role="menu" aria-orientation="vertical" tabIndex={-1}>
          <div className="py-1" role="none">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white border-2 border-blue-400">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-white truncate" role="menuitem" tabIndex={-1}>{user.username}</p>
                <p className="text-sm text-gray-400" role="menuitem" tabIndex={-1}>{user.username === 'dushi' ? 'Admin' : 'Customer'}</p>
              </div>
            </div>
            {user.username === 'dushi' && (
              <button
                onClick={() => { navigate('/price-editor'); setIsOpen(false); }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-yellow-300 hover:bg-white/10 hover:text-yellow-200 transition-colors"
                role="menuitem"
                tabIndex={-1}
              >
                <PriceIcon className="w-5 h-5" />
                <span>Product Catalog</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-white/10 hover:text-red-300 transition-colors"
              role="menuitem"
              tabIndex={-1}
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


interface LoginScreenProps {
  onLogin: (user: User) => void;
  registerUser: (username: string, pass: string) => boolean;
  loginUser: (username: string, pass: string) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, registerUser, loginUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const success = registerUser(username, password);
      if (success) {
        onLogin({ username });
      } else {
        setError("Username already exists.");
      }
    } else {
      const success = loginUser(username, password);
      if (success) {
        onLogin({ username });
      } else {
        setError("Invalid username or password.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fadeIn">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.35)] animate-float mb-4">
          <span className="text-4xl font-black text-white tracking-wider font-heading">DS</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-widest bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent uppercase font-heading">Smart Weigh</h1>
        <p className="text-[10px] text-cyan-400/60 tracking-[0.25em] uppercase mt-1 font-semibold">IoT Intelligent Weighing Hub</p>
      </div>

      {/* Glassy Input Card */}
      <div className="w-full max-w-xs glass-premium p-6 rounded-3xl shadow-layered border border-white/10 animate-scaleUp">
        <h2 className="text-xl font-bold text-center text-slate-100 mb-6 font-heading">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/40 border border-red-500/20 p-2 rounded-xl">
              {error}
            </p>
          )}
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full input-premium text-white placeholder-gray-400 focus:outline-none"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full input-premium text-white placeholder-gray-400 focus:outline-none"
          />
          {isRegister && (
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
              className="w-full input-premium text-white placeholder-gray-400 focus:outline-none"
            />
          )}
          <button type="submit" className="w-full py-3 premium-btn rounded-xl">
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }} 
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-200"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for logged-in user in localStorage
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      try {
        setCurrentUser(JSON.parse(loggedInUser));
        if (location.pathname === '/login' || location.pathname === '/') {
          navigate('/home');
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        localStorage.removeItem('currentUser');
      }
    } else {
      if (location.pathname !== '/login' && location.pathname !== '/') {
        navigate('/login');
      }
    }

    // Load product catalog with custom prices
    const savedPrices = localStorage.getItem('customProductPrices');
    const customPrices: Record<string, number> = savedPrices ? JSON.parse(savedPrices) : {};

    const initialProducts = defaultProductCatalog.map(p => ({
      ...p,
      price: customPrices[p.id] ?? p.price
    }));
    setProducts(initialProducts);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/home');
  }

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  const handleUpdatePrices = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);

    const customPricesToSave: Record<string, number> = {};
    updatedProducts.forEach(p => {
      const originalProduct = defaultProductCatalog.find(op => op.id === p.id);
      if (originalProduct && originalProduct.price !== p.price) {
        customPricesToSave[p.id] = p.price;
      }
    });

    localStorage.setItem('customProductPrices', JSON.stringify(customPricesToSave));
    alert('Prices updated successfully!');
  };

  const registerUser = (username: string, pass: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
      return false; // User exists
    }
    users[username] = pass; // In a real app, hash the password!
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  const loginUser = (username: string, pass: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users['dushi']) {
      users['dushi'] = '123';
      localStorage.setItem('users', JSON.stringify(users));
    }
    if (users[username] && users[username] === pass) {
      return true;
    }
    return false;
  }

  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const AdminRoute = ({ children }: { children: React.ReactElement }) => {
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    if (currentUser.username !== 'dushi') {
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  return (
    <div className="h-screen w-screen bg-[#050510] text-slate-100 overflow-hidden relative font-sans">
      {/* Immersive ambient glowing spheres */}
      <div className="absolute top-[-10%] left-[-20%] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[90px] animate-float pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[90px] animate-float pointer-events-none delay-300" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-md mx-auto h-full relative z-10 overflow-y-auto">
        {currentUser && location.pathname !== '/' && location.pathname !== '/login' && (
          <UserInfo user={currentUser} onLogout={handleLogout} />
        )}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen onLogin={handleLogin} registerUser={registerUser} loginUser={loginUser} />} />
          <Route path="/home" element={<ProtectedRoute><HomeScreen onNavigate={(page) => {
            const routeMap: Record<string, string> = {
              'QUANTITY_ANALYZER': '/quantity-analyzer',
              'RECIPE_PROVIDER': '/recipe-provider',
              'SMART_BILLING': '/smart-billing',
              'BLUETOOTH_SCANNER': '/bluetooth-scanner',
              'PRICE_EDITOR': '/price-editor',
              'RECIPE_BILL_GENERATOR': '/recipe-bill-generator'
            };
            if (routeMap[page]) navigate(routeMap[page]);
          }} /></ProtectedRoute>} />
          <Route path="/quantity-analyzer" element={<ProtectedRoute><QuantityAnalyzer /></ProtectedRoute>} />
          <Route path="/recipe-provider" element={<ProtectedRoute><RecipeProvider /></ProtectedRoute>} />
          <Route path="/recipe-detail/:recipeId" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
          <Route path="/smart-billing" element={<ProtectedRoute><SmartBilling user={currentUser!} products={products} /></ProtectedRoute>} />
          <Route path="/price-editor" element={<AdminRoute><PriceEditor products={products} onUpdatePrices={handleUpdatePrices} /></AdminRoute>} />
          <Route path="/bluetooth-scanner" element={<ProtectedRoute><BluetoothScanner /></ProtectedRoute>} />
          <Route path="/recipe-bill-generator" element={<ProtectedRoute><RecipeBillGenerator /></ProtectedRoute>} />

        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <IoTProvider>
        <AppContent />
      </IoTProvider>
    </Router>
  );
};

export default App;