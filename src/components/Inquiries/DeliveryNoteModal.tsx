import React from 'react';
import { 
  Printer, 
  X, 
  Building, 
  Phone, 
  Truck, 
  Cpu, 
  ShieldCheck, 
  FileCheck2,
  Clock,
  MapPin
} from 'lucide-react';
import { CommercialOrder } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface DeliveryNoteModalProps {
  order: CommercialOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: CommercialOrder['fulfillment_status']) => void;
}

export const DeliveryNoteModal: React.FC<DeliveryNoteModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  const { formatMoney, currentUser } = useInertia();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        id="delivery-note-modal"
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:rounded-none"
      >
        {/* Modal Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111111] text-white print:hidden">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#F6AF31]" />
            <span className="text-xs font-black uppercase tracking-wider font-mono">
              Goods Delivery Note & Dispatch Slip • {order.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {order.fulfillment_status !== 'Delivered & Signed' && onUpdateStatus && (
              <button
                onClick={() => {
                  onUpdateStatus(order.id, 'Delivered & Signed');
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#22A06B] hover:bg-[#1b8055] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Mark Delivered & Signed</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Delivery Note</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Delivery Note Body */}
        <div className="p-6 sm:p-10 space-y-6 text-[#111111] font-sans">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-[#111111]">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black shrink-0">
                  <Cpu className="w-5 h-5 text-[#F6AF31]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] font-mono leading-none">
                    KARAT LOGISTICS
                  </h1>
                  <span className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-bold block mt-0.5">
                    Fleet Dispatch & Yard Materials Release
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-[#111111]/70 leading-relaxed font-medium">
                Main Yard: Plot 18 Jinja Road Heavy Machinery Industrial Corridor<br />
                Yard 4 Dispatch Depot: Nakawa Heavy Equipment Hub<br />
                Dispatch Hotline: +256 700 842 100 / +256 772 555 427
              </div>
            </div>

            {/* Note Metadata */}
            <div className="sm:text-right space-y-1 bg-[#F7F6F3] p-4 rounded-2xl border border-slate-200/80 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]/40 block">
                GOODS DELIVERY NOTE (GDN)
              </span>
              <div className="text-xl font-mono font-black text-[#111111]">
                GDN-{order.id.replace('ORD-', '')}
              </div>
              <div className="text-xs text-[#111111]/70">
                Order Ref: <span className="font-mono font-bold text-[#111111]">{order.id}</span>
              </div>
              {order.po_reference && (
                <div className="text-xs text-[#111111]/70">
                  Client PO: <span className="font-mono font-bold text-[#111111]">{order.po_reference}</span>
                </div>
              )}
              <div className="text-xs text-[#111111]/70">
                Dispatch Date: <span className="font-bold text-[#111111]">{order.date}</span>
              </div>
            </div>
          </div>

          {/* Consignee & Transit Transport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F6F3]/70 border border-slate-200/70 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]/40 block">
                Consignee / Delivering To
              </span>
              <div className="font-black text-sm text-[#111111]">
                {order.customer_name}
              </div>
              {order.customer_company && (
                <div className="font-bold text-[#111111]/80 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#111111]/50" />
                  <span>{order.customer_company}</span>
                </div>
              )}
              {order.customer_phone && (
                <div className="text-[#111111]/70 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#111111]/50" />
                  <span>{order.customer_phone}</span>
                </div>
              )}
              <div className="text-[#111111]/80 flex items-start gap-1.5 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0 mt-0.5" />
                <span>{order.delivery_site}</span>
              </div>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]/40 block">
                Transport & Transit Details
              </span>
              <div className="font-bold text-[#111111]">
                Method: <span className="font-semibold text-[#111111]/80">{order.delivery_method}</span>
              </div>
              <div className="text-[#111111]/80">
                Assigned Driver: <span className="font-bold text-[#111111]">{order.driver_name || 'Geoffrey Mukasa (Senior Dispatch Driver)'}</span>
              </div>
              <div className="text-[#111111]/80 font-mono">
                Vehicle Reg: <span className="font-bold text-[#111111]">{order.vehicle_reg || 'UBK 492T (Toyota Hilux Heavy Transit)'}</span>
              </div>
              <div className="text-[#111111]/80">
                Gate Pass ID: <span className="font-mono font-bold text-[#111111]">GP-2026-{(Math.floor(1000 + Math.random() * 9000))}</span>
              </div>
              <div className="text-[#111111]/80">
                Assigned Machine: <span className="font-bold text-[#111111]">{order.equipment_model}</span>
              </div>
            </div>
          </div>

          {/* Delivered Items Verification Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-black tracking-wider text-[#111111]/60">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-3">Part Name & Specification</th>
                  <th className="py-2.5 px-3">Part / OEM #</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3 text-center">Qty Dispatched</th>
                  <th className="py-2.5 px-3 text-center">Physical Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-mono text-[11px] text-[#111111]/50">{idx + 1}</td>
                    <td className="py-3 px-3 font-black text-[#111111]">{item.name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] font-bold text-[#111111]">
                      {item.part_number} {item.oem_number && `(${item.oem_number})`}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#111111]/80">{item.brand || 'OEM Heavy Duty'}</td>
                    <td className="py-3 px-3 text-center font-mono font-black text-sm text-[#111111]">
                      {item.quantity} Unit(s)
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="w-5 h-5 border-2 border-slate-400 rounded mx-auto flex items-center justify-center">
                        <span className="text-[10px] text-slate-300">✓</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delivery Note Special Instructions */}
          <div className="p-3 rounded-2xl bg-[#F7F6F3] border border-slate-200 text-xs text-[#111111]/80 leading-relaxed">
            <span className="font-bold text-[#111111]">Inspection & Receiving Protocol: </span>
            Please inspect all delivered packages, crate seals, and part numbers before signing below. Any discrepancies or transit damage must be endorsed on this delivery note within 24 hours of site delivery.
          </div>

          {/* Dual Sign-off Blocks */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200 text-xs">
            {/* Dispatch Yard Release Sign-off */}
            <div className="space-y-4">
              <div className="font-bold text-[#111111] uppercase tracking-wider text-[10px]">
                Dispatched By (KARAT Machinery Yard)
              </div>
              <div className="h-12 border-b border-dashed border-slate-400"></div>
              <div className="space-y-0.5 text-[11px] text-[#111111]/80">
                <div>Name: <span className="font-bold text-[#111111]">{currentUser?.name || 'Kalema Arafat'}</span></div>
                <div>Designation: Dispatch Logistics Officer</div>
                <div>Date & Time: {order.date}</div>
              </div>
            </div>

            {/* Consignee Receiving Sign-off */}
            <div className="space-y-4">
              <div className="font-bold text-[#111111] uppercase tracking-wider text-[10px]">
                Received in Good Condition By (Client Site)
              </div>
              <div className="h-12 border-b border-dashed border-slate-400"></div>
              <div className="space-y-0.5 text-[11px] text-[#111111]/80">
                <div>Receiver Name: __________________________</div>
                <div>Designation: Plant / Fleet Manager</div>
                <div>Receiver Signature & Site Rubber Stamp</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
