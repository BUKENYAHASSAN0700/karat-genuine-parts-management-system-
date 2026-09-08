import React from 'react';
import { 
  Package, 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight,
  Boxes,
  Compass
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

export const InventoryValuationReport: React.FC = () => {
  const { parts, formatMoney } = useInertia();

  // Valuation computations
  const totalItemsCount = parts.reduce((sum, p) => sum + p.stock_quantity, 0);
  const totalValueAtCost = parts.reduce((sum, p) => sum + (p.stock_quantity * p.unit_cost), 0);
  const totalValueAtRetail = parts.reduce((sum, p) => sum + (p.stock_quantity * p.unit_price), 0);
  const unrealizedProfit = totalValueAtRetail - totalValueAtCost;
  const unrealizedMarginPct = totalValueAtRetail > 0 ? (unrealizedProfit / totalValueAtRetail) * 100 : 0;

  // Breakdown by brand
  const brandValuations = ['Caterpillar', 'Komatsu', 'Volvo', 'Hitachi'].map(brand => {
    const brandParts = parts.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    const qty = brandParts.reduce((s, p) => s + p.stock_quantity, 0);
    const cost = brandParts.reduce((s, p) => s + (p.stock_quantity * p.unit_cost), 0);
    const retail = brandParts.reduce((s, p) => s + (p.stock_quantity * p.unit_price), 0);
    return {
      brand,
      qty,
      cost,
      retail,
      profit: retail - cost,
      margin: retail > 0 ? ((retail - cost) / retail) * 100 : 0
    };
  });

  // Breakdown by category
  const categoryMap: { [cat: string]: { cost: number; retail: number; count: number } } = {};
  parts.forEach(p => {
    if (!categoryMap[p.category]) {
      categoryMap[p.category] = { cost: 0, retail: 0, count: 0 };
    }
    categoryMap[p.category].cost += (p.stock_quantity * p.unit_cost);
    categoryMap[p.category].retail += (p.stock_quantity * p.unit_price);
    categoryMap[p.category].count += p.stock_quantity;
  });

  const categories = Object.keys(categoryMap).map(cat => ({
    name: cat,
    count: categoryMap[cat].count,
    cost: categoryMap[cat].cost,
    retail: categoryMap[cat].retail,
    profit: categoryMap[cat].retail - categoryMap[cat].cost
  })).sort((a, b) => b.cost - a.cost);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900">
              Warehouse Balance Sheet
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Nakawa Yard 4 • Heavy Spares Capitalization
            </span>
          </div>
          <h2 className="text-xl font-black text-[#111111] tracking-tight">
            Inventory Asset Valuation & Stock Turnover
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit of physical warehouse inventory valued at acquisition cost versus projected retail market realization.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Catalog SKU Units</span>
            <span className="text-lg font-black text-[#111111] font-mono">{totalItemsCount} Physical Units</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black text-xs">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Cost Value */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Total Inventory at Cost
          </span>
          <div className="text-2xl font-black text-[#111111] font-mono">
            {formatMoney(totalValueAtCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Capital tied up in physical shelf stock
          </div>
        </div>

        {/* Total Retail Realization */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Projected Retail Realization
          </span>
          <div className="text-2xl font-black text-blue-600 font-mono">
            {formatMoney(totalValueAtRetail)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Full market selling value at current catalogue prices
          </div>
        </div>

        {/* Potential Gross Profit */}
        <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-300 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#22A06B]">
              Unrealized Inventory Gain
            </span>
            <span className="text-[10px] font-black bg-[#22A06B] text-white px-2 py-0.5 rounded-full">
              {unrealizedMarginPct.toFixed(1)}% Margin
            </span>
          </div>
          <div className="text-2xl font-black text-[#22A06B] font-mono">
            +{formatMoney(unrealizedProfit)}
          </div>
          <div className="text-[11px] text-slate-700 mt-2 font-medium">
            Expected gross profit upon complete stock realization
          </div>
        </div>
      </div>

      {/* Brand Asset Capitalization */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-black text-[#111111] uppercase tracking-tight border-b border-slate-100 pb-3">
          Capital Allocation by OEM Manufacturer
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {brandValuations.map(bv => {
            const shareOfCost = totalValueAtCost > 0 ? ((bv.cost / totalValueAtCost) * 100).toFixed(1) : '0';
            return (
              <div key={bv.brand} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#111111] text-xs">{bv.brand}</span>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {shareOfCost}% Capital
                  </span>
                </div>
                <div>
                  <div className="text-base font-black text-[#111111] font-mono">
                    {formatMoney(bv.cost)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Retail: <span className="font-bold text-slate-700">{formatMoney(bv.retail)}</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-[#22A06B] flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span>{bv.qty} Units in Stock</span>
                  <span>+{bv.margin.toFixed(0)}% Margin</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories Valuation Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="text-sm font-black text-[#111111] uppercase tracking-tight">
            Inventory Valuation by Equipment Category
          </h3>
        </div>

        {/* Categories Valuation - Mobile Card View */}
        <div className="block md:hidden divide-y divide-slate-100 p-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="py-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111]">{cat.name}</span>
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {cat.count} Units
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Asset Cost</div>
                  <div className="font-mono text-slate-700">{formatMoney(cat.cost)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Market Value</div>
                  <div className="font-mono font-bold text-slate-900">{formatMoney(cat.retail)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-slate-500">Gross Margin Potential</span>
                <span className="font-mono font-black text-[#22A06B]">+{formatMoney(cat.profit)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Categories Valuation Table - Desktop */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-4 text-center">Physical Qty</th>
                <th className="py-3 px-4 text-right">Asset Cost</th>
                <th className="py-3 px-4 text-right">Market Selling Value</th>
                <th className="py-3 px-5 text-right">Gross Profit Potential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {categories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-5 font-bold text-[#111111]">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-black text-slate-700">
                    {cat.count}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatMoney(cat.cost)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800 font-bold">
                    {formatMoney(cat.retail)}
                  </td>
                  <td className="py-3 px-5 text-right font-mono font-black text-[#22A06B]">
                    +{formatMoney(cat.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
