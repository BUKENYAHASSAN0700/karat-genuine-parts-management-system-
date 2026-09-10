import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Info,
  Calendar,
  Building,
  TrendingUp,
  Percent
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

interface PnLProps {
  grossRevenue: number;
  posSalesRevenue: number;
  commercialOrdersRevenue: number;
  freightSurcharges: number;
  cogs: number;
  oemAcquisitionCost: number;
  inboundFreightCost: number;
  marineInsuranceCost: number;
  customsClearingCost: number;
  grossProfit: number;
  grossMarginPercent: number;
  opexDepotLease: number;
  opexLogisticsFleet: number;
  opexSalariesTechnicians: number;
  opexDiagnosticTools: number;
  opexUtilities: number;
  opexITAdmin: number;
  totalOpex: number;
  ebitda: number;
  depreciation: number;
  bankAndWireFees: number;
  ebt: number;
  corporateTax: number;
  netProfit: number;
  netMarginPercent: number;
  periodLabel: string;
  onOpenAuditModal: () => void;
}

export const ProfitAndLossStatement: React.FC<PnLProps> = ({
  grossRevenue,
  posSalesRevenue,
  commercialOrdersRevenue,
  freightSurcharges,
  cogs,
  oemAcquisitionCost,
  inboundFreightCost,
  marineInsuranceCost,
  customsClearingCost,
  grossProfit,
  grossMarginPercent,
  opexDepotLease,
  opexLogisticsFleet,
  opexSalariesTechnicians,
  opexDiagnosticTools,
  opexUtilities,
  opexITAdmin,
  totalOpex,
  ebitda,
  depreciation,
  bankAndWireFees,
  ebt,
  corporateTax,
  netProfit,
  netMarginPercent,
  periodLabel,
  onOpenAuditModal
}) => {
  const { formatMoney, currency } = useInertia();

  // Collapsible sub-sections
  const [expandRevenue, setExpandRevenue] = useState(true);
  const [expandCOGS, setExpandCOGS] = useState(true);
  const [expandOPEX, setExpandOPEX] = useState(true);

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ['KARAT HEAVY MACHINERY SPARE PARTS'],
      ['OFFICIAL STATEMENT OF PROFIT OR LOSS AND COMPREHENSIVE INCOME'],
      [`Reporting Period: ${periodLabel}`],
      [`Operating Currency: ${currency}`],
      [''],
      ['Account Classification', 'Sub-Account', 'Amount'],
      ['Revenues', 'Over-the-Counter POS Sales', posSalesRevenue],
      ['Revenues', 'Commercial & Fleet Invoiced Orders', commercialOrdersRevenue],
      ['Revenues', 'Field Logistics & Emergency Surcharges', freightSurcharges],
      ['Revenues', 'TOTAL COMMERCIAL REVENUE', grossRevenue],
      [''],
      ['Cost of Goods Sold (COGS)', 'OEM Direct Factory Acquisition', -oemAcquisitionCost],
      ['Cost of Goods Sold (COGS)', 'Inbound Air & Ocean Freight Consignments', -inboundFreightCost],
      ['Cost of Goods Sold (COGS)', 'Marine & Transit Insurance', -marineInsuranceCost],
      ['Cost of Goods Sold (COGS)', 'Port & Border Customs Clearing', -customsClearingCost],
      ['Cost of Goods Sold (COGS)', 'TOTAL COST OF SALES (COGS)', -cogs],
      [''],
      ['Summary', 'GROSS PROFIT', grossProfit],
      ['Summary', 'Gross Margin (%)', `${grossMarginPercent.toFixed(2)}%`],
      [''],
      ['Operating Expenses (OPEX)', 'Yard 4 Industrial Area Depot Lease & Storage', -opexDepotLease],
      ['Operating Expenses (OPEX)', 'Fleet Logistics & Delivery Transit', -opexLogisticsFleet],
      ['Operating Expenses (OPEX)', 'Master Mechanics & Technical Payroll', -opexSalariesTechnicians],
      ['Operating Expenses (OPEX)', 'Hydraulic Diagnostic Rig & Tool Calibration', -opexDiagnosticTools],
      ['Operating Expenses (OPEX)', 'Warehouse Heavy Power & Utilities', -opexUtilities],
      ['Operating Expenses (OPEX)', 'ERP Licensing & Communications', -opexITAdmin],
      ['Operating Expenses (OPEX)', 'TOTAL OPERATING EXPENSES', -totalOpex],
      [''],
      ['EBITDA', 'OPERATING INCOME (EBITDA)', ebitda],
      ['Depreciation', 'Yard Cranes & Fleet Amortization', -depreciation],
      ['Finance', 'Bank Swift, RTGS & Wire Transfer Fees', -bankAndWireFees],
      ['EBT', 'EARNINGS BEFORE TAX (EBT)', ebt],
      ['Taxation', 'Corporate Income Tax Provision (30%)', -corporateTax],
      [''],
      ['Net Profit', 'NET EARNINGS FOR PERIOD', netProfit],
      ['Net Profit', 'Net Margin (%)', `${netMarginPercent.toFixed(2)}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KARAT_PnL_Statement_${periodLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6">
      
      {/* P&L Statement Header */}
      <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#111111] text-[#F6AF31]">
              Financial Accounting
            </span>
            <span className="text-xs text-slate-500 font-mono">
              GAAP & IFRS Compliant Multi-Step Statement
            </span>
          </div>
          <h2 className="text-xl font-black text-[#111111] tracking-tight">
            Statement of Profit or Loss (P&L)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Reporting Period: <strong className="text-slate-800">{periodLabel}</strong> • Operating Currency: <strong className="text-slate-800">{currency}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAuditModal}
            className="px-4 py-2 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Audit P&L</span>
          </button>
        </div>
      </div>

      {/* P&L Line Items Table */}
      <div className="px-6 pb-6">
        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200 text-xs">
          
          {/* SECTION 1: REVENUE */}
          <div>
            <div 
              onClick={() => setExpandRevenue(!expandRevenue)}
              className="bg-slate-100/80 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition select-none"
            >
              <div className="flex items-center gap-2">
                {expandRevenue ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                <span className="font-black text-[#111111] uppercase tracking-wider text-[11px]">
                  1. Commercial Revenues & Sales Turnaround
                </span>
              </div>
              <span className="font-mono font-black text-sm text-[#111111]">
                {formatMoney(grossRevenue)}
              </span>
            </div>

            {expandRevenue && (
              <div className="bg-white divide-y divide-slate-100">
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Over-the-Counter POS Counter Sales (Walk-ins & Contractors)</span>
                  <span className="font-mono font-bold text-slate-800">{formatMoney(posSalesRevenue)}</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Commercial Quotation Orders & Mining Invoices</span>
                  <span className="font-mono font-bold text-slate-800">{formatMoney(commercialOrdersRevenue)}</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Direct Site Van Delivery & Emergency Machine-Down Surcharges</span>
                  <span className="font-mono font-bold text-slate-800">{formatMoney(freightSurcharges)}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: COST OF GOODS SOLD */}
          <div>
            <div 
              onClick={() => setExpandCOGS(!expandCOGS)}
              className="bg-slate-100/80 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition select-none"
            >
              <div className="flex items-center gap-2">
                {expandCOGS ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                <span className="font-black text-[#111111] uppercase tracking-wider text-[11px]">
                  2. Cost of Goods Sold (COGS / OEM Outflow)
                </span>
              </div>
              <span className="font-mono font-black text-sm text-rose-600">
                ({formatMoney(cogs)})
              </span>
            </div>

            {expandCOGS && (
              <div className="bg-white divide-y divide-slate-100">
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>OEM Direct Factory Acquisition (Caterpillar, Komatsu, Volvo, Hitachi)</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(oemAcquisitionCost)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Inbound Expedited Air Freight & Ocean Container Charters</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(inboundFreightCost)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Marine Cargo Insurance & Port Bond Transit Protection</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(marineInsuranceCost)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Entebbe & ICD Kampala Customs Bond Verification & Handling</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(customsClearingCost)})</span>
                </div>
              </div>
            )}
          </div>

          {/* GROSS PROFIT HIGHLIGHT ROW */}
          <div className="bg-amber-500/10 px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-black text-[#111111] uppercase tracking-wider text-xs">
                GROSS OPERATING PROFIT
              </span>
              <span className="px-2 py-0.5 bg-[#F6AF31] text-[#111111] text-[10px] font-black rounded-full">
                {grossMarginPercent.toFixed(1)}% Gross Margin
              </span>
            </div>
            <span className="font-mono font-black text-base text-[#111111]">
              {formatMoney(grossProfit)}
            </span>
          </div>

          {/* SECTION 3: OPERATING EXPENSES (OPEX) */}
          <div>
            <div 
              onClick={() => setExpandOPEX(!expandOPEX)}
              className="bg-slate-100/80 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition select-none"
            >
              <div className="flex items-center gap-2">
                {expandOPEX ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                <span className="font-black text-[#111111] uppercase tracking-wider text-[11px]">
                  3. Yard 4 Industrial Area Depot & Operating Expenses (OPEX)
                </span>
              </div>
              <span className="font-mono font-black text-sm text-slate-700">
                ({formatMoney(totalOpex)})
              </span>
            </div>

            {expandOPEX && (
              <div className="bg-white divide-y divide-slate-100">
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Yard 4 Industrial Area Warehouse Lease, Heavy Aisle Storage & Yard Security</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(opexDepotLease)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Field Transit Hilux Fleet Fuel, Routine Service & Entebbe Express Tolls</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(opexLogisticsFleet)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Senior Parts Specialists, Master Mechanics & Stores Technicians Payroll</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(opexSalariesTechnicians)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Hydraulic Pressure Test Bench Calibration & CAT ET Diagnostic Subscriptions</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(opexDiagnosticTools)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>3-Phase Industrial Power, Forklift Diesel & Depot Utilities</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(opexUtilities)})</span>
                </div>
                <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
                  <span>Inventory Management ERP Licensing, Telephony & Fibre Internet</span>
                  <span className="font-mono font-bold text-slate-800">({formatMoney(opexITAdmin)})</span>
                </div>
              </div>
            )}
          </div>

          {/* EBITDA ROW */}
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-between">
            <span className="font-black text-slate-700 uppercase tracking-wider text-xs">
              Operating Income Before Interest, Tax & Depreciation (EBITDA)
            </span>
            <span className="font-mono font-black text-sm text-[#111111]">
              {formatMoney(ebitda)}
            </span>
          </div>

          {/* SECTION 4: DEPRECIATION & FINANCE */}
          <div className="bg-white divide-y divide-slate-100">
            <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
              <span>Depreciation: 5-Ton Overhead Gantry Crane & Transit Delivery Vehicles</span>
              <span className="font-mono font-bold text-slate-800">({formatMoney(depreciation)})</span>
            </div>
            <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 hover:bg-slate-50/50">
              <span>Bank Wire Swift Charges, International Letters of Credit & Foreign Exchange</span>
              <span className="font-mono font-bold text-slate-800">({formatMoney(bankAndWireFees)})</span>
            </div>
          </div>

          {/* EARNINGS BEFORE TAX (EBT) */}
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-between">
            <span className="font-black text-slate-700 uppercase tracking-wider text-xs">
              Earnings Before Tax (EBT)
            </span>
            <span className="font-mono font-black text-sm text-[#111111]">
              {formatMoney(ebt)}
            </span>
          </div>

          {/* CORPORATE TAX PROVISION */}
          <div className="px-8 py-2.5 flex items-center justify-between text-slate-600 bg-white">
            <span>Uganda Revenue Authority (URA) Corporate Income Tax Provision (Estimated 30%)</span>
            <span className="font-mono font-bold text-rose-600">({formatMoney(corporateTax)})</span>
          </div>

          {/* NET PROFIT FINAL ROW */}
          <div className="bg-[#111111] text-white px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base uppercase tracking-wider text-[#F6AF31]">
                  NET EARNINGS FOR PERIOD
                </span>
                <span className="px-2 py-0.5 bg-[#22A06B] text-white text-[10px] font-black rounded-full">
                  {netMarginPercent.toFixed(1)}% Net Margin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total distributable store earnings after all operational, logistics, and statutory deductions
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-2xl text-[#22A06B]">
                {formatMoney(netProfit)}
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
