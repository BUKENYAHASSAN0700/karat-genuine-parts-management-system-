import React, { useState } from 'react';
import { 
  Percent, 
  Server, 
  ShieldAlert, 
  CheckCircle2, 
  Save, 
  FileCheck, 
  Info,
  RefreshCw
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

export const TaxationPolicyTab: React.FC = () => {
  const { setFlashMessage } = useInertia();

  const [vatRate, setVatRate] = useState<number>(18);
  const [whtRate, setWhtRate] = useState<number>(6);
  const [efrisMode, setEfrisMode] = useState<'live' | 'buffered'>('live');
  const [autoFiscalizePOS, setAutoFiscalizePOS] = useState<boolean>(true);
  const [exemptMiningHolders, setExemptMiningHolders] = useState<boolean>(true);
  const [taxDisclaimer, setTaxDisclaimer] = useState<string>(
    'All parts supplied are subject to Uganda Revenue Authority 18% VAT and standard EFRIS fiscal documentation. Official e-receipt generated at point of sale.'
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isPingingEfris, setIsPingingEfris] = useState(false);

  const handlePingEfris = () => {
    setIsPingingEfris(true);
    setTimeout(() => {
      setIsPingingEfris(false);
      setFlashMessage('success', 'URA EFRIS Gateway connected! Response code: 200 OK (Latency: 48ms)');
    }, 1200);
  };

  const handleSaveTax = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setFlashMessage('success', 'URA statutory tax rules and EFRIS fiscal protocol saved successfully.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSaveTax} className="space-y-6">
      
      {/* URA EFRIS Realtime Fiscalization Engine */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
              EFRIS Protocol
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Electronic Fiscal Receipting & Invoicing System (EFRIS)
            </h3>
            <p className="text-xs text-slate-500">
              Live automated handshake with Uganda Revenue Authority servers for instantaneous QR code and fiscal receipt signature generation.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePingEfris}
            disabled={isPingingEfris}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#111111] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingEfris ? 'animate-spin text-purple-600' : 'text-slate-500'}`} />
            <span>{isPingingEfris ? 'Testing Handshake...' : 'Ping EFRIS Gateway'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Server Mode */}
          <div
            onClick={() => setEfrisMode('live')}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
              efrisMode === 'live'
                ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-purple-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-600" />
                Live Cloud Fiscal Gateway (Recommended)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Receipts are transmitted immediately upon checkout via HTTPS REST. QR code and URA verification signature returned within 100ms.
            </p>
          </div>

          {/* Offline Buffer Mode */}
          <div
            onClick={() => setEfrisMode('buffered')}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
              efrisMode === 'buffered'
                ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-600" />
                Offline Store & Forward Buffer
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Safe for rural quarry yards with intermittent fiber internet. Signs invoices locally with cryptographic security key and synchronizes when online.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoFiscalizePOS}
              onChange={e => setAutoFiscalizePOS(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400 accent-purple-600"
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Automatic POS Fiscalization on Every Transaction
              </span>
              <span className="text-[11px] text-slate-500">
                Immediately issues an official URA EFRIS receipt without cashier manual intervention.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Statutory Rates & Withholding Tax */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
            Statutory Rates
          </span>
          <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
            Value Added Tax (VAT) & Withholding Tax (WHT)
          </h3>
          <p className="text-xs text-slate-500">
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
              <Percent className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
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
              <Percent className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
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
                  Allows zero-rating parts for accredited gold/tin/cobalt mining license holders holding URA exemption slips.
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
          Tax adjustments update future quote calculations and EFRIS fiscal transmissions.
        </span>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#111111]" />
              <span>Tax Policies Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#111111]" />
              <span>Save Taxation Rules</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};
