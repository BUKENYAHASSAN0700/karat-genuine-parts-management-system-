import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ClipboardCheck, 
  Truck, 
  Building, 
  Calendar, 
  ShieldCheck, 
  PackageCheck,
  UserCheck
} from 'lucide-react';
import { OEMPurchaseOrder } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface GoodsReceivedNoteModalProps {
  order: OEMPurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GoodsReceivedNoteModal: React.FC<GoodsReceivedNoteModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { formatMoney, currentUser } = useInertia();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const grnNumber = order.grn_number || `GRN-2026-0${440 + Math.floor(Math.random() * 40)}`;
  const receivedDate = order.received_date || order.eta || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const receiverName = order.received_by || currentUser?.name || 'Hassan (Yard 4 Supervisor)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Topbar - Screen Only */}
        <div className="p-4 sm:px-6 bg-[#111111] text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22A06B] flex items-center justify-center text-white font-black">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">{grnNumber}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#22A06B] text-white">
                  Stock Shelved & Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Goods Received Note (GRN) • Ref: {order.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#22A06B] hover:bg-[#1c8c5c] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official GRN</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable GRN Document */}
        <div className="p-6 sm:p-10 overflow-y-auto grow space-y-6 bg-[#FDFDFD]" ref={printRef}>
          
          {/* Header */}
          <div className="border-b-2 border-[#111111] pb-6 flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-black tracking-widest text-[#111111]">
                  KARAT
                </span>
                <span className="px-2 py-0.5 bg-[#22A06B] text-white font-black text-[10px] rounded uppercase tracking-wider">
                  Warehouse Depot
                </span>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wide">
                Stores Ingest & Quality Assurance Inspection
              </div>
              <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Plot 14 Industrial Area, Yard 4, Kampala, Uganda<br />
                Central Heavy Parts Receiving Bay • Dock 3<br />
                Internal System Code: KARAT-WMS-INGEST
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight uppercase">
                Goods Received Note
              </div>
              <div className="font-mono text-sm font-black text-white bg-[#22A06B] px-3 py-1 rounded-md inline-block">
                {grnNumber}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">Receipt Date:</span> {receivedDate}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">Purchase Order Ref:</span> <span className="font-mono font-bold">{order.id}</span>
              </div>
              <div className="text-xs font-mono text-slate-600">
                <span className="font-semibold font-sans">Receiving Inspector:</span> {receiverName}
              </div>
            </div>
          </div>

          {/* Supplier & Logistics Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="text-[10px] uppercase font-black text-slate-400">OEM Supplier / Origin</div>
              <div className="font-black text-[#111111]">{order.supplier_name}</div>
              <div className="text-slate-500 font-medium">{order.supplier_brand} Hub • {order.supplier_country}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="text-[10px] uppercase font-black text-slate-400">Carrier & Waybill Ref</div>
              <div className="font-black text-[#111111]">{order.carrier || 'International Freight Carrier'}</div>
              <div className="font-mono text-slate-600 font-bold">{order.tracking_number || 'AWB-Direct'}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="text-[10px] uppercase font-black text-slate-400">Storage Location</div>
              <div className="font-black text-[#111111]">Yard 4 Industrial Area Depot</div>
              <div className="text-slate-500 font-medium">Under Bond / Cleared for Shelf Storage</div>
            </div>
          </div>

          {/* Inspection & Verified Stock Check Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111111] text-white text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 text-center w-10">#</th>
                  <th className="py-2.5 px-3">Part Description & Specification</th>
                  <th className="py-2.5 px-3">OEM / Part #</th>
                  <th className="py-2.5 px-3 text-center">Allocated Bin</th>
                  <th className="py-2.5 px-3 text-center">Qty Ordered</th>
                  <th className="py-2.5 px-3 text-center">Qty Received</th>
                  <th className="py-2.5 px-3 text-center">Inspection Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {order.items.map((item, index) => {
                  const qtyReceived = item.quantity_received !== undefined ? item.quantity_received : item.quantity_ordered;
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3 font-black text-[#111111]">
                        {item.name}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {item.brand} Genuine Component
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-700 font-bold">
                        {item.part_number}
                        {item.oem_number && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            OEM: {item.oem_number}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-700 font-bold">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {item.target_bin || 'Yard 4 Ingest'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-600">
                        {item.quantity_ordered}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-[#22A06B]">
                        {qtyReceived}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22A06B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-[#22A06B]" />
                          <span>Passed QA</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quality Inspection & Warehouse Endorsement Notes */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
            <div className="font-extrabold text-[#111111] flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-[#22A06B]" />
              <span>Receiving Bay Verification Summary</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Consignment received in tamper-evident crates/cartons with OEM manufacturer holographic security seals intact. All serial numbers cross-referenced against packing list and air/ocean bill. Components inspected for transit rust, impact, or sealant compromise. All items marked as verified have been immediately absorbed into active inventory stock in the KARAT Enterprise Database.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Stores Receiving Officer:</div>
              <div className="font-bold text-[#111111] mt-1">{receiverName}</div>
              <div className="text-[11px] text-slate-500">Warehouse Receiving & Shelving Inspector</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48"></div>
              <div className="text-[10px] text-slate-400 mt-1">Date & Signature of Acceptance</div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Inventory Controller / Master:</div>
              <div className="font-bold text-[#111111] mt-1">Hassan</div>
              <div className="text-[11px] text-slate-500">Karat Heavy Machinery Spare Parts</div>
              <div className="mt-8 border-b border-dashed border-slate-400 w-48 ml-auto"></div>
              <div className="text-[10px] text-slate-400 mt-1">Stock Endorsement Stamp</div>
            </div>
          </div>

        </div>

        {/* Modal Footer - Screen Only */}
        <div className="p-4 sm:px-6 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Inventory stock has been incremented and updated in real-time.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-[#111111] font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#22A06B]" />
              <span>Print GRN Document</span>
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
