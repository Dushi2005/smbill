import React, { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import BackButton from './BackButton';
import { BillItem, Product, User } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { useIoT } from '../App';

interface SmartBillingProps {
  user: User;
  products: Product[];
}

const SmartBilling: React.FC<SmartBillingProps> = ({ user, products }) => {
  const { weight, tare, connectToScale, isConnected, deviceName } = useIoT();
  const [items, setItems] = useState<BillItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!itemName) {
      setPrice('');
      return;
    }

    const lowerCaseSearch = itemName.toLowerCase();
    const foundProduct = products.find(p =>
      p.name.toLowerCase() === lowerCaseSearch ||
      p.id.toLowerCase() === lowerCaseSearch
    );

    if (foundProduct) {
      setPrice(foundProduct.price.toFixed(2));
      // If user entered an ID, update the input to show the full name for clarity
      if (lowerCaseSearch === foundProduct.id.toLowerCase() && itemName !== foundProduct.name) {
        setItemName(foundProduct.name);
      }
    } else {
      setPrice('');
    }
  }, [itemName, products]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);

    if (itemName && !isNaN(qty) && !isNaN(prc) && qty > 0 && prc > 0) {
      const newItem: BillItem = {
        id: new Date().toISOString(),
        name: itemName,
        quantity: qty,
        price: prc,
        total: qty * prc,
      };
      setItems([...items, newItem]);
      setItemName('');
      setQuantity('');
      setPrice('');
      tare(); // Reset scale after adding item
    }
  };

  const handleUseWeight = () => {
    const product = products.find(p => p.name.toLowerCase() === itemName.toLowerCase());

    // If a product is selected and it's sold by piece, alert the user and do nothing.
    if (product && product.unit === 'pcs') {
      alert("This item is sold by piece. Please enter the quantity manually.");
      return; // Exit the function
    }

    // For items sold by kg, or if no item is selected yet, use the scale weight.
    const weightInKg = weight / 1000;
    setQuantity(String(weightInKg));
  };

  const grandTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.total, 0);
  }, [items]);

  const qrCodeValue = useMemo(() => {
    const billData = {
      customerName: user.username,
      shopName: "Smart Weigh Hub",
      date: new Date().toLocaleDateString(),
      items: items.map(i => ({ name: i.name, qty: i.quantity, price: i.price.toFixed(2), total: i.total.toFixed(2) })),
      grandTotal: grandTotal.toFixed(2)
    };
    try {
      return JSON.stringify(billData);
    } catch (e) {
      return "Error creating QR Code";
    }
  }, [items, user.username, grandTotal]);

  return (
    <div className="flex flex-col h-full relative text-slate-100 font-sans">
      <BackButton />
      <Header title="Smart Billing" />
      
      <div className="flex-grow p-4 animate-fadeIn overflow-y-auto space-y-5 pb-8">
        
        {/* Modern IoT Scale Digital Gauge */}
        <div className="w-full glass-premium-strong p-6 rounded-3xl border border-white/10 flex flex-col items-center relative overflow-hidden shadow-layered">
          {/* Decorative ambient gauge circle */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <span className="text-[10px] text-cyan-400 tracking-[0.25em] uppercase font-bold mb-3 font-heading">
            Live IoT Scale Telemetry
          </span>
          
          {/* Beautiful glowing digital weight display */}
          <div className="relative w-40 h-40 rounded-full bg-black/60 border-4 border-cyan-500/30 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.8),_0_0_25px_rgba(34,211,238,0.2)]">
            {/* Spinning active ring if connected */}
            {isConnected && (
              <div className="absolute inset-0 rounded-full border-t-2 border-t-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            )}
            
            <span className="text-3xl font-black font-heading text-white tracking-wide">
              {weight.toFixed(1)}
            </span>
            <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider mt-1">
              Grams
            </span>
          </div>

          {/* Interactive controls and status panel */}
          <div className="w-full mt-5 flex flex-col items-center space-y-3">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]' : 'bg-red-500'}`} />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {isConnected ? `Connected: ${deviceName}` : 'Scale Offline'}
              </span>
            </div>
            
            <button
              onClick={tare}
              disabled={!isConnected}
              className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            >
              Reset Tare
            </button>
          </div>
        </div>

        {/* Glassmorphic Item input Form */}
        <form onSubmit={handleAddItem} className="glass-premium p-5 rounded-3xl border border-white/10 space-y-4 shadow-layered">
          <h3 className="text-sm font-bold text-indigo-300 font-heading uppercase tracking-wider mb-1">
            Add Transaction Item
          </h3>
          
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Select Product</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Type Name or ID (e.g. Tomato / A001)"
              className="w-full input-premium text-white placeholder-gray-500 focus:outline-none"
              list="products"
            />
            <datalist id="products">
              {products.map(p => <option key={p.id} value={p.name} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Qty / Weight (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  className="w-full input-premium text-white placeholder-gray-500 focus:outline-none pr-16"
                  step="any"
                />
                <button
                  type="button"
                  onClick={handleUseWeight}
                  disabled={!isConnected}
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Scale
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Price (₹ per kg/pc)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full input-premium text-white placeholder-gray-500 focus:outline-none"
                step="any"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            {!isConnected && (
              <button
                type="button"
                onClick={connectToScale}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-300 rounded-xl font-bold transition-all text-xs tracking-wider uppercase font-heading flex items-center justify-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Connect to Bluetooth Scale
              </button>
            )}
            
            <button 
              type="submit" 
              className="w-full py-3 premium-btn rounded-xl shadow-lg"
            >
              ADD ITEM TO BILL
            </button>
          </div>
        </form>

        {/* Elegant Billing Table & Ledger */}
        <div className="glass-premium p-5 rounded-3xl border border-white/10 shadow-layered">
          <h3 className="text-sm font-bold text-cyan-300 font-heading uppercase tracking-wider mb-3">
            Transaction Ledger
          </h3>
          
          <div className="overflow-hidden rounded-2xl border border-white/5">
            <div className="grid grid-cols-4 gap-2 text-center font-bold text-[10px] text-cyan-400 bg-white/5 py-2.5 uppercase tracking-wider font-heading">
              <div>Item</div>
              <div>Qty / Wt</div>
              <div>Rate</div>
              <div>Total</div>
            </div>
            
            <div className="max-h-56 overflow-y-auto divide-y divide-white/5">
              {items.length === 0 ? (
                <p className="text-center text-xs text-gray-500 py-8 italic bg-black/10">No transactions recorded yet.</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className="grid grid-cols-4 gap-2 text-center py-3 items-center text-xs table-row-hover bg-black/10">
                    <div className="truncate font-semibold text-slate-200 px-1">{item.name}</div>
                    <div className="text-gray-400 font-medium">{item.quantity}</div>
                    <div className="text-gray-400">₹{item.price.toFixed(2)}</div>
                    <div className="font-bold text-emerald-400">₹{item.total.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Dynamic Grand Total Section */}
          <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/10">
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Grand Balance</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-yellow-300 font-heading tracking-wide">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* High-Tech QR Bill Invoice Drawer */}
        {grandTotal > 0 && (
          <div className="glass-premium-strong p-6 rounded-3xl border border-white/12 flex flex-col items-center shadow-layered animate-scaleUp">
            <h3 className="text-sm font-bold text-center text-indigo-300 font-heading uppercase tracking-widest mb-1">
              DIGITAL INVOICE
            </h3>
            <p className="text-[9px] text-gray-500 tracking-wider uppercase mb-4">
              Scan dynamic QR to checkout instantly
            </p>
            
            <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center">
              <QRCodeSVG value={qrCodeValue} size={150} bgColor="#ffffff" fgColor="#000000" />
            </div>
            
            <div className="mt-4 text-[10px] text-gray-400 text-center max-w-[200px] leading-relaxed">
              Scan using your device to sync the billing list and process payment.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartBilling;