import React from 'react';
import { 
  Printer, 
  X, 
  Building, 
  Phone, 
  Mail, 
  Cpu, 
  ShieldCheck, 
  ArrowUpRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { InquiryItem } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface QuotationModalProps {
  inquiry: InquiryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConvertToOrder?: (inquiryId: string) => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  inquiry,
  isOpen,
  onClose,
  onConvertToOrder
}) => {
  const { formatMoney, currentUser } = useInertia();

  if (!isOpen || !inquiry) return null;

  const handlePrint = () => {
    window.print();
  };

  const lineItems = inquiry.items && inquiry.items.length > 0 ? inquiry.items : [
    {
      part_number: inquiry.id,
      name: inquiry.parts_requested,
      quantity: 1,
      unit_price: inquiry.quoted_amount,
      total_price: inquiry.quoted_amount,
      in_stock: true,
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        id="quotation-print-modal"
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:rounded-none"
      >
        {/* Modal Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111111] text-white print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F6AF31]" />
            <span className="text-xs font-black uppercase tracking-wider font-mono">
              Official Commercial Quotation • {inquiry.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {inquiry.status !== 'Converted to Order' && onConvertToOrder && (
              <button
                onClick={() => {
                  onConvertToOrder(inquiry.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#22A06B] hover:bg-[#1b8055] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Convert to Order</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Quotation</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Sheet Body */}
        <div className="p-6 sm:p-10 space-y-6 text-[#111111] font-sans">
          
          {/* Header & Company Brand Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-[#111111]">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black shrink-0">
                  <Cpu className="w-5 h-5 text-[#F6AF31]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] font-mono leading-none">
                    KARAT
                  </h1>
                  <span className="text-[10px] uppercase tracking-widest text-[#111111]/60 font-bold block mt-0.5">
                    Heavy Machinery & Spare Parts
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-[#111111]/70 leading-relaxed font-medium">
                Plot 18, Jinja Road Heavy Machinery Industrial Corridor<br />
                P.O. Box 7421, Kampala, Uganda<br />
                TIN: 1009-8422-710 • VAT Reg: UG984102<br />
                Phone: +256 700 842 100 / +256 772 555 427<br />
                Email: quotes@karatparts.com • Web: www.karatparts.com
              </div>
            </div>

            {/* Quotation Ref Block */}
            <div className="sm:text-right space-y-1.5 bg-[#F7F6F3] p-4 rounded-2xl border border-slate-200/80 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]/40 block">
                PRO-FORMA QUOTATION
              </span>
              <div className="text-xl font-mono font-black text-[#111111]">
                {inquiry.id}
              </div>
              <div className="text-xs text-[#111111]/70">
                Date: <span className="font-bold text-[#111111]">{inquiry.created_at}</span>
              </div>
              <div className="text-xs text-[#111111]/70">
                Validity: <span className="font-bold text-[#22A06B]">{inquiry.validity_period || '14 Days from date of issue'}</span>
              </div>
              <div className="pt-1">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  inquiry.priority?.includes('Critical') 
                    ? 'bg-[#DC2626] text-white' 
                    : 'bg-[#F6AF31] text-[#111111]'
                }`}>
                  {inquiry.priority || 'Standard Commercial'}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Equipment Target Fleet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F7F6F3]/70 border border-slate-200/70 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]/40 block">
                Customer / Contractor Details
              </span>
              <div className="font-black text-sm text-[#111111]">
                {inquiry.customer_name}
              </div>
              {inquiry.customer_company && (
                <div className="font-bold text-[#111111]/80 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#111111]/50" />
                  <span>{inquiry.customer_company}</span>
                </div>
              )}
              {inquiry.customer_phone && (
                <div className="text-[#111111]/70 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#111111]/50" />
                  <span>{inquiry.customer_phone}</span>
                </div>
              )}
              {inquiry.customer_email && (
                <div className="text-[#111111]/70 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#111111]/50" />
                  <span>{inquiry.customer_email}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#111111]/40 block">
                Target Machinery & Project Site
              </span>
              <div className="font-black text-sm text-[#111111]">
                {inquiry.equipment_model}
              </div>
              {inquiry.equipment_serial && (
                <div className="font-mono text-[11px] text-[#111111]/80">
                  Chassis/VIN: <span className="font-bold text-[#111111]">{inquiry.equipment_serial}</span>
                </div>
              )}
              {inquiry.delivery_site && (
                <div className="text-[#111111]/80 mt-1">
                  Site: <span className="font-semibold">{inquiry.delivery_site}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quotation Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-black tracking-wider text-[#111111]/60">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-3">Part Details / OEM Ref</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-mono text-[11px] text-[#111111]/50">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-black text-[#111111]">{item.name}</div>
                      <div className="font-mono text-[10px] text-[#111111]/60 mt-0.5">
                        KA Ref: {item.part_number} {item.oem_number && `• OEM: ${item.oem_number}`}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#111111]/80">{item.brand || 'OEM Heavy Duty'}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#111111]/80">
                      {formatMoney(item.unit_price)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-[#111111]">
                      {formatMoney(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-200">
            <div className="max-w-md space-y-1.5 text-xs text-[#111111]/70">
              <div className="font-bold text-[#111111]">Notes & Commercial Warranty:</div>
              <p className="text-[11px] leading-relaxed">
                {inquiry.notes || 'All parts backed by KARAT 12-Month / 2,000-Hour replacement warranty against manufacturing defects. Prices include port clearance and local warehouse prep.'}
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs bg-[#F7F6F3] p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-[#111111]/70">
                <span>Subtotal Net:</span>
                <span className="font-mono font-bold">{formatMoney(inquiry.quoted_amount)}</span>
              </div>
              <div className="flex justify-between text-[#111111]/70">
                <span>VAT / Sales Tax (0% Exempt):</span>
                <span className="font-mono font-bold">{formatMoney(0)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#111111] pt-2 border-t border-slate-300">
                <span>Grand Total:</span>
                <span className="font-mono font-black text-[#111111]">
                  {formatMoney(inquiry.quoted_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details & Sign-off Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
              <div className="font-black text-[#111111] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22A06B]" />
                <span>Bank Settlement & Wire Instructions</span>
              </div>
              <div className="text-[11px] text-[#111111]/70 font-mono space-y-0.5 mt-1">
                <div>Bank: Stanbic Bank Uganda Ltd</div>
                <div>Account Name: KARAT Machinery Ltd</div>
                <div>UGX A/C: 9030018420912</div>
                <div>USD A/C: 9030018420935 (Swift: SBICUGKX)</div>
              </div>
            </div>

            <div className="flex flex-col justify-end space-y-4 pt-2">
              <div className="border-b border-dashed border-slate-400 pb-1">
                <span className="font-mono font-bold text-xs text-[#111111]">
                  {currentUser?.name || 'Hassan Bukenya'}
                </span>
                <span className="text-[10px] text-[#111111]/50 block">Authorized Technical Sales Engineer</span>
              </div>
              <div className="text-[10px] text-[#111111]/40 uppercase font-mono">
                Commercial Official Stamp & Signature Block
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
