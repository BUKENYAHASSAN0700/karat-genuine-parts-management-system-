import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShoppingCart, 
  FileText,
  ShieldCheck,
  Building2,
  Phone,
  Calendar,
  Clock,
  User,
  Hash,
  QrCode
} from 'lucide-react';
import { SaleReceipt } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface ReceiptModalProps {
  receipt: SaleReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onNewSale?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onNewSale,
}) => {
  const { formatMoney } = useInertia();
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `
========================================
KARAT HEAVY MACHINERY SPARE PARTS
OFFICIAL SALE RECEIPT: ${receipt.receipt_number}
========================================
Date: ${receipt.date} ${receipt.time}
Customer: ${receipt.customer_name}${receipt.customer_company ? ` (${receipt.customer_company})` : ''}
Phone: ${receipt.customer_phone || 'N/A'}
Equipment: ${receipt.equipment_model || 'N/A'}
Cashier: ${receipt.cashier_name}
----------------------------------------
ITEMS SOLD:
${receipt.items.map((it, idx) => `${idx + 1}. [${it.part_number}] ${it.name} (${it.model || it.oem_number || 'Model'}) - ${it.quantity}x @ ${formatMoney(it.unit_price)} = ${formatMoney(it.total_price)}`).join('\n')}
----------------------------------------
Subtotal: ${formatMoney(receipt.subtotal)}
Discount: -${formatMoney(receipt.discount_amount)}
Tax / VAT (${receipt.tax_rate}%): ${formatMoney(receipt.tax_amount)}
TOTAL PAID: ${formatMoney(receipt.grand_total)}
Payment Method: ${receipt.payment_method}
Payment Status: ${receipt.payment_status}
${receipt.notes ? `Notes: ${receipt.notes}\n` : ''}========================================
Thank you for trusting Karat Heavy Machinery Spare Parts!
30-Day Warranty on All Parts.
`;
    navigator.clipboard.writeText(summary.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Container with print-safe styles */}
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="print:hidden bg-[#111111] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F6AF31] text-[#111111] flex items-center justify-center font-extrabold shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Sale Completed Successfully</h2>
              <p className="text-[11px] text-white/60 font-mono">Receipt #{receipt.receipt_number} generated</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Copy receipt text to send via WhatsApp or SMS"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#22A06B]" />
                  <span className="text-[#22A06B]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white/70" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition ml-1"
              title="Close receipt preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-[#FAFAF8] flex-1 print:p-0 print:bg-white print:overflow-visible" ref={receiptRef}>
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs print:border-none print:shadow-none print:p-4 text-[#111111]">
            {/* Receipt Header */}
            <div className="border-b-2 border-[#111111] pb-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-[#111111]">
                      KARAT
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F6AF31] text-[#111111] text-[10px] font-black tracking-wider uppercase">
                      Heavy Machinery
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#111111]/70 mt-1 uppercase tracking-wider">
                    Heavy Machinery Spare Parts & Fleet Logistics
                  </p>
                  <p className="text-[11px] text-[#111111]/60 mt-1">
                    Plot 44, Jinja Road Industrial Area • Kampala, Uganda
                  </p>
                  <p className="text-[11px] text-[#111111]/60">
                    Tel: +256 757 800 000 / +1 (800) 555-4272 • Email: sales@karat.com
                  </p>
                  <p className="text-[10px] font-mono text-[#111111]/50 mt-0.5">
                    TIN: 1009842891 • VAT Reg: UG-VAT-2024-K
                  </p>
                </div>

                {/* Receipt Badge & Number */}
                <div className="sm:text-right flex sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#111111] text-white text-[11px] font-extrabold uppercase tracking-wider">
                    Official Receipt
                  </span>
                  <div className="mt-2 text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50 block">Receipt No</span>
                    <span className="text-base font-black font-mono text-[#111111]">{receipt.receipt_number}</span>
                  </div>
                </div>
              </div>

              {/* Date, Time, Cashier Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#111111]/40 block">Date</span>
                  <span className="font-semibold text-[#111111] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#111111]/40" />
                    {receipt.date}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#111111]/40 block">Time</span>
                  <span className="font-semibold text-[#111111] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#111111]/40" />
                    {receipt.time}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#111111]/40 block">Cashier / Agent</span>
                  <span className="font-semibold text-[#111111] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#111111]/40" />
                    {receipt.cashier_name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#111111]/40 block">Status</span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#22A06B]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {receipt.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Billed To / Customer Section */}
            <div className="py-4 border-b border-slate-100 bg-[#F7F6F3]/50 -mx-6 sm:-mx-8 px-6 sm:px-8">
              <span className="text-[10px] uppercase font-extrabold text-[#111111]/50 tracking-wider block mb-1.5">
                Customer & Machinery Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#111111]/50 block">Customer / Company</span>
                  <span className="font-bold text-[#111111]">{receipt.customer_name}</span>
                  {receipt.customer_company && (
                    <span className="text-[11px] text-[#111111]/70 block">{receipt.customer_company}</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#111111]/50 block">Phone / Contact</span>
                  <span className="font-medium text-[#111111]">{receipt.customer_phone || 'Walk-in Customer'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#111111]/50 block">Equipment Model</span>
                  <span className="font-semibold text-[#111111]">{receipt.equipment_model || 'Standard Machinery'}</span>
                </div>
              </div>
            </div>

            {/* Itemized Parts Table */}
            <div className="py-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider font-extrabold text-[#111111]/60">
                    <th className="py-2 w-8">#</th>
                    <th className="py-2">Item / Part Description</th>
                    <th className="py-2">Brand</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {receipt.items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-mono text-[10px] text-[#111111]/40">{index + 1}</td>
                      <td className="py-2.5 pr-2">
                        <div className="font-bold text-[#111111]">{item.name}</div>
                        <div className="text-[10px] text-[#111111]/60 flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-[#111111]">{item.part_number}</span>
                          {item.model && <span>• Model: {item.model}</span>}
                        </div>
                      </td>
                      <td className="py-2.5 text-[11px] font-medium text-[#111111]/80">
                        {item.brand}
                      </td>
                      <td className="py-2.5 text-center font-bold text-[#111111] font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[#111111]/80">
                        {formatMoney(item.unit_price)}
                      </td>
                      <td className="py-2.5 text-right font-bold font-mono text-[#111111]">
                        {formatMoney(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Calculations & Totals */}
            <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row justify-between gap-6">
              {/* Payment Method & Authorization Stamp */}
              <div className="space-y-3 flex-1">
                <div className="p-3 rounded-xl bg-[#F7F6F3] border border-slate-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#111111]/50">Payment Method:</span>
                    <span className="font-bold text-[#111111]">{receipt.payment_method}</span>
                  </div>
                  {receipt.payment_reference && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#111111]/50">Transaction Ref:</span>
                      <span className="font-mono text-[11px] font-bold text-[#111111]">{receipt.payment_reference}</span>
                    </div>
                  )}
                  {receipt.amount_tendered !== undefined && receipt.amount_tendered > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#111111]/50">Cash Tendered:</span>
                      <span className="font-mono font-medium text-[#111111]">{formatMoney(receipt.amount_tendered)}</span>
                    </div>
                  )}
                  {receipt.change_due !== undefined && receipt.change_due > 0 && (
                    <div className="flex items-center justify-between text-[#22A06B] font-bold">
                      <span className="text-[10px] uppercase">Change Returned:</span>
                      <span className="font-mono">{formatMoney(receipt.change_due)}</span>
                    </div>
                  )}
                </div>

                {receipt.notes && (
                  <div className="text-[11px] text-[#111111]/70 bg-amber-50/70 border border-amber-200/80 p-2.5 rounded-xl">
                    <span className="font-bold text-amber-900 block text-[10px] uppercase">Transaction Notes:</span>
                    {receipt.notes}
                  </div>
                )}
              </div>

              {/* Numerical Breakdown */}
              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-[#111111]/70">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-[#111111]">{formatMoney(receipt.subtotal)}</span>
                </div>

                {receipt.discount_amount > 0 && (
                  <div className="flex justify-between text-[#22A06B]">
                    <span>Discount Applied:</span>
                    <span className="font-mono font-semibold">-{formatMoney(receipt.discount_amount)}</span>
                  </div>
                )}

                {receipt.tax_amount > 0 && (
                  <div className="flex justify-between text-[#111111]/70">
                    <span>Tax / VAT ({receipt.tax_rate}%):</span>
                    <span className="font-mono font-semibold text-[#111111]">{formatMoney(receipt.tax_amount)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-[#111111] uppercase tracking-tight">Total Amount:</span>
                  <span className="text-lg font-black font-mono text-[#111111]">{formatMoney(receipt.grand_total)}</span>
                </div>

                <div className="p-2 rounded-lg bg-[#22A06B]/15 text-[#22A06B] text-center font-extrabold text-xs tracking-wider uppercase border border-[#22A06B]/30">
                  ✓ PAID IN FULL
                </div>
              </div>
            </div>

            {/* Official Terms & Footer */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 text-[10px] text-[#111111]/60 space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-[#111111]/80">WARRANTY & RETURN POLICY:</p>
                  <p>1. 30-day warranty against manufacturer defects on genuine OEM parts with this original receipt.</p>
                  <p>2. Electrical components and hydraulic seal kits are non-refundable once opened or installed.</p>
                  <p>3. Goods inspected and received in good working condition.</p>
                </div>
                
                {/* Visual Stamp Line */}
                <div className="w-40 text-center border-t border-slate-400 pt-1 mt-3 sm:mt-0">
                  <span className="text-[9px] uppercase font-bold text-[#111111]/60 block">Authorized Signature</span>
                  <span className="font-serif italic text-xs text-[#111111]">{receipt.cashier_name}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[#111111]/40 border-t border-slate-100">
                *** THANK YOU FOR YOUR BUSINESS • KEEP YOUR FLEET RUNNING STRONG ***
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer (Hidden in Print) */}
        <div className="print:hidden bg-white border-t border-slate-200/90 px-6 py-3.5 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-[#111111] hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onNewSale && (
              <button
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="px-4 py-2 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#F6AF31]" />
                <span>Start New Sale</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
