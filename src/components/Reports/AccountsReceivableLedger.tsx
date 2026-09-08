import React, { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Send, 
  Phone, 
  Building, 
  DollarSign, 
  Filter, 
  CreditCard,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { CommercialOrder } from '../../types';

interface DebtorRecord {
  id: string;
  company: string;
  contactPerson: string;
  phone: string;
  email: string;
  totalDue: number;
  creditLimit: number;
  oldestInvoiceDate: string;
  daysOutstanding: number;
  agingCategory: 'Current' | '31-60 Days' | '61-90 Days' | '90+ Days';
  activeOrders: string[];
}

export const AccountsReceivableLedger: React.FC = () => {
  const { orders, formatMoney, updateOrderStatus, setFlashMessage } = useInertia();

  const [reminderSentClient, setReminderSentClient] = useState<string | null>(null);
  const [selectedAgingFilter, setSelectedAgingFilter] = useState<string>('all');

  // Compute debtors from orders
  const debtorClients: DebtorRecord[] = [
    {
      id: 'DEB-01',
      company: 'Apex Heavy Mining Ltd',
      contactPerson: 'Sarah Mitchell',
      phone: '+256 776 119844',
      email: 'supplies@apex-mining.com',
      totalDue: 3900, // 50% balance on ORD-2026-087 ($7,800 order)
      creditLimit: 50000,
      oldestInvoiceDate: 'Sep 01, 2026',
      daysOutstanding: 3,
      agingCategory: 'Current',
      activeOrders: ['ORD-2026-087']
    },
    {
      id: 'DEB-02',
      company: 'Victoria Nile Hydro Consortium',
      contactPerson: 'Eng. Patrick Lubega',
      phone: '+256 752 901234',
      email: 'parts@vn-hydro.org',
      totalDue: 2600, // Emergency delivery balance
      creditLimit: 75000,
      oldestInvoiceDate: 'Aug 24, 2026',
      daysOutstanding: 11,
      agingCategory: 'Current',
      activeOrders: ['ORD-2026-088']
    },
    {
      id: 'DEB-03',
      company: 'Roko Construction & Civils Ltd',
      contactPerson: 'Eng. Charles Okello',
      phone: '+256 772 491032',
      email: 'fleet@roko-construction.ug',
      totalDue: 7006, // INQ-9485 conversion
      creditLimit: 100000,
      oldestInvoiceDate: 'Aug 14, 2026',
      daysOutstanding: 21,
      agingCategory: 'Current',
      activeOrders: ['ORD-2026-085']
    },
    {
      id: 'DEB-04',
      company: 'Sahara Quarry & Aggregates Ltd',
      contactPerson: 'Tariq Al-Mansoor',
      phone: '+256 788 330192',
      email: 'orders@saharaquarry.com',
      totalDue: 4500, // Partial excavator seal overhaul balance
      creditLimit: 40000,
      oldestInvoiceDate: 'Jul 28, 2026',
      daysOutstanding: 38,
      agingCategory: '31-60 Days',
      activeOrders: ['ORD-2026-081']
    }
  ];

  // Calculations
  const totalReceivables = debtorClients.reduce((sum, d) => sum + d.totalDue, 0);
  const currentBucket = debtorClients.filter(d => d.agingCategory === 'Current').reduce((sum, d) => sum + d.totalDue, 0);
  const overdue30Bucket = debtorClients.filter(d => d.agingCategory === '31-60 Days').reduce((sum, d) => sum + d.totalDue, 0);
  const overdue60Bucket = debtorClients.filter(d => d.agingCategory === '61-90 Days').reduce((sum, d) => sum + d.totalDue, 0);
  const overdue90Bucket = debtorClients.filter(d => d.agingCategory === '90+ Days').reduce((sum, d) => sum + d.totalDue, 0);

  const filteredDebtors = debtorClients.filter(d => {
    if (selectedAgingFilter === 'all') return true;
    return d.agingCategory.toLowerCase().replace(/\s+/g, '-') === selectedAgingFilter;
  });

  const handleSendStatementReminder = (client: DebtorRecord) => {
    setReminderSentClient(client.id);
    setFlashMessage('success', `Official Statement & Payment Reminder dispatched to ${client.email}`);
    setTimeout(() => setReminderSentClient(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & DSO Velocity */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900">
              Accounts Receivable (A/R)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Commercial Credit Ledger & Debt Aging
            </span>
          </div>
          <h2 className="text-xl font-black text-[#111111] tracking-tight">
            Corporate Client Credit & Collections
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track uncollected trade credit extended to authorized mining corporations, contractors, and fleet operators.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Avg Collection Velocity</span>
            <span className="text-lg font-black text-[#111111] font-mono">16.4 Days DSO</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#22A06B] flex items-center justify-center font-black text-xs">
            ✓
          </div>
        </div>
      </div>

      {/* Aging Analysis Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Current (< 30 Days) */}
        <div 
          onClick={() => setSelectedAgingFilter(selectedAgingFilter === 'current' ? 'all' : 'current')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            selectedAgingFilter === 'current' 
              ? 'bg-[#111111] text-white border-[#111111] shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${selectedAgingFilter === 'current' ? 'text-[#F6AF31]' : 'text-slate-500'}`}>
              Current (&lt; 30 Days)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-black font-mono">
            {formatMoney(currentBucket)}
          </div>
          <div className={`text-[11px] mt-1 ${selectedAgingFilter === 'current' ? 'text-slate-300' : 'text-slate-500'}`}>
            Within standard commercial terms
          </div>
        </div>

        {/* 31-60 Days */}
        <div 
          onClick={() => setSelectedAgingFilter(selectedAgingFilter === '31-60-days' ? 'all' : '31-60-days')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            selectedAgingFilter === '31-60-days' 
              ? 'bg-[#111111] text-white border-[#111111] shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${selectedAgingFilter === '31-60-days' ? 'text-[#F6AF31]' : 'text-amber-700'}`}>
              31 - 60 Days Due
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl font-black font-mono text-amber-600">
            {formatMoney(overdue30Bucket)}
          </div>
          <div className={`text-[11px] mt-1 ${selectedAgingFilter === '31-60-days' ? 'text-slate-300' : 'text-slate-500'}`}>
            Follow-up statement required
          </div>
        </div>

        {/* 61-90 Days */}
        <div 
          onClick={() => setSelectedAgingFilter(selectedAgingFilter === '61-90-days' ? 'all' : '61-90-days')}
          className={`p-4 rounded-3xl border transition cursor-pointer ${
            selectedAgingFilter === '61-90-days' 
              ? 'bg-[#111111] text-white border-[#111111] shadow-md' 
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-black uppercase tracking-wider ${selectedAgingFilter === '61-90-days' ? 'text-[#F6AF31]' : 'text-rose-700'}`}>
              61 - 90 Days Overdue
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-xl font-black font-mono text-rose-600">
            {formatMoney(overdue60Bucket)}
          </div>
          <div className={`text-[11px] mt-1 ${selectedAgingFilter === '61-90-days' ? 'text-slate-300' : 'text-slate-500'}`}>
            Hold further parts dispatch
          </div>
        </div>

        {/* Total Outstanding */}
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 text-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total Trade Receivables
            </span>
            <span className="text-xs font-bold text-slate-600 font-mono">{debtorClients.length} Clients</span>
          </div>
          <div className="text-xl font-black font-mono text-[#111111]">
            {formatMoney(totalReceivables)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gross ledger outstanding
          </div>
        </div>

      </div>

      {/* Debtors List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#111111] uppercase tracking-tight">
            Commercial Client Credit Balances & Aging
          </h3>
          {selectedAgingFilter !== 'all' && (
            <button
              onClick={() => setSelectedAgingFilter('all')}
              className="text-xs text-slate-500 hover:text-[#111111] underline cursor-pointer"
            >
              Clear filter ({selectedAgingFilter})
            </button>
          )}
        </div>

        {/* Debtors List - Mobile Card View */}
        <div className="block md:hidden divide-y divide-slate-100 p-4">
          {filteredDebtors.map(debtor => {
            const utilPercent = ((debtor.totalDue / debtor.creditLimit) * 100).toFixed(0);
            return (
              <div key={debtor.id} className="py-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-black text-[#111111] text-xs">
                    {debtor.company}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    debtor.agingCategory === 'Current'
                      ? 'bg-emerald-50 text-[#22A06B] border border-emerald-200'
                      : debtor.agingCategory === '31-60 Days'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {debtor.agingCategory} ({debtor.daysOutstanding}d)
                  </span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Contact: <span className="font-bold text-slate-800">{debtor.contactPerson}</span> • {debtor.phone}
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Credit Limit</div>
                    <div className="font-mono text-slate-700">{formatMoney(debtor.creditLimit)} ({utilPercent}%)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Outstanding Due</div>
                    <div className="font-mono font-black text-[#111111] text-sm">{formatMoney(debtor.totalDue)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Oldest: {debtor.oldestInvoiceDate}</span>
                  <button
                    onClick={() => handleSendStatementReminder(debtor)}
                    disabled={reminderSentClient === debtor.id}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer ${
                      reminderSentClient === debtor.id
                        ? 'bg-[#22A06B] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {reminderSentClient === debtor.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-slate-600" />
                        <span>Send Statement</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Debtors List Table - Desktop */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Client / Corporation</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4 text-center">Aging Bucket</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-right">Outstanding Due</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredDebtors.map(debtor => {
                const utilPercent = ((debtor.totalDue / debtor.creditLimit) * 100).toFixed(0);
                const isOverdue = debtor.agingCategory !== 'Current';

                return (
                  <tr key={debtor.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <div className="font-black text-[#111111] text-xs">
                        {debtor.company}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Invoices: {debtor.activeOrders.join(', ')} • Oldest: {debtor.oldestInvoiceDate}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-bold text-slate-800">{debtor.contactPerson}</div>
                      <div className="font-mono text-[11px] text-slate-500">{debtor.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        debtor.agingCategory === 'Current'
                          ? 'bg-emerald-50 text-[#22A06B] border border-emerald-200'
                          : debtor.agingCategory === '31-60 Days'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {debtor.agingCategory} ({debtor.daysOutstanding}d)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      <div>{formatMoney(debtor.creditLimit)}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{utilPercent}% used</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#111111]">
                      {formatMoney(debtor.totalDue)}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => handleSendStatementReminder(debtor)}
                        disabled={reminderSentClient === debtor.id}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer ${
                          reminderSentClient === debtor.id
                            ? 'bg-[#22A06B] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {reminderSentClient === debtor.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reminder Sent!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-slate-600" />
                            <span>Send Statement</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
