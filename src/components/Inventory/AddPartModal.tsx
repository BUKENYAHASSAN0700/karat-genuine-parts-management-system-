import React, { useState, useEffect } from 'react';
import { X, Boxes, Plus, Sparkles, RefreshCw, Cpu } from 'lucide-react';
import { useInertia, generateNextKaratId } from '../../context/InertiaContext';
import { SparePart } from '../../types';

export const AddPartModal: React.FC = () => {
  const { addModalOpen, setAddModalOpen, addPart, parts, currency } = useInertia();

  const [assignedId, setAssignedId] = useState<string>('KA113');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    oem_number: '',
    name: '',
    description: '',
    category: 'Hydraulics & Cylinders',
    machinery_models: 'CAT 349D, CAT 336D',
    brand: 'Caterpillar' as SparePart['brand'],
    stock_quantity: 1,
    min_stock_alert: 2,
    unit_cost: 0,
    unit_price: 1850,
    warehouse_bin: 'Aisle 3 - Bay B - Level 2',
  });

  // Automatically assign 5-character KA... ID when modal opens
  useEffect(() => {
    if (addModalOpen) {
      setAssignedId(generateNextKaratId(parts));
      setError(null);
    }
  }, [addModalOpen, parts]);

  if (!addModalOpen) return null;

  const handleRegenerateId = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 899);
    setAssignedId(`KA${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Part name is required.');
      return;
    }

    const stockQty = Number(formData.stock_quantity);
    if (isNaN(stockQty) || stockQty < 1) {
      setError('Initial stock cannot be less than 1. Please enter at least 1 unit.');
      return;
    }

    const minAlert = Number(formData.min_stock_alert) || 1;
    if (minAlert < 1) {
      setError('Mini alert stock must be at least 1.');
      return;
    }

    const unitPrice = Number(formData.unit_price) || 0;
    if (unitPrice <= 0) {
      setError('Unit price must be greater than 0.');
      return;
    }

    const modelsArray = formData.machinery_models
      ? formData.machinery_models.split(',').map(s => s.trim()).filter(Boolean)
      : ['Universal Equipment'];

    const partStatus: SparePart['status'] = stockQty <= minAlert ? 'Low Stock' : 'In Stock';

    addPart({
      part_number: assignedId,
      oem_number: formData.oem_number.trim() || 'OEM-STANDARD',
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      machinery_models: modelsArray.length > 0 ? modelsArray : ['All Standard Fleets'],
      brand: formData.brand,
      stock_quantity: stockQty,
      min_stock_alert: minAlert,
      unit_cost: formData.unit_cost || unitPrice * 0.65,
      unit_price: unitPrice,
      warehouse_bin: formData.warehouse_bin.trim() || 'General Receiving Rack',
      status: partStatus,
    });

    setAddModalOpen(false);
    setFormData({
      oem_number: '',
      name: '',
      description: '',
      category: 'Hydraulics & Cylinders',
      machinery_models: 'CAT 349D, CAT 336D',
      brand: 'Caterpillar',
      stock_quantity: 1,
      min_stock_alert: 2,
      unit_cost: 0,
      unit_price: 1850,
      warehouse_bin: 'Aisle 3 - Bay B - Level 2',
    });
    setError(null);
  };

  const quickCompatibilitySuggestions = [
    'CAT 349D', 'CAT 336D', 'Komatsu PC400-8', 'Volvo EC480D', 'Hitachi ZX350-5G', 'Komatsu PC200-8'
  ];

  const handleAddSuggestion = (model: string) => {
    const current = formData.machinery_models ? formData.machinery_models.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (!current.includes(model)) {
      setFormData({
        ...formData,
        machinery_models: current.length > 0 ? `${formData.machinery_models}, ${model}` : model,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 sticky -top-6 bg-white z-10 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center shadow-xs">
              <Boxes className="w-4 h-4 text-[#F6AF31]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#111111]">Register New Spare Part</h3>
                <span className="px-2 py-0.5 rounded-lg bg-[#111111] text-[#F6AF31] font-mono font-black text-xs">
                  {assignedId}
                </span>
              </div>
              <p className="text-[11px] text-[#111111]/50">Enter product information to upload into live KARAT inventory</p>
            </div>
          </div>
          <button
            onClick={() => setAddModalOpen(false)}
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
          {/* Product ID & OEM Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Auto-Assigned Product Number Badge (Clean, without the label clutter) */}
            <div className="p-3 bg-[#F7F6F3] border border-slate-200/90 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">ID</span>
                <span className="font-mono font-black text-base text-[#111111] tracking-tight">{assignedId}</span>
              </div>
              <button
                type="button"
                onClick={handleRegenerateId}
                className="text-[10px] text-[#111111]/50 hover:text-[#111111] flex items-center gap-1 font-semibold p-1.5 rounded-lg hover:bg-slate-200 transition"
                title="Refresh ID"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {/* OEM Code */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                OEM Code / OEM Part #
              </label>
              <input
                type="text"
                placeholder="e.g. CAT-349D-HYD or VOE21340611"
                value={formData.oem_number}
                onChange={e => setFormData({ ...formData, oem_number: e.target.value })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] font-mono focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>
          </div>

          {/* Part Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
              Part Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Main Hydraulic Control Valve Assembly"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
            />
          </div>

          {/* Part Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
              Description & Technical Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Heavy-duty variable displacement hydraulic control valve assembly with integrated dual-circuit relief bypass."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31] resize-none"
            />
          </div>

          {/* Manufacturer / Brand & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Manufacturer / Brand *
              </label>
              <select
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value as SparePart['brand'] })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
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
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              >
                <option value="Hydraulics & Cylinders">Hydraulics & Cylinders</option>
                <option value="Engine & Fuel Injection">Engine & Fuel Injection</option>
                <option value="Undercarriage & Tracks">Undercarriage & Tracks</option>
                <option value="Transmission & Final Drive">Transmission & Final Drive</option>
                <option value="Ground Engaging Tools (GET)">Ground Engaging Tools (GET & Buckets)</option>
                <option value="Cooling, Radiators & Fans">Cooling, Radiators & Fans</option>
                <option value="Braking & Air Systems">Braking & Air Systems</option>
                <option value="Electrical, Sensors & ECUs">Electrical, Sensors & ECUs</option>
                <option value="Turbochargers & Exhaust">Turbochargers & Exhaust</option>
                <option value="Filters & PM Service Kits">Filters & PM Service Kits</option>
                <option value="Seals & Gasket Kits">Seals & Gasket Kits</option>
                <option value="Cabin & Operator Controls">Cabin, Glass & Controls</option>
                <option value="Steering, Axles & Differential">Steering, Axles & Differential</option>
                <option value="Attachments, Breakers & Augers">Attachments, Breakers & Augers</option>
              </select>
            </div>
          </div>

          {/* Initial Stock (min 1), Mini Alert Stock (min 1) & Unit Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/70">
                  Initial Stock *
                </label>
                <span className="text-[9px] font-bold text-amber-600">Min 1</span>
              </div>
              <input
                type="number"
                min="1"
                required
                value={formData.stock_quantity}
                onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Mini Alert Stock
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.min_stock_alert}
                onChange={e => setFormData({ ...formData, min_stock_alert: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Unit Price ({currency}) *
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={formData.unit_price}
                onChange={e => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>
          </div>

          {/* Compatibility: Compatible Heavy Machinery */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-[#111111]/50" />
                <span>Compatibility (Compatible Heavy Machinery)</span>
              </label>
              <span className="text-[9px] text-[#111111]/40">Separate multiple with commas</span>
            </div>
            <input
              type="text"
              placeholder="e.g. CAT 349D, CAT 336D, CAT 345C, CAT D6T"
              value={formData.machinery_models}
              onChange={e => setFormData({ ...formData, machinery_models: e.target.value })}
              className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
            />

            {/* Quick Compatibility Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
              <span className="text-[10px] text-[#111111]/50 font-medium">Quick add:</span>
              {quickCompatibilitySuggestions.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => handleAddSuggestion(model)}
                  className="px-2 py-0.5 rounded-md bg-[#F7F6F3] hover:bg-amber-100/70 border border-slate-200 text-[10px] font-mono text-[#111111] transition"
                >
                  + {model}
                </button>
              ))}
            </div>
          </div>

          {/* Warehouse Bin Location */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
              Warehouse Storage Bin / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Aisle 3 - Bay B - Level 2 or Rack 4"
              value={formData.warehouse_bin}
              onChange={e => setFormData({ ...formData, warehouse_bin: e.target.value })}
              className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111111] font-mono focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
            />
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111]/70 hover:bg-[#F7F6F3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold transition shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Save Part to Inventory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
