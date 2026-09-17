import React, { useState } from 'react';
import { useInertia } from '../../context/InertiaContext';
import { DepotProfileTab } from './DepotProfileTab';
import { CurrencyFXTab } from './CurrencyFXTab';
import { CommercialCreditTab } from './CommercialCreditTab';
import { TeamRolesTab } from './TeamRolesTab';
import { TaxationPolicyTab } from './TaxationPolicyTab';
import { SystemMaintenanceTab } from './SystemMaintenanceTab';
import { UIcon } from '../Common/UIcon';

type SettingsTab = 'store' | 'currency' | 'pricing' | 'team' | 'tax' | 'maintenance';

export const StoreSettingsView: React.FC = () => {
  const { currency, exchangeRate, setActiveView, parts } = useInertia();
  const [activeTab, setActiveTab] = useState<SettingsTab>('store');

  const tabs: Array<{ id: SettingsTab; label: string; icon: string }> = [
    {
      id: 'store',
      label: 'Store & Identity',
      icon: 'building'
    },
    {
      id: 'currency',
      label: 'Currency & Forex',
      icon: 'coins'
    },
    {
      id: 'pricing',
      label: 'Pricing & Credit Policy',
      icon: 'percentage'
    },
    {
      id: 'team',
      label: 'Team & Staff Roles',
      icon: 'users'
    },
    {
      id: 'tax',
      label: 'Tax & Invoicing',
      icon: 'receipt'
    },
    {
      id: 'maintenance',
      label: 'Backups & Storage',
      icon: 'database'
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight font-poppins">
            Settings
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView('inventory')}
            className="px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-[#111111] text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-xs"
          >
            <UIcon name="boxes" className="text-xs text-slate-500" />
            <span>Manage Parts Catalog</span>
            <UIcon name="arrow-right" className="text-xs text-slate-400" />
          </button>
        </div>
      </div>

      {/* Useful Metrics First: Big Data, Label Down */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div 
          onClick={() => setActiveTab('currency')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
            {exchangeRate.toLocaleString()} UGX
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            1 USD Exchange Rate
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('currency')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
            {currency}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Operating Currency
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('tax')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
            18% VAT
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Statutory Tax Rate
          </div>
        </div>

        <div 
          onClick={() => setActiveView('inventory')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-[#111111]/30 transition cursor-pointer"
        >
          <div className="text-2xl sm:text-3xl font-black text-[#111111] font-mono tracking-tight">
            {parts.length} Parts
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Cataloged In System
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UIcon name={tab.icon} className={`text-sm ${isActive ? 'text-[#F6AF31]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View Body */}
      <div>
        {activeTab === 'store' && <DepotProfileTab />}
        {activeTab === 'currency' && <CurrencyFXTab />}
        {activeTab === 'pricing' && <CommercialCreditTab />}
        {activeTab === 'team' && <TeamRolesTab />}
        {activeTab === 'tax' && <TaxationPolicyTab />}
        {activeTab === 'maintenance' && <SystemMaintenanceTab />}
      </div>

    </div>
  );
};
