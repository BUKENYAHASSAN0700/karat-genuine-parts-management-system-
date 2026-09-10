import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Building, 
  Phone, 
  Mail, 
  FileText, 
  Check, 
  Package
} from 'lucide-react';
import { InquiryItem, InquiryLineItem } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface NewInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInquiryModal: React.FC<NewInquiryModalProps> = ({ isOpen, onClose }) => {
  const { parts, addInquiry, formatMoney, currency } = useInertia();

  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [equipmentModel, setEquipmentModel] = useState('Caterpillar 349D Excavator');
  const [equipmentSerial, setEquipmentSerial] = useState('');
  const [priority, setPriority] = useState<InquiryItem['priority']>('Standard Routine');
  const [validityPeriod, setValidityPeriod] = useState('14 Days');
  const [deliverySite, setDeliverySite] = useState('');
  const [notes, setNotes] = useState('');

  // Line items state
  const [items, setItems] = useState<InquiryLineItem[]>([
    {
      part_id: parts[0]?.id || 'KA101',
      part_number: parts[0]?.part_number || 'KA101',
      oem_number: parts[0]?.oem_number || '',
      name: parts[0]?.name || 'Main Hydraulic Control Valve Assembly',
      brand: parts[0]?.brand || 'Caterpillar',
      quantity: 1,
      unit_price: parts[0]?.selling_price || 6850,
      total_price: parts[0]?.selling_price || 6850,
      in_stock: (parts[0]?.stock_quantity ?? 0) > 0,
    }
  ]);

  const [selectedCatalogPartId, setSelectedCatalogPartId] = useState<string>('');

  if (!isOpen) return null;

  const handleAddLineItem = () => {
    const defaultPart = parts[0];
    const newItem: InquiryLineItem = {
      part_id: defaultPart?.id || 'CUSTOM',
      part_number: defaultPart?.part_number || 'KA-NEW',
      oem_number: defaultPart?.oem_number || '',
      name: defaultPart?.name || 'Custom Heavy Equipment Spare Part',
      brand: defaultPart?.brand || 'OEM',
      quantity: 1,
      unit_price: defaultPart?.selling_price || 100,
      total_price: defaultPart?.selling_price || 100,
      in_stock: true,
    };
    setItems([...items, newItem]);
  };

  const handleAddFromCatalog = (partId: string) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return;

    const newItem: InquiryLineItem = {
      part_id: part.id,
      part_number: part.part_number,
      oem_number: part.oem_number,
      name: part.name,
      brand: part.brand,
      quantity: 1,
      unit_price: part.selling_price,
      total_price: part.selling_price,
      in_stock: part.stock_quantity > 0,
    };
    setItems([...items, newItem]);
    setSelectedCatalogPartId('');
  };

  const handleItemChange = (index: number, field: keyof InquiryLineItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(value) : target.quantity;
      const p = field === 'unit_price' ? Number(value) : target.unit_price;
      target.total_price = q * p;
    }
    
    updated[index] = target;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const calculatedTotal = items.reduce((sum, it) => sum + (it.total_price || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !equipmentModel.trim()) return;

    const partsSummary = items.map(i => `${i.name} (x${i.quantity})`).join(', ');

    addInquiry({
      customer_name: customerName.trim(),
      customer_company: customerCompany.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      customer_email: customerEmail.trim() || undefined,
      equipment_model: equipmentModel.trim(),
      equipment_serial: equipmentSerial.trim() || undefined,
      parts_requested: partsSummary,
      items: items,
      quoted_amount: calculatedTotal,
      priority: priority,
      validity_period: validityPeriod,
      delivery_site: deliverySite.trim() || undefined,
      status: 'Draft',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111111] text-white shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F6AF31]" />
            <h2 className="text-sm font-black uppercase tracking-wider font-mono">
              Create New Customer RFQ / Quotation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto grow">
          
          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#F6AF31]" />
              <span>Customer & Fleet Contractor</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Eng. Charles Okello"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g., Roko Construction Ltd"
                  value={customerCompany}
                  onChange={e => setCustomerCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Telephone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+256 772 000 000"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="procurement@company.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Machine Details & Priority */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#F6AF31]" />
              <span>Target Machinery & Delivery Urgency</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Machinery Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Caterpillar 349D"
                  value={equipmentModel}
                  onChange={e => setEquipmentModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Chassis / Serial # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., CAT0349D-W84920"
                  value={equipmentSerial}
                  onChange={e => setEquipmentSerial(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Priority / Dispatch Need
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#F6AF31] font-semibold"
                >
                  <option value="Standard Routine">Standard Routine</option>
                  <option value="Urgent (48h)">Urgent (48h)</option>
                  <option value="Critical (Machine Down)">Critical (Machine Down)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Delivery Site Destination
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tororo Quarry Pit 4 or Kampala Depot"
                  value={deliverySite}
                  onChange={e => setDeliverySite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Quotation Validity
                </label>
                <select
                  value={validityPeriod}
                  onChange={e => setValidityPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                >
                  <option value="7 Days (Immediate dispatch available)">7 Days</option>
                  <option value="14 Days">14 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Itemized Line Items */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]/70">
                Itemized Spare Parts ({items.length})
              </h3>

              {/* Quick Add from Inventory */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedCatalogPartId}
                  onChange={e => handleAddFromCatalog(e.target.value)}
                  className="text-[11px] font-medium px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none"
                >
                  <option value="">+ Pick from Stock Catalog...</option>
                  {parts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.brand}) - {formatMoney(p.selling_price)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="px-2.5 py-1 bg-[#111111] hover:bg-[#222222] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#F6AF31]" />
                  <span>Custom Item</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="p-3 bg-[#F7F6F3] rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="Part Name / Specification"
                        value={it.name}
                        onChange={e => handleItemChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Part / OEM Ref"
                        value={it.part_number}
                        onChange={e => handleItemChange(idx, 'part_number', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="Brand"
                        value={it.brand || ''}
                        onChange={e => handleItemChange(idx, 'brand', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs pt-1 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-[#111111]/70">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white text-center font-mono font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-[#111111]/70">Unit Price:</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#111111]/50">{currency}</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={it.unit_price}
                          onChange={e => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-24 pl-10 pr-2 py-1 text-xs rounded-lg border border-slate-200 bg-white text-right font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#111111]/50 block">Line Total</span>
                      <span className="font-mono font-black text-xs text-[#111111]">
                        {formatMoney(it.total_price)}
                      </span>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 transition cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Display */}
            <div className="flex justify-between items-center p-3.5 rounded-2xl bg-[#111111] text-white">
              <span className="text-xs font-black uppercase tracking-wider text-white/70">
                Calculated Quotation Total
              </span>
              <span className="text-base font-mono font-black text-[#F6AF31]">
                {formatMoney(calculatedTotal)}
              </span>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
              Internal & Commercial Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Expedited OEM procurement required. Air cargo delivery to Entebbe."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Save & Record Quotation</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
