import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  Download, 
  HelpCircle, 
  ExternalLink, 
  AlertTriangle,
  Building,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

interface TaxReportProps {
  grossRevenue: number;
  outputVAT: number;
  inputVAT: number;
  netVATPayable: number;
  whtCollected: number;
  customsDutyPaid: number;
  periodLabel: string;
}

export const TaxAndEFRISReport: React.FC<TaxReportProps> = ({
  grossRevenue,
  outputVAT,
  inputVAT,
  netVATPayable,
  whtCollected,
  customsDutyPaid,
  periodLabel
}) => {
  const { formatMoney, currency, setFlashMessage } = useInertia();

  const handleExportVATSchedules = () => {
    const rows = [
      ['UGANDA REVENUE AUTHORITY (URA) - VALUE ADDED TAX (VAT) RETURN SCHEDULE'],
      ['TAXPAYER: KARAT HEAVY MACHINERY SPARE PARTS'],
      ['TIN: 1004829104 | VAT REGISTRATION: 1004829104-VAT'],
      ['STATION: KAMPALA LARGE TAXPAYERS OFFICE, KAMPALA'],
      [`TAX PERIOD: ${periodLabel}`],
      [''],
      ['Schedule Box', 'Tax Description', 'Taxable Value', 'VAT Rate', 'VAT Amount'],
      ['Box 50', 'Standard Rated Supplies (18% Sales & Counter POS)', grossRevenue, '18%', outputVAT],
      ['Box 55', 'Total Output Tax Payable', grossRevenue, '18%', outputVAT],
      [''],
      ['Box 70', 'Standard Rated Imports (OEM Inbound Consignments CIF)', grossRevenue * 0.58, '18%', inputVAT],
      ['Box 85', 'Total Input Tax Allowable', grossRevenue * 0.58, '18%', inputVAT],
      [''],
      ['Box 90', 'NET VAT PAYABLE TO URA', '', '', netVATPayable],
      ['Box 95', 'Withholding VAT (WHT 6%) Deducted by Clients', '', '6%', whtCollected],
      ['Customs', 'EAC Common External Tariff Duty Paid at Customs', '', 'Var', customsDutyPaid]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `URA_VAT_Schedule_TIN_1004829104_${periodLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFlashMessage('success', 'URA VAT Return Schedule (Form DT-2017) exported.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900">
              Statutory Compliance
            </span>
            <span className="text-xs text-slate-500 font-mono">
              URA TIN: 1004829104 • EFRIS Electronic Fiscal System
            </span>
          </div>
          <h2 className="text-xl font-black text-[#111111] tracking-tight">
            Uganda Revenue Authority (URA) VAT & Customs Duty
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconciliation of 18% Output VAT collected on spare part sales versus Input VAT claimed on factory-direct OEM imports.
          </p>
        </div>

        <button
          onClick={handleExportVATSchedules}
          className="px-4 py-2.5 bg-[#111111] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shrink-0"
        >
          <Download className="w-4 h-4 text-[#F6AF31]" />
          <span>Export URA Return Form</span>
        </button>
      </div>

      {/* Tax Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Output VAT */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            18% Output VAT (Sales)
          </span>
          <div className="text-2xl font-black text-[#111111] font-mono">
            {formatMoney(outputVAT)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Collected across POS & commercial invoices
          </div>
        </div>

        {/* Input VAT */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            18% Input VAT (Imports)
          </span>
          <div className="text-2xl font-black text-blue-600 font-mono">
            {formatMoney(inputVAT)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Paid at Entebbe / Mombasa customs bond
          </div>
        </div>

        {/* Net VAT Payable */}
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-300 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#111111]">
              Net VAT Payable to URA
            </span>
            <span className="text-[10px] font-black bg-[#F6AF31] text-[#111111] px-1.5 py-0.2 rounded">
              Due 15th
            </span>
          </div>
          <div className="text-2xl font-black text-[#111111] font-mono">
            {formatMoney(netVATPayable)}
          </div>
          <div className="text-[11px] text-slate-700 mt-2 font-medium">
            Output VAT minus allowable Input VAT credit
          </div>
        </div>

        {/* Withholding Tax 6% */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Withholding Tax (WHT 6%)
          </span>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {formatMoney(whtCollected)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Deducted by corporate clients (Credit notes held)
          </div>
        </div>
      </div>

      {/* EFRIS Electronic Fiscal Receipting Verification Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#111111] uppercase tracking-tight">
                  EFRIS Fiscal Integration Status
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#22A06B] text-[10px] font-black rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ONLINE & SYNCHRONIZED</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                System connected to URA Central Fiscal Server • Device ID: <strong>EFRIS-UG-882194</strong>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Fiscalized Invoices</span>
            <span className="font-mono font-black text-sm text-[#111111]">100% Compliant</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Standard VAT Rate: 18%</span>
            <p className="text-slate-500 text-[11px]">
              Automatically computed on all heavy earthmoving parts, hydraulic valves, and rebuild overhaul kits.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Customs Duty Exemption Scheme</span>
            <p className="text-slate-500 text-[11px]">
              Certain certified agricultural & mining plant spares qualify for zero-rated EAC industrial tariffs.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-700 block mb-1">Monthly Return Deadline</span>
            <p className="text-slate-500 text-[11px]">
              Next monthly VAT return is due on the 15th of the month via the URA e-Tax portal.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
