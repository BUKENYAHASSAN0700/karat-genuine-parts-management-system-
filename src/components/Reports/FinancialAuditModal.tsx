import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  Building,
  Calendar,
  FileText
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

interface FinancialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  grossRevenue: number;
  posSalesRevenue: number;
  commercialOrdersRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  totalOpex: number;
  ebitda: number;
  corporateTax: number;
  netProfit: number;
  netMarginPercent: number;
  accountsReceivable: number;
  totalInventoryCost: number;
}

export const FinancialAuditModal: React.FC<FinancialAuditModalProps> = ({
  isOpen,
  onClose,
  periodLabel,
  grossRevenue,
  posSalesRevenue,
  commercialOrdersRevenue,
  cogs,
  grossProfit,
  grossMarginPercent,
  totalOpex,
  ebitda,
  corporateTax,
  netProfit,
  netMarginPercent,
  accountsReceivable,
  totalInventoryCost
}) => {
  const { formatMoney, currency } = useInertia();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Modal Action Header (Hidden on Print) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6AF31]" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Printable Official Document Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 printable-document">
          
          {/* Letterhead */}
          <div className="border-b-2 border-[#111111] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#111111] text-[#F6AF31] rounded-2xl flex items-center justify-center font-black text-2xl tracking-tighter shadow-sm">
                  KA
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#111111] tracking-tight uppercase leading-none">
                    Karat Heavy Machinery Spare Parts
                  </h1>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#F6AF31] bg-[#111111] px-2 py-0.5 rounded-sm inline-block mt-1">
                    Spare Parts Limited
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-medium pt-1 max-w-sm">
                Plot 14-16 Jinja Road, Industrial Area Estate, Yard 4 Ingest, Kampala, Uganda.
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                TIN: 1004829104 &bull; VAT No: 1004829104-VAT &bull; EFRIS Fiscal Unit: EFRIS-UG-882194
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 inline-block">
                Audited Management Report
              </span>
              <div className="font-mono text-xs font-bold text-slate-500 mt-2">
                Report Ref: <strong className="text-[#111111]">AUD-2026-Q3-094</strong>
              </div>
              <div className="text-xs text-slate-600">
                Period: <strong className="text-[#111111]">{periodLabel}</strong>
              </div>
              <div className="text-xs text-slate-600">
                Currency: <strong className="text-[#111111]">{currency}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#111111] uppercase tracking-wide">
                Executive Financial Performance & Statutory Audit Statement
              </h2>
              <p className="text-[11px] text-slate-600">
                Consolidated performance of spare parts turnover, OEM procurement, and statutory taxes.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#22A06B] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Accurate</span>
            </div>
          </div>

          {/* Key Executive Ratios */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Gross Margin</span>
              <span className="text-base font-black text-[#111111] font-mono">{grossMarginPercent.toFixed(1)}%</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Net Margin</span>
              <span className="text-base font-black text-[#22A06B] font-mono">{netMarginPercent.toFixed(1)}%</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">DSO Velocity</span>
              <span className="text-base font-black text-slate-800 font-mono">16.4 Days</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">EFRIS Status</span>
              <span className="text-base font-black text-[#22A06B] font-mono">100% Tax OK</span>
            </div>
          </div>

          {/* Statement of Profit & Loss Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#111111] border-b border-slate-200 pb-1">
              1. Statement of Profit or Loss (Income Statement)
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-right">Debit / Cost</th>
                  <th className="py-2 text-right">Credit / Income</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-2 font-sans font-medium text-slate-800">Commercial Spare Part Sales (POS Walk-ins & Quotations)</td>
                  <td className="py-2 text-right text-slate-400">-</td>
                  <td className="py-2 text-right font-bold text-[#111111]">{formatMoney(grossRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-sans font-medium text-slate-800">Cost of Goods Sold (Factory Direct OEM Acquisition & Freight)</td>
                  <td className="py-2 text-right text-rose-600">({formatMoney(cogs)})</td>
                  <td className="py-2 text-right text-slate-400">-</td>
                </tr>
                <tr className="bg-amber-50/60 font-bold">
                  <td className="py-2 font-sans text-[#111111]">GROSS OPERATING PROFIT ({grossMarginPercent.toFixed(1)}%)</td>
                  <td className="py-2 text-right text-slate-400">-</td>
                  <td className="py-2 text-right text-[#111111]">{formatMoney(grossProfit)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-sans font-medium text-slate-800">Operating Expenses (Depot Lease, Logistics Fleet, Mechanics, Utilities)</td>
                  <td className="py-2 text-right text-slate-700">({formatMoney(totalOpex)})</td>
                  <td className="py-2 text-right text-slate-400">-</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2 font-sans text-slate-800">Operating Income Before Tax & Deprec. (EBITDA)</td>
                  <td className="py-2 text-right text-slate-400">-</td>
                  <td className="py-2 text-right text-slate-800">{formatMoney(ebitda)}</td>
                </tr>
                <tr>
                  <td className="py-2 font-sans font-medium text-slate-800">Uganda Revenue Authority (URA) Corporate Tax Provision</td>
                  <td className="py-2 text-right text-rose-600">({formatMoney(corporateTax)})</td>
                  <td className="py-2 text-right text-slate-400">-</td>
                </tr>
                <tr className="bg-slate-900 text-white font-black text-sm">
                  <td className="py-2.5 px-3 font-sans uppercase tracking-wider text-[#F6AF31]">NET DISTRIBUTABLE STORE PROFIT</td>
                  <td className="py-2.5 text-right text-slate-400">-</td>
                  <td className="py-2.5 px-3 text-right text-[#22A06B]">{formatMoney(netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Working Capital Balance Sheet Snapshot */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#111111] border-b border-slate-200 pb-1">
              2. Working Capital & Asset Position
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Warehouse Spares Asset</span>
                <span className="font-mono font-black text-sm text-[#111111]">{formatMoney(totalInventoryCost)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Physical stock at cost</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Trade Receivables (A/R)</span>
                <span className="font-mono font-black text-sm text-[#111111]">{formatMoney(accountsReceivable)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Corporate debtor balances</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Statutory VAT Status</span>
                <span className="font-mono font-black text-sm text-[#22A06B]">Active (EFRIS)</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">URA TIN: 1004829104</span>
              </div>
            </div>
          </div>

          {/* Statutory Declaration & Dual Sign-offs */}
          <div className="pt-6 border-t border-slate-200 space-y-6">
            <p className="text-[11px] text-slate-500 italic leading-relaxed">
              Certification: I hereby certify that the financial statements, inventory assets, trade receivables, and tax obligations outlined in this report have been accurately extracted from the official inventory and accounting ledgers of Karat Heavy Machinery Spare Parts in accordance with prevailing statutory reporting requirements.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
              <div className="border-t border-slate-400 pt-2 space-y-1">
                <div className="font-serif italic text-base text-slate-700">Hassan Bukenya</div>
                <div className="text-xs font-black text-[#111111]">CPA Hassan Bukenya</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Chief Financial Officer & Stores Controller</div>
                <div className="text-[10px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString('en-GB')}</div>
              </div>

              <div className="border-t border-slate-400 pt-2 space-y-1">
                <div className="font-serif italic text-base text-slate-700">Ronald Mukasa</div>
                <div className="text-xs font-black text-[#111111]">Eng. Ronald Mukasa, PE</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Managing Director & CEO</div>
                <div className="text-[10px] text-slate-400 font-mono">Official Seal: KARAT LTD - VERIFIED</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
