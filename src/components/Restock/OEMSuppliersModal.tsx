import React, { useState } from 'react';
import { 
  X, 
  Building, 
  Globe, 
  Phone, 
  Mail, 
  Clock, 
  Plane, 
  Ship, 
  ShieldCheck, 
  Plus, 
  Search,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { OEMSupplier } from '../../types';
import { useInertia } from '../../context/InertiaContext';

interface OEMSuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSupplierForPO: (supplier: OEMSupplier) => void;
}

export const OEMSuppliersModal: React.FC<OEMSuppliersModalProps> = ({
  isOpen,
  onClose,
  onSelectSupplierForPO,
}) => {
  const { suppliers } = useInertia();
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');

  if (!isOpen) return null;

  const brands = ['All', 'Caterpillar', 'Komatsu', 'Volvo', 'Hitachi', 'Bosch Rexroth', 'Donaldson'];

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBrand = brandFilter === 'All' || s.brand === brandFilter;

    return matchesSearch && matchesBrand;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-5 sm:px-6 bg-[#111111] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6AF31] flex items-center justify-center text-[#111111] font-black">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Authorized OEM Supplier Network</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                  {suppliers.length} Certified Hubs
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct procurement channels with official manufacturers & global parts depots
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

        {/* Filters & Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search supplier, brand, country, or account..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F6AF31] font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {brands.map(b => (
              <button
                key={b}
                onClick={() => setBrandFilter(b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  brandFilter === b
                    ? 'bg-[#111111] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="p-6 overflow-y-auto grow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map(sup => (
              <div 
                key={sup.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F6AF31] hover:shadow-md transition group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#111111] text-white">
                          {sup.brand}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-bold">
                          Acc: {sup.account_number}
                        </span>
                      </div>
                      <h3 className="font-black text-sm text-[#111111] mt-1 group-hover:text-[#F6AF31] transition">
                        {sup.name}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-[#22A06B]" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sup.city}, <strong className="text-slate-800">{sup.country}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Plane className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Port of Origin: <strong className="text-slate-800">{sup.port_of_origin}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700">{sup.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700">{sup.phone}</span>
                    </div>
                  </div>

                  {/* Lead Times Pills */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px]">
                    <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-medium flex items-center gap-1 border border-blue-100">
                      <Plane className="w-3 h-3 text-blue-600" />
                      <span>Air: <strong>{sup.typical_lead_days_air}d</strong></span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium flex items-center gap-1 border border-emerald-100">
                      <Ship className="w-3 h-3 text-emerald-600" />
                      <span>Sea: <strong>{sup.typical_lead_days_sea}d</strong></span>
                    </div>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      Attn: {sup.contact_person.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onSelectSupplierForPO(sup);
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer w-full justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Issue Restock PO with {sup.brand}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No OEM suppliers matched your search query.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#111111] hover:bg-[#222222] text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
};
