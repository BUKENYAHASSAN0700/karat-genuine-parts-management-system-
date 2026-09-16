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
      {/* Gross Revenue */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
          {formatMoney(grossRevenue)}
        </div>
        <div className="text-xs font-semibold text-slate-500 mt-1">
          Gross Commercial Revenue
        </div>
      </div>

      {/* Net Operating Income / Profit */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="text-2xl sm:text-3xl font-black text-[#22A06B] font-mono tracking-tight">
          {formatMoney(netProfit)}
        </div>
        <div className="text-xs font-semibold text-slate-500 mt-1">
          Net Operating Profit
        </div>
      </div>

      {/* Accounts Receivable (Credit Balances) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
          {formatMoney(accountsReceivable)}
        </div>
        <div className="text-xs font-semibold text-slate-500 mt-1">
          Accounts Receivable (A/R)
        </div>
      </div>

      {/* Inventory Asset Valuation */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition">
        <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
          {formatMoney(totalInventoryCost)}
        </div>
        <div className="text-xs font-semibold text-slate-500 mt-1">
          Inventory Asset Value
        </div>
      </div>
    </div>
  );
};
