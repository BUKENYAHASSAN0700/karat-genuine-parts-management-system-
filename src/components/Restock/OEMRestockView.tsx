import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Truck, 
  Plane, 
  Ship, 
  Building, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Printer, 
  PackageCheck, 
  ArrowRight, 
  ShieldCheck, 
  Trash2, 
  ExternalLink, 
  Copy, 
  ChevronDown, 
  Filter, 
  Layers, 
  ArrowUpRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { OEMPurchaseOrder, OEMSupplier, SparePart } from '../../types';
import { OEMPurchaseOrderModal } from './OEMPurchaseOrderModal';
import { GoodsReceivedNoteModal } from './GoodsReceivedNoteModal';
import { OEMSuppliersModal } from './OEMSuppliersModal';
import { NewOEMPurchaseOrderModal } from './NewOEMPurchaseOrderModal';

export const OEMRestockView: React.FC = () => {
  const { 
    oemOrders, 
    suppliers, 
    parts, 
    formatMoney, 
    updateOEMOrderStatus, 
    receiveOEMOrderShipment, 
    deleteOEMOrder 
  } = useInertia();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  // Modals state
  const [selectedPOForDoc, setSelectedPOForDoc] = useState<OEMPurchaseOrder | null>(null);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);

  const [selectedPOForGRN, setSelectedPOForGRN] = useState<OEMPurchaseOrder | null>(null);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);

  const [isSuppliersModalOpen, setIsSuppliersModalOpen] = useState(false);
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [preSelectedSupplier, setPreSelectedSupplier] = useState<OEMSupplier | null>(null);
  const [preSelectedParts, setPreSelectedParts] = useState<SparePart[] | null>(null);

  // Copy tracking feedback state
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Critical Low Stock Parts in catalog needing OEM replenishment
  const lowStockParts = useMemo(() => {
    return parts.filter(p => p.stock_quantity <= p.min_stock_alert);
  }, [parts]);

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    const activeOrders = oemOrders.filter(o => o.status !== 'Received & Stocked' && o.status !== 'Cancelled');
    const totalPipelineValue = activeOrders.reduce((sum, o) => sum + (o.total_cost || 0), 0);
    const inTransitCount = oemOrders.filter(o => o.status === 'In Transit').length;
    const receivingBayCount = oemOrders.filter(o => o.status === 'At Receiving Bay').length;
    const customsCount = oemOrders.filter(o => o.status === 'Customs Clearance').length;
    const receivedCount = oemOrders.filter(o => o.status === 'Received & Stocked').length;

    return {
      activeCount: activeOrders.length,
      totalPipelineValue,
      inTransitCount,
      receivingBayCount,
      customsCount,
      receivedCount,
    };
  }, [oemOrders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return oemOrders.filter(order => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        order.id.toLowerCase().includes(q) ||
        order.supplier_name.toLowerCase().includes(q) ||
        order.supplier_brand.toLowerCase().includes(q) ||
        (order.tracking_number && order.tracking_number.toLowerCase().includes(q)) ||
        order.port_of_loading.toLowerCase().includes(q) ||
        order.port_of_discharge.toLowerCase().includes(q) ||
        order.items.some(it => 
          it.name.toLowerCase().includes(q) || 
          it.part_number.toLowerCase().includes(q) ||
          (it.oem_number && it.oem_number.toLowerCase().includes(q))
        );

      const matchesStatus = 
        statusFilter === 'all' || 
        order.status.toLowerCase().replace(/\s+/g, '-') === statusFilter;

      const matchesBrand = 
        brandFilter === 'all' || 
        order.supplier_brand.toLowerCase() === brandFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesBrand;
    });
  }, [oemOrders, searchTerm, statusFilter, brandFilter]);

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const handleOpenNewPOWithSupplier = (supplier: OEMSupplier) => {
    setPreSelectedSupplier(supplier);
    setPreSelectedParts(null);
    setIsNewPOModalOpen(true);
  };

  const handleAutoRestockShortages = () => {
    if (lowStockParts.length === 0) return;
    setPreSelectedParts(lowStockParts);
    setPreSelectedSupplier(null);
    setIsNewPOModalOpen(true);
  };

  const handleReceiveStock = (order: OEMPurchaseOrder) => {
    receiveOEMOrderShipment(order.id);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F6AF31] text-[#111111]">
              OEM Global Supply Chain
            </span>
            <span className="text-xs text-slate-400 font-mono font-medium">
              Kampala Depot • Yard 4 Nakawa Ingest
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            OEM Restock & International Procurement
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage factory-direct purchase orders, international air & ocean freight consignments, customs clearing, and real-time inventory shelf ingest.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsSuppliersModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl flex items-center gap-2 transition cursor-pointer border border-slate-200"
          >
            <Building className="w-4 h-4 text-slate-600" />
            <span>OEM Supplier Directory</span>
            <span className="px-1.5 py-0.5 bg-white rounded-md text-[10px] font-black text-slate-600 border border-slate-200">
              {suppliers.length}
            </span>
          </button>

          {lowStockParts.length > 0 && (
            <button
              onClick={handleAutoRestockShortages}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-2xl flex items-center gap-1.5 transition cursor-pointer border border-rose-200 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Restock Shortages ({lowStockParts.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              setPreSelectedSupplier(null);
              setPreSelectedParts(null);
              setIsNewPOModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Issue OEM Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pipeline Value */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inbound Pipeline Value</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#F6AF31]">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#111111] font-mono">
            {formatMoney(stats.totalPipelineValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="font-bold text-[#111111]">{stats.activeCount} active consignments</span>
            <span>en route from Europe & Asia</span>
          </div>
        </div>

        {/* In Transit */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Air & Ocean Freight</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 font-mono">
            {stats.inTransitCount} In Transit
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span>Airway Bills & B/L active with carriers</span>
          </div>
        </div>

        {/* Customs & Receiving Bay */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">At Receiving Bay</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 font-mono">
            {stats.receivingBayCount} Consignments
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-purple-600 font-bold">Ready for inspection</span>
            <span>& shelf ingest at Dock 3</span>
          </div>
        </div>

        {/* Inventory Shortages */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Shortages</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {lowStockParts.length} Critical Parts
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-rose-600 font-semibold">At or below reorder threshold</span>
          </div>
        </div>

      </div>

      {/* Critical Low Stock Replenishment Alert Banner */}
      {lowStockParts.length > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <AlertTriangle className="w-5 h-5 text-black font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#111111] uppercase tracking-tight">
                  Automated Stock Replenishment Detection
                </h3>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-full uppercase">
                  {lowStockParts.length} Critical Deficits
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                The following components are exhausted or beneath safety stock levels: {' '}
                {lowStockParts.slice(0, 3).map((p, idx) => (
                  <span key={p.id} className="font-bold text-[#111111]">
                    {p.name} ({p.stock_quantity} left){idx < Math.min(2, lowStockParts.length - 1) ? ', ' : ''}
                  </span>
                ))}
                {lowStockParts.length > 3 && ` and ${lowStockParts.length - 3} others`}.
              </p>
            </div>
          </div>

          <button
            onClick={handleAutoRestockShortages}
            className="px-5 py-2.5 bg-[#111111] hover:bg-black text-white font-black text-xs rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#F6AF31]" />
            <span>Generate OEM Restock PO for Shortages</span>
          </button>
        </div>
      )}

      {/* Filters Bar & Search */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search PO #, supplier, part number, AWB tracking, or port..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31] font-medium text-slate-800"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'All Shipments', count: oemOrders.length },
            { id: 'in-transit', label: 'In Transit', count: oemOrders.filter(o => o.status === 'In Transit').length },
            { id: 'customs-clearance', label: 'Customs', count: oemOrders.filter(o => o.status === 'Customs Clearance').length },
            { id: 'at-receiving-bay', label: 'Receiving Bay', count: oemOrders.filter(o => o.status === 'At Receiving Bay').length },
            { id: 'received-&-stocked', label: 'Stocked (GRN)', count: oemOrders.filter(o => o.status === 'Received & Stocked').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* OEM Purchase Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => {
          const isStocked = order.status === 'Received & Stocked';
          const isAtBay = order.status === 'At Receiving Bay';
          const isCustoms = order.status === 'Customs Clearance';
          const isInTransit = order.status === 'In Transit';

          return (
            <div 
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    PO
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-[#111111]">
                        {order.id}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-bold text-slate-700">
                        {order.order_date}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
                        {order.supplier_brand}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="font-black text-[#111111]">{order.supplier_name}</span>
                      {order.supplier_country && (
                        <span className="text-slate-500">({order.supplier_country})</span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">Incoterm: <strong className="text-slate-800">{order.incoterm}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Status & ETA */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Target ETA</div>
                    <div className="text-xs font-black text-[#111111] flex items-center gap-1 justify-end">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{order.eta}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={order.status}
                    onChange={e => updateOEMOrderStatus(order.id, e.target.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer border shadow-xs focus:outline-none ${
                      isStocked
                        ? 'bg-[#22A06B] text-white border-emerald-600'
                        : isAtBay
                        ? 'bg-amber-400 text-black border-amber-500'
                        : isCustoms
                        ? 'bg-purple-600 text-white border-purple-700'
                        : isInTransit
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-slate-700 text-white border-slate-800'
                    }`}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Confirmed & Placed">Confirmed & Placed</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Customs Clearance">Customs Clearance</option>
                    <option value="At Receiving Bay">At Receiving Bay</option>
                    <option value="Received & Stocked">Received & Stocked</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Logistics & Tracking Bar */}
              <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-1.5 font-medium">
                    {order.shipping_method.includes('Ocean') ? (
                      <Ship className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Plane className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{order.shipping_method}</span>
                  </div>

                  {order.carrier && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Carrier:</span>
                      <strong className="text-slate-800">{order.carrier}</strong>
                    </div>
                  )}

                  {order.tracking_number && (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <span className="text-slate-500 font-mono text-[11px]">AWB:</span>
                      <strong className="font-mono text-slate-800 text-[11px]">{order.tracking_number}</strong>
                      <button
                        onClick={() => handleCopyTracking(order.tracking_number || '')}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                        title="Copy tracking number"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {copiedTracking === order.tracking_number && (
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.port_of_loading}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-700">{order.port_of_discharge}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">PO Total:</span>
                    <span className="text-base font-black text-[#111111] font-mono">
                      {formatMoney(order.total_cost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items - Mobile Card View */}
              <div className="p-4 block md:hidden space-y-2.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-[11px] text-[#111111] bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.part_number}
                      </span>
                      <span className="font-mono font-black text-xs text-[#111111]">
                        {item.quantity_ordered} Units
                      </span>
                    </div>

                    <div className="font-bold text-[#111111]">{item.name}</div>
                    {item.oem_number && (
                      <div className="text-[10px] text-slate-400 font-mono">OEM: {item.oem_number}</div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Bin: {item.target_bin || 'Yard 4 Ingest'}</span>
                      <span className="font-mono font-bold text-[#111111]">{formatMoney(item.total_cost)}</span>
                    </div>
                  </div>
                ))}

                {order.notes && (
                  <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">Consignment Notes:</span> {order.notes}
                  </div>
                )}
              </div>

              {/* Line Items Table Preview - Desktop */}
              <div className="p-5 hidden md:block">
                <div className="rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Part Description</th>
                        <th className="py-2.5 px-3">Part # / OEM</th>
                        <th className="py-2.5 px-3 text-center">Allocated Bin</th>
                        <th className="py-2.5 px-3 text-center">Qty Ordered</th>
                        <th className="py-2.5 px-3 text-center">Status Ingest</th>
                        <th className="py-2.5 px-3 text-right">Unit FOB</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-bold text-[#111111]">
                            {item.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 font-bold">
                            {item.part_number}
                            {item.oem_number && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                OEM: {item.oem_number}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                            {item.target_bin || 'Yard 4 Ingest'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-[#111111]">
                            {item.quantity_ordered}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isStocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22A06B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Shelved ({item.quantity_received || item.quantity_ordered})</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Inbound
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            {formatMoney(item.unit_cost)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-[#111111]">
                            {formatMoney(item.total_cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {order.notes && (
                  <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-700">Consignment Notes:</span> {order.notes}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Payment:</span>
                  <span className="text-xs font-bold text-slate-700 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                    {order.payment_terms} • {order.payment_status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  
                  {/* View Official PO Slip */}
                  <button
                    onClick={() => {
                      setSelectedPOForDoc(order);
                      setIsPOModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>View / Print OEM PO</span>
                  </button>

                  {/* Stock Receiving Action */}
                  {!isStocked ? (
                    <button
                      onClick={() => handleReceiveStock(order)}
                      className="px-4 py-2 bg-[#22A06B] hover:bg-[#1c8c5c] text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Receive Shipment & Update Stock</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPOForGRN(order);
                        setIsGRNModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#22A06B]" />
                      <span>Print GRN ({order.grn_number || 'GRN Slip'})</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete purchase order ${order.id}?`)) {
                        deleteOEMOrder(order.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    title="Delete PO"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Truck className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-[#111111]">
              No OEM Purchase Orders found
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No consignments matched your search or status filter. Click "Issue OEM Purchase Order" to create a new international consignment.
            </p>
            <button
              onClick={() => {
                setPreSelectedSupplier(null);
                setPreSelectedParts(null);
                setIsNewPOModalOpen(true);
              }}
              className="px-4 py-2 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New OEM PO</span>
            </button>
          </div>
        )}
      </div>

      {/* Official PO Printable Modal */}
      <OEMPurchaseOrderModal
        order={selectedPOForDoc}
        isOpen={isPOModalOpen}
        onClose={() => {
          setIsPOModalOpen(false);
          setSelectedPOForDoc(null);
        }}
      />

      {/* Goods Received Note (GRN) Printable Modal */}
      <GoodsReceivedNoteModal
        order={selectedPOForGRN}
        isOpen={isGRNModalOpen}
        onClose={() => {
          setIsGRNModalOpen(false);
          setSelectedPOForGRN(null);
        }}
      />

      {/* OEM Suppliers Directory Modal */}
      <OEMSuppliersModal
        isOpen={isSuppliersModalOpen}
        onClose={() => setIsSuppliersModalOpen(false)}
        onSelectSupplierForPO={handleOpenNewPOWithSupplier}
      />

      {/* New OEM Purchase Order Modal */}
      <NewOEMPurchaseOrderModal
        isOpen={isNewPOModalOpen}
        onClose={() => {
          setIsNewPOModalOpen(false);
          setPreSelectedSupplier(null);
          setPreSelectedParts(null);
        }}
        preSelectedSupplier={preSelectedSupplier}
        preSelectedParts={preSelectedParts}
      />

    </div>
  );
};
