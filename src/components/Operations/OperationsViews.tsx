import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Truck, 
  Receipt, 
  BarChart3, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  FileText,
  DollarSign,
  Package,
  ArrowUpRight,
  Settings,
  Shield,
  User,
  Store
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { InquiryItem } from '../../types';
import { OEMRestockView } from '../Restock/OEMRestockView';
import { FinancialReportsView } from '../Reports/FinancialReportsView';
import { StoreSettingsView } from '../Settings/StoreSettingsView';

// ================= SALES & QUOTATIONS VIEW =================
export const SalesView: React.FC = () => {
  const { inquiries, addInquiry, updateInquiryStatus, setFlashMessage, currency, formatMoney } = useInertia();
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [newQuote, setNewQuote] = useState({
    customer_name: '',
    equipment_model: '',
    parts_requested: '',
    quoted_amount: 0,
    status: 'Sent' as InquiryItem['status'],
  });

  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.customer_name || !newQuote.parts_requested) return;
    addInquiry(newQuote);
    setShowNewQuoteModal(false);
    setNewQuote({
      customer_name: '',
      equipment_model: '',
      parts_requested: '',
      quoted_amount: 0,
      status: 'Sent',
    });
  };

  const totalQuotedValue = inquiries.reduce((acc, q) => acc + q.quoted_amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Customer Quotes & Sales Orders
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#22A06B]/15 text-[#22A06B]">
              {formatMoney(totalQuotedValue)} Quoted
            </span>
          </div>
          <p className="text-xs text-[#111111]/50 mt-1">
            Track active customer requests, convert machinery inquiries to invoices, and log completed payouts.
          </p>
        </div>

        <button
          onClick={() => setShowNewQuoteModal(true)}
          className="px-5 py-2.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-2 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#111111]" />
          <span>Generate New Quotation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {inquiries.map(inq => (
          <div key={inq.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#111111]/40">{inq.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  inq.status === 'Approved'
                    ? 'bg-[#22A06B]/15 text-[#22A06B]'
                    : inq.status === 'Sent'
                    ? 'bg-[#F6AF31]/20 text-[#111111]'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {inq.status}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-[#111111] mt-2">{inq.customer_name}</h3>
              <p className="text-xs text-[#111111]/60 font-medium">{inq.equipment_model}</p>
              <div className="mt-3 p-3 rounded-2xl bg-[#F7F6F3] text-xs text-[#111111]/80 font-mono">
                {inq.parts_requested}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#111111]/40 uppercase font-bold">Total Quoted</span>
                <div className="text-base font-extrabold text-[#111111] font-mono">
                  {formatMoney(inq.quoted_amount)}
                </div>
              </div>

              {inq.status !== 'Approved' && (
                <button
                  onClick={() => updateInquiryStatus(inq.id, 'Approved')}
                  className="px-3 py-1.5 rounded-full bg-[#111111] text-white text-xs font-bold hover:bg-black transition"
                >
                  Approve Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showNewQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#111111]">Create Sales Quotation</h3>
            <form onSubmit={handleCreateQuote} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Customer Name / Fleet Company"
                value={newQuote.customer_name}
                onChange={e => setNewQuote({ ...newQuote, customer_name: e.target.value })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#111111]"
              />
              <input
                type="text"
                placeholder="Equipment Model (e.g. Caterpillar 349D Excavator)"
                value={newQuote.equipment_model}
                onChange={e => setNewQuote({ ...newQuote, equipment_model: e.target.value })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#111111]"
              />
              <textarea
                required
                placeholder="Parts requested (e.g. Hydraulic Valve Assembly x 2)"
                value={newQuote.parts_requested}
                onChange={e => setNewQuote({ ...newQuote, parts_requested: e.target.value })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#111111] h-20"
              />
              <input
                type="number"
                required
                placeholder="Quoted Base Amount in USD"
                value={newQuote.quoted_amount || ''}
                onChange={e => setNewQuote({ ...newQuote, quoted_amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-[#111111] font-mono"
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111]/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#F6AF31] text-[#111111] font-extrabold shadow-xs"
                >
                  Issue Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= PURCHASES & OEM ORDERS VIEW =================
export const PurchasesView = OEMRestockView;

// ================= REPORTS & ANALYTICS VIEW =================
export const ReportsView = FinancialReportsView;

// ================= STORE SETTINGS & PROFILE VIEW =================
export const SettingsView = StoreSettingsView;

