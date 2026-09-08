import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Boxes, 
  Building,
  RefreshCw,
  ArrowUpRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { FinancialKPIs } from './FinancialKPIs';
import { ProfitAndLossStatement } from './ProfitAndLossStatement';
import { AccountsReceivableLedger } from './AccountsReceivableLedger';
import { TaxAndEFRISReport } from './TaxAndEFRISReport';
import { InventoryValuationReport } from './InventoryValuationReport';
import { FinancialCharts } from './FinancialCharts';
import { FinancialAuditModal } from './FinancialAuditModal';

export const FinancialReportsView: React.FC = () => {
  const { 
    receipts, 
    orders, 
    oemOrders, 
    parts, 
    currency, 
    setCurrency, 
    formatMoney, 
    setFlashMessage 
  } = useInertia();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'pnl' | 'receivables' | 'tax' | 'inventory'>('overview');
  
  // Period filter
  const [selectedPeriod, setSelectedPeriod] = useState<string>('q3-2026');

  // Audit Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Period label
  const periodLabel = useMemo(() => {
    switch (selectedPeriod) {
      case 'sep-2026':
        return 'September 2026 (Month to Date)';
      case 'aug-2026':
        return 'August 2026';
      case 'q3-2026':
        return 'Q3 2026 (July - September)';
      case 'ytd-2026':
        return 'Year to Date 2026 (Jan - Sep)';
      default:
        return 'Consolidated Fiscal 2026';
    }
  }, [selectedPeriod]);

  // Financial calculations
  const financialData = useMemo(() => {
    // 1. Sales from POS Receipts
    const posSalesRevenue = receipts.reduce((sum, r) => sum + r.grand_total, 0);

    // 2. Sales from Commercial Orders
    const commercialOrdersRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

    // Field Delivery & Freight Surcharges
    const freightSurcharges = orders
      .filter(o => o.delivery_method === 'Field Van Delivery' || o.delivery_method === 'Expedited Air Freight')
      .length * 150; // nominal delivery dispatch fee

    // Gross Revenue
    const grossRevenue = posSalesRevenue + commercialOrdersRevenue + freightSurcharges;

    // 3. Cost of Goods Sold (COGS)
    // We calculate cost from parts sold in receipts and orders
    let totalItemsCost = 0;
    receipts.forEach(r => {
      r.items.forEach(item => {
        const foundPart = parts.find(p => p.id === item.part_id || p.part_number === item.part_number);
        const unitCost = foundPart ? foundPart.unit_cost : (item.unit_price * 0.6);
        totalItemsCost += (unitCost * item.quantity);
      });
    });

    orders.forEach(o => {
      o.items.forEach(item => {
        const foundPart = parts.find(p => p.id === item.part_id || p.part_number === item.part_number);
        const unitCost = foundPart ? foundPart.unit_cost : (item.unit_price * 0.6);
        totalItemsCost += (unitCost * item.quantity);
      });
    });

    // Baseline OEM restock costs
    const oemAcquisitionCost = totalItemsCost > 0 ? totalItemsCost : 18400;
    const inboundFreightCost = 2850;
    const marineInsuranceCost = 360;
    const customsClearingCost = 1010;
    const cogs = oemAcquisitionCost + inboundFreightCost + marineInsuranceCost + customsClearingCost;

    // Gross Profit
    const grossProfit = Math.max(0, grossRevenue - cogs);
    const grossMarginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    // 4. Operating Expenses (OPEX)
    const opexDepotLease = 4200;
    const opexLogisticsFleet = 1850;
    const opexSalariesTechnicians = 3600;
    const opexDiagnosticTools = 950;
    const opexUtilities = 1100;
    const opexITAdmin = 450;
    const totalOpex = opexDepotLease + opexLogisticsFleet + opexSalariesTechnicians + opexDiagnosticTools + opexUtilities + opexITAdmin;

    // Operating Income (EBITDA)
    const ebitda = grossProfit - totalOpex;

    // Depreciation & Finance
    const depreciation = 600;
    const bankAndWireFees = 380;
    const ebt = ebitda - depreciation - bankAndWireFees;

    // Corporate Income Tax (30% on positive earnings)
    const corporateTax = ebt > 0 ? ebt * 0.30 : 0;
    const netProfit = ebt - corporateTax;
    const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // 5. Accounts Receivable (A/R)
    // From orders with partial or credit payment
    let accountsReceivable = 0;
    let unpaidOrdersCount = 0;
    orders.forEach(order => {
      if (order.payment_status === 'Partial Advance (50%)') {
        accountsReceivable += (order.total_amount * 0.5);
        unpaidOrdersCount++;
      } else if (order.payment_status === '30-Day Credit Account' || order.payment_status === 'Pending Wire') {
        accountsReceivable += order.total_amount;
        unpaidOrdersCount++;
      }
    });
    // Add known commercial debtor baseline for full ledger view
    accountsReceivable += 11406;
    unpaidOrdersCount += 3;

    // 6. Inventory Valuation
    const totalInventoryCost = parts.reduce((sum, p) => sum + (p.stock_quantity * p.unit_cost), 0);
    const totalInventoryRetail = parts.reduce((sum, p) => sum + (p.stock_quantity * p.unit_price), 0);
    const unrealizedProfit = totalInventoryRetail - totalInventoryCost;

    // 7. Taxes & URA EFRIS (18% VAT)
    const outputVAT = grossRevenue * 0.18;
    const inputVAT = cogs * 0.18;
    const netVATPayable = Math.max(0, outputVAT - inputVAT);
    const whtCollected = grossRevenue * 0.06;
    const customsDutyPaid = oemOrders.reduce((sum, o) => sum + (o.customs_duty_est || 0), 0);

    return {
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
      accountsReceivable,
      unpaidOrdersCount,
      totalInventoryCost,
      totalInventoryRetail,
      unrealizedProfit,
      outputVAT,
      inputVAT,
      netVATPayable,
      whtCollected,
      customsDutyPaid,
    };
  }, [receipts, orders, oemOrders, parts]);

  // Chart trend data points (2026 Monthly Trend)
  const monthlyChartData = useMemo(() => {
    return [
      { month: 'Jan', revenue: 38200, cogs: 22900, grossProfit: 15300, expenses: 10400, netProfit: 3430 },
      { month: 'Feb', revenue: 42100, cogs: 24800, grossProfit: 17300, expenses: 10600, netProfit: 4690 },
      { month: 'Mar', revenue: 49500, cogs: 28900, grossProfit: 20600, expenses: 11100, netProfit: 6650 },
      { month: 'Apr', revenue: 44000, cogs: 25600, grossProfit: 18400, expenses: 10800, netProfit: 5320 },
      { month: 'May', revenue: 53200, cogs: 30800, grossProfit: 22400, expenses: 11500, netProfit: 7630 },
      { month: 'Jun', revenue: 58900, cogs: 33900, grossProfit: 25000, expenses: 11900, netProfit: 9170 },
      { month: 'Jul', revenue: 61400, cogs: 35600, grossProfit: 25800, expenses: 12100, netProfit: 9590 },
      { month: 'Aug', revenue: 68500, cogs: 39800, grossProfit: 28700, expenses: 12500, netProfit: 11340 },
      { month: 'Sep (P)', revenue: 74200, cogs: 42500, grossProfit: 31700, expenses: 12700, netProfit: 13300 },
    ];
  }, []);

  // Brand contribution for pie chart
  const brandChartData = useMemo(() => {
    return [
      { name: 'Caterpillar', value: 34800, color: '#F6AF31' },
      { name: 'Komatsu', value: 24200, color: '#2563eb' },
      { name: 'Volvo CE', value: 16500, color: '#16a34a' },
      { name: 'Hitachi', value: 12900, color: '#ea580c' },
      { name: 'Others', value: 6800, color: '#64748b' }
    ];
  }, []);

  // Category breakdown for bar chart
  const categoryChartData = useMemo(() => {
    return [
      { category: 'Hydraulics', revenue: 32400, cost: 18200, margin: 43.8 },
      { category: 'Engine & Fuel', revenue: 22800, cost: 13900, margin: 39.0 },
      { category: 'Transmission', revenue: 16400, cost: 9800, margin: 40.2 },
      { category: 'GET Tools', revenue: 11200, cost: 5900, margin: 47.3 },
      { category: 'Cooling & Rads', revenue: 8600, cost: 4800, margin: 44.1 },
      { category: 'Filtration', revenue: 3800, cost: 1700, margin: 55.2 }
    ];
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Header & Context Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F6AF31] text-[#111111]">
              Financial Accounting & BI
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">
              Kampala Depot • Operating Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            Financial & Commercial Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time Statement of Profit or Loss (P&L), OEM procurement outflow, corporate accounts receivable aging, and Uganda Revenue Authority (URA) VAT returns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setCurrency('USD');
                setFlashMessage('success', 'Operating currency set to USD ($).');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#111111] text-[#F6AF31] shadow-xs'
                  : 'text-slate-600 hover:text-[#111111]'
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => {
                setCurrency('UGX');
                setFlashMessage('success', 'Operating currency set to UGX (USh at 3,750 rate).');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                currency === 'UGX'
                  ? 'bg-[#111111] text-[#F6AF31] shadow-xs'
                  : 'text-slate-600 hover:text-[#111111]'
              }`}
            >
              USh UGX
            </button>
          </div>

          {/* Period Dropdown */}
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="sep-2026">Sep 2026 (MTD)</option>
            <option value="aug-2026">August 2026</option>
            <option value="q3-2026">Q3 2026 (Jul - Sep)</option>
            <option value="ytd-2026">Year to Date 2026</option>
          </select>

          {/* Print Audit Modal Trigger */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-4 py-2.5 bg-[#111111] hover:bg-black text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#F6AF31]" />
            <span>Audit Report & PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <FinancialKPIs
        grossRevenue={financialData.grossRevenue}
        cogs={financialData.cogs}
        grossProfit={financialData.grossProfit}
        grossMarginPercent={financialData.grossMarginPercent}
        netProfit={financialData.netProfit}
        netMarginPercent={financialData.netMarginPercent}
        accountsReceivable={financialData.accountsReceivable}
        unpaidOrdersCount={financialData.unpaidOrdersCount}
        totalInventoryCost={financialData.totalInventoryCost}
        totalInventoryRetail={financialData.totalInventoryRetail}
        unrealizedProfit={financialData.unrealizedProfit}
        netVATPayable={financialData.netVATPayable}
      />

      {/* Navigation Sub-Tabs */}
      <div className="p-2 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Executive Overview & Charts', icon: BarChart3 },
          { id: 'pnl', label: 'Profit & Loss (Income Statement)', icon: FileText },
          { id: 'receivables', label: 'Accounts Receivable & Aging', icon: Clock, badge: `${financialData.unpaidOrdersCount} Open` },
          { id: 'tax', label: 'URA 18% VAT & EFRIS Compliance', icon: ShieldCheck },
          { id: 'inventory', label: 'Inventory Asset Valuation', icon: Boxes },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F6AF31]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                  isActive ? 'bg-amber-400 text-black font-black' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <FinancialCharts
          monthlyData={monthlyChartData}
          brandData={brandChartData}
          categoryData={categoryChartData}
        />
      )}

      {activeTab === 'pnl' && (
        <ProfitAndLossStatement
          grossRevenue={financialData.grossRevenue}
          posSalesRevenue={financialData.posSalesRevenue}
          commercialOrdersRevenue={financialData.commercialOrdersRevenue}
          freightSurcharges={financialData.freightSurcharges}
          cogs={financialData.cogs}
          oemAcquisitionCost={financialData.oemAcquisitionCost}
          inboundFreightCost={financialData.inboundFreightCost}
          marineInsuranceCost={financialData.marineInsuranceCost}
          customsClearingCost={financialData.customsClearingCost}
          grossProfit={financialData.grossProfit}
          grossMarginPercent={financialData.grossMarginPercent}
          opexDepotLease={financialData.opexDepotLease}
          opexLogisticsFleet={financialData.opexLogisticsFleet}
          opexSalariesTechnicians={financialData.opexSalariesTechnicians}
          opexDiagnosticTools={financialData.opexDiagnosticTools}
          opexUtilities={financialData.opexUtilities}
          opexITAdmin={financialData.opexITAdmin}
          totalOpex={financialData.totalOpex}
          ebitda={financialData.ebitda}
          depreciation={financialData.depreciation}
          bankAndWireFees={financialData.bankAndWireFees}
          ebt={financialData.ebt}
          corporateTax={financialData.corporateTax}
          netProfit={financialData.netProfit}
          netMarginPercent={financialData.netMarginPercent}
          periodLabel={periodLabel}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
        />
      )}

      {activeTab === 'receivables' && (
        <AccountsReceivableLedger />
      )}

      {activeTab === 'tax' && (
        <TaxAndEFRISReport
          grossRevenue={financialData.grossRevenue}
          outputVAT={financialData.outputVAT}
          inputVAT={financialData.inputVAT}
          netVATPayable={financialData.netVATPayable}
          whtCollected={financialData.whtCollected}
          customsDutyPaid={financialData.customsDutyPaid}
          periodLabel={periodLabel}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryValuationReport />
      )}

      {/* Official Printable Financial Audit Statement Modal */}
      <FinancialAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        periodLabel={periodLabel}
        grossRevenue={financialData.grossRevenue}
        posSalesRevenue={financialData.posSalesRevenue}
        commercialOrdersRevenue={financialData.commercialOrdersRevenue}
        cogs={financialData.cogs}
        grossProfit={financialData.grossProfit}
        grossMarginPercent={financialData.grossMarginPercent}
        totalOpex={financialData.totalOpex}
        ebitda={financialData.ebitda}
        corporateTax={financialData.corporateTax}
        netProfit={financialData.netProfit}
        netMarginPercent={financialData.netMarginPercent}
        accountsReceivable={financialData.accountsReceivable}
        totalInventoryCost={financialData.totalInventoryCost}
      />

    </div>
  );
};
