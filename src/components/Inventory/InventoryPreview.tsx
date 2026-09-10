import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  Warehouse, 
  Layers,
  ShieldCheck,
  X
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { InventoryTable } from './InventoryTable';

export const InventoryPreview: React.FC = () => {
  const { parts, setActiveView, formatMoney } = useInertia();
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  const lowStockCount = parts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.stock_quantity <= p.min_stock_alert).length;
  const totalValuation = parts.reduce((acc, p) => acc + (p.stock_quantity * p.unit_price), 0);
  const totalUnits = parts.reduce((acc, p) => acc + p.stock_quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Bento Summary */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-black text-[#111111] tracking-tight font-mono">
              Inventory
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#F6AF31]/20 text-[#111111] border border-[#F6AF31]/30">
              {parts.length} Heavy SKUs
            </span>
          </div>
          <p className="text-xs text-[#111111]/60">
            Real-time catalog for heavy machinery spare parts and stock management.
          </p>
        </div>

        {/* Metric Capsules */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <div className="px-4 py-2.5 bg-[#F7F6F3] rounded-2xl border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-[#111111]/40">Catalog Valuation</div>
            <div className="text-base font-black font-mono text-[#111111]">
              {formatMoney(totalValuation)}
            </div>
          </div>

          <div className="px-4 py-2.5 bg-[#F7F6F3] rounded-2xl border border-slate-200/80">
            <div className="text-[10px] uppercase font-bold text-[#111111]/40">Total Units in Stock</div>
            <div className="text-base font-black font-mono text-[#111111]">
              {totalUnits} <span className="text-xs font-normal text-[#111111]/50">Units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Banner with direct jump / action and close button */}
      {lowStockCount > 0 && !isAlertDismissed && (
        <div className="bg-[#DC2626]/10 border border-[#DC2626]/25 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#DC2626] transition animate-in fade-in">
          <div className="flex items-center gap-2.5 font-bold">
            <div className="w-7 h-7 rounded-xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold">{lowStockCount} spare {lowStockCount === 1 ? 'part is' : 'parts are'}</span> currently below safety reorder threshold.
              <span className="hidden sm:inline text-[#111111]/60 font-normal ml-1.5">
                Review stock levels before the next dispatch.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIsAlertDismissed(true)}
              className="w-7 h-7 rounded-xl bg-[#DC2626]/15 hover:bg-[#DC2626]/25 text-[#DC2626] flex items-center justify-center transition"
              title="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Inventory Table with all details, sorting, filtering, and stock color coding */}
      <InventoryTable />
    </div>
  );
};
