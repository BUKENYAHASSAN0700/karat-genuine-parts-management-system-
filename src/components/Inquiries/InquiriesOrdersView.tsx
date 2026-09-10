import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Truck, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building, 
  Phone, 
  Eye, 
  Trash2, 
  ShoppingCart, 
  ShieldAlert,
  ChevronRight,
  UserCheck,
  Check,
  RefreshCw,
  SlidersHorizontal,
  FileCheck2,
  Package
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { InquiryItem, CommercialOrder } from '../../types';
import { QuotationModal } from './QuotationModal';
import { DeliveryNoteModal } from './DeliveryNoteModal';
import { NewInquiryModal } from './NewInquiryModal';
import { NewOrderModal } from './NewOrderModal';

export const InquiriesOrdersView: React.FC = () => {
  const { 
    inquiries, 
    orders, 
    formatMoney, 
    updateInquiryStatus, 
    updateOrderStatus, 
    deleteInquiry, 
    deleteOrder, 
    convertInquiryToOrder,
    startSaleWithPart,
    parts
  } = useInertia();

  // Active view tab: inquiries or orders
  const [activeTab, setActiveTab] = useState<'inquiries' | 'orders'>('inquiries');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal states
  const [selectedInquiryForQuote, setSelectedInquiryForQuote] = useState<InquiryItem | null>(null);
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<CommercialOrder | null>(null);
  const [isNewInquiryOpen, setIsNewInquiryOpen] = useState(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Metrics
  const totalInquiryPipeline = useMemo(() => {
    return inquiries
      .filter(i => i.status !== 'Declined')
      .reduce((acc, curr) => acc + (curr.quoted_amount || 0), 0);
  }, [inquiries]);

  const totalOrdersValue = useMemo(() => {
    return orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  }, [orders]);

  const machineDownInquiriesCount = useMemo(() => {
    return inquiries.filter(i => i.priority?.includes('Critical')).length;
  }, [inquiries]);

  const pendingDispatchesCount = useMemo(() => {
    return orders.filter(o => o.fulfillment_status === 'Ready for Dispatch' || o.fulfillment_status === 'Processing & Packing').length;
  }, [orders]);

  // Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.customer_name.toLowerCase().includes(q) ||
        (item.customer_company && item.customer_company.toLowerCase().includes(q)) ||
        item.equipment_model.toLowerCase().includes(q) ||
        item.parts_requested.toLowerCase().includes(q) ||
        (item.delivery_site && item.delivery_site.toLowerCase().includes(q));

      const matchesStatus = 
        inquiryStatusFilter === 'all' || 
        item.status === inquiryStatusFilter;

      const matchesPriority = 
        priorityFilter === 'all' || 
        item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [inquiries, searchQuery, inquiryStatusFilter, priorityFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.po_reference && order.po_reference.toLowerCase().includes(q)) ||
        order.customer_name.toLowerCase().includes(q) ||
        (order.customer_company && order.customer_company.toLowerCase().includes(q)) ||
        order.equipment_model.toLowerCase().includes(q) ||
        order.delivery_site.toLowerCase().includes(q) ||
        (order.driver_name && order.driver_name.toLowerCase().includes(q)) ||
        (order.items && order.items.some(it => it.name.toLowerCase().includes(q) || (it.part_number && it.part_number.toLowerCase().includes(q))));

      const matchesStatus = 
        orderStatusFilter === 'all' || 
        order.fulfillment_status === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, orderStatusFilter]);

  // Quick action: Send inquiry line items to sales register
  const handleTransferToPOS = (inquiry: InquiryItem) => {
    if (inquiry.items && inquiry.items.length > 0) {
      const firstItem = inquiry.items[0];
      const matchInStock = parts.find(p => p.id === firstItem.part_id || p.part_number === firstItem.part_number);
      if (matchInStock) {
        startSaleWithPart(matchInStock);
        return;
      }
    }
    // Fallback: pick first available catalog item
    if (parts.length > 0) {
      startSaleWithPart(parts[0]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & KPI Snapshot */}
      <div className="bg-[#111111] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F6AF31] text-[#111111] text-[10px] font-black uppercase tracking-wider">
                Commercial Operations
              </span>
              {machineDownInquiriesCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#DC2626] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{machineDownInquiriesCount} Machine-Down Emergency</span>
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Inquiries & Commercial Orders
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track customer RFQs, engineer quotation dispatch, equipment pro-forma slips, and field delivery fulfillment across contractor fleets.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 sm:p-4 rounded-2xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active RFQs Pipeline
              </div>
              <div className="text-lg sm:text-xl font-mono font-black text-[#F6AF31] mt-0.5">
                {formatMoney(totalInquiryPipeline)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {inquiries.length} registered inquiries
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xs border border-white/10 p-3 sm:p-4 rounded-2xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Confirmed Orders Value
              </div>
              <div className="text-lg sm:text-xl font-mono font-black text-[#22A06B] mt-0.5">
                {formatMoney(totalOrdersValue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {pendingDispatchesCount} pending dispatch
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Mode Tab Switcher & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-200/80 p-1.5 rounded-2xl w-full sm:w-fit flex-wrap sm:flex-nowrap gap-1">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'inquiries'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-slate-600 hover:text-[#111111]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#F6AF31]" />
            <span>Customer RFQs</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'inquiries' ? 'bg-[#F6AF31] text-[#111111]' : 'bg-slate-300 text-slate-700'
            }`}>
              {inquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-[#111111] shadow-sm'
                : 'text-slate-600 hover:text-[#111111]'
            }`}
          >
            <Truck className="w-4 h-4 text-[#22A06B]" />
            <span>Orders & Dispatch</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'orders' ? 'bg-[#22A06B] text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {orders.length}
            </span>
          </button>
        </div>

        {/* Create Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === 'inquiries' ? (
            <button
              onClick={() => setIsNewInquiryOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#111111] hover:bg-[#222222] text-white text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-[#F6AF31]" />
              <span>+ New RFQ / Quotation</span>
            </button>
          ) : (
            <button
              onClick={() => setIsNewOrderOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#22A06B] hover:bg-[#1b8055] text-white text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Commercial Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Sub-Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative grow max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'inquiries'
                ? "Search RFQs by customer, company, equipment, part, site..."
                : "Search orders by ID, PO reference, client, vehicle, site..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F6AF31] transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {activeTab === 'inquiries' ? (
            <>
              <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {['all', 'Draft', 'Sent', 'Approved', 'Converted to Order'].map(st => (
                <button
                  key={st}
                  onClick={() => setInquiryStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    inquiryStatusFilter === st
                      ? 'bg-[#111111] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Inquiries' : st}
                </button>
              ))}
            </>
          ) : (
            <>
              <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Fulfillment:
              </span>
              {['all', 'Processing & Packing', 'Ready for Dispatch', 'Dispatched / In Transit', 'Delivered & Signed'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === st
                      ? 'bg-[#22A06B] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Orders' : st}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION A: INQUIRIES & QUOTATIONS LIST */}
      {/* ========================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {filteredInquiries.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">No RFQs Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No customer inquiries match your current search query or filter. Try clearing filters or create a new quotation.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setInquiryStatusFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <div 
                key={inquiry.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-4"
              >
                {/* Card Top Row: ID, Priority, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-sm text-[#111111] bg-slate-100 px-2.5 py-1 rounded-lg">
                      {inquiry.id}
                    </span>

                    {inquiry.priority && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        inquiry.priority.includes('Critical')
                          ? 'bg-[#DC2626] text-white animate-pulse'
                          : inquiry.priority.includes('Urgent')
                          ? 'bg-[#F6AF31] text-[#111111]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {inquiry.priority.includes('Critical') && <AlertTriangle className="w-3 h-3" />}
                        <span>{inquiry.priority}</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{inquiry.created_at}</span>
                    </span>

                    {inquiry.validity_period && (
                      <span className="text-[11px] text-slate-500">
                        • Valid: <span className="font-medium text-[#111111]">{inquiry.validity_period}</span>
                      </span>
                    )}
                  </div>

                  {/* Status Dropdown / Badge */}
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Status:</label>
                    <select
                      value={inquiry.status}
                      onChange={e => updateInquiryStatus(inquiry.id, e.target.value as any)}
                      className={`text-xs font-extrabold px-3 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                        inquiry.status === 'Approved'
                          ? 'bg-emerald-50 text-[#22A06B] border-emerald-200'
                          : inquiry.status === 'Converted to Order'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : inquiry.status === 'Sent'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : inquiry.status === 'Declined'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent to Client</option>
                      <option value="Approved">Approved by Contractor</option>
                      <option value="Converted to Order">Converted to Order</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </div>
                </div>

                {/* Card Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Customer Info */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Customer / Fleet Account
                    </div>
                    <div className="font-black text-sm text-[#111111]">
                      {inquiry.customer_name}
                    </div>
                    {inquiry.customer_company && (
                      <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inquiry.customer_company}</span>
                      </div>
                    )}
                    {inquiry.customer_phone && (
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inquiry.customer_phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Machinery & Site */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Target Equipment & Site
                    </div>
                    <div className="font-bold text-xs text-[#111111]">
                      {inquiry.equipment_model}
                    </div>
                    {inquiry.equipment_serial && (
                      <div className="font-mono text-[11px] text-slate-500">
                        VIN: {inquiry.equipment_serial}
                      </div>
                    )}
                    {inquiry.delivery_site && (
                      <div className="text-xs text-slate-600">
                        Site: <span className="font-medium text-slate-800">{inquiry.delivery_site}</span>
                      </div>
                    )}
                  </div>

                  {/* Quoted Valuation */}
                  <div className="md:col-span-4 flex flex-col justify-between sm:items-end">
                    <div className="sm:text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Quotation Value
                      </div>
                      <div className="text-xl font-mono font-black text-[#111111]">
                        {formatMoney(inquiry.quoted_amount)}
                      </div>
                      {inquiry.converted_order_id && (
                        <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1 sm:justify-end mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Order #{inquiry.converted_order_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requested Parts Line items list summary */}
                <div className="p-3 bg-[#F7F6F3] rounded-xl border border-slate-200/70 text-xs">
                  <span className="font-bold text-[#111111]">Quoted Parts: </span>
                  <span className="text-slate-700">{inquiry.parts_requested}</span>
                  {inquiry.notes && (
                    <div className="mt-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600">Notes:</span> {inquiry.notes}
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    {/* View / Print Quotation Button */}
                    <button
                      onClick={() => setSelectedInquiryForQuote(inquiry)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#F6AF31]" />
                      <span>View / Print Quotation</span>
                    </button>

                    {/* Transfer to sales register button */}
                    <button
                      onClick={() => handleTransferToPOS(inquiry)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                      title="Load quotation items into sales register"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                      <span>Open in Sales</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Convert to Commercial Order Button */}
                    {inquiry.status !== 'Converted to Order' ? (
                      <button
                        onClick={() => convertInquiryToOrder(inquiry.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#22A06B] hover:bg-[#1b8055] text-white text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Convert to Order</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#22A06B] flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-xl">
                        <Check className="w-3.5 h-3.5" />
                        <span>Converted</span>
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => deleteInquiry(inquiry.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Delete Inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION B: COMMERCIAL ORDERS & DISPATCH LIST */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">No Commercial Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No orders match your filter criteria. Convert an approved quotation above or log a direct commercial order.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setOrderStatusFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-4"
              >
                {/* Order Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-sm text-[#111111] bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.id}
                    </span>

                    {order.po_reference && (
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        {order.po_reference}
                      </span>
                    )}

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{order.date}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      {order.delivery_method}
                    </span>
                  </div>

                  {/* Dual Status Selectors: Payment + Fulfillment */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Payment status badge */}
                    <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                      order.payment_status === 'Paid in Full'
                        ? 'bg-emerald-50 text-[#22A06B] border border-emerald-200'
                        : order.payment_status?.includes('Partial')
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {order.payment_status}
                    </span>

                    {/* Fulfillment stage selector */}
                    <select
                      value={order.fulfillment_status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                      className={`text-xs font-black px-3 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                        order.fulfillment_status === 'Delivered & Signed'
                          ? 'bg-emerald-50 text-[#22A06B] border-emerald-200'
                          : order.fulfillment_status === 'Dispatched / In Transit'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : order.fulfillment_status === 'Ready for Dispatch'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="Processing & Packing">Processing & Packing</option>
                      <option value="Ready for Dispatch">Ready for Dispatch</option>
                      <option value="Dispatched / In Transit">Dispatched / In Transit</option>
                      <option value="Delivered & Signed">Delivered & Signed</option>
                      <option value="Awaiting OEM Restock">Awaiting OEM Restock</option>
                    </select>
                  </div>
                </div>

                {/* Main Order Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Client & Destination */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Consignee / Delivering To
                    </div>
                    <div className="font-black text-sm text-[#111111]">
                      {order.customer_name}
                    </div>
                    {order.customer_company && (
                      <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.customer_company}</span>
                      </div>
                    )}
                    <div className="text-xs text-slate-600">
                      Site: <span className="font-medium text-slate-800">{order.delivery_site}</span>
                    </div>
                  </div>

                  {/* Logistics Driver & Machine */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Fleet Equipment & Transport
                    </div>
                    <div className="font-bold text-xs text-[#111111]">
                      {order.equipment_model}
                    </div>
                    {order.driver_name && (
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.driver_name} {order.vehicle_reg && `(${order.vehicle_reg})`}</span>
                      </div>
                    )}
                    {order.estimated_delivery && (
                      <div className="text-xs text-slate-500">
                        ETA: <span className="font-medium text-[#111111]">{order.estimated_delivery}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Total */}
                  <div className="md:col-span-4 flex flex-col justify-between sm:items-end">
                    <div className="sm:text-right">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Total Order Amount
                      </div>
                      <div className="text-xl font-mono font-black text-[#22A06B]">
                        {formatMoney(order.total_amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {order.items.length} line item(s) confirmed
                      </div>
                    </div>
                  </div>
                </div>

                {/* Itemized Order Parts Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs bg-[#F7F6F3]">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3">Part # / Model</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {order.items.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-[#111111]">{item.name}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                            {item.part_number} {item.oem_number && `• ${item.oem_number}`}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {formatMoney(item.unit_price)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-[#111111]">
                            {formatMoney(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    {/* Print Official Goods Delivery Note (GDN) */}
                    <button
                      onClick={() => setSelectedOrderForDelivery(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#22A06B]" />
                      <span>Print Delivery Note (GDN)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.fulfillment_status !== 'Delivered & Signed' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Delivered & Signed')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#22A06B] hover:bg-[#1b8055] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Endorse Site Delivery</span>
                      </button>
                    )}

                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Delete Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* MODALS */}
      <QuotationModal
        inquiry={selectedInquiryForQuote}
        isOpen={Boolean(selectedInquiryForQuote)}
        onClose={() => setSelectedInquiryForQuote(null)}
        onConvertToOrder={convertInquiryToOrder}
      />

      <DeliveryNoteModal
        order={selectedOrderForDelivery}
        isOpen={Boolean(selectedOrderForDelivery)}
        onClose={() => setSelectedOrderForDelivery(null)}
        onUpdateStatus={(orderId, st) => updateOrderStatus(orderId, st)}
      />

      <NewInquiryModal
        isOpen={isNewInquiryOpen}
        onClose={() => setIsNewInquiryOpen(false)}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />

    </div>
  );
};
