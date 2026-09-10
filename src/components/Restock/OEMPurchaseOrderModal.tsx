import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building, 
  Truck, 
  Plane, 
  Ship, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Globe 
} from 'lucide-react';
import { OEMPurchaseOrder } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface OEMPurchaseOrderModalProps {
  order: OEMPurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (status: OEMPurchaseOrder['status']) => void;
}

export const OEMPurchaseOrderModal: React.FC<OEMPurchaseOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const { formatMoney, currentUser } = useInertia();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Header Bar - Screen Only */}
        <div className="p-4 sm:px-6 bg-[#111111] text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F6AF31] flex items-center justify-center text-[#111111] font-black">
              PO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">{order.id}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  order.status === 'Received & Stocked'
                    ? 'bg-[#22A06B] text-white'
                    : order.status === 'At Receiving Bay'
                    ? 'bg-amber-400 text-black font-extrabold'
                    : order.status === 'Customs Clearance'
                    ? 'bg-purple-600 text-white'
                    : order.status === 'In Transit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official OEM Purchase Order • {order.supplier_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official PO</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Area) */}
        <div className="p-6 sm:p-10 overflow-y-auto grow space-y-6 bg-[#FDFDFD]" ref={printRef}>
          
          {/* Header & Corporate Letterhead */}
          <div className="border-b-2 border-[#111111] pb-6 flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-black tracking-widest text-[#111111]">
                  KARAT
                </span>
                <span className="px-2 py-0.5 bg-[#F6AF31] text-[#111111] font-black text-[10px] rounded uppercase tracking-wider">
                  OEM Procurement
                </span>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wide">
                  Karat Heavy Machinery Spare Parts
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Plot 14 Industrial Area, Yard 4, Kampala, Uganda<br />
                TIN: 1004829104 • VAT No: 99420-UG • Import Reg: URA-IMP-7721<br />
                Tel: +256 772 555 272 • Email: procurement@karat-machinery.com
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight uppercase">
                Purchase Order
              </div>
              <div className="font-mono text-sm font-black text-[#F6AF31] bg-[#111111] px-3 py-1 rounded-md inline-block">
                {order.id}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">Issue Date:</span> {order.order_date}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">Target ETA:</span> {order.eta}
              </div>
              <div className="text-xs font-mono text-slate-600">
                <span className="font-semibold font-sans">Payment Terms:</span> {order.payment_terms}
              </div>
            </div>
          </div>

          {/* Supplier & Consignee Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Vendor / OEM Supplier */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-600" />
                <span>Vendor / OEM Manufacturer</span>
              </div>
              <div className="font-black text-sm text-[#111111]">
                {order.supplier_name}
              </div>
              <div className="text-slate-600 font-medium">
                Authorized {order.supplier_brand} Global Distribution Hub
              </div>
              {order.supplier_contact && (
                <div className="text-slate-500">
                  <span className="font-semibold text-slate-700">Attn:</span> {order.supplier_contact}
                </div>
              )}
              {order.supplier_email && (
                <div className="text-slate-500 font-mono text-[11px]">
                  {order.supplier_email}
                </div>
              )}
              {order.supplier_country && (
                <div className="text-slate-500 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>Origin: {order.supplier_country}</span>
                </div>
              )}
            </div>

            {/* Consignee & Shipping Logistics */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-600" />
                <span>Consignee & Freight Destination</span>
              </div>
              <div className="font-black text-sm text-[#111111]">
                Karat Heavy Machinery Spare Parts (Yard 4 Industrial Area)
              </div>
              <div className="text-slate-600">
                <span className="font-semibold text-slate-700">Shipping Mode:</span> {order.shipping_method}
              </div>
              {order.carrier && (
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-700">Designated Carrier:</span> {order.carrier}
                </div>
              )}
              {order.tracking_number && (
                <div className="text-slate-700 font-mono text-[11px] font-bold">
                  <span className="font-sans font-semibold text-slate-500">AWB / BL Tracking:</span> {order.tracking_number}
                </div>
              )}
              <div className="text-slate-600">
                <span className="font-semibold text-slate-700">Routing:</span> {order.port_of_loading} → {order.port_of_discharge}
              </div>
              <div className="text-slate-600">
                <span className="font-semibold text-slate-700">Incoterms:</span> <span className="font-bold text-[#111111]">{order.incoterm}</span>
              </div>
            </div>

          </div>

          {/* Component Line Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111111] text-white text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">Part Description & Application</th>
                  <th className="py-2.5 px-3">Part # / OEM Ref</th>
                  <th className="py-2.5 px-3 text-center">Brand</th>
                  <th className="py-2.5 px-3 text-center">Target Bin</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit FOB Cost</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {order.items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-3 font-black text-[#111111]">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-700 font-bold">
                      {item.part_number}
                      {item.oem_number && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Model: {item.oem_number}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.brand}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600">
                      {item.target_bin || 'Yard 4 Ingest'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-[#111111]">
                      {item.quantity_ordered}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatMoney(item.unit_cost)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-[#111111]">
                      {formatMoney(item.total_cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
              <div className="font-extrabold text-[#111111] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F6AF31]" />
                <span>OEM Certification & Warranty Terms</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                All components supplied under this Purchase Order must be 100% genuine factory-certified OEM parts matching Caterpillar, Komatsu, Volvo, or Hitachi specifications. Certificates of Conformance (CoC) and manufacturer warranty certificates (12 months / 2,000 operational hours) must accompany the shipping documents.
              </p>
              {order.notes && (
                <div className="pt-2 mt-2 border-t border-amber-200/60 text-[11px] text-slate-700">
                  <span className="font-bold">Order Directives:</span> {order.notes}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Parts Subtotal FOB:</span>
                <span className="font-mono font-bold text-[#111111]">{formatMoney(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>International Freight ({order.shipping_method.includes('Air') ? 'Air Cargo' : 'Ocean Container'}):</span>
                <span className="font-mono font-bold text-[#111111]">{formatMoney(order.freight_cost)}</span>
              </div>

              {order.insurance_cost !== undefined && order.insurance_cost > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Marine & Cargo Transit Insurance:</span>
                  <span className="font-mono font-bold text-[#111111]">{formatMoney(order.insurance_cost)}</span>
                </div>
              )}

              {order.customs_duty_est !== undefined && order.customs_duty_est > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Customs Clearing & Port Charges:</span>
                  <span className="font-mono font-bold text-slate-600">{formatMoney(order.customs_duty_est)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-black text-sm">
                <span className="text-[#111111]">Total PO Commitment ({order.currency}):</span>
                <span className="text-xl font-mono text-[#22A06B]">{formatMoney(order.total_cost)}</span>
              </div>

              <div className="text-[10px] text-right text-slate-400">
                Status: <span className="font-bold text-slate-700">{order.payment_status}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Execution Section */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Prepared & Issued By:</div>
              <div className="font-bold text-[#111111] mt-1">{currentUser?.name || 'Hassan'}</div>
              <div className="text-[11px] text-slate-500">Procurement & Fleet Logistics Director</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48"></div>
              <div className="text-[10px] text-slate-400 mt-1">Authorized KARAT Stamp & Signature</div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Vendor OEM Acceptance:</div>
              <div className="font-bold text-[#111111] mt-1">{order.supplier_name}</div>
              <div className="text-[11px] text-slate-500">Order Confirmation & Freight Allocation</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48 ml-auto"></div>
              <div className="text-[10px] text-slate-400 mt-1">OEM Factory Representative Date & Seal</div>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions - Screen Only */}
        <div className="p-4 sm:px-6 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Status:</span>
            <span className="text-xs font-bold text-[#111111] bg-white px-3 py-1 rounded-lg border border-slate-200">
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-[#111111] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#F6AF31]" />
              <span>Print PO Slip</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
