import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableComboboxProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | ComboboxOption)[];
  placeholder?: string;
  allowCustom?: boolean;
  required?: boolean;
  className?: string;
  badgeColor?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Type to search...',
  allowCustom = true,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to ComboboxOption objects
  const normalizedOptions: ComboboxOption[] = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Keep input text aligned with current value when closed
  const currentLabel = normalizedOptions.find(o => o.value.toLowerCase() === (value || '').toLowerCase())?.label || value;

  // Filter options based on user search term
  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleCustomSubmit = () => {
    if (searchTerm.trim()) {
      onChange(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main input wrapper */}
      <div 
        className="relative flex items-center bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#F6AF31] focus-within:border-transparent transition-all shadow-2xs"
      >
        <div className="pl-2.5 text-slate-400">
          <Search className="w-3.5 h-3.5" />
        </div>

        <input
          id={id}
          type="text"
          value={isOpen ? searchTerm : currentLabel}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setSearchTerm(value);
            setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required && !value}
          autoComplete="off"
          className="w-full bg-transparent px-2.5 py-2 text-xs font-bold text-[#111111] focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
        />

        {value && !isOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchTerm('');
            }}
            className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-md"
            title="Clear"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              setSearchTerm('');
            }
            setIsOpen(!isOpen);
          }}
          className="p-2 text-slate-400 hover:text-slate-700"
          tabIndex={-1}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl py-1 text-xs animate-in fade-in">
          {filteredOptions.length > 0 ? (
            <div className="p-1 space-y-0.5">
              {filteredOptions.map((opt) => {
                const isSelected = (value || '').toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-amber-500/15 text-[#111111] font-black'
                        : 'text-slate-700 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{opt.label}</div>
                      {opt.subLabel && (
                        <div className="text-[10px] text-slate-400 font-normal">{opt.subLabel}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#F6AF31]" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center text-slate-500">
              <p className="text-xs mb-1.5 font-medium">No matching predefined options</p>
              {allowCustom && searchTerm.trim() && (
                <button
                  type="button"
                  onClick={handleCustomSubmit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6AF31] hover:bg-[#e09e2a] text-[#111111] font-bold rounded-lg text-xs transition"
                >
                  <span>Use "{searchTerm.trim()}"</span>
                </button>
              )}
            </div>
          )}

          {/* Quick custom addition footer if typed search term is not in current list */}
          {allowCustom && searchTerm.trim() && !filteredOptions.some(o => o.value.toLowerCase() === searchTerm.trim().toLowerCase()) && (
            <div className="p-1.5 border-t border-slate-100 mt-1 bg-slate-50/70 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="w-full text-left px-3 py-1.5 text-xs text-[#111111] hover:bg-amber-100/60 rounded-xl flex items-center justify-between font-semibold transition"
              >
                <span>Add custom: <strong className="font-black underline">{searchTerm.trim()}</strong></span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-bold">+ Select</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
