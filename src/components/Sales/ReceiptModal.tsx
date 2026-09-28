import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Check, 
  ShoppingCart
} from 'lucide-react';
import { SaleReceipt } from '../../types';
import { useInertia } from '../../context/InertiaContext';
import { cleanModelName } from '../../utils/modelUtils';

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
  const { formatMoney, currentUser } = useInertia();
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const storeProfile = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('karat_store_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  }, []);

  const storeName = (storeProfile?.shopName || currentUser?.shop_name || 'KARAT HEAVY MACHINERY SPARE PARTS').toUpperCase();
  const storeAddress = (storeProfile?.physicalAddress && !storeProfile.physicalAddress.includes('Jinja Road')) 
    ? storeProfile.physicalAddress 
    : 'Kampala Kisenyi';
  const storePhone = storeProfile?.dispatchPhone || currentUser?.phone || '+256 700 882194';
  const receiptFooter = storeProfile?.receiptFooter || 'When picking up the goods, please point out and confirm the quantity, model and amount of the goods can be returned and exchange within 7 days; if damage, change, oil contamination, used; the goods will not be returned. Thank you for your cooperation.';

  if (!isOpen || !receipt) return null;

  const totalQuantity = receipt.items.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `
========================================
${storeName}
Location: ${storeAddress} | Phone: ${storePhone}
Receipt Number: ${receipt.receipt_number}
Date: ${receipt.date}
Client Name: ${receipt.customer_name || 'Walk-in Client'}
Client Phone: ${receipt.customer_phone || '-'}
Issued By: ${receipt.cashier_name || 'Arafat'}
========================================
ITEMS:
${receipt.items.map((it, idx) => `${idx + 1}. [${it.part_number}] ${it.name} | Model: ${cleanModelName(it.model || '-', it.brand)} | Qty: ${it.quantity} PCS | Price: ${formatMoney(it.unit_price)} | Total: ${formatMoney(it.total_price)}`).join('\n')}
----------------------------------------
TOTAL QUANTITY: ${totalQuantity} PCS
TOTAL PRICE: ${formatMoney(receipt.grand_total)}
========================================
Attention: ${receiptFooter}
`;
    navigator.clipboard.writeText(summary.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      {/* Container with print-safe styles */}
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh] border border-slate-300">
        
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="print:hidden bg-[#111111] text-white px-5 py-3.5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F6AF31] text-[#111111] flex items-center justify-center font-extrabold shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Sale Completed Successfully</h2>
              <p className="text-[11px] text-white/60 font-mono">Receipt #{receipt.receipt_number}</p>
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
              className="px-4 py-1.5 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-black flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition ml-1 cursor-pointer"
              title="Close receipt preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-[#EEEEEA] flex-1 print:p-0 print:bg-white print:overflow-visible" ref={receiptRef}>
          
          {/* Continuous Stationery Sheet Wrapper with Perforated Tractor Margins */}
          <div className="relative max-w-3xl mx-auto bg-[#FFFDF9] border border-stone-300 shadow-md print:shadow-none print:border-none text-black font-sans">
            
            {/* Left Tractor Feed Margin with Sprocket Holes */}
            <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col justify-around items-center border-r border-dashed border-stone-300 print:hidden pointer-events-none select-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={`left-hole-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#EEEEEA] border border-stone-300" />
              ))}
            </div>

            {/* Right Tractor Feed Margin with Sprocket Holes */}
            <div className="absolute right-0 top-0 bottom-0 w-5 flex flex-col justify-around items-center border-l border-dashed border-stone-300 print:hidden pointer-events-none select-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={`right-hole-${i}`} className="w-2.5 h-2.5 rounded-full bg-[#EEEEEA] border border-stone-300" />
              ))}
            </div>

            {/* Main Receipt Content Area */}
            <div className="px-7 sm:px-10 py-7 text-[12px] leading-tight text-neutral-900">
              
              {/* Header Title */}
              <div className="text-center pb-2">
                <h1 className="text-base sm:text-lg font-black tracking-wide text-neutral-900 uppercase">
                  {storeName}
                </h1>
                <p className="text-[11px] text-neutral-600 font-semibold tracking-normal mt-0.5">
                  {storeAddress} {storePhone ? `• Tel: ${storePhone}` : ''}
                </p>
              </div>

              {/* Subheader Metadata: Receipt Number, Date, Client Info, Issued By */}
              <div className="pt-2 pb-2 text-[11px] border-y border-black grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">Receipt Number:</span>
                  <span className="font-mono font-black text-xs text-neutral-900">{receipt.receipt_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">Date:</span>
                  <span className="font-mono font-semibold text-neutral-900">{receipt.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">Client Name:</span>
                  <span className="font-bold text-neutral-900 truncate block">{receipt.customer_name || 'Walk-in Client'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">Client Phone:</span>
                  <span className="font-mono font-semibold text-neutral-900">{receipt.customer_phone || '-'}</span>
                </div>
              </div>

              <div className="py-1 text-[11px] flex items-center justify-between border-b border-black">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-neutral-700">Issued By:</span>
                  <span className="font-semibold text-neutral-900">{receipt.cashier_name || 'Arafat'}</span>
                </div>
                {receipt.customer_company && (
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <span className="font-bold">Company:</span>
                    <span>{receipt.customer_company}</span>
                  </div>
                )}
              </div>

              {/* Itemized Parts Table Matching Requested Fields */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[11px]">
                  <thead>
                    <tr className="bg-neutral-100/70 border-b border-black text-center font-bold text-[10.5px]">
                      <th className="border-r border-black py-1.5 px-1.5 w-10">No.</th>
                      <th className="border-r border-black py-1.5 px-2">Part No.</th>
                      <th className="border-r border-black py-1.5 px-2 text-left">Item</th>
                      <th className="border-r border-black py-1.5 px-2">Model</th>
                      <th className="border-r border-black py-1.5 px-1.5 w-14">Quantity</th>
                      <th className="border-r border-black py-1.5 px-1.5 w-12">Unit</th>
                      <th className="border-r border-black py-1.5 px-2 text-right">Unit Price</th>
                      <th className="border-r border-black py-1.5 px-2 text-right">Total Price</th>
                      <th className="py-1.5 px-2 text-center w-20">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item, index) => (
                      <tr key={index} className="border-b border-black/80 hover:bg-neutral-50/50">
                        <td className="border-r border-black py-1.5 px-1.5 text-center font-mono font-medium">
                          {index + 1}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 font-mono font-bold text-center">
                          {item.part_number}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 font-medium">
                          {item.name}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 text-center font-mono font-semibold">
                          {cleanModelName(item.model || '-', item.brand)}
                        </td>
                        <td className="border-r border-black py-1.5 px-1.5 text-center font-mono font-bold">
                          {item.quantity}
                        </td>
                        <td className="border-r border-black py-1.5 px-1.5 text-center uppercase font-mono">
                          PCS
                        </td>
                        <td className="border-r border-black py-1.5 px-2 text-right font-mono font-medium">
                          {formatMoney(item.unit_price)}
                        </td>
                        <td className="border-r border-black py-1.5 px-2 text-right font-mono font-bold">
                          {formatMoney(item.total_price)}
                        </td>
                        <td className="py-1.5 px-2 text-center text-[10px] text-neutral-400 font-mono">
                          
                        </td>
                      </tr>
                    ))}

                    {/* Total Price Row */}
                    <tr className="font-extrabold bg-neutral-100/60 border-t border-black">
                      <td colSpan={4} className="border-r border-black py-2 px-3 text-right uppercase tracking-wider font-bold">
                        Total Price:
                      </td>
                      <td className="border-r border-black py-2 px-1.5 text-center font-mono font-black">
                        {totalQuantity}
                      </td>
                      <td className="border-r border-black py-2 px-1.5 text-center"></td>
                      <td className="border-r border-black py-2 px-2"></td>
                      <td className="border-r border-black py-2 px-2 text-right font-mono font-black text-sm">
                        {formatMoney(receipt.grand_total)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Signatures & Remarks */}
              <div className="mt-5 pt-2 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Issued By:</span>
                    <span className="font-mono font-semibold text-neutral-800">{receipt.cashier_name || 'Arafat'}</span>
                  </div>
                  {receipt.notes && (
                    <div className="flex items-start gap-2">
                      <span className="font-bold">Remark:</span>
                      <span className="font-mono font-medium text-neutral-800">{receipt.notes}</span>
                    </div>
                  )}
                </div>

                {/* Right side: Client Signature Line with empty field */}
                <div className="sm:text-right space-y-2">
                  <div className="inline-block text-left sm:text-right">
                    <span className="font-bold block text-neutral-800">Client Signature:</span>
                    <div className="mt-7 inline-block">
                      <div className="w-52 border-b border-black"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attention Notice at Bottom */}
              <div className="mt-6 pt-3 border-t border-black text-[10.5px] leading-snug text-neutral-800">
                <p>
                  <strong className="text-black">Attention: </strong>
                  {receiptFooter}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Actions Footer (Hidden in Print) */}
        <div className="print:hidden bg-white border-t border-slate-200/90 px-6 py-3 flex items-center justify-between shrink-0">
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
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;
