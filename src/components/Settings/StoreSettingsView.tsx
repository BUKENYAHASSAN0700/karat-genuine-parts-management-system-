import React, { useState } from 'react';
import { useInertia } from '../../context/InertiaContext';
import { 
  Store, 
  Coins, 
  Receipt, 
  Save, 
  Check, 
  RotateCcw,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { CurrencyCode } from '../../types';

interface StoreProfileSettings {
  shopName: string;
  physicalAddress: string;
  officialEmail: string;
  dispatchPhone: string;
  ownerName: string;
  receiptFooter: string;
}

const DEFAULT_SETTINGS: StoreProfileSettings = {
  shopName: 'Karat Heavy Machinery Spare Parts',
  physicalAddress: 'Kampala Kisenyi',
  officialEmail: 'finance@karat.co.ug',
  dispatchPhone: '+256 700 882194',
  ownerName: 'Hassan Bukenya',
  receiptFooter: 'When picking up the goods, please point out and confirm the quantity, model and amount of the goods can be returned and exchange within 7 days; if damage, change, oil contamination, used; the goods will not be returned. Thank you for your cooperation.'
};

export const StoreSettingsView: React.FC = () => {
  const { 
    currentUser, 
    updateUser, 
    currency, 
    setCurrency, 
    exchangeRate, 
    setExchangeRate, 
    setActiveView, 
    setFlashMessage 
  } = useInertia();

  const [formData, setFormData] = useState<StoreProfileSettings>(() => {
    try {
      const saved = localStorage.getItem('karat_store_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.physicalAddress || parsed.physicalAddress.includes('Jinja Road')) {
          parsed.physicalAddress = 'Kampala Kisenyi';
        }
        delete parsed.facilityName;
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {}
    return {
      ...DEFAULT_SETTINGS,
      shopName: currentUser?.shop_name || DEFAULT_SETTINGS.shopName,
      physicalAddress: 'Kampala Kisenyi',
      officialEmail: currentUser?.email || DEFAULT_SETTINGS.officialEmail,
      ownerName: currentUser?.name || DEFAULT_SETTINGS.ownerName,
      dispatchPhone: currentUser?.phone || DEFAULT_SETTINGS.dispatchPhone,
    };
  });

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency || 'UGX');
  const [rateInput, setRateInput] = useState<number>(exchangeRate || 3750);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update user identity in context & localStorage
    updateUser({
      shop_name: formData.shopName,
      email: formData.officialEmail,
      name: formData.ownerName,
      phone: formData.dispatchPhone
    });

    // 2. Persist store profile
    try {
      localStorage.setItem('karat_store_profile', JSON.stringify(formData));
    } catch {}

    // 3. Update currency & exchange rate if changed
    setCurrency(selectedCurrency);
    if (rateInput && rateInput > 0) {
      setExchangeRate(rateInput);
    }

    setIsSaved(true);
    setFlashMessage('success', 'Settings updated successfully.');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset settings to system defaults?')) {
      setFormData(DEFAULT_SETTINGS);
      setSelectedCurrency('UGX');
      setRateInput(3750);
      try {
        localStorage.setItem('karat_store_profile', JSON.stringify(DEFAULT_SETTINGS));
      } catch {}
      setCurrency('UGX');
      setExchangeRate(3750);
      setFlashMessage('info', 'Settings reset to default values.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            Settings
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView('inventory')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#111111] text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-xs"
          >
            <Boxes className="w-3.5 h-3.5 text-slate-500" />
            <span>Parts Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Simple Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Store & Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#F6AF31]" />
              Store Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Business details printed on customer receipts and sales records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store / Business Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Store Name
              </label>
              <input
                type="text"
                value={formData.shopName}
                onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                placeholder="e.g. Karat Heavy Machinery Spare Parts"
                required
              />
            </div>

            {/* Store Location / Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Store Location / Address
              </label>
              <input
                type="text"
                value={formData.physicalAddress}
                onChange={e => setFormData({ ...formData, physicalAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                placeholder="e.g. Kampala Kisenyi"
              />
            </div>

            {/* Store Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Store Phone Number
              </label>
              <input
                type="text"
                value={formData.dispatchPhone}
                onChange={e => setFormData({ ...formData, dispatchPhone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                placeholder="e.g. +256 700 882194"
              />
            </div>

            {/* Official Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Email Address
              </label>
              <input
                type="email"
                value={formData.officialEmail}
                onChange={e => setFormData({ ...formData, officialEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                placeholder="e.g. finance@karat.co.ug"
              />
            </div>

            {/* In-Charge / Cashier Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block">
                Person In-Charge / Signatory
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                placeholder="e.g. Hassan Bukenya"
              />
            </div>
          </div>
        </div>

        {/* Currency & Operating Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#F6AF31]" />
              Currency & Pricing
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the store operating currency and exchange rate.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Operating Currency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Operating Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('UGX')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCurrency === 'UGX'
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>UGX (Shillings)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCurrency('USD')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedCurrency === 'USD'
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>USD ($)</span>
                </button>
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                1 USD Exchange Rate (in UGX)
              </label>
              <input
                type="number"
                min={1}
                value={rateInput}
                onChange={e => setRateInput(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition"
                placeholder="3750"
              />
            </div>
          </div>
        </div>

        {/* Receipt Terms & Notice */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-[#111111] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#F6AF31]" />
              Receipt Policy & Footer Note
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The return policy and attention note printed at the bottom of customer receipts.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Attention / Return Notice Text
            </label>
            <textarea
              rows={3}
              value={formData.receiptFooter}
              onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111111] focus:bg-white focus:outline-none focus:border-amber-400 transition leading-relaxed"
              placeholder="When picking up the goods, please point out and confirm the quantity, model and amount..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Default Values</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-[#111111]" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#111111]" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
