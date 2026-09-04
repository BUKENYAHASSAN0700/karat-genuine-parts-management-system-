import React, { useState } from 'react';
import { 
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  Save, 
  Receipt,
  HelpCircle
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { CurrencyCode } from '../../types';

export const CurrencyFXTab: React.FC = () => {
  const { 
    currency, 
    setCurrency, 
    exchangeRate, 
    setExchangeRate, 
    formatMoney, 
    setFlashMessage 
  } = useInertia();

  const [customRate, setCustomRate] = useState<number>(exchangeRate);
  const [dualCurrencyOnReceipts, setDualCurrencyOnReceipts] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('karat_dual_receipts');
      return saved !== 'false';
    } catch {
      return true;
    }
  });
  const [roundUgxNearestThousand, setRoundUgxNearestThousand] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveFX = (e: React.FormEvent) => {
    e.preventDefault();
    if (customRate <= 0) {
      setFlashMessage('error', 'Exchange rate must be greater than zero.');
      return;
    }
    setExchangeRate(customRate);
    try {
      localStorage.setItem('karat_dual_receipts', String(dualCurrencyOnReceipts));
    } catch {}
    setIsSaved(true);
    setFlashMessage('success', `Exchange rate updated: 1 USD = ${customRate.toLocaleString()} UGX applied across all catalogs and invoices.`);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleQuickRate = (rate: number) => {
    setCustomRate(rate);
  };

  return (
    <form onSubmit={handleSaveFX} className="space-y-6">
      
      {/* Active Operating Currency Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F6AF31] bg-[#111111] px-2 py-0.5 rounded-md">
              System Standard
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Active System Operating Currency
            </h3>
            <p className="text-xs text-slate-500">
              Select the primary denomination displayed across dashboard metrics, inventory valuations, and cashier checkout.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black bg-[#111111] text-white">
            Current: {currency}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* USD Card */}
          <div
            onClick={() => {
              setCurrency('USD');
              setFlashMessage('info', 'System currency switched to United States Dollar ($ USD).');
            }}
            className={`p-5 rounded-2xl border text-left transition relative cursor-pointer ${
              currency === 'USD'
                ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base">$ USD</span>
              {currency === 'USD' && (
                <span className="w-5 h-5 rounded-full bg-[#F6AF31] text-[#111111] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
              )}
            </div>
            <div className={`text-sm font-extrabold mt-1 ${currency === 'USD' ? 'text-[#F6AF31]' : 'text-slate-900'}`}>
              United States Dollar
            </div>
            <p className={`text-xs mt-2 font-mono ${currency === 'USD' ? 'text-slate-300' : 'text-slate-500'}`}>
              Primary international trade & OEM factory procurement currency.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono font-bold">
              Base Catalog Reference: $100.00
            </div>
          </div>

          {/* UGX Card */}
          <div
            onClick={() => {
              setCurrency('UGX');
              setFlashMessage('info', 'System currency switched to Uganda Shillings (USh UGX).');
            }}
            className={`p-5 rounded-2xl border text-left transition relative cursor-pointer ${
              currency === 'UGX'
                ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-base">USh UGX</span>
              {currency === 'UGX' && (
                <span className="w-5 h-5 rounded-full bg-[#F6AF31] text-[#111111] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
              )}
            </div>
            <div className={`text-sm font-extrabold mt-1 ${currency === 'UGX' ? 'text-[#F6AF31]' : 'text-slate-900'}`}>
              Uganda Shillings
            </div>
            <p className={`text-xs mt-2 font-mono ${currency === 'UGX' ? 'text-slate-300' : 'text-slate-500'}`}>
              Local market counter sales, mobile money (MTN / Airtel), and domestic banking.
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono font-bold">
              Converted Rate: UGX {(100 * customRate).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate Peg Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
              Forex Engine
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Live Currency Exchange Rate Peg (1 USD to UGX)
            </h3>
            <p className="text-xs text-slate-500">
              Adjust the baseline foreign exchange rate used to calculate Uganda Shilling equivalents.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank of Uganda Indicative</span>
            <span className="text-xs font-bold text-slate-700 font-mono">3,730 - 3,780 UGX</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rate Input & Quick buttons */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Configured Exchange Rate
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1000"
                  max="10000"
                  step="10"
                  value={customRate}
                  onChange={e => setCustomRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-4 py-3 text-base font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                  required
                />
                <span className="absolute left-4 top-3.5 text-xs font-bold text-slate-400 font-mono">
                  1 USD =
                </span>
              </div>
              <span className="text-xs font-black text-slate-600 font-mono">UGX</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-bold">Presets:</span>
              {[3700, 3750, 3800, 3850].map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handleQuickRate(p)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                    customRate === p
                      ? 'bg-[#111111] text-[#F6AF31]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Conversion Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Live Conversion Impact Preview
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                <span className="text-slate-600">GET Excavator Tooth Tip ($55.00)</span>
                <span className="font-bold text-[#111111]">UGX {(55 * customRate).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                <span className="text-slate-600">Volvo Injector Set ($420.00)</span>
                <span className="font-bold text-[#111111]">UGX {(420 * customRate).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">CAT Hydraulic Main Pump ($4,850.00)</span>
                <span className="font-bold text-[#22A06B]">UGX {(4850 * customRate).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dualCurrencyOnReceipts}
              onChange={e => setDualCurrencyOnReceipts(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-[#111111]"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Dual-Currency on Printed POS Receipts & Dispatch Notes
              </span>
              <span className="text-[11px] text-slate-500">
                Automatically prints both the USD figure and converted UGX equivalent on all thermal till slips.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={roundUgxNearestThousand}
              onChange={e => setRoundUgxNearestThousand(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-[#111111]"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Round UGX Transactions to Nearest 500 / 1,000 Shillings
              </span>
              <span className="text-[11px] text-slate-500">
                Eliminates awkward small coin denominations for physical cash till drawer reconciliations.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          Exchange rate adjustments apply instantaneously across all inventory items and invoices.
        </span>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#111111]" />
              <span>Exchange Rate Applied!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#111111]" />
              <span>Save Forex Settings</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};
