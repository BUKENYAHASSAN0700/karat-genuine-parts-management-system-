import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Building, 
  Truck, 
  FileCheck2, 
  Check, 
  DollarSign,
  Package
} from 'lucide-react';
import { CommercialOrder, InquiryLineItem } from '../../types';
import { useInertia } from '../../context/InertiaContext';
import { SearchableCombobox } from '../Common/SearchableCombobox';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { parts, addOrder, formatMoney, currency } = useInertia();

  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [poReference, setPoReference] = useState(`PO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [equipmentModel, setEquipmentModel] = useState('Caterpillar 349D Excavator');
  const [deliverySite, setDeliverySite] = useState('Kampala Central Depot (Yard 4)');
  const [deliveryMethod, setDeliveryMethod] = useState<CommercialOrder['delivery_method']>('Field Van Delivery');
  const [paymentStatus, setPaymentStatus] = useState<CommercialOrder['payment_status']>('Paid in Full');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<CommercialOrder['fulfillment_status']>('Processing & Packing');
  const [driverName, setDriverName] = useState('Geoffrey Mukasa (Field Logistics)');
  const [vehicleReg, setVehicleReg] = useState('UBK 492T (Toyota Hilux Heavy Transit)');
  const [notes, setNotes] = useState('');

  // Line items
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
      in_stock: true,
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

  const subtotal = items.reduce((sum, it) => sum + (it.total_price || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !equipmentModel.trim() || !deliverySite.trim()) return;

    addOrder({
      po_reference: poReference.trim() || undefined,
      customer_name: customerName.trim(),
      customer_company: customerCompany.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      customer_email: customerEmail.trim() || undefined,
      equipment_model: equipmentModel.trim(),
      delivery_site: deliverySite.trim(),
      delivery_method: deliveryMethod,
      items: items,
      subtotal: subtotal,
      total_amount: subtotal,
      payment_status: paymentStatus,
      fulfillment_status: fulfillmentStatus,
      driver_name: driverName.trim() || undefined,
      vehicle_reg: vehicleReg.trim() || undefined,
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
            <Truck className="w-5 h-5 text-[#22A06B]" />
            <h2 className="text-sm font-black uppercase tracking-wider font-mono">
              Log Commercial Order & Dispatch Release
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
          
          {/* Section 1: Customer Info & PO */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#22A06B]" />
              <span>Client Account & PO Reference</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Customer / Contractor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Marcus Vance"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g., Titan Earthmoving Corp"
                  value={customerCompany}
                  onChange={e => setCustomerCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Client PO Reference #
                </label>
                <input
                  type="text"
                  placeholder="e.g., PO-TITAN-8841"
                  value={poReference}
                  onChange={e => setPoReference(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B] font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  placeholder="+256 701 883419"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="procurement@titan.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Equipment & Logistics Delivery */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]/70 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#22A06B]" />
              <span>Logistics, Delivery & Site Protocol</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Target Machinery Model *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Komatsu PC400-8 & PC200-8"
                  value={equipmentModel}
                  onChange={e => setEquipmentModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Delivery Site Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kampala Northern Bypass Yard or Tororo Site"
                  value={deliverySite}
                  onChange={e => setDeliverySite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Delivery Method
                </label>
                <select
                  value={deliveryMethod}
                  onChange={e => setDeliveryMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#22A06B] font-medium"
                >
                  <option value="Field Van Delivery">Field Van Delivery (Direct to Mine/Site)</option>
                  <option value="Warehouse Pickup (Yard 4 - Industrial Area)">Warehouse Pickup (Yard 4 - Industrial Area)</option>
                  <option value="Expedited Air Freight">Expedited Air Freight</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                  Dispatch Driver & Vehicle
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Driver Name"
                    value={driverName}
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Reg (e.g. UBK 492T)"
                    value={vehicleReg}
                    onChange={e => setVehicleReg(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Terms & Fulfillment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                Commercial Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#22A06B] font-bold"
              >
                <option value="Paid in Full">Paid in Full (Cash / Wire / Mobile)</option>
                <option value="Partial Advance (50%)">Partial Advance (50%)</option>
                <option value="30-Day Credit Account">30-Day Credit Account (Approved Contractor)</option>
                <option value="Pending Wire">Pending Wire Settlement</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
                Warehouse Fulfillment Stage
              </label>
              <select
                value={fulfillmentStatus}
                onChange={e => setFulfillmentStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#22A06B] font-bold"
              >
                <option value="Processing & Packing">Processing & Packing</option>
                <option value="Ready for Dispatch">Ready for Dispatch (Yard Cleared)</option>
                <option value="Dispatched / In Transit">Dispatched / In Transit</option>
                <option value="Delivered & Signed">Delivered & Signed</option>
                <option value="Awaiting OEM Restock">Awaiting OEM Restock</option>
              </select>
            </div>
          </div>

          {/* Section 4: Line Items */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#111111]/70">
                Order Spare Parts Line Items ({items.length})
              </h3>

              {/* Quick Add from Inventory with Search by Typing */}
              <div className="flex items-center gap-2">
                <div className="w-64 sm:w-80">
                  <SearchableCombobox
                    value={selectedCatalogPartId}
                    onChange={val => {
                      if (val) {
                        handleAddFromCatalog(val);
                        setSelectedCatalogPartId('');
                      }
                    }}
                    options={parts.map(p => ({
                      value: p.id,
                      label: `[${p.part_number}] ${p.name}`,
                      subLabel: `${p.brand} • ${p.category} • ${formatMoney(p.unit_price)} (${p.stock_quantity} in stock)`,
                    }))}
                    placeholder="Search by typing part name, ID, OEM..."
                    allowCustom={false}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="px-2.5 py-2 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-[#22A06B]" />
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
                        placeholder="Part Name / Description"
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
                Total Order Value
              </span>
              <span className="text-base font-mono font-black text-[#22A06B]">
                {formatMoney(subtotal)}
              </span>
            </div>
          </div>

          {/* Section 5: Notes */}
          <div>
            <label className="block text-[11px] font-bold text-[#111111]/70 mb-1">
              Dispatch Instructions & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Gate pass required for mining site entry. Customer requested delivery receipt signed by Master Mechanic."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#22A06B]"
            />
          </div>

          {/* Footer */}
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
              className="px-5 py-2 rounded-xl bg-[#22A06B] hover:bg-[#1b8055] text-white text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Issue Order</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
