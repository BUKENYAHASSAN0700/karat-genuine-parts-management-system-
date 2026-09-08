import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Save, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

export const DepotProfileTab: React.FC = () => {
  const { currentUser, updateUser, setFlashMessage } = useInertia();

  const [formData, setFormData] = useState({
    shopName: currentUser?.shop_name || 'KARAT Heavy Machinery & Spare Parts Ltd',
    facilityName: 'Yard 4 Nakawa Heavy Depot & Ingest Bay',
    physicalAddress: 'Plot 14-16 Jinja Road, Nakawa Industrial Estate, Kampala, Uganda',
    officialEmail: currentUser?.email || 'finance@karat.co.ug',
    dispatchPhone: '+256 700 882194',
    emergencyHotline: '+256 414 290114',
    operatingHours: 'Monday - Saturday: 07:30 - 18:30 EAT',
    ownerName: currentUser?.name || 'Hassan Bukenya',
    ownerTitle: 'Chief Financial Officer & Stores Controller'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      shop_name: formData.shopName,
      email: formData.officialEmail,
      name: formData.ownerName,
      phone: formData.dispatchPhone
    });
    setIsSaved(true);
    setFlashMessage('success', 'Depot facility details & legal profile saved successfully.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Facility & Legal Identity Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F6AF31] bg-[#111111] px-2 py-0.5 rounded-md">
              Facility Registration
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Store & Depot Facility Identity
            </h3>
            <p className="text-xs text-slate-500">
              Official corporate name and warehouse facility details printed on invoices, quotes, and dispatch slips.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#22A06B] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Industrial Entity</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Shop Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Registered Company Name
            </label>
            <input
              type="text"
              value={formData.shopName}
              onChange={e => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              required
            />
          </div>

          {/* Facility / Yard Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Primary Yard & Receiving Bay
            </label>
            <input
              type="text"
              value={formData.facilityName}
              onChange={e => setFormData({ ...formData, facilityName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              required
            />
          </div>

          {/* Physical Address */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Physical Yard Location (Dispatch & Receiving)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.physicalAddress}
                onChange={e => setFormData({ ...formData, physicalAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                required
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Dispatch Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Stores Dispatch Mobile Phone
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.dispatchPhone}
                onChange={e => setFormData({ ...formData, dispatchPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Emergency Hotline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              24/7 Field Tech & Urgent Hotline
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.emergencyHotline}
                onChange={e => setFormData({ ...formData, emergencyHotline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Official Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Operations & Invoicing Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.officialEmail}
                onChange={e => setFormData({ ...formData, officialEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Yard Receiving Bay Operating Hours
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.operatingHours}
                onChange={e => setFormData({ ...formData, operatingHours: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
              />
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-500">
          Changes will immediately take effect across all depot profiles and store settings.
        </span>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-2xl flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#111111]" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-[#111111]" />
              <span>Save Depot Changes</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};
