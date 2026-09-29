import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemDetails?: { label: string; value: React.ReactNode }[];
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  itemDetails,
  confirmText = 'Yes, Delete',
  cancelText = 'Cancel',
  isDangerous = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-[#111111] hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isDangerous ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'
          }`}>
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 id="confirm-delete-title" className="font-extrabold text-base text-[#111111] tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Please review and confirm this action.
            </p>
          </div>
        </div>

        {itemDetails && itemDetails.length > 0 && (
          <div className="p-3.5 bg-[#F7F6F3] rounded-2xl border border-slate-200/90 space-y-2">
            {itemDetails.map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-500 font-medium">{detail.label}:</span>
                <span className="font-bold text-[#111111] truncate">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-600 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#111111] hover:bg-slate-100 transition cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              isDangerous 
                ? 'bg-[#DC2626] hover:bg-rose-700' 
                : 'bg-[#111111] hover:bg-black'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
