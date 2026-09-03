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
export const PurchasesView: React.FC = () => {
  const { formatMoney } = useInertia();
  const oemOrders = [
    {
      id: 'PO-8841',
      supplier: 'Caterpillar Logistics Services',
      items: 'Wastegated Turbocharger C9 ACERT x 4',
      status: 'In Transit',
      eta: 'In 3 Days',
      amount: 6600,
    },
    {
      id: 'PO-8840',
      supplier: 'Komatsu Global Parts Direct',
      items: 'Variable Displacement Hydraulic Piston Pump x 2',
      status: 'Customs Clearance',
      eta: 'Next Week',
      amount: 11600,
    },
    {
      id: 'PO-8839',
      supplier: 'Volvo Construction Equipment Hub',
      items: 'Common Rail Fuel Injector Set x 12',
      status: 'Delivered',
      eta: 'Yesterday',
      amount: 5040,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            OEM Restock & Purchase Orders
          </h1>
          <p className="text-xs text-[#111111]/50 mt-1">
            Manage replenishment orders direct from Caterpillar, Komatsu, Volvo CE, and Hitachi supply chains.
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold shadow-xs transition">
          + Issue OEM Purchase Order
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F6F3] border-b border-slate-200 text-[#111111]/60 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">PO Number</th>
              <th className="px-4 py-3.5">OEM Supplier</th>
              <th className="px-4 py-3.5">Components Ordered</th>
              <th className="px-4 py-3.5">Cost</th>
              <th className="px-4 py-3.5">Logistics Status</th>
              <th className="px-6 py-3.5">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {oemOrders.map(po => (
              <tr key={po.id} className="hover:bg-[#F7F6F3]/50 transition">
                <td className="px-6 py-4 font-mono font-bold text-[#111111]">{po.id}</td>
                <td className="px-4 py-4 font-bold text-[#111111]">{po.supplier}</td>
                <td className="px-4 py-4 text-[#111111]/70">{po.items}</td>
                <td className="px-4 py-4 font-mono font-bold text-[#111111]">{formatMoney(po.amount)}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    po.status === 'Delivered'
                      ? 'bg-[#22A06B]/15 text-[#22A06B]'
                      : 'bg-[#F6AF31]/20 text-[#111111]'
                  }`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[#111111]/50 font-medium">{po.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ================= REPORTS & ANALYTICS VIEW =================
export const ReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
          Financial & Inventory Analytics
        </h1>
        <p className="text-xs text-[#111111]/50 mt-1">
          Quarterly revenue growth, parts turnaround velocity, and gross store liquidity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">Quarterly Sales Growth</span>
          <div className="text-3xl font-extrabold text-[#111111] tracking-tight">+24.6%</div>
          <div className="text-xs text-[#22A06B] font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Outperforming targets
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">Fast Moving Category</span>
          <div className="text-3xl font-extrabold text-[#111111] tracking-tight">Hydraulics</div>
          <div className="text-xs text-[#111111]/60">CAT 349D & Komatsu PC400 Series</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">Cash Collection Cycle</span>
          <div className="text-3xl font-extrabold text-[#111111] tracking-tight">14 Days</div>
          <div className="text-xs text-[#22A06B] font-semibold">Healthy Commercial Term</div>
        </div>
      </div>
    </div>
  );
};

// ================= STORE SETTINGS & PROFILE VIEW =================
export const SettingsView: React.FC = () => {
  const { currentUser, setFlashMessage, currency, setCurrency, formatMoney, setActiveView } = useInertia();
  const [shopName, setShopName] = useState(currentUser?.shop_name || 'KARAT Heavy Machinery & Spare Parts');
  const [ownerEmail, setOwnerEmail] = useState(currentUser?.email || 'owner@karat.com');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setFlashMessage('success', 'KARAT Store preferences and settings successfully saved.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Store Settings & Profile
          </h1>
          <p className="text-xs text-[#111111]/50 mt-1">
            Configure system currency (UGX / USD), store identity, and manage parts catalog preferences.
          </p>
        </div>

        <button
          onClick={() => setActiveView('inventory')}
          className="px-4 py-2 rounded-2xl bg-[#F7F6F3] hover:bg-slate-200 text-[#111111] text-xs font-bold transition flex items-center gap-1.5 border border-slate-200/80"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Manage Parts Catalog &rarr;</span>
        </button>
      </div>

      {/* System Currency Card (UGX & USD Systemwide) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F6AF31]/20 text-[#111111] flex items-center justify-center font-bold text-xs">
              <DollarSign className="w-4 h-4 text-[#111111]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#111111]">
                System Operating Currency
              </h2>
              <p className="text-[11px] text-[#111111]/50">
                Applied systemwide across Dashboard KPI cards, catalog valuations, invoice pricing, and spare part unit costs.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#111111] text-white">
            Active: {currency}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* USD Card */}
          <button
            type="button"
            onClick={() => {
              setCurrency('USD');
              setFlashMessage('info', 'System currency switched to United States Dollar ($ USD).');
            }}
            className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
              currency === 'USD'
                ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                : 'bg-[#F7F6F3] text-[#111111] border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm">$ USD</span>
              {currency === 'USD' && (
                <span className="w-5 h-5 rounded-full bg-[#F6AF31] text-[#111111] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
              )}
            </div>
            <div className={`text-xs font-extrabold mt-1 ${currency === 'USD' ? 'text-[#F6AF31]' : 'text-[#111111]'}`}>
              United States Dollar
            </div>
            <div className={`text-[10px] mt-2 font-mono ${currency === 'USD' ? 'text-white/70' : 'text-[#111111]/50'}`}>
              Standard Base &bull; e.g. {formatMoney(100)}
            </div>
          </button>

          {/* UGX Card */}
          <button
            type="button"
            onClick={() => {
              setCurrency('UGX');
              setFlashMessage('info', 'System currency switched to Uganda Shillings (USh UGX).');
            }}
            className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
              currency === 'UGX'
                ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                : 'bg-[#F7F6F3] text-[#111111] border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm">USh UGX</span>
              {currency === 'UGX' && (
                <span className="w-5 h-5 rounded-full bg-[#F6AF31] text-[#111111] flex items-center justify-center text-xs font-black">
                  ✓
                </span>
              )}
            </div>
            <div className={`text-xs font-extrabold mt-1 ${currency === 'UGX' ? 'text-[#F6AF31]' : 'text-[#111111]'}`}>
              Uganda Shillings
            </div>
            <div className={`text-[10px] mt-2 font-mono ${currency === 'UGX' ? 'text-white/70' : 'text-[#111111]/50'}`}>
              1 USD = 3,750 UGX &bull; e.g. {formatMoney(100)}
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111111]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Owner Email
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={e => setOwnerEmail(e.target.value)}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#111111]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Active System Currency
              </label>
              <select
                value={currency}
                onChange={e => {
                  setCurrency(e.target.value as any);
                  setFlashMessage('info', `Active currency set to ${e.target.value}`);
                }}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#111111] font-semibold"
              >
                <option value="USD">USD ($ - United States Dollar)</option>
                <option value="UGX">UGX (USh - Uganda Shilling)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold shadow-xs transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
