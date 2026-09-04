import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Search, 
  Building, 
  Truck, 
  Plane, 
  Ship, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  Check, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { OEMSupplier, OEMPurchaseOrderItem, OEMPurchaseOrder, SparePart } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface NewOEMPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedSupplier?: OEMSupplier | null;
  preSelectedParts?: SparePart[] | null;
}

export const NewOEMPurchaseOrderModal: React.FC<NewOEMPurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  preSelectedSupplier,
  preSelectedParts,
}) => {
  const { suppliers, parts, addOEMOrder, formatMoney } = useInertia();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<OEMPurchaseOrder['shipping_method']>(
    'Expedited Air Freight (3-5 Days)'
  );
  const [carrier, setCarrier] = useState<string>('Emirates SkyCargo');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [portOfLoading, setPortOfLoading] = useState<string>('Brussels Zaventem (BRU)');
  const [portOfDischarge, setPortOfDischarge] = useState<string>('Entebbe International Airport (EBB)');
  const [incoterm, setIncoterm] = useState<OEMPurchaseOrder['incoterm']>('CIF Kampala');
  const [paymentTerms, setPaymentTerms] = useState<OEMPurchaseOrder['payment_terms']>('100% Wire Transfer (T/T)');
  const [paymentStatus, setPaymentStatus] = useState<OEMPurchaseOrder['payment_status']>('Paid in Full');
  const [orderStatus, setOrderStatus] = useState<OEMPurchaseOrder['status']>('In Transit');
  const [etaDays, setEtaDays] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [freightCost, setFreightCost] = useState<number>(650);
  const [insuranceCost, setInsuranceCost] = useState<number>(75);
  const [customsDutyEst, setCustomsDutyEst] = useState<number>(250);

  // Line items
  const [items, setItems] = useState<OEMPurchaseOrderItem[]>([]);
  const [partSearch, setPartSearch] = useState<string>('');
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState<boolean>(false);

  // Initialize supplier & parts if passed
  useEffect(() => {
    if (isOpen) {
      if (preSelectedSupplier) {
        setSelectedSupplierId(preSelectedSupplier.id);
        setPortOfLoading(preSelectedSupplier.port_of_origin);
        if (preSelectedSupplier.preferred_freight === 'Ocean Container') {
          setShippingMethod('Ocean Container (25-35 Days)');
          setCarrier('Maersk Line');
          setPortOfDischarge('Mombasa Port -> ICD Kampala');
          setEtaDays(30);
          setFreightCost(850);
        } else {
          setShippingMethod('Expedited Air Freight (3-5 Days)');
          setCarrier('Emirates SkyCargo');
          setPortOfDischarge('Entebbe International Airport (EBB)');
          setEtaDays(preSelectedSupplier.typical_lead_days_air || 4);
          setFreightCost(650);
        }
      } else if (suppliers.length > 0 && !selectedSupplierId) {
        const defaultSup = suppliers[0];
        setSelectedSupplierId(defaultSup.id);
        setPortOfLoading(defaultSup.port_of_origin);
      }

      if (preSelectedParts && preSelectedParts.length > 0) {
        const initialItems: OEMPurchaseOrderItem[] = preSelectedParts.map(p => {
          const suggestedQty = Math.max(2, (p.min_stock_alert * 2) - p.stock_quantity);
          return {
            part_id: p.id,
            part_number: p.part_number,
            oem_number: p.oem_number || '',
            name: p.name,
            brand: p.brand,
            quantity_ordered: suggestedQty,
            unit_cost: p.unit_cost || 150,
            total_cost: (p.unit_cost || 150) * suggestedQty,
            target_bin: p.warehouse_bin || 'Yard 4 Ingest',
          };
        });
        setItems(initialItems);
      } else if (items.length === 0) {
        // Pick one default low-stock or popular part
        const lowPart = parts.find(p => p.stock_quantity <= p.min_stock_alert) || parts[0];
        if (lowPart) {
          setItems([
            {
              part_id: lowPart.id,
              part_number: lowPart.part_number,
              oem_number: lowPart.oem_number || '',
              name: lowPart.name,
              brand: lowPart.brand,
              quantity_ordered: 4,
              unit_cost: lowPart.unit_cost,
              total_cost: lowPart.unit_cost * 4,
              target_bin: lowPart.warehouse_bin || 'Yard 4 Ingest',
            }
          ]);
        }
      }

      // Generate a realistic random AWB
      setTrackingNumber(`AWB-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10000000 + Math.random() * 90000000)}`);
    }
  }, [isOpen, preSelectedSupplier, preSelectedParts]);

  if (!isOpen) return null;

  const currentSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  const handleSupplierChange = (supId: string) => {
    setSelectedSupplierId(supId);
    const sup = suppliers.find(s => s.id === supId);
    if (sup) {
      setPortOfLoading(sup.port_of_origin);
      if (sup.preferred_freight === 'Ocean Container') {
        setShippingMethod('Ocean Container (25-35 Days)');
        setCarrier('Maersk Line');
        setPortOfDischarge('Mombasa Port -> ICD Kampala');
        setEtaDays(sup.typical_lead_days_sea || 30);
        setFreightCost(850);
      } else {
        setShippingMethod('Expedited Air Freight (3-5 Days)');
        setCarrier('Emirates SkyCargo');
        setPortOfDischarge('Entebbe International Airport (EBB)');
        setEtaDays(sup.typical_lead_days_air || 4);
        setFreightCost(650);
      }
    }
  };

  const handleShippingMethodChange = (method: OEMPurchaseOrder['shipping_method']) => {
    setShippingMethod(method);
    if (method.includes('Ocean')) {
      setCarrier('Maersk Line');
      setPortOfDischarge('Mombasa Port -> ICD Kampala');
      setEtaDays(30);
      setFreightCost(850);
    } else {
      setCarrier('Emirates SkyCargo');
      setPortOfDischarge('Entebbe International Airport (EBB)');
      setEtaDays(4);
      setFreightCost(650);
    }
  };

  const addItemFromCatalog = (part: SparePart) => {
    // Check if already in items
    const existingIndex = items.findIndex(it => it.part_number === part.part_number);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity_ordered += 1;
      updated[existingIndex].total_cost = updated[existingIndex].quantity_ordered * updated[existingIndex].unit_cost;
      setItems(updated);
    } else {
      const newItem: OEMPurchaseOrderItem = {
        part_id: part.id,
        part_number: part.part_number,
        oem_number: part.oem_number || '',
        name: part.name,
        brand: part.brand,
        quantity_ordered: 2,
        unit_cost: part.unit_cost,
        total_cost: part.unit_cost * 2,
        target_bin: part.warehouse_bin || 'Yard 4 Ingest Bay',
      };
      setItems([...items, newItem]);
    }
    setIsCatalogPickerOpen(false);
  };

  const addCustomItem = () => {
    const customItem: OEMPurchaseOrderItem = {
      part_number: `OEM-${Math.floor(1000 + Math.random() * 9000)}`,
      oem_number: '',
      name: 'Custom OEM Replacement Component',
      brand: currentSupplier?.brand || 'Caterpillar',
      quantity_ordered: 1,
      unit_cost: 250,
      total_cost: 250,
      target_bin: 'Yard 4 Ingest Bay',
    };
    setItems([...items, customItem]);
  };

  const updateItem = (index: number, field: keyof OEMPurchaseOrderItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity_ordered' || field === 'unit_cost') {
        const qty = field === 'quantity_ordered' ? Number(value) || 1 : item.quantity_ordered;
        const cost = field === 'unit_cost' ? Number(value) || 0 : item.unit_cost;
        item.total_cost = qty * cost;
      }
      updated[index] = item;
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, it) => sum + (it.total_cost || 0), 0);
  const totalCost = subtotal + freightCost + insuranceCost + customsDutyEst;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Please add at least one line item to the OEM Purchase Order.');
      return;
    }

    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + etaDays);
    const etaString = etaDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + 
      ` (${etaDays} days transit)`;

    addOEMOrder({
      supplier_id: currentSupplier.id,
      supplier_name: currentSupplier.name,
      supplier_brand: currentSupplier.brand,
      supplier_contact: currentSupplier.contact_person,
      supplier_email: currentSupplier.email,
      supplier_country: currentSupplier.country,
      items,
      subtotal,
      freight_cost: freightCost,
      insurance_cost: insuranceCost,
      customs_duty_est: customsDutyEst,
      total_cost: totalCost,
      currency: 'USD',
      status: orderStatus,
      shipping_method: shippingMethod,
      tracking_number: trackingNumber,
      carrier,
      port_of_loading: portOfLoading,
      port_of_discharge: portOfDischarge,
      incoterm,
      payment_terms: paymentTerms,
      payment_status: paymentStatus,
      eta: etaString,
      notes: notes || `Direct OEM consignment replenishment for ${currentSupplier.brand} fleet parts.`,
    });

    onClose();
  };

  const filteredCatalogParts = parts.filter(p => {
    const q = partSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.part_number.toLowerCase().includes(q) ||
      (p.oem_number && p.oem_number.toLowerCase().includes(q)) ||
      p.brand.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 sm:px-6 bg-[#111111] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6AF31] flex items-center justify-center text-[#111111] font-black">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Issue OEM Purchase Order</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  Restock Inbound
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct international manufacturer requisition & freight booking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto grow space-y-6">
          
          {/* Supplier Selection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#F6AF31]" />
                <span>Select OEM Manufacturer / Distribution Hub</span>
              </label>
              <span className="text-[11px] font-mono text-slate-500">
                Authorized Account: <strong className="text-[#111111]">{currentSupplier?.account_number}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {suppliers.map(sup => (
                <div
                  key={sup.id}
                  onClick={() => handleSupplierChange(sup.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedSupplierId === sup.id
                      ? 'border-[#F6AF31] bg-amber-50/50 ring-2 ring-[#F6AF31]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#111111] text-white">
                      {sup.brand}
                    </span>
                    {selectedSupplierId === sup.id && (
                      <Check className="w-4 h-4 text-[#F6AF31]" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-[#111111] mt-1.5 truncate">
                    {sup.name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>{sup.country}</span>
                    <span className="font-mono text-[10px] text-slate-400">{sup.preferred_freight.includes('Air') ? 'Air Cargo' : 'Ocean'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Logistics & Routing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Freight Mode
              </label>
              <select
                value={shippingMethod}
                onChange={e => handleShippingMethodChange(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              >
                <option value="Expedited Air Freight (3-5 Days)">Expedited Air Freight (3-5 Days)</option>
                <option value="Ocean Container (25-35 Days)">Ocean Container (25-35 Days)</option>
                <option value="Overland Transit">Overland Transit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designated Carrier
              </label>
              <input
                type="text"
                value={carrier}
                onChange={e => setCarrier(e.target.value)}
                placeholder="e.g. Emirates SkyCargo, Maersk"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                AWB / B/L Tracking #
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="e.g. AWB-176-99214820"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Port of Loading (Origin)
              </label>
              <input
                type="text"
                value={portOfLoading}
                onChange={e => setPortOfLoading(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Port of Discharge / Destination
              </label>
              <input
                type="text"
                value={portOfDischarge}
                onChange={e => setPortOfDischarge(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Incoterm
              </label>
              <select
                value={incoterm}
                onChange={e => setIncoterm(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              >
                <option value="CIF Kampala">CIF Kampala (Carriage, Ins, Freight)</option>
                <option value="DAP Nakawa Yard">DAP Nakawa Yard (Delivered at Place)</option>
                <option value="FOB Origin">FOB Origin (Free on Board)</option>
                <option value="EXW Factory">EXW Factory (Ex Works)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              >
                <option value="100% Wire Transfer (T/T)">100% Wire Transfer (T/T)</option>
                <option value="Letter of Credit (L/C)">Letter of Credit (L/C)</option>
                <option value="30% Advance, 70% vs B/L">30% Advance, 70% vs B/L</option>
                <option value="OEM Net 30">OEM Net 30 (Corporate Account)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Pipeline Status
              </label>
              <select
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              >
                <option value="In Transit">In Transit (Air / Sea En Route)</option>
                <option value="Confirmed & Placed">Confirmed & Placed (Factory Allocating)</option>
                <option value="Customs Clearance">Customs Clearance (Port Entry)</option>
                <option value="At Receiving Bay">At Receiving Bay (Ready for Ingest)</option>
                <option value="Draft">Draft PO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Transit Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={etaDays}
                onChange={e => setEtaDays(Number(e.target.value) || 4)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
              />
            </div>

          </div>

          {/* Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#F6AF31]" />
                  <span>Components & Spare Parts To Order ({items.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select genuine parts from catalog or insert custom OEM part codes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatalogPickerOpen(prev => !prev)}
                  className="px-3 py-1.5 bg-[#111111] text-white hover:bg-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5 text-[#F6AF31]" />
                  <span>Pick From Catalog</span>
                </button>
                <button
                  type="button"
                  onClick={addCustomItem}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom Item</span>
                </button>
              </div>
            </div>

            {/* Catalog Picker Dropdown Panel */}
            {isCatalogPickerOpen && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#111111] uppercase">
                    Select Part from Inventory Catalog
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCatalogPickerOpen(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by part name, SKU, OEM #, or model..."
                    value={partSearch}
                    onChange={e => setPartSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31]"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
                  {filteredCatalogParts.map(part => (
                    <div
                      key={part.id}
                      onClick={() => addItemFromCatalog(part)}
                      className="p-2.5 hover:bg-amber-50/50 flex items-center justify-between cursor-pointer transition text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#111111]">{part.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          SKU: {part.part_number} • OEM: {part.oem_number || 'N/A'} • Brand: {part.brand}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-[#111111]">
                          FOB Cost: {formatMoney(part.unit_cost)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Current Stock: <strong className={part.stock_quantity <= part.min_stock_alert ? 'text-rose-600 font-black' : 'text-slate-800'}>{part.stock_quantity}</strong> (Min: {part.min_stock_alert})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] text-white text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Part Description</th>
                    <th className="py-2.5 px-3">Part # / OEM</th>
                    <th className="py-2.5 px-3 text-center">Brand</th>
                    <th className="py-2.5 px-3 text-center">Target Bin</th>
                    <th className="py-2.5 px-3 text-center w-20">Qty</th>
                    <th className="py-2.5 px-3 text-right w-28">Unit Cost ($)</th>
                    <th className="py-2.5 px-3 text-right w-28">Total</th>
                    <th className="py-2.5 px-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => updateItem(index, 'name', e.target.value)}
                          className="w-full font-bold text-[#111111] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#F6AF31] focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.part_number}
                          onChange={e => updateItem(index, 'part_number', e.target.value)}
                          className="w-full font-mono text-[11px] font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#F6AF31] focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="text"
                          value={item.brand}
                          onChange={e => updateItem(index, 'brand', e.target.value)}
                          className="w-20 text-center text-[10px] font-bold bg-slate-100 rounded px-1 py-0.5"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="text"
                          value={item.target_bin || 'Yard 4 Ingest'}
                          onChange={e => updateItem(index, 'target_bin', e.target.value)}
                          className="w-24 text-center font-mono text-[11px] text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#F6AF31] focus:outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity_ordered}
                          onChange={e => updateItem(index, 'quantity_ordered', e.target.value)}
                          className="w-16 text-center font-mono font-black text-sm bg-slate-50 rounded border border-slate-200 py-1"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.unit_cost}
                          onChange={e => updateItem(index, 'unit_cost', e.target.value)}
                          className="w-24 text-right font-mono font-semibold text-slate-700 bg-slate-50 rounded border border-slate-200 py-1 px-1.5"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-[#111111]">
                        {formatMoney(item.total_cost)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        No parts added to this purchase order yet. Click "Pick From Catalog" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financials & Cost Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Order Notes & Logistics Directives
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Urgent rush consignment for quarry fleet breakdown. Ensure original holographic certificates are attached."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31] font-medium"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Parts Subtotal (FOB):</span>
                <span className="font-mono font-bold text-[#111111]">{formatMoney(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>International Freight:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={freightCost}
                    onChange={e => setFreightCost(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 font-mono text-right text-xs rounded border border-slate-200 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Marine / Cargo Transit Insurance:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={insuranceCost}
                    onChange={e => setInsuranceCost(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 font-mono text-right text-xs rounded border border-slate-200 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated Customs Clearance / Import Duties:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={customsDutyEst}
                    onChange={e => setCustomsDutyEst(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 font-mono text-right text-xs rounded border border-slate-200 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-[#111111]">Total PO Commitment:</span>
                <span className="text-xl font-mono text-[#22A06B]">{formatMoney(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-[#111111] transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>Dispatch & Issue OEM Purchase Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
