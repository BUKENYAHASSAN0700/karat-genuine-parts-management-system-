import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Cpu, Warehouse, DollarSign, Package } from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { SparePart } from '../../types';

interface EditPartModalProps {
  part: SparePart | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPartModal: React.FC<EditPartModalProps> = ({ part, isOpen, onClose }) => {
  const { updatePart, currency } = useInertia();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    oem_number: '',
    brand: 'Caterpillar' as SparePart['brand'],
    category: 'Hydraulics & Cylinders',
    stock_quantity: 1,
    min_stock_alert: 1,
    unit_cost: 0,
    unit_price: 0,
    machinery_models: '',
    warehouse_bin: '',
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        description: part.description || '',
        oem_number: part.oem_number || '',
        brand: part.brand || 'Caterpillar',
        category: part.category || 'Hydraulics & Cylinders',
        stock_quantity: part.stock_quantity ?? 1,
        min_stock_alert: part.min_stock_alert ?? 1,
        unit_cost: part.unit_cost || 0,
        unit_price: part.unit_price || 0,
        machinery_models: part.machinery_models ? part.machinery_models.join(', ') : '',
        warehouse_bin: part.warehouse_bin || '',
      });
      setError(null);
    }
  }, [part]);

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
      setError('Unit price must be a valid positive amount.');
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
      category: formData.category,
      stock_quantity: stockQty,
      min_stock_alert: minAlert,
      unit_cost: formData.unit_cost || (price * 0.65),
      unit_price: price,
      machinery_models: modelsArray.length > 0 ? modelsArray : ['Universal Equipment'],
      warehouse_bin: formData.warehouse_bin.trim() || part.warehouse_bin,
      status: partStatus,
    };

    updatePart(updatedPart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 sticky -top-6 bg-white z-10 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center shadow-xs">
              <Edit3 className="w-4 h-4 text-[#F6AF31]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#111111]">Edit Product Information</h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#111111] text-[#F6AF31] font-mono font-black text-xs">
                  {part.id || part.part_number}
                </span>
              </div>
              <p className="text-[11px] text-[#111111]/50">Modify product specifications and inventory parameters</p>
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
          {/* OEM Code & Product Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

          {/* Category */}
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

          {/* Stock, Mini Alert & Unit Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                min="0"
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
                value={formData.min_stock_alert}
                onChange={e => setFormData({ ...formData, min_stock_alert: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#F7F6F3] border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111111] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
                Unit Price ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111111]/70 hover:bg-[#F7F6F3] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold transition shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
