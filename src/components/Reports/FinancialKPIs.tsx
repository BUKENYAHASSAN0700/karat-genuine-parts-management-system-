import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  Package, 
  Clock, 
  ShieldCheck, 
  CreditCard,
  Building,
  AlertCircle
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

interface FinancialKPIsProps {
  grossRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  netProfit: number;
  netMarginPercent: number;
  accountsReceivable: number;
  unpaidOrdersCount: number;
  totalInventoryCost: number;
  totalInventoryRetail: number;
  unrealizedProfit: number;
  netVATPayable: number;
}

export const FinancialKPIs: React.FC<FinancialKPIsProps> = ({
  grossRevenue,
  cogs,
  grossProfit,
  grossMarginPercent,
  netProfit,
  netMarginPercent,
  accountsReceivable,
  unpaidOrdersCount,
  totalInventoryCost,
  totalInventoryRetail,
  unrealizedProfit,
  netVATPayable
}) => {
  const { formatMoney } = useInertia();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Revenue & Margin */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Gross Commercial Revenue</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#111111]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-[#111111] font-mono tracking-tight">
          {formatMoney(grossRevenue)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="inline-flex items-center gap-0.5 text-xs font-black text-[#22A06B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <TrendingUp className="w-3 h-3" />
            <span>{grossMarginPercent.toFixed(1)}%</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Gross Margin on Spares
          </span>
        </div>
      </div>

      {/* Net Operating Income / Profit */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Net Operating Profit</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#22A06B]">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-[#22A06B] font-mono tracking-tight">
          {formatMoney(netProfit)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
            {netMarginPercent.toFixed(1)}% Net
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            After Yard & Logistics OPEX
          </span>
        </div>
      </div>

      {/* Accounts Receivable (Credit Balances) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Accounts Receivable (A/R)</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#F6AF31]">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
        </div>
        <div className="text-2xl font-black text-[#111111] font-mono tracking-tight">
          {formatMoney(accountsReceivable)}
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{unpaidOrdersCount} Open Balances</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Corporate credit
          </span>
        </div>
      </div>

      {/* Inventory Asset Valuation */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider">Inventory Asset Value</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-black text-[#111111] font-mono tracking-tight">
          {formatMoney(totalInventoryCost)}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
          <span>Retail: <strong className="text-slate-800 font-mono">{formatMoney(totalInventoryRetail)}</strong></span>
          <span className="text-[#22A06B] font-bold font-mono">+{formatMoney(unrealizedProfit)} gain</span>
        </div>
      </div>
    </div>
  );
};
