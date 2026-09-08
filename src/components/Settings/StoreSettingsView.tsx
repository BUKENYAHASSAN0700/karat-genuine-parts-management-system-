import React, { useState } from 'react';
import { 
  Building2, 
  Coins, 
  Receipt, 
  TrendingUp, 
  Users, 
  HardDrive, 
  ArrowRight, 
  Package, 
  CheckCircle2,
  Sparkles,
  Shield
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { DepotProfileTab } from './DepotProfileTab';
import { CurrencyFXTab } from './CurrencyFXTab';
import { TaxationPolicyTab } from './TaxationPolicyTab';
import { CommercialCreditTab } from './CommercialCreditTab';
import { TeamRolesTab } from './TeamRolesTab';
import { SystemMaintenanceTab } from './SystemMaintenanceTab';

type SettingsTab = 'depot' | 'currency' | 'tax' | 'pricing' | 'team' | 'maintenance';

export const StoreSettingsView: React.FC = () => {
  const { currentUser, currency, exchangeRate, setActiveView } = useInertia();
  const [activeTab, setActiveTab] = useState<SettingsTab>('depot');

  const tabs = [
    {
      id: 'depot' as SettingsTab,
      label: 'Depot & Identity',
      icon: Building2,
      badge: 'Nakawa Y4',
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'currency' as SettingsTab,
      label: 'Currency & Forex',
      icon: Coins,
      badge: `${currency} (${exchangeRate.toLocaleString()})`,
      badgeColor: 'bg-amber-100 text-amber-900'
    },
    {
      id: 'tax' as SettingsTab,
      label: 'URA Taxes & EFRIS',
      icon: Receipt,
      badge: '18% VAT',
      badgeColor: 'bg-purple-100 text-purple-900'
    },
    {
      id: 'pricing' as SettingsTab,
      label: 'Margins & Credit',
      icon: TrendingUp,
      badge: 'Net 30',
      badgeColor: 'bg-emerald-100 text-emerald-900'
    },
    {
      id: 'team' as SettingsTab,
      label: 'Staff & Roles',
      icon: Users,
      badge: '5 Staff',
      badgeColor: 'bg-blue-100 text-blue-900'
    },
    {
      id: 'maintenance' as SettingsTab,
      label: 'Backups & Storage',
      icon: HardDrive,
      badge: 'Live',
      badgeColor: 'bg-slate-100 text-slate-700'
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#111111] text-[#F6AF31]">
              System Configuration
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • Yard 4 Nakawa Depot & Commercial POS
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            Store Settings & Operations Control
          </h1>
          <p className="text-xs text-slate-500">
            Configure enterprise parameters, statutory URA EFRIS compliance, currency peg, staff credentials, and corporate credit limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveView('inventory')}
            className="px-4 py-2 rounded-2xl bg-slate-50 hover:bg-slate-100 text-[#111111] text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 cursor-pointer shadow-xs"
          >
            <Package className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Parts Catalog</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
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
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F6AF31]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-[#F6AF31]' : tab.badgeColor
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View Body */}
      <div>
        {activeTab === 'depot' && <DepotProfileTab />}
        {activeTab === 'currency' && <CurrencyFXTab />}
        {activeTab === 'tax' && <TaxationPolicyTab />}
        {activeTab === 'pricing' && <CommercialCreditTab />}
        {activeTab === 'team' && <TeamRolesTab />}
        {activeTab === 'maintenance' && <SystemMaintenanceTab />}
      </div>

    </div>
  );
};
