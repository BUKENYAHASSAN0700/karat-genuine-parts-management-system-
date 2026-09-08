import React, { useState } from 'react';
import { 
  Percent, 
  CreditCard, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Lock,
  Layers
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

export const CommercialCreditTab: React.FC = () => {
  const { setFlashMessage, formatMoney } = useInertia();

  const [standardMargin, setStandardMargin] = useState<number>(35);
  const [heavyAssemblyMargin, setHeavyAssemblyMargin] = useState<number>(28);
  const [machineDownSurcharge, setMachineDownSurcharge] = useState<number>(15);

  const [defaultCreditDays, setDefaultCreditDays] = useState<number>(30);
  const [defaultCreditLimitUsd, setDefaultCreditLimitUsd] = useState<number>(50000);
  const [autoHoldOverdueDays, setAutoHoldOverdueDays] = useState<number>(60);
  const [requireCfoOverride, setRequireCfoOverride] = useState<boolean>(true);
  const [lowStockDefaultThreshold, setLowStockDefaultThreshold] = useState<number>(2);

  const [isSaved, setIsSaved] = useState(false);

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setFlashMessage('success', 'Commercial credit policies & pricing margin defaults saved successfully.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSavePricing} className="space-y-6">
      
      {/* Gross Margin & Markup Targets */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Pricing Strategy
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Target Gross Margins & Emergency Surcharges
            </h3>
            <p className="text-xs text-slate-500">
              Default markup multipliers applied when adding parts to OEM factory restocks and quotations.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
            Target Blended Margin: ~32.4%
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Fast Moving Items */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Fast-Moving Maintenance (Filters, Seals, O-Rings)
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="80"
                value={standardMargin}
                onChange={e => setStandardMargin(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Typical margin: 30% - 40%
            </span>
          </div>

          {/* Major Heavy Assemblies */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Heavy Assemblies (Engines, Pumps, Final Drives)
            </label>
            <div className="relative">
              <input
                type="number"
                min="5"
                max="60"
                value={heavyAssemblyMargin}
                onChange={e => setHeavyAssemblyMargin(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            </div>
            <span className="text-[11px] text-slate-400 block">
              High-value capital items: 25% - 30%
            </span>
          </div>

          {/* Machine Down Express Surcharge */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Urgent Machine-Down Surcharge
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                value={machineDownSurcharge}
                onChange={e => setMachineDownSurcharge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Air-freight & urgent site courier fee
            </span>
          </div>
        </div>
      </div>

      {/* Contractor Credit Policy & Exposure Control */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
              Risk Management
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Contractor Commercial Credit & Dispatch Lockout Rules
            </h3>
            <p className="text-xs text-slate-500">
              Set default payment periods and automatic safety lockouts to curb bad debt from road contractors and quarry operators.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-Lock Enabled</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Default Credit Days */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Standard Commercial Credit Period
            </label>
            <div className="relative">
              <input
                type="number"
                min="7"
                max="90"
                value={defaultCreditDays}
                onChange={e => setDefaultCreditDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <span className="absolute left-4 top-3 text-xs font-black text-slate-400">
                NET
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Default is Net 30 Days from delivery slip endorsement.
            </span>
          </div>

          {/* Default Credit Limit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Standard Corporate Credit Limit
            </label>
            <div className="relative">
              <input
                type="number"
                min="5000"
                max="500000"
                step="5000"
                value={defaultCreditLimitUsd}
                onChange={e => setDefaultCreditLimitUsd(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <span className="absolute left-4 top-3 text-xs font-black text-slate-400">
                USD
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Approx. {formatMoney(defaultCreditLimitUsd)} equivalent.
            </span>
          </div>

          {/* Auto-Hold Overdue Days */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Overdue Accounts Freeze Threshold
            </label>
            <div className="relative">
              <input
                type="number"
                min="30"
                max="120"
                value={autoHoldOverdueDays}
                onChange={e => setAutoHoldOverdueDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <span className="absolute left-4 top-3 text-xs font-black text-slate-400">
                Days
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Dispatches freeze when uncollected balance exceeds {autoHoldOverdueDays} days.
            </span>
          </div>

          {/* Minimum Stock Alert Multiplier */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Default Minimum Reorder Threshold (Units)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="10"
                value={lowStockDefaultThreshold}
                onChange={e => setLowStockDefaultThreshold(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <Layers className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Triggers low stock badge on parts catalog.
            </span>
          </div>

          <div className="sm:col-span-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireCfoOverride}
                onChange={e => setRequireCfoOverride(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-[#111111]"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Mandatory CFO or Managing Director PIN Override for Frozen Accounts
                </span>
                <span className="text-[11px] text-slate-500">
                  Prevents yard technicians from releasing heavy parts to overdue debtors without signed authorization.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          Margins and credit thresholds take effect on new commercial quotations.
        </span>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#111111]" />
              <span>Credit Policies Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#111111]" />
              <span>Save Commercial Terms</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};
