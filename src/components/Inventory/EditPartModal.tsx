import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Cpu, Warehouse, DollarSign, Package, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { SparePart } from '../../types';
import { SERIES_LIST, getCategoriesForSeries, getSeriesForCategory } from '../../data/partTaxonomy';

const COMMON_UNITS = [
  { value: 'PCS', label: 'PCS - Pieces' },
  { value: 'SET', label: 'SET - Full Set' },
  { value: 'KIT', label: 'KIT - Overhaul / Seal Kit' },
  { value: 'ASSY', label: 'ASSY - Complete Assembly' },
  { value: 'PAIR', label: 'PAIR - Paired Components' },
  { value: 'MTR', label: 'MTR - Meters' },
  { value: 'KG', label: 'KG - Kilograms' },
  { value: 'BOX', label: 'BOX - Boxed Package' },
  { value: 'ROLL', label: 'ROLL - Continuous Roll' },
];

interface EditPartModalProps {
  part: SparePart | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPartModal: React.FC<EditPartModalProps> = ({ part, isOpen, onClose }) => {
  const { updatePart, currency } = useInertia();

  const [selectedSeries, setSelectedSeries] = useState<string>('Motor Series');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    oem_number: '',
    brand: 'Caterpillar' as SparePart['brand'],
    series: 'Motor Series',
    category: 'KST Starter Motor Series',
    model: '',
    machinery_models: '',
    unit: 'PCS',
    taxes: '18% VAT',
    tax_rate: 18,
    tax_amount: 0,
    transport_cost: 0,
    stock_quantity: 1,
    min_stock_alert: 1,
    unit_cost: 0,
    unit_price: 0,
    registered_date: '2026-03-01',
    warehouse_bin: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (part) {
      const partSeries = part.series || getSeriesForCategory(part.category);
      setSelectedSeries(partSeries);
      setFormData({
        name: part.name || '',
        description: part.description || '',
        oem_number: part.oem_number || '',
        brand: part.brand || 'Caterpillar',
        series: partSeries,
        category: part.category || (getCategoriesForSeries(partSeries)[0] || ''),
        model: part.model || (part.machinery_models?.[0] || ''),
        machinery_models: part.machinery_models ? part.machinery_models.join(', ') : '',
        unit: part.unit || (part.name?.toLowerCase().includes('kit') ? 'KIT' : part.name?.toLowerCase().includes('set') ? 'SET' : 'PCS'),
        taxes: part.taxes || '18% VAT',
        tax_rate: part.tax_rate ?? 18,
        tax_amount: part.tax_amount ?? 0,
        transport_cost: part.transport_cost ?? 0,
        stock_quantity: part.stock_quantity ?? 1,
        min_stock_alert: part.min_stock_alert ?? 1,
        unit_cost: part.unit_cost !== undefined ? part.unit_cost : Math.round((part.unit_price || 0) * 0.65),
        unit_price: part.unit_price || 0,
        registered_date: part.registered_date || '2026-03-01',
        warehouse_bin: part.warehouse_bin || '',
      });
      setError(null);
    }
  }, [part]);

  const handleSeriesChange = (newSeries: string) => {
    setSelectedSeries(newSeries);
    const availableCats = getCategoriesForSeries(newSeries);
    setFormData(prev => ({
      ...prev,
      series: newSeries,
      category: availableCats[0] || '',
    }));
  };

  if (!isOpen || !part) return null;

  const quickCompatibilitySuggestions = [
    'CAT 349D', 'CAT 336D', 'Komatsu PC400-8', 'Volvo EC480D', 'Hitachi ZX350-5G', 'Komatsu PC200-8'
  ];

  const handleAddSuggestion = (model: string) => {
    const current = formData.machinery_models
      ? formData.machinery_models.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    if (!current.includes(model)) {
      setFormData({
        ...formData,
        machinery_models: current.length > 0 ? `${formData.machinery_models}, ${model}` : model,
        model: formData.model ? formData.model : model,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Part name is required.');
      return;
    }

    const stockQty = Number(formData.stock_quantity);
    if (isNaN(stockQty) || stockQty < 0) {
      setError('Stock quantity must be 0 or higher.');
      return;
    }

    const minAlert = Number(formData.min_stock_alert);
    if (isNaN(minAlert) || minAlert < 1) {
      setError('Mini alert stock must be at least 1.');
      return;
    }

    const price = Number(formData.unit_price);
    if (isNaN(price) || price < 0) {
      setError('Price on item must be a valid positive amount.');
      return;
    }

    const itemCost = Number(formData.unit_cost);
    if (isNaN(itemCost) || itemCost < 0) {
      setError('Cost for item cannot be negative.');
      return;
    }

    const modelsArray = formData.machinery_models
      ? formData.machinery_models.split(',').map(s => s.trim()).filter(Boolean)
      : part.machinery_models;

    let partStatus: SparePart['status'] = 'In Stock';
    if (stockQty === 0) {
      partStatus = 'Out of Stock';
    } else if (stockQty <= minAlert) {
      partStatus = 'Low Stock';
    }

    const updatedPart: SparePart = {
      ...part,
      name: formData.name.trim(),
      description: formData.description.trim(),
      oem_number: formData.oem_number.trim() || part.oem_number,
      brand: formData.brand,
      series: formData.series,
      category: formData.category,
      model: formData.model.trim() || (modelsArray[0] || 'Universal Fleet'),
      machinery_models: modelsArray.length > 0 ? modelsArray : ['Universal Equipment'],
      unit: formData.unit || 'PCS',
      taxes: formData.taxes || '18% VAT',
      tax_rate: formData.tax_rate,
      tax_amount: Number(formData.tax_amount) || 0,
      transport_cost: Number(formData.transport_cost) || 0,
      stock_quantity: stockQty,
      min_stock_alert: minAlert,
      unit_cost: itemCost,
      unit_price: price,
      registered_date: formData.registered_date || part.registered_date || '2026-03-01',
      warehouse_bin: formData.warehouse_bin.trim() || part.warehouse_bin,
      status: partStatus,
    };

    updatePart(updatedPart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 sticky -top-6 bg-white z-10 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5 text-[#F6AF31]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#111111]">Edit Product Information</h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#111111] text-[#F6AF31] font-mono font-black text-xs">
                  {part.id || part.part_number}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F7F6F3] text-[#111111]/70 hover:text-[#111111] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Identification & Codes */}
          <div className="bg-[#F7F6F3]/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-black uppercase text-[#111111]/80 tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#111111]" />
              <span>Product Identification & Part Numbers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Product ID (Read-only) */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Product ID (Part No)</span>
                <span className="font-mono font-black text-sm text-[#111111]">{part.id || part.part_number}</span>
              </div>

              {/* OEM Part Number */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Model Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAT-349D-HYD or VOE21340611"
                  value={formData.oem_number}
                  onChange={e => setFormData({ ...formData, oem_number: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] font-mono focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>
            </div>

            {/* Part Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Part Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Main Hydraulic Control Valve Assembly"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Description (DESC) & Technical Specifications
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Heavy-duty variable displacement hydraulic control valve assembly with integrated dual-circuit relief bypass."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31] resize-none"
              />
            </div>
          </div>

          {/* Section 2: Model & Taxonomy */}
          <div className="bg-[#F7F6F3]/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-black uppercase text-[#111111]/80 tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#111111]" />
              <span>Model & Heavy Machinery Compatibility</span>
            </div>

            {/* Model input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/70">
                  Machinery Model(s) (MODEL) *
                </label>
                <span className="text-[9px] text-[#111111]/50">Comma separated for multiple models</span>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. CAT 349D, CAT 336D, CAT 345C"
                value={formData.machinery_models}
                onChange={e => setFormData({ ...formData, machinery_models: e.target.value, model: e.target.value.split(',')[0]?.trim() || '' })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111111] font-medium focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />

              {/* Quick suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                <span className="text-[10px] text-[#111111]/50 font-medium">Quick add:</span>
                {quickCompatibilitySuggestions.map((model) => (
                  <button
                    key={model}
                    type="button"
                    onClick={() => handleAddSuggestion(model)}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-100 border border-slate-200 text-[10px] font-mono text-[#111111] transition"
                  >
                    + {model}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand, Series & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Manufacturer Brand *
                </label>
                <select
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value as SparePart['brand'] })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                >
                  <option value="Caterpillar">Caterpillar (CAT)</option>
                  <option value="Komatsu">Komatsu</option>
                  <option value="Volvo">Volvo CE</option>
                  <option value="Hitachi">Hitachi Heavy</option>
                  <option value="Hyundai">Hyundai Construction</option>
                  <option value="Doosan">Doosan / Develon</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Series *
                </label>
                <select
                  value={selectedSeries}
                  onChange={e => handleSeriesChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                >
                  {SERIES_LIST.map(series => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                >
                  {getCategoriesForSeries(selectedSeries).map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Unit, Taxes & Registration Date */}
          <div className="bg-[#F7F6F3]/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-black uppercase text-[#111111]/80 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#111111]" />
              <span>Unit of Measure, Taxes & Registration Date</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Unit of measure */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Unit of Measure (UNIT) *
                </label>
                <select
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                >
                  {COMMON_UNITS.map(u => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tax amount */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Tax Amount ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#111111]/50">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.tax_amount}
                    onChange={e => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter tax amount"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-3 py-2 text-xs font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                  />
                </div>
              </div>

              {/* Date Registered */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#111111]/50" />
                  <span>Date Registered *</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.registered_date}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Cost, Clear Selling Price, and Stock */}
          <div className="bg-[#F7F6F3]/70 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="text-[11px] font-black uppercase text-[#111111]/80 tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#111111]" />
                <span>Pricing & Stock Quantities</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* COST for ITEM */}
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/70">
                    Cost for Item ({currency}) *
                  </label>
                  <span className="text-[9px] text-slate-500 font-medium">Landed / Purchase Cost</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#111111]/50">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.unit_cost}
                    onChange={e => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#F7F6F3] border border-slate-200 rounded-lg pl-12 pr-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                  />
                </div>
              </div>

              {/* SELLING PRICE on Item */}
              <div className="bg-white p-3 rounded-xl border border-amber-300/70 bg-amber-50/20">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#111111]">
                    Price Put On Item ({currency}) *
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#111111]/50">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.unit_price}
                    onChange={e => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#F7F6F3] border border-slate-300 rounded-lg pl-12 pr-3 py-2 text-xs text-[#111111] font-mono font-black focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Transport Cost ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#111111]/50">{currency}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.transport_cost}
                    onChange={e => setFormData({ ...formData, transport_cost: parseFloat(e.target.value) || 0 })}
                    placeholder="Cost to bring item to the shop"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                  />
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60">Total Stock Selling Value</span>
                <strong className="text-sm font-black text-[#111111]">
                  {currency} {(Number(formData.stock_quantity) * Number(formData.unit_price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>

            {/* Stock, Min Alert & Bin Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                  Mini Alert Stock *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.min_stock_alert}
                  onChange={e => setFormData({ ...formData, min_stock_alert: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111]/70 hover:bg-[#F7F6F3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Update Product Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
