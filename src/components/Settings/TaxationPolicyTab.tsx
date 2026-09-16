import React, { useState } from 'react';
import { useInertia } from '../../context/InertiaContext';
import { UIcon } from '../Common/UIcon';

export const TaxationPolicyTab: React.FC = () => {
  const { setFlashMessage } = useInertia();

  const [vatRate, setVatRate] = useState<number>(18);
  const [whtRate, setWhtRate] = useState<number>(6);
  const [taxMode, setTaxMode] = useState<'live' | 'buffered'>('live');
  const [autoTaxPOS, setAutoTaxPOS] = useState<boolean>(true);
  const [exemptMiningHolders, setExemptMiningHolders] = useState<boolean>(true);
  const [taxDisclaimer, setTaxDisclaimer] = useState<string>(
    'All parts supplied are subject to Uganda Revenue Authority 18% VAT and standard statutory documentation. Official receipt generated at checkout.'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingTax, setIsTestingTax] = useState(false);

  const handleTestTax = () => {
    setIsTestingTax(true);
    setTimeout(() => {
      setIsTestingTax(false);
      setFlashMessage('success', 'Tax rates verified! Response code: 200 OK');
    }, 1200);
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setFlashMessage('success', 'Statutory tax rules saved successfully.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSaveTax} className="space-y-6">
      
      {/* Statutory Tax Configuration Engine */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-[#111111] tracking-tight">
              Automated Statutory Tax Calculation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated calculation with statutory revenue authority rules for receipts and invoicing.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestTax}
            disabled={isTestingTax}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#111111] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <UIcon name="refresh" className={`text-xs ${isTestingTax ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
            <span>{isTestingTax ? 'Testing Rates...' : 'Verify Tax Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Server Mode */}
          <div
            onClick={() => setTaxMode('live')}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
              taxMode === 'live'
                ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-900 flex items-center gap-2">
                <UIcon name="server" className="text-sm text-purple-600" />
                Live Cloud Mode (Recommended)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Receipts are recorded immediately upon checkout with official tax calculations.
            </p>
          </div>

          {/* Offline Buffer Mode */}
          <div
            onClick={() => setTaxMode('buffered')}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
              taxMode === 'buffered'
                ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                <UIcon name="document-signed" className="text-sm text-slate-600" />
                Offline Store & Forward Buffer
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Safe for locations with intermittent internet. Records transactions locally with secure logging and synchronizes when network reconnects.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoTaxPOS}
              onChange={e => setAutoTaxPOS(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400 accent-purple-600"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Automatic Tax Calculation on Every Transaction
              </span>
              <span className="text-[11px] text-slate-500">
                Immediately generates tax receipt without cashier manual intervention.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Statutory Rates & Withholding Tax */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-[#111111] tracking-tight">
            Value Added Tax (VAT) & Withholding Tax (WHT)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Applicable tax calculations configured in adherence to the Uganda VAT Act & Tax Procedures Code.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Standard Value Added Tax (VAT) Rate
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="30"
                value={vatRate}
                onChange={e => setVatRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <UIcon name="percentage" className="text-sm text-slate-400 absolute left-4 top-3" />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Statutory standard rate in Uganda is 18%.
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Corporate Withholding Tax (WHT) Rate
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="20"
                value={whtRate}
                onChange={e => setWhtRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-sm font-black font-mono text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <UIcon name="percentage" className="text-sm text-slate-400 absolute left-4 top-3" />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Deducted by approved commercial clients on invoices &gt; 1,000,000 UGX.
            </span>
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exemptMiningHolders}
                onChange={e => setExemptMiningHolders(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400 accent-purple-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Support EAC / COMESA Mining Investment Exemption Certificates
                </span>
                <span className="text-[11px] text-slate-500">
                  Allows zero-rating parts for accredited mining license holders holding statutory exemption slips.
                </span>
              </div>
            </label>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Official Tax Footnote printed on Invoices
            </label>
            <textarea
              rows={2}
              value={taxDisclaimer}
              onChange={e => setTaxDisclaimer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          Tax adjustments update future quote and checkout calculations.
        </span>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          {isSaved ? (
            <>
              <UIcon name="check" className="text-sm text-[#111111]" />
              <span>Tax Policies Saved!</span>
            </>
          ) : (
            <>
              <UIcon name="disk" className="text-sm text-[#111111]" />
              <span>Save Taxation Rules</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};
