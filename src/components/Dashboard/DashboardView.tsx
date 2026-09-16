import React, { useState, useMemo } from 'react';
import { useInertia } from '../../context/InertiaContext';
import { SaleReceipt, SaleReceiptItem } from '../../types';
import { ReceiptModal } from '../Sales/ReceiptModal';
import { UIcon } from '../Common/UIcon';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    parts, 
    receipts,
    setAddModalOpen,
    setActiveView,
    updatePartStock,
    setFlashMessage,
    deleteReceipt,
    currency,
    formatMoney,
    formatMoneyShort
  } = useInertia();

  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Caterpillar' | 'Komatsu' | 'Volvo' | 'Hitachi'>('All');
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

  const totalSalesTransactions = receipts.length;

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

  const handleDeleteReceipt = (receipt: SaleReceipt) => {
    deleteReceipt(receipt.id);
    setViewingReceipt(current => current?.id === receipt.id ? null : current);
    setIsReceiptOpen(current => current && viewingReceipt?.id === receipt.id ? false : current);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row with Clear Greeting */}
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight font-mono">
          Dashboard
        </h1>
      </div>

      {/* ================= 4 CLEAN, COMPACT METRIC CARDS HORIZONTALLY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Inventory Valuation */}
        <div 
          onClick={() => setActiveView('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight truncate">
              {formatMoney(totalStockValuation)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Inventory Valuation
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F6AF31] flex items-center justify-center shrink-0 transition shadow-2xs">
            <UIcon name="coins" className="text-base" />
          </div>
        </div>

        {/* Card 2: Active Spare Parts In Stock */}
        <div 
          onClick={() => setActiveView('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
              {totalUnitsInStock} <span className="text-sm font-normal text-slate-400">Units</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Total Units In Stock
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F6AF31] flex items-center justify-center shrink-0 transition shadow-2xs">
            <UIcon name="boxes" className="text-base" />
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div 
          onClick={() => setActiveView('inventory')}
          className={`border rounded-2xl p-5 shadow-2xs transition cursor-pointer group flex items-start justify-between gap-3 ${
            lowStockCount > 0 
              ? 'bg-[#DC2626]/5 border-[#DC2626]/30 hover:border-[#DC2626]' 
              : 'bg-white border-slate-200/90 hover:border-[#111111]/30'
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
              lowStockCount > 0 ? 'text-[#DC2626]' : 'text-[#111111]'
            }`}>
              {lowStockCount} <span className="text-sm font-normal text-slate-400">Items</span>
            </div>
            <div className={`text-xs font-semibold mt-1 ${
              lowStockCount > 0 ? 'text-[#DC2626]' : 'text-slate-500'
            }`}>
              Low Stock Alerts
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition shadow-2xs ${
            lowStockCount > 0 
              ? 'bg-[#DC2626]/10 text-[#DC2626]' 
              : 'bg-[#F7F6F3] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F6AF31]'
          }`}>
            <UIcon name="triangle-warning" className="text-base" />
          </div>
        </div>

        {/* Card 4: Monthly Sales & Transactions */}
        <div 
          onClick={() => setActiveView('pos')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer group flex items-start justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
              {totalSalesTransactions} <span className="text-sm font-normal text-slate-400">Transactions</span>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Sales Transactions
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] group-hover:bg-[#111111] text-[#111111] group-hover:text-[#F6AF31] flex items-center justify-center shrink-0 transition shadow-2xs">
            <UIcon name="receipt" className="text-base" />
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
                  <UIcon name="layers" className="text-xs text-[#F6AF31]" />
                </div>
                <h2 className="text-base font-black text-[#111111] tracking-tight">
                  Machinery Fleet Inventory & Stock Movements
                </h2>
              </div>
            </div>

            {/* Brand Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {(['All', 'Caterpillar', 'Komatsu', 'Volvo', 'Hitachi'] as const).map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
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
                className="text-xs text-[#111111] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Inventory ({parts.length})</span>
                <UIcon name="angle-small-right" className="text-xs" />
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
                          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-[#111111] flex items-center justify-center disabled:opacity-30 transition shadow-2xs cursor-pointer"
                          title="Decrease Stock (Sale / Dispense)"
                        >
                          <UIcon name="minus-circle" className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleStockQuickAdjust(part.id, part.stock_quantity, 1)}
                          className="w-6 h-6 rounded-lg bg-[#111111] hover:bg-black text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Increase Stock (Restock received)"
                        >
                          <UIcon name="plus-circle" className="text-xs text-[#F6AF31]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= BIG CARD 2: LIVE SOLD ITEMS & RECEIPTS (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
          
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-bold text-xs shadow-2xs">
                  <UIcon name="shopping-cart" className="text-xs text-[#F6AF31]" />
                </div>
                <h2 className="text-base font-black text-[#111111] tracking-tight">
                  Sales Activity History
                </h2>
              </div>
            </div>
          </div>

          {/* Live Sold Items Feed */}
          <div className="space-y-3">
              <div className="space-y-3">
                {allSoldItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#111111]/40 bg-[#F7F6F3]/50 rounded-2xl">
                    No products sold yet. Open the sales register to process your first sale!
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
                <UIcon name="time-past" className="text-xs text-[#F6AF31]" />
                <span>Open Full Sales Register</span>
                <UIcon name="arrow-up-right" className="text-xs" />
              </button>
          </div>

        </div>

      </div>

      {/* ================= DEDICATED SECTION: LIVE SOLD ITEMS & INVENTORY DEDUCTIONS HISTORY ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              <UIcon name="time-past" className="text-lg text-[#F6AF31]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight">
                Sold Items & Inventory Deductions History
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveView('pos')}
              className="px-4 py-2 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UIcon name="shopping-cart" className="text-xs text-[#F6AF31]" />
              <span>Launch Sales & Sell</span>
            </button>
          </div>
        </div>

        {/* Sold Items - Mobile Card View */}
        <div className="block md:hidden divide-y divide-slate-100">
          {allSoldItems.length === 0 ? (
            <div className="py-12 text-center text-[#111111]/40 text-xs">
              No items sold yet. Use the sales register to complete product sales.
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
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">Model: {item.model || 'Heavy Machinery'}</div>
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
                    <UIcon name="clock" className="text-xs text-slate-400" />
                    <span>{item.date} {item.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setViewingReceipt(item.fullReceipt);
                        setIsReceiptOpen(true);
                      }}
                      className="text-xs font-bold text-[#111111] hover:text-[#F6AF31] underline decoration-slate-300 transition cursor-pointer"
                    >
                      Receipt #{item.receipt_number}
                    </button>
                    <button
                      onClick={() => handleDeleteReceipt(item.fullReceipt)}
                      className="w-7 h-7 rounded-lg text-[#DC2626] hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                      title="Delete receipt and restore stock"
                      aria-label={`Delete receipt ${item.receipt_number}`}
                    >
                      <UIcon name="trash" className="text-xs" />
                    </button>
                  </div>
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
                <th className="py-3 px-3">Brand / Model</th>
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
                    No items sold yet. Use the sales register to complete product sales.
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
                        <UIcon name="clock" className="text-xs text-slate-400" /> {item.time}
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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setViewingReceipt(item.fullReceipt);
                            setIsReceiptOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#111111] hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <UIcon name="print" className="text-xs text-[#F6AF31]" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReceipt(item.fullReceipt)}
                          className="w-7 h-7 rounded-full text-[#DC2626] hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                          title="Delete receipt and restore stock"
                          aria-label={`Delete receipt ${item.receipt_number}`}
                        >
                          <UIcon name="trash" className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View all in sales register footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-[#111111]/60">
            Showing {Math.min(8, allSoldItems.length)} of {allSoldItems.length} sold parts transactions recorded in system.
          </span>
          <button
            onClick={() => setActiveView('pos')}
            className="text-xs font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All Sold Parts in Sales Register</span>
            <UIcon name="arrow-up-right" className="text-xs" />
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
