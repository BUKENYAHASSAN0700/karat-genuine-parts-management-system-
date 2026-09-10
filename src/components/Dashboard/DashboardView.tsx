import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  TrendingUp, 
  Warehouse, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Layers, 
  FileText, 
  ShoppingCart,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  PlusCircle,
  MinusCircle,
  History,
  Printer,
  Receipt
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { SaleReceipt, SaleReceiptItem } from '../../types';
import { ReceiptModal } from '../Sales/ReceiptModal';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    parts, 
    transactions, 
    receipts,
    setAddModalOpen,
    setActiveView,
    updatePartStock,
    setFlashMessage,
    currency,
    formatMoney,
    formatMoneyShort
  } = useInertia();

  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Caterpillar' | 'Komatsu' | 'Volvo' | 'Hitachi'>('All');
  const [activityTab, setActivityTab] = useState<'sold-items' | 'transactions'>('sold-items');
  const [viewingReceipt, setViewingReceipt] = useState<SaleReceipt | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Flatten all sold items across receipts for itemized history
  const allSoldItems = useMemo(() => {
    const list: Array<SaleReceiptItem & {
      receipt_id: string;
      receipt_number: string;
      customer_name: string;
      customer_company?: string;
      customer_phone?: string;
      equipment_model?: string;
      date: string;
      time: string;
      timestamp: number;
      payment_method: string;
      payment_reference?: string;
      fullReceipt: SaleReceipt;
    }> = [];

    receipts.forEach(r => {
      r.items.forEach(item => {
        list.push({
          ...item,
          receipt_id: r.id,
          receipt_number: r.receipt_number,
          customer_name: r.customer_name,
          customer_company: r.customer_company,
          customer_phone: r.customer_phone,
          equipment_model: r.equipment_model,
          date: r.date,
          time: r.time,
          timestamp: r.timestamp,
          payment_method: r.payment_method,
          payment_reference: r.payment_reference,
          fullReceipt: r,
        });
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [receipts]);

  // Core Computed Metrics
  const totalStockValuation = parts.reduce((acc, p) => acc + (p.stock_quantity * p.unit_price), 0);
  const totalUnitsInStock = parts.reduce((acc, p) => acc + p.stock_quantity, 0);
  const lowStockParts = parts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.stock_quantity <= p.min_stock_alert);
  const lowStockCount = lowStockParts.length;

  const totalSalesRevenue = transactions
    .filter(t => t.type === 'sale')
    .reduce((acc, t) => acc + t.amount, 0);

  // Brand calculations
  const brandStats = (['Caterpillar', 'Komatsu', 'Volvo', 'Hitachi'] as const).map(brand => {
    const brandParts = parts.filter(p => p.brand === brand);
    const count = brandParts.reduce((acc, p) => acc + p.stock_quantity, 0);
    const value = brandParts.reduce((acc, p) => acc + (p.stock_quantity * p.unit_price), 0);
    const percentage = totalUnitsInStock > 0 ? Math.round((count / totalUnitsInStock) * 100) : 0;
    return { brand, count, value, percentage, skuCount: brandParts.length };
  });

  const filteredParts = selectedBrand === 'All' 
    ? parts 
    : parts.filter(p => p.brand === selectedBrand);

  const handleStockQuickAdjust = (partId: string, currentStock: number, delta: number) => {
    const nextStock = Math.max(0, currentStock + delta);
    updatePartStock(partId, nextStock);
    setFlashMessage('success', `Stock updated to ${nextStock} units`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row with Clear Greeting and Primary CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight font-mono">
            Welcome Back, {currentUser?.name || 'Shop Owner'}
          </h1>
          <p className="text-xs text-[#111111]/60 mt-0.5">
            Karat Heavy Machinery Spare Parts &bull; Live Inventory & Commercial Command Center
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Quick POS Sell Action */}
          <button
            onClick={() => setActiveView('pos')}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-[#111111] border border-slate-200/90 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#F6AF31]" />
            <span>Point of Sale Register</span>
          </button>

          {/* Primary Action Button: + Add New Part */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#111111] stroke-[2.5]" />
            <span>Add New Part</span>
          </button>
        </div>
      </div>

      {/* ================= 4 CLEAN, COMPACT METRIC CARDS HORIZONTALLY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Inventory Valuation */}
        <div 
          onClick={() => setActiveView('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#F7F6F3] group-hover:bg-[#F6AF31]/20 flex items-center justify-center text-[#111111] transition">
              <Warehouse className="w-4 h-4 text-[#111111]" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22A06B]/15 text-[#22A06B]">
              Active Store
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/50">
              Inventory Valuation
            </div>
            <div className="text-xl font-black text-[#111111] font-mono tracking-tight mt-0.5 truncate">
              {formatMoney(totalStockValuation)}
            </div>
          </div>
        </div>

        {/* Card 2: Active Spare Parts In Stock */}
        <div 
          onClick={() => setActiveView('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#F7F6F3] group-hover:bg-[#F6AF31]/20 flex items-center justify-center text-[#111111] transition">
              <Boxes className="w-4 h-4 text-[#111111]" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#111111] text-white">
              {parts.length} SKUs
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/50">
              Total Units In Stock
            </div>
            <div className="text-xl font-black text-[#111111] font-mono tracking-tight mt-0.5">
              {totalUnitsInStock} <span className="text-[11px] font-normal text-[#111111]/50">Units</span>
            </div>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div 
          onClick={() => setActiveView('inventory')}
          className={`border rounded-2xl p-4 shadow-2xs transition cursor-pointer group ${
            lowStockCount > 0 
              ? 'bg-[#DC2626]/5 border-[#DC2626]/30 hover:border-[#DC2626]' 
              : 'bg-white border-slate-200/90 hover:border-[#111111]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
              lowStockCount > 0 ? 'bg-[#DC2626] text-white' : 'bg-[#F7F6F3] text-[#111111]'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              lowStockCount > 0 ? 'bg-[#DC2626] text-white' : 'bg-[#22A06B]/15 text-[#22A06B]'
            }`}>
              {lowStockCount > 0 ? 'Action Needed' : 'Optimal'}
            </span>
          </div>

          <div className="mt-3">
            <div className={`text-[10px] font-bold uppercase tracking-wider ${
              lowStockCount > 0 ? 'text-[#DC2626]' : 'text-[#111111]/50'
            }`}>
              Low Stock Alerts
            </div>
            <div className={`text-xl font-black font-mono tracking-tight mt-0.5 ${
              lowStockCount > 0 ? 'text-[#DC2626]' : 'text-[#111111]'
            }`}>
              {lowStockCount} <span className="text-[11px] font-normal text-[#111111]/50">Items</span>
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Sales & Transactions */}
        <div 
          onClick={() => setActiveView('pos')}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-[#F7F6F3] group-hover:bg-[#F6AF31]/20 flex items-center justify-center text-[#111111] transition">
              <TrendingUp className="w-4 h-4 text-[#111111]" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22A06B]/15 text-[#22A06B] border border-[#22A06B]/30">
              {receipts.length} Invoices
            </span>
          </div>

          <div className="mt-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/50">
              Sales Revenue
            </div>
            <div className="text-xl font-black text-[#111111] font-mono tracking-tight mt-0.5 truncate">
              {formatMoney(totalSalesRevenue)}
            </div>
          </div>
        </div>

      </div>

      {/* ================= 2 BIG CARDS DOWN (PRACTICAL BUSINESS INSIGHTS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= BIG CARD 1: FLEET STOCK BREAKDOWN & FAST-MOVING SKUS (6 or 7 COLS) ================= */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
          
          {/* Card Header & Brand Quick Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-bold text-xs">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-base font-black text-[#111111] tracking-tight">
                  Machinery Fleet Inventory & Stock Movements
                </h2>
              </div>
              <p className="text-xs text-[#111111]/50 mt-1">
                Real-time stock allocation and quick adjustments across heavy OEM machinery.
              </p>
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {(['All', 'Caterpillar', 'Komatsu', 'Volvo', 'Hitachi'] as const).map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    selectedBrand === brand
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-[#F7F6F3] text-[#111111]/70 hover:bg-slate-200/60'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* OEM Brand Volume Distribution Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F6F3]/70 p-3.5 rounded-2xl border border-slate-200/70">
            {brandStats.map(b => (
              <div key={b.brand} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-[#111111]">{b.brand}</span>
                  <span className="font-mono text-[#111111]/60">{b.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#F6AF31] rounded-full transition-all duration-500"
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#111111]/50 flex justify-between">
                  <span>{b.count} Units</span>
                  <span className="font-mono">{formatMoneyShort(b.value)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Key Spare Parts List with Direct Quick Adjust Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#111111] uppercase tracking-wider text-[11px]">
                High-Demand Spare Parts Catalog
              </span>
              <button 
                onClick={() => setActiveView('inventory')}
                className="text-xs text-[#111111] font-bold hover:underline flex items-center gap-1"
              >
                <span>Full Inventory ({parts.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
              {filteredParts.slice(0, 5).map(part => {
                const isLow = part.stock_quantity <= part.min_stock_alert;
                return (
                  <div key={part.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#F7F6F3]/50 transition">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-[#111111] bg-[#F7F6F3] px-2 py-0.5 rounded border border-slate-200">
                          {part.part_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          part.brand === 'Caterpillar' ? 'bg-[#F6AF31]/20 text-[#111111]' :
                          part.brand === 'Komatsu' ? 'bg-blue-50 text-blue-800' :
                          part.brand === 'Volvo' ? 'bg-slate-200 text-[#111111]' :
                          'bg-orange-50 text-orange-800'
                        }`}>
                          {part.brand}
                        </span>
                        <span className="text-[10px] text-[#111111]/40 truncate">
                          {part.warehouse_bin}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#111111] truncate">
                        {part.name}
                      </div>

                      <div className="text-[10px] text-[#111111]/50 truncate">
                        Fleet: {part.machinery_models.join(', ')}
                      </div>
                    </div>

                    {/* Stock Counter + Quick Stepper */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`text-xs font-black font-mono ${isLow ? 'text-[#DC2626]' : 'text-[#111111]'}`}>
                          {part.stock_quantity} Units
                        </div>
                        <div className="text-[10px] font-mono text-[#111111]/60">
                          {formatMoney(part.unit_price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-[#F7F6F3] p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleStockQuickAdjust(part.id, part.stock_quantity, -1)}
                          disabled={part.stock_quantity <= 0}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-[#111111] flex items-center justify-center disabled:opacity-30 transition shadow-2xs"
                          title="Decrease Stock (Sale / Dispense)"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockQuickAdjust(part.id, part.stock_quantity, 1)}
                          className="w-6 h-6 rounded-lg bg-[#111111] hover:bg-black text-white flex items-center justify-center transition shadow-2xs"
                          title="Increase Stock (Restock received)"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-[#F6AF31]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= BIG CARD 2: LIVE COMMERCIAL INQUIRIES & RECENT TRANSACTIONS (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
          
          {/* Card Header & Toggle Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#22A06B] text-white flex items-center justify-center font-bold text-xs">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-base font-black text-[#111111] tracking-tight">
                  Sales Activity & Counter History
                </h2>
              </div>
              <p className="text-xs text-[#111111]/50 mt-1">
                Real-time sold items, cashier POS receipts, and counter transactions.
              </p>
            </div>

            {/* Toggle Switch between Sold Items and Transactions */}
            <div className="flex items-center bg-[#F7F6F3] p-0.5 rounded-full border border-slate-200/70 text-[11px] font-bold shrink-0 flex-wrap">
              <button
                onClick={() => setActivityTab('sold-items')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  activityTab === 'sold-items' 
                    ? 'bg-[#111111] text-white shadow-2xs' 
                    : 'text-[#111111]/60 hover:text-[#111111]'
                }`}
              >
                Sold Items ({allSoldItems.length})
              </button>
              <button
                onClick={() => setActivityTab('transactions')}
                className={`px-3 py-1 rounded-full transition cursor-pointer ${
                  activityTab === 'transactions' 
                    ? 'bg-[#111111] text-white shadow-2xs' 
                    : 'text-[#111111]/60 hover:text-[#111111]'
                }`}
              >
                Ledger ({transactions.length})
              </button>
            </div>
          </div>

          {/* Tab 1: Live Sold Items Feed */}
          {activityTab === 'sold-items' && (
            <div className="space-y-3">
              <div className="space-y-3">
                {allSoldItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#111111]/40 bg-[#F7F6F3]/50 rounded-2xl">
                    No products sold yet. Open the POS terminal to process your first sale!
                  </div>
                ) : (
                  allSoldItems.slice(0, 4).map(item => (
                    <div 
                      key={`${item.receipt_id}-${item.part_id}-${item.part_number}`}
                      className="p-3.5 rounded-2xl bg-[#F7F6F3]/80 border border-slate-200/80 hover:border-[#111111]/30 transition space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-[10px] text-[#111111] bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            {item.part_number}
                          </span>
                          <span className="font-extrabold text-xs text-[#111111] truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#111111] text-white shrink-0">
                          {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#111111]/70">
                        <span className="truncate">
                          <span className="font-semibold text-[#111111]">{item.customer_name}</span>
                          {item.equipment_model && ` • ${item.equipment_model}`}
                        </span>
                        <span className="font-mono font-black text-[#111111] shrink-0 ml-2">
                          {formatMoney(item.total_price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] border-t border-slate-200/60 font-mono text-[#111111]/50">
                        <span>{item.date} • {item.time}</span>
                        <button
                          onClick={() => {
                            setViewingReceipt(item.fullReceipt);
                            setIsReceiptOpen(true);
                          }}
                          className="text-[#111111] font-bold hover:text-[#F6AF31] underline cursor-pointer"
                        >
                          {item.receipt_number}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setActiveView('pos')}
                className="w-full py-2.5 rounded-2xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-[#F6AF31]" />
                <span>Open Full Point of Sale Terminal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Tab 2: Confirmed Sales Transactions */}
          {activityTab === 'transactions' && (
            <div className="space-y-3">
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div 
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-[#F7F6F3]/80 border border-slate-200/80 hover:border-[#111111]/30 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] font-black text-xs flex items-center justify-center shrink-0">
                        {tx.iconType === 'caterpillar' ? 'CAT' : (currency === 'UGX' ? 'UGX' : '$')}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#111111] truncate">{tx.name}</div>
                        <div className="text-[10px] text-[#111111]/50 font-mono">{tx.date} &bull; {tx.time}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black font-mono text-[#111111]">
                        +{formatMoney(tx.amount)}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22A06B]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22A06B]" />
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveView('sales')}
                className="w-full py-2.5 rounded-2xl bg-[#111111] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>View Full Sales Ledger & Invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Summary Pill at bottom of Card 2 */}
          <div className="p-3.5 rounded-2xl bg-[#F6AF31]/15 border border-[#F6AF31]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#111111]" />
              <span className="font-bold text-[#111111]">Stock & Sales Reconciliation</span>
            </div>
            <span className="font-mono font-black text-[#111111]">Synchronized</span>
          </div>

        </div>

      </div>

      {/* ================= DEDICATED SECTION: LIVE SOLD ITEMS & INVENTORY DEDUCTIONS HISTORY ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              <History className="w-5 h-5 text-[#F6AF31]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                  Sold Items & Inventory Deductions History
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#22A06B]/15 text-[#22A06B]">
                  {allSoldItems.reduce((acc, it) => acc + it.quantity, 0)} Units Deducted
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F6AF31]/20 text-[#111111]">
                  {receipts.length} Official Receipts
                </span>
              </div>
              <p className="text-xs text-[#111111]/60 mt-0.5">
                Itemized real-time log of sold spare parts, customer contractor fleets, machine models, and issued receipt slips.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveView('pos')}
              className="px-4 py-2 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#F6AF31]" />
              <span>Launch POS & Sell</span>
            </button>
          </div>
        </div>

        {/* Sold Items - Mobile Card View */}
        <div className="block md:hidden divide-y divide-slate-100">
          {allSoldItems.length === 0 ? (
            <div className="py-12 text-center text-[#111111]/40 text-xs">
              No items sold yet. Use the POS Register to complete product sales.
            </div>
          ) : (
            allSoldItems.slice(0, 8).map(item => (
              <div key={`${item.receipt_id}-${item.part_id}-${item.part_number}`} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#111111]">
                      {item.part_number}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.brand}
                    </span>
                  </div>
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-[#111111] text-white">
                    {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[#111111] leading-tight">{item.name}</h4>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">OEM: {item.oem_number}</div>
                </div>

                <div className="flex items-center justify-between text-xs bg-[#F7F6F3] p-2.5 rounded-xl border border-slate-200/70">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Customer</div>
                    <div className="font-bold text-[#111111]">{item.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Sale Total</div>
                    <div className="font-mono font-black text-sm text-[#111111]">{formatMoney(item.total_price)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.date} {item.time}</span>
                  </div>

                  <button
                    onClick={() => {
                      setViewingReceipt(item.fullReceipt);
                      setIsReceiptOpen(true);
                    }}
                    className="text-xs font-bold text-[#111111] hover:text-[#F6AF31] underline decoration-slate-300 transition cursor-pointer"
                  >
                    Receipt #{item.receipt_number}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sold Items Table - Desktop */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-extrabold text-[#111111]/60 tracking-wider">
                <th className="py-3 px-3">KA ID</th>
                <th className="py-3 px-3">Sold Spare Part</th>
                <th className="py-3 px-3">OEM / Brand</th>
                <th className="py-3 px-3 text-center">Units Sold</th>
                <th className="py-3 px-3 text-right">Sale Total</th>
                <th className="py-3 px-3">Customer / Fleet</th>
                <th className="py-3 px-3">Equipment</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Receipt Slip</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {allSoldItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#111111]/40">
                    No items sold yet. Use the POS Register to complete product sales.
                  </td>
                </tr>
              ) : (
                allSoldItems.slice(0, 8).map(item => (
                  <tr key={`${item.receipt_id}-${item.part_id}-${item.part_number}`} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-black text-[#111111] px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80">
                        {item.part_number}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#111111] max-w-[200px] leading-tight">
                        {item.name}
                      </div>
                      <span className="text-[10px] text-[#111111]/50 block mt-0.5">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold text-[#111111] block">
                        {item.oem_number}
                      </span>
                      <span className="text-[10px] text-[#111111]/60 font-semibold">
                        {item.brand}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-[#111111] text-white">
                        {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black font-mono text-[#111111]">
                      {formatMoney(item.total_price)}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#111111]">{item.customer_name}</div>
                      {item.customer_phone && (
                        <div className="text-[10px] text-[#111111]/60">{item.customer_phone}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-[#111111]/80 font-medium whitespace-nowrap">
                      {item.equipment_model || '—'}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-[#111111]">{item.date}</div>
                      <div className="text-[10px] text-[#111111]/50 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {item.time}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => {
                          setViewingReceipt(item.fullReceipt);
                          setIsReceiptOpen(true);
                        }}
                        className="font-mono text-[10px] font-bold text-[#111111] hover:text-[#F6AF31] underline decoration-slate-300 underline-offset-2 transition cursor-pointer"
                        title="View official receipt"
                      >
                        {item.receipt_number}
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setViewingReceipt(item.fullReceipt);
                          setIsReceiptOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#111111] hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 mx-auto transition cursor-pointer"
                      >
                        <Printer className="w-3 h-3 text-[#F6AF31]" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View all in POS footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-[#111111]/60">
            Showing {Math.min(8, allSoldItems.length)} of {allSoldItems.length} sold parts transactions recorded in system.
          </span>
          <button
            onClick={() => setActiveView('pos')}
            className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Sold Parts in POS Terminal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Receipt Viewer Modal on Dashboard */}
      <ReceiptModal
        receipt={viewingReceipt}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onNewSale={() => setActiveView('pos')}
      />
    </div>
  );
};
