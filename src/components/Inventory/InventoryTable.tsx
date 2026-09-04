import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Warehouse, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Minus, 
  Eye, 
  EyeOff,
  X, 
  Download, 
  RefreshCw,
  Tag,
  SlidersHorizontal,
  Info,
  Cpu,
  ShieldAlert,
  Copy,
  Check,
  FileSpreadsheet,
  UploadCloud,
  ShoppingCart
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { SparePart } from '../../types';
import { EditPartModal } from './EditPartModal';
import { BulkUploadModal } from './BulkUploadModal';

export interface InventoryTableProps {
  initialSearchQuery?: string;
  onAddNewPart?: () => void;
  showFilters?: boolean;
}

type SortField = 'name' | 'part_number' | 'stock_quantity' | 'unit_price' | 'brand' | 'category';
type SortOrder = 'asc' | 'desc';

export const InventoryTable: React.FC<InventoryTableProps> = ({ 
  initialSearchQuery = '',
  onAddNewPart,
  showFilters = true
}) => {
  const { parts, updatePartStock, deletePart, setAddModalOpen, currency, formatMoney, startSaleWithPart } = useInertia();

  // Bulk Upload Modal State
  const [bulkUploadOpen, setBulkUploadOpen] = useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('part_number');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Expanded Rows for Detailed Specifications
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  // OEM Code Reveal State (hidden by default)
  const [revealedOems, setRevealedOems] = useState<Record<string, boolean>>({});

  // Full Product Edit Modal State
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  // Quick Stock Step Modal
  const [stockEditPart, setStockEditPart] = useState<SparePart | null>(null);
  const [quickStockVal, setQuickStockVal] = useState<number>(0);

  // Selected Detail View Modal
  const [detailModalPart, setDetailModalPart] = useState<SparePart | null>(null);

  // Delete Confirmation Modal State
  const [deleteConfirmPart, setDeleteConfirmPart] = useState<SparePart | null>(null);

  // Copied OEM feedback state
  const [copiedOem, setCopiedOem] = useState<string | null>(null);

  // Unique Brands & Categories for filter dropdowns
  const brandOptions = useMemo(() => {
    const brands = Array.from(new Set(parts.map(p => p.brand)));
    return ['all', ...brands];
  }, [parts]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(parts.map(p => p.category)));
    return ['all', ...categories];
  }, [parts]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Toggle Row Expansion
  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle OEM Code Visibility for a specific part
  const toggleOemReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedOems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyOem = (oem: string) => {
    navigator.clipboard.writeText(oem);
    setCopiedOem(oem);
    setTimeout(() => setCopiedOem(null), 2000);
  };

  // Filter and Sort Logic
  const filteredAndSortedParts = useMemo(() => {
    return parts
      .filter(part => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
          part.name.toLowerCase().includes(q) ||
          part.part_number.toLowerCase().includes(q) ||
          part.id.toLowerCase().includes(q) ||
          part.oem_number.toLowerCase().includes(q) ||
          part.warehouse_bin.toLowerCase().includes(q) ||
          part.machinery_models.some(m => m.toLowerCase().includes(q)) ||
          part.brand.toLowerCase().includes(q) ||
          part.category.toLowerCase().includes(q)
        );

        const matchesBrand = selectedBrand === 'all' || part.brand === selectedBrand;
        const matchesCategory = selectedCategory === 'all' || part.category === selectedCategory;
        
        let matchesStatus = true;
        if (selectedStockStatus === 'low') {
          matchesStatus = part.status === 'Low Stock' || part.status === 'Out of Stock' || part.stock_quantity <= part.min_stock_alert;
        } else if (selectedStockStatus === 'in-stock') {
          matchesStatus = part.status === 'In Stock' && part.stock_quantity > part.min_stock_alert;
        } else if (selectedStockStatus === 'out-of-stock') {
          matchesStatus = part.status === 'Out of Stock' || part.stock_quantity === 0;
        } else if (selectedStockStatus === 'on-order') {
          matchesStatus = part.status === 'On Order';
        }

        return matchesSearch && matchesBrand && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [parts, searchQuery, selectedBrand, selectedCategory, selectedStockStatus, sortField, sortOrder]);

  // Metric aggregates
  const lowStockCount = parts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.stock_quantity <= p.min_stock_alert).length;
  const totalStockQuantity = parts.reduce((acc, p) => acc + p.stock_quantity, 0);
  const totalValuation = parts.reduce((acc, p) => acc + (p.stock_quantity * p.unit_price), 0);

  // Quick Inline Stock increment / decrement
  const handleQuickStepStock = (part: SparePart, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newQty = Math.max(0, part.stock_quantity + delta);
    updatePartStock(part.id, newQty);
  };

  // Quick Stock Modal Submit
  const handleSaveStockModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockEditPart) {
      updatePartStock(stockEditPart.id, quickStockVal);
      setStockEditPart(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Product ID', 'OEM Number', 'Name', 'Brand', 'Category', 'Stock Quantity', 'Min Alert', 'Warehouse Bin', 'Unit Cost USD', 'Unit Price USD', 'Status', 'Machinery Models'];
    const rows = filteredAndSortedParts.map(p => [
      `"${p.id || p.part_number}"`,
      `"${p.oem_number}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand}"`,
      `"${p.category}"`,
      p.stock_quantity,
      p.min_stock_alert,
      `"${p.warehouse_bin}"`,
      p.unit_cost,
      p.unit_price,
      `"${p.status}"`,
      `"${p.machinery_models.join(', ')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KARAT_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30 group-hover:opacity-70 transition" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#111111]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#111111]" />
    );
  };

  // Helper for brand badge style
  const getBrandBadge = (brand: string) => {
    switch (brand) {
      case 'Caterpillar':
        return 'bg-[#F6AF31]/20 text-[#111111] border-[#F6AF31]/50';
      case 'Komatsu':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Volvo':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Hitachi':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Hyundai':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Doosan':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-[#F7F6F3] text-[#111111] border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Control / Filter Bar */}
      {showFilters && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#111111]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search spare parts by ID (e.g. KA101), Name, OEM, Category, Location, Machinery..."
                className="w-full bg-[#F7F6F3] focus:bg-white border border-slate-200 focus:border-[#111111] rounded-xl pl-9 pr-8 py-2 text-xs text-[#111111] placeholder:text-[#111111]/40 outline-none transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#111111]/40 hover:text-[#111111]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-2 w-full lg:w-auto">
              {/* Brand Filter */}
              <div className="flex-1 min-w-[130px]">
                <select
                  value={selectedBrand}
                  onChange={e => setSelectedBrand(e.target.value)}
                  className="w-full bg-[#F7F6F3] hover:bg-slate-100/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] outline-none cursor-pointer"
                >
                  <option value="all">All OEM Brands</option>
                  {brandOptions.filter(b => b !== 'all').map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex-1 min-w-[130px]">
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#F7F6F3] hover:bg-slate-100/80 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categoryOptions.filter(c => c !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Stock Status Filter */}
              <div className="flex-1 min-w-[140px]">
                <select
                  value={selectedStockStatus}
                  onChange={e => setSelectedStockStatus(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer ${
                    selectedStockStatus === 'low'
                      ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/40'
                      : 'bg-[#F7F6F3] hover:bg-slate-100/80 text-[#111111] border-slate-200/90'
                  }`}
                >
                  <option value="all">All Stock Statuses</option>
                  <option value="low">⚠️ Low Stock ({lowStockCount})</option>
                  <option value="in-stock">✓ In Stock</option>
                  <option value="out-of-stock">✕ Out of Stock</option>
                  <option value="on-order">⏳ On Order</option>
                </select>
              </div>

              {/* CSV Export, Bulk Upload & Add Part Trigger */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto pt-1 sm:pt-0 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => setBulkUploadOpen(true)}
                  className="flex-1 sm:flex-none justify-center px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 flex items-center gap-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                  title="Bulk Upload / Import products via CSV or Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
                  <span className="truncate">Bulk Upload</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="p-2 sm:px-3 rounded-xl bg-[#F7F6F3] hover:bg-slate-200/80 text-[#111111] border border-slate-200/80 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
                  title="Export catalog as CSV spreadsheet"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddNewPart ? onAddNewPart() : setAddModalOpen(true)}
                  className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips & Result Counter */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-[#111111]/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#111111]">
                Showing {filteredAndSortedParts.length} of {parts.length} spare parts
              </span>

              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#111111] text-white font-semibold">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')} className="hover:text-[#F6AF31]">×</button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#111111] text-white font-semibold">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-[#F6AF31]">×</button>
                </span>
              )}

              {selectedStockStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DC2626] text-white font-semibold">
                  Filter: {selectedStockStatus}
                  <button onClick={() => setSelectedStockStatus('all')} className="hover:text-white/80">×</button>
                </span>
              )}

              {(searchQuery || selectedBrand !== 'all' || selectedCategory !== 'all' || selectedStockStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBrand('all');
                    setSelectedCategory('all');
                    setSelectedStockStatus('all');
                  }}
                  className="text-[#DC2626] font-bold hover:underline ml-1"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono">
              <span>Total Units: <strong>{totalStockQuantity}</strong></span>
              <span>Catalog Value: <strong className="text-[#111111]">{formatMoney(totalValuation)}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Inventory Table Component */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        {/* Mobile View: Touch-friendly cards, zero horizontal scrolling */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredAndSortedParts.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F6F3] text-[#111111]/40 flex items-center justify-center mx-auto">
                <Boxes className="w-6 h-6" />
              </div>
              <div className="font-extrabold text-sm text-[#111111]">
                No spare parts found
              </div>
              <p className="text-xs text-[#111111]/50">
                Try adjusting your search query or clearing filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('all');
                  setSelectedCategory('all');
                  setSelectedStockStatus('all');
                }}
                className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredAndSortedParts.map(part => {
              const isExpanded = !!expandedRows[part.id];
              const isLowStock = part.status === 'Low Stock' || part.status === 'Out of Stock' || part.stock_quantity <= part.min_stock_alert;
              const isOutOfStock = part.stock_quantity === 0 || part.status === 'Out of Stock';
              const isOemRevealed = !!revealedOems[part.id];
              const displayId = part.id || part.part_number;

              return (
                <div key={part.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition">
                  {/* Top: ID, Brand, Stock Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg bg-[#111111] text-[#F6AF31]">
                        {displayId}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBrandBadge(part.brand)}`}>
                        {part.brand}
                      </span>
                    </div>

                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${
                      part.status === 'In Stock'
                        ? 'bg-[#22A06B]/15 text-[#22A06B] border border-[#22A06B]/30'
                        : part.status === 'Low Stock'
                        ? 'bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30'
                        : part.status === 'Out of Stock'
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#F6AF31]/20 text-[#111111] border border-[#F6AF31]/40'
                    }`}>
                      {part.status}
                    </span>
                  </div>

                  {/* Name and Machinery Models */}
                  <div>
                    <h3 className="font-extrabold text-sm text-[#111111] leading-snug">
                      {part.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Fits: <span className="font-medium text-slate-700">{part.machinery_models.join(', ')}</span>
                    </div>
                  </div>

                  {/* OEM code & Warehouse Bin */}
                  <div className="flex items-center justify-between gap-2 text-xs bg-[#F7F6F3] p-2.5 rounded-xl border border-slate-200/70">
                    <div className="flex items-center gap-1 font-mono text-[11px]">
                      <span className="text-slate-400 font-bold">OEM:</span>
                      {isOemRevealed ? (
                        <span className="font-bold text-[#111111] bg-amber-100 px-1.5 py-0.5 rounded">{part.oem_number}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => toggleOemReveal(part.id, e)}
                          className="text-amber-700 underline font-semibold cursor-pointer"
                        >
                          Show OEM
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                      <Warehouse className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{part.warehouse_bin}</span>
                    </div>
                  </div>

                  {/* Stock Quantity Stepper & Price Row */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    {/* Price */}
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Unit Price</div>
                      <div className="font-mono font-black text-sm text-[#111111]">
                        {formatMoney(part.unit_price)}
                      </div>
                    </div>

                    {/* Stock stepper */}
                    <div className="flex items-center gap-1.5 bg-[#F7F6F3] p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={(e) => handleQuickStepStock(part, -1, e)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-[#111111] flex items-center justify-center font-bold text-xs shadow-xs transition cursor-pointer"
                        title="Decrease stock"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-black text-xs px-2 text-[#111111] min-w-[36px] text-center">
                        {part.stock_quantity}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickStepStock(part, 1, e)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-[#111111] flex items-center justify-center font-bold text-xs shadow-xs transition cursor-pointer"
                        title="Increase stock"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleRow(part.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-[#111111] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Details</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startSaleWithPart(part)}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-[#111111] hover:bg-black text-[#F6AF31] shadow-xs cursor-pointer'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Sell / POS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingPart(part)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="Edit part specifications"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmPart(part)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        title="Delete part"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Mobile Details */}
                  {isExpanded && (
                    <div className="pt-2 text-xs space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-slate-700 animate-in fade-in">
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-slate-400 block">Unit Cost:</span>
                          <span className="font-bold">{formatMoney(part.unit_cost)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Category:</span>
                          <span className="font-bold">{part.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Min Reorder Alert:</span>
                          <span className="font-bold">{part.min_stock_alert} units</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Estimated Margin:</span>
                          <span className="font-bold text-[#22A06B]">
                            {part.unit_price > 0 ? `${Math.round(((part.unit_price - part.unit_cost) / part.unit_price) * 100)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {part.description && (
                        <p className="text-[11px] text-slate-600 border-t border-slate-200/80 pt-2 leading-relaxed">
                          {part.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full data table */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead className="bg-[#F7F6F3] border-b border-slate-200 text-[#111111]/70 font-mono text-[11px] uppercase tracking-wider select-none">
              <tr>
                {/* Expander Column */}
                <th className="w-10 px-3 py-3.5 text-center">
                  <span className="sr-only">Details</span>
                </th>

                {/* Product ID Column */}
                <th 
                  onClick={() => handleSort('part_number')}
                  className="px-4 py-3.5 cursor-pointer hover:text-[#111111] transition group"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>Product ID</span>
                    {renderSortIndicator('part_number')}
                  </div>
                </th>

                {/* Name & Machinery Column */}
                <th 
                  onClick={() => handleSort('name')}
                  className="px-4 py-3.5 cursor-pointer hover:text-[#111111] transition group"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>Part Name & Specifications</span>
                    {renderSortIndicator('name')}
                  </div>
                </th>

                {/* Brand & Category Column */}
                <th 
                  onClick={() => handleSort('brand')}
                  className="px-4 py-3.5 cursor-pointer hover:text-[#111111] transition group"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>Brand & Category</span>
                    {renderSortIndicator('brand')}
                  </div>
                </th>

                {/* Stock Level & Bin Column */}
                <th 
                  onClick={() => handleSort('stock_quantity')}
                  className="px-4 py-3.5 cursor-pointer hover:text-[#111111] transition group"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>Stock Level & Location</span>
                    {renderSortIndicator('stock_quantity')}
                  </div>
                </th>

                {/* Unit Price Column */}
                <th 
                  onClick={() => handleSort('unit_price')}
                  className="px-4 py-3.5 cursor-pointer hover:text-[#111111] transition group"
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>Unit Price ({currency})</span>
                    {renderSortIndicator('unit_price')}
                  </div>
                </th>

                {/* Status Badge Column */}
                <th className="px-4 py-3.5 font-bold">
                  Status
                </th>

                {/* Actions Column */}
                <th className="px-5 py-3.5 text-right font-bold">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 px-4 bg-white">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F7F6F3] border border-slate-200 text-[#111111]/40 flex items-center justify-center mx-auto">
                        <Boxes className="w-6 h-6" />
                      </div>
                      <div className="font-extrabold text-sm text-[#111111]">
                        No spare parts found
                      </div>
                      <p className="text-xs text-[#111111]/50">
                        Try adjusting your search query, clearing filters, or register a new part into KARAT.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedBrand('all');
                          setSelectedCategory('all');
                          setSelectedStockStatus('all');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedParts.map(part => {
                  const isExpanded = !!expandedRows[part.id];
                  const isLowStock = part.status === 'Low Stock' || part.status === 'Out of Stock' || part.stock_quantity <= part.min_stock_alert;
                  const isOutOfStock = part.stock_quantity === 0 || part.status === 'Out of Stock';
                  const isOemRevealed = !!revealedOems[part.id];
                  const displayId = part.id || part.part_number;

                  return (
                    <React.Fragment key={part.id}>
                      <tr 
                        className={`transition-colors duration-150 cursor-pointer ${
                          isExpanded 
                            ? 'bg-amber-50/30' 
                            : isLowStock 
                            ? 'hover:bg-red-50/40' 
                            : 'hover:bg-[#F7F6F3]/70'
                        }`}
                        onClick={() => toggleRow(part.id)}
                      >
                        {/* Expander Arrow */}
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(part.id);
                            }}
                            className="w-6 h-6 rounded-lg bg-[#F7F6F3] hover:bg-slate-200 text-[#111111] flex items-center justify-center transition"
                            title={isExpanded ? 'Collapse row details' : 'Expand full product details'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>

                        {/* Product ID & Click-to-Reveal OEM Code */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-[#111111] text-[#F6AF31] tracking-wide">
                              {displayId}
                            </span>
                          </div>

                          {/* OEM Code: Hidden by default, revealed on click */}
                          <div className="mt-1">
                            {isOemRevealed ? (
                              <div className="text-[10px] text-[#111111] font-mono flex items-center gap-1 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/70 animate-in fade-in">
                                <span className="text-[#111111]/50 font-bold">OEM:</span>
                                <span className="font-bold">{part.oem_number}</span>
                                <button
                                  type="button"
                                  onClick={(e) => toggleOemReveal(part.id, e)}
                                  className="text-[#111111]/40 hover:text-[#111111] ml-0.5 p-0.5"
                                  title="Hide OEM Code"
                                >
                                  <EyeOff className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => toggleOemReveal(part.id, e)}
                                className="text-[10px] text-[#111111]/50 hover:text-[#111111] font-mono flex items-center gap-1 hover:underline transition"
                                title="Click to view OEM number"
                              >
                                <Eye className="w-2.5 h-2.5 text-[#111111]/40" />
                                <span>Show OEM</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Part Name & Compatible Models */}
                        <td className="px-4 py-3.5 min-w-[200px] max-w-sm">
                          <div className="font-extrabold text-xs text-[#111111] leading-snug">
                            {part.name}
                          </div>
                          <div className="text-[11px] text-[#111111]/50 truncate mt-0.5">
                            Fits: {part.machinery_models.join(', ')}
                          </div>
                        </td>

                        {/* Brand & Category */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBrandBadge(part.brand)}`}>
                              {part.brand}
                            </span>
                            <span className="text-[10px] text-[#111111]/60 font-semibold truncate">
                              {part.category}
                            </span>
                          </div>
                        </td>

                        {/* Stock Level & Bin Location */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="space-y-1">
                            {/* Stock Quantity & Stepper Controls */}
                            <div className="flex items-center gap-2">
                              <div className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono inline-flex items-center gap-1.5 whitespace-nowrap ${
                                isOutOfStock
                                  ? 'bg-[#DC2626] text-white shadow-2xs'
                                  : isLowStock
                                  ? 'bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30'
                                  : 'bg-[#22A06B]/15 text-[#22A06B] border border-[#22A06B]/30'
                              }`}>
                                {isOutOfStock ? (
                                  <span>0 Units</span>
                                ) : isLowStock ? (
                                  <>
                                    <AlertTriangle className="w-3 h-3 text-[#DC2626] shrink-0" />
                                    <span>{part.stock_quantity} Units</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-[#22A06B] shrink-0" />
                                    <span>{part.stock_quantity} in stock</span>
                                  </>
                                )}
                              </div>

                              {/* Quick Step +/- buttons */}
                              <div className="inline-flex items-center bg-[#F7F6F3] rounded-lg border border-slate-200/80 p-0.5">
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickStepStock(part, -1, e)}
                                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200 text-[#111111] transition"
                                  title="Decrease quantity by 1"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickStepStock(part, 1, e)}
                                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200 text-[#111111] transition"
                                  title="Increase quantity by 1"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>

                            {/* Warehouse Bin & Min threshold */}
                            <div className="flex items-center gap-2 text-[10px] text-[#111111]/50 font-mono whitespace-nowrap">
                              <span className="flex items-center gap-1" title={part.warehouse_bin}>
                                <Warehouse className="w-2.5 h-2.5 text-[#111111]/40 shrink-0" />
                                {part.warehouse_bin}
                              </span>
                              <span className="text-[#111111]/30">&bull;</span>
                              <span>Min: {part.min_stock_alert}</span>
                            </div>
                          </div>
                        </td>

                        {/* Price Column */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-mono font-black text-xs text-[#111111]">
                            {formatMoney(part.unit_price)}
                          </div>
                          <div className="text-[10px] text-[#111111]/50 font-mono mt-0.5">
                            Per unit
                          </div>
                        </td>

                        {/* Stock Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap min-w-[120px]">
                          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap ${
                            part.status === 'In Stock'
                              ? 'bg-[#22A06B]/15 text-[#22A06B] border border-[#22A06B]/30'
                              : part.status === 'Low Stock'
                              ? 'bg-[#DC2626]/15 text-[#DC2626] border border-[#DC2626]/30 font-extrabold'
                              : part.status === 'Out of Stock'
                              ? 'bg-[#DC2626] text-white font-extrabold shadow-2xs'
                              : 'bg-[#F6AF31]/20 text-[#111111] border border-[#F6AF31]/40 font-bold'
                          }`}>
                            {part.status}
                          </span>
                        </td>

                        {/* Row Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                            {/* Direct Sell in POS Button */}
                            <button
                              type="button"
                              onClick={() => startSaleWithPart(part)}
                              disabled={part.stock_quantity <= 0}
                              className="px-2.5 py-1 rounded-lg bg-[#F6AF31] hover:bg-[#e5a028] disabled:bg-slate-200 disabled:text-slate-400 text-[#111111] text-[11px] font-black flex items-center gap-1 transition shadow-2xs cursor-pointer disabled:cursor-not-allowed"
                              title={part.stock_quantity > 0 ? `Sell ${part.name} in POS terminal` : 'Part is out of stock'}
                            >
                              <ShoppingCart className="w-3 h-3 stroke-[2.5]" />
                              <span>Sell</span>
                            </button>

                            {/* Inspect Detail Button */}
                            <button
                              type="button"
                              onClick={() => setDetailModalPart(part)}
                              className="p-1.5 rounded-lg bg-[#F7F6F3] hover:bg-slate-200 text-[#111111] transition"
                              title="View full specification sheet"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Full Product Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditingPart(part)}
                              className="p-1.5 rounded-lg bg-[#F7F6F3] hover:bg-[#F6AF31]/30 text-[#111111] transition"
                              title="Edit full product information"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button (triggers confirmation dialog) */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmPart(part)}
                              className="p-1.5 rounded-lg bg-[#F7F6F3] hover:bg-rose-50 text-[#111111]/40 hover:text-[#DC2626] transition"
                              title="Delete part"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Row Content: Full Product Specifications Drawer */}
                      {isExpanded && (
                        <tr className="bg-amber-50/20 border-b border-slate-200">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-xs">
                              {/* Product ID & OEM Specifications */}
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold uppercase text-[#111111]/50 tracking-wider">
                                  Product & OEM Details
                                </div>
                                <div className="font-mono text-xs space-y-1">
                                  <div><span className="text-[#111111]/50">Product ID:</span> <strong className="text-[#111111] px-1.5 py-0.5 rounded bg-[#111111] text-[#F6AF31]">{displayId}</strong></div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[#111111]/50">OEM:</span>
                                    <strong className="text-[#111111]">{part.oem_number}</strong>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyOem(part.oem_number)}
                                      className="text-[10px] text-[#111111]/40 hover:text-[#111111]"
                                      title="Copy OEM"
                                    >
                                      {copiedOem === part.oem_number ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                                    </button>
                                  </div>
                                  <div><span className="text-[#111111]/50">Brand:</span> <strong className="text-[#111111]">{part.brand}</strong></div>
                                </div>
                              </div>

                              {/* Warehouse & Storage Logistics */}
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold uppercase text-[#111111]/50 tracking-wider">
                                  Warehouse Storage
                                </div>
                                <div className="text-xs">
                                  <div className="font-semibold text-[#111111] flex items-center gap-1">
                                    <Warehouse className="w-3 h-3 text-[#111111]/50" />
                                    {part.warehouse_bin}
                                  </div>
                                  <div className="text-[11px] text-[#111111]/60 font-mono mt-0.5">
                                    Min Reorder Threshold: <strong>{part.min_stock_alert} units</strong>
                                  </div>
                                  <div className="text-[11px] text-[#111111]/60 font-mono">
                                    Current Status: <strong className={isLowStock ? 'text-[#DC2626]' : 'text-[#22A06B]'}>{part.status}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Commercial Financials & Valuations */}
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold uppercase text-[#111111]/50 tracking-wider">
                                  Commercial Pricing
                                </div>
                                <div className="space-y-0.5 font-mono text-xs">
                                  <div><span className="text-[#111111]/50">Customer Price:</span> <strong className="text-[#111111]">{formatMoney(part.unit_price)}</strong></div>
                                  <div><span className="text-[#111111]/50">Stock Quantity:</span> <strong>{part.stock_quantity} units</strong></div>
                                  <div><span className="text-[#111111]/50">Total Bin Asset Value:</span> <strong className="text-[#111111]">{formatMoney(part.stock_quantity * part.unit_price)}</strong></div>
                                </div>
                              </div>

                              {/* Machine Compatibility Fleet */}
                              <div className="space-y-1.5">
                                <div className="text-[10px] font-bold uppercase text-[#111111]/50 tracking-wider flex items-center gap-1">
                                  <Cpu className="w-3 h-3 text-[#111111]/40" />
                                  <span>Compatible Heavy Machinery</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {part.machinery_models.map((model, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F7F6F3] border border-slate-200 text-[10px] font-bold text-[#111111] font-mono">
                                      {model}
                                    </span>
                                  ))}
                                </div>
                                {part.description && (
                                  <div className="pt-2 mt-2 border-t border-slate-100 text-[11px] text-[#111111]/70 leading-relaxed">
                                    <span className="font-bold text-[#111111]">Description: </span>
                                    {part.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary Status */}
        <div className="bg-[#F7F6F3] border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/60 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22A06B]" /> Healthy Stock
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" /> Low / Out of Stock
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F6AF31]" /> KARAT Verified
            </span>
          </div>

          <div className="font-mono text-[11px]">
            Sorted by: <strong>{sortField} ({sortOrder.toUpperCase()})</strong>
          </div>
        </div>
      </div>

      {/* Full Edit Part Modal */}
      <EditPartModal
        part={editingPart}
        isOpen={!!editingPart}
        onClose={() => setEditingPart(null)}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#111111]">Delete Product from Catalog?</h3>
                <p className="text-xs text-[#111111]/50">Confirm before removing this product.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F7F6F3] rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#111111] text-[#F6AF31]">
                  {deleteConfirmPart.id || deleteConfirmPart.part_number}
                </span>
                <span className="font-bold text-xs text-[#111111] truncate">{deleteConfirmPart.name}</span>
              </div>
              <div className="text-[11px] text-[#111111]/60 font-mono pt-1">
                Brand: <strong>{deleteConfirmPart.brand}</strong> &bull; Stock: <strong>{deleteConfirmPart.stock_quantity} units</strong> &bull; Bin: <strong>{deleteConfirmPart.warehouse_bin}</strong>
              </div>
            </div>

            <p className="text-xs text-[#111111]/70 leading-relaxed">
              Are you sure you want to permanently delete this product? It will be removed from inventory calculations, active customer search, and quotation matching.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmPart(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111]/70 hover:bg-[#F7F6F3] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePart(deleteConfirmPart.id);
                  setDeleteConfirmPart(null);
                  if (detailModalPart?.id === deleteConfirmPart.id) {
                    setDetailModalPart(null);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-[#DC2626] hover:bg-rose-700 text-white text-xs font-extrabold shadow-xs transition flex items-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Adjust Stock Modal */}
      {stockEditPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-[#111111]">
                  Adjust Stock Balance
                </h3>
                <p className="text-[10px] text-[#111111]/50 font-mono">
                  {stockEditPart.id || stockEditPart.part_number} &bull; {stockEditPart.brand}
                </p>
              </div>
              <button
                onClick={() => setStockEditPart(null)}
                className="w-7 h-7 rounded-full bg-[#F7F6F3] text-[#111111]/60 hover:text-[#111111] flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-[#F7F6F3] p-3 rounded-2xl border border-slate-200/80">
              <div className="font-bold text-xs text-[#111111]">{stockEditPart.name}</div>
              <div className="text-[10px] text-[#111111]/50 font-mono mt-0.5">
                Location: {stockEditPart.warehouse_bin}
              </div>
              <div className="text-[10px] text-[#111111]/50 font-mono">
                Min Safety Level: {stockEditPart.min_stock_alert} units
              </div>
            </div>

            <form onSubmit={handleSaveStockModal} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#111111]/70 mb-1">
                  New Quantity in Bin
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickStockVal(Math.max(0, quickStockVal - 1))}
                    className="w-10 h-10 rounded-xl bg-[#F7F6F3] text-[#111111] font-bold text-lg hover:bg-slate-200 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={quickStockVal}
                    onChange={e => setQuickStockVal(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-center text-base font-bold font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                  />
                  <button
                    type="button"
                    onClick={() => setQuickStockVal(quickStockVal + 1)}
                    className="w-10 h-10 rounded-xl bg-[#F7F6F3] text-[#111111] font-bold text-lg hover:bg-slate-200 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Status preview */}
              <div className="text-[11px] font-semibold text-center">
                {quickStockVal === 0 ? (
                  <span className="text-[#DC2626] font-bold">⚠️ Will be marked as OUT OF STOCK</span>
                ) : quickStockVal <= stockEditPart.min_stock_alert ? (
                  <span className="text-[#DC2626] font-bold">⚠️ Will trigger LOW STOCK ALERT (&le; {stockEditPart.min_stock_alert})</span>
                ) : (
                  <span className="text-[#22A06B] font-bold">✓ Healthy Stock Level</span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockEditPart(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111]/70 hover:bg-[#F7F6F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F6AF31] text-[#111111] text-xs font-extrabold shadow-xs hover:bg-[#e5a028] transition"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Part Specification Detail Modal (Complete Product Information) */}
      {detailModalPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 sticky -top-6 bg-white z-10 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black shadow-xs">
                  <Boxes className="w-5 h-5 text-[#F6AF31]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#111111]">{detailModalPart.name}</h3>
                    <span className="px-2 py-0.5 rounded-lg bg-[#111111] text-[#F6AF31] font-mono font-black text-xs">
                      {detailModalPart.id || detailModalPart.part_number}
                    </span>
                  </div>
                  <p className="text-xs text-[#111111]/50 font-mono">
                    Brand: {detailModalPart.brand} &bull; Category: {detailModalPart.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalPart(null)}
                className="w-8 h-8 rounded-full bg-[#F7F6F3] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Complete Product Details */}
            <div className="space-y-3.5 text-xs">
              {/* Product ID & OEM Code */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F7F6F3] rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Product ID (Internal)</span>
                  <div className="font-mono font-black text-sm text-[#111111] mt-0.5">
                    {detailModalPart.id || detailModalPart.part_number}
                  </div>
                </div>

                <div className="p-3 bg-[#F7F6F3] rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">OEM Code</span>
                    <button
                      type="button"
                      onClick={() => handleCopyOem(detailModalPart.oem_number)}
                      className="text-[10px] text-[#111111]/50 hover:text-[#111111] flex items-center gap-0.5"
                      title="Copy OEM"
                    >
                      {copiedOem === detailModalPart.oem_number ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="font-mono font-bold text-xs text-[#111111] mt-0.5">
                    {detailModalPart.oem_number}
                  </div>
                </div>
              </div>

              {/* Manufacturer & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F7F6F3] rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50">Manufacturer / Brand</span>
                  <div className="font-bold text-sm text-[#111111] mt-0.5">{detailModalPart.brand}</div>
                </div>
                <div className="p-3 bg-[#F7F6F3] rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50">Category</span>
                  <div className="font-bold text-sm text-[#111111] mt-0.5">{detailModalPart.category}</div>
                </div>
              </div>

              {/* Storage & Inventory Stock */}
              <div className="p-3.5 bg-[#F7F6F3] rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50">Warehouse Storage Location</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    detailModalPart.status === 'In Stock'
                      ? 'bg-[#22A06B]/15 text-[#22A06B]'
                      : 'bg-[#DC2626]/15 text-[#DC2626]'
                  }`}>
                    {detailModalPart.status}
                  </span>
                </div>
                <div className="font-mono font-bold text-xs text-[#111111] flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-[#111111]/50" />
                  <span>{detailModalPart.warehouse_bin}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#111111]/70 font-mono pt-1 border-t border-slate-200/60">
                  <span>Current Balance: <strong className="text-[#111111]">{detailModalPart.stock_quantity} units</strong></span>
                  <span>Safety Reorder Level: <strong>{detailModalPart.min_stock_alert} units</strong></span>
                </div>
              </div>

              {/* Commercial Pricing */}
              <div className="p-3.5 bg-[#F7F6F3] rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#111111]/50">Commercial Financials</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-[#111111]/40 block">Unit Selling Price</span>
                    <strong className="text-xs text-[#111111]">{formatMoney(detailModalPart.unit_price)}</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[9px] text-[#111111]/40 block">Total Bin Asset Value</span>
                    <strong className="text-xs text-[#111111]">{formatMoney(detailModalPart.stock_quantity * detailModalPart.unit_price)}</strong>
                  </div>
                </div>
              </div>

              {/* Compatibility: Compatible Heavy Machinery */}
              <div className="p-3.5 bg-[#F7F6F3] rounded-2xl border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[#111111]/50 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-[#111111]/40" />
                  <span>Compatible Heavy Machinery (Compatibility)</span>
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {detailModalPart.machinery_models.map((model, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-[#111111] text-white text-xs font-mono font-semibold">
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description & Technical Notes */}
              {detailModalPart.description && (
                <div className="p-3.5 bg-[#F7F6F3] rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Part Description & Specifications</span>
                  <p className="text-xs text-[#111111]/80 leading-relaxed">{detailModalPart.description}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmPart(detailModalPart);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#DC2626] text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    startSaleWithPart(detailModalPart);
                    setDetailModalPart(null);
                  }}
                  disabled={detailModalPart.stock_quantity <= 0}
                  className="px-4 py-2 rounded-xl bg-[#22A06B] hover:bg-[#1c8457] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Sell This Part</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingPart(detailModalPart);
                    setDetailModalPart(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailModalPart(null)}
                  className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-black transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload / Import CSV & Excel Modal */}
      <BulkUploadModal 
        isOpen={bulkUploadOpen} 
        onClose={() => setBulkUploadOpen(false)} 
      />
    </div>
  );
};
