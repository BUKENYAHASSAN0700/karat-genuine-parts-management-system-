import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Plus, 
  Boxes,
  Settings,
  User,
  ShieldCheck,
  PanelLeft,
  X,
  Coins,
  Check,
  Receipt
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';
import { CurrencyCode } from '../../types';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    setActiveView, 
    setAddModalOpen,
    parts,
    toggleMobileMenu,
    currency,
    setCurrency,
    setFlashMessage
  } = useInertia();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  const lowStockCount = parts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.stock_quantity <= p.min_stock_alert).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('inventory');
    }
  };

  const handleCurrencySelect = (code: CurrencyCode) => {
    setCurrency(code);
    setFlashMessage('success', `System currency updated to ${code} (${code === 'UGX' ? '1 USD = 3,750 UGX' : 'US Dollar'}).`);
  };

  return (
    <header className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 shadow-xs flex items-center justify-between gap-3 sm:gap-4 transition-all duration-300">
      {/* Mobile-Only Sidebar Toggle */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden w-9 h-9 rounded-xl bg-[#F7F6F3] hover:bg-slate-200/80 text-[#111111] border border-slate-200/80 flex items-center justify-center shrink-0 transition cursor-pointer"
        title="Toggle Navigation Menu"
      >
        <PanelLeft className="w-4 h-4 text-[#111111]" />
      </button>

      {/* Center Search Input - Adapts fluidly whether sidebar is minimized or expanded */}
      <div className="flex-1 max-w-2xl min-w-0">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[#111111]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spare parts, SKU, OEM numbers, machinery models..."
            className="w-full bg-[#F7F6F3] hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 focus:border-[#111111] rounded-full pl-10 pr-9 py-2 text-xs text-[#111111] placeholder:text-[#111111]/40 outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111111]/40 hover:text-[#111111]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Right Controls: POS Terminal, Add Part, Notifications, User Icon */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Sell / POS Terminal Button */}
        <button
          onClick={() => setActiveView('pos')}
          className="py-2 px-3 sm:px-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          title="Open Point of Sale / Selling Terminal"
        >
          <Receipt className="w-3.5 h-3.5 text-[#F6AF31]" />
          <span className="hidden sm:inline">Sell / POS</span>
          <span className="sm:hidden">Sell</span>
        </button>

        {/* Add New Part Button */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="py-2 px-3.5 sm:px-4 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition active:scale-95"
          title="Add New Spare Part"
        >
          <Plus className="w-4 h-4 text-[#111111] stroke-[2.5]" />
          <span className="hidden sm:inline">Add New Part</span>
          <span className="sm:hidden">Add Part</span>
        </button>

        {/* Notifications with alert count */}
        <button 
          onClick={() => setActiveView('inventory')}
          className="w-9 h-9 rounded-full bg-[#F7F6F3] hover:bg-slate-200/60 text-[#111111] border border-slate-200/80 flex items-center justify-center transition relative"
          title={lowStockCount > 0 ? `${lowStockCount} Parts Require Restock Attention` : 'All Stock Healthy'}
        >
          <Bell className="w-4 h-4" />
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#DC2626] border-2 border-white" />
          )}
        </button>

        {/* User Profile & Store Settings Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#F7F6F3] hover:bg-slate-200/60 border border-slate-200/80 transition"
            title="User Profile & Store Settings"
          >
            {/* User Icon Capsule with Online Status Indicator */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#111111] text-white shadow-2xs">
              <User className="w-3.5 h-3.5 text-[#F6AF31]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#22A06B] border border-white" />
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#111111] leading-tight flex items-center gap-1.5">
                {currentUser?.name || 'Shop Owner'}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/90 text-[#111111] font-extrabold">
                  {currency}
                </span>
              </span>
              <span className="text-[9px] text-[#22A06B] font-extrabold uppercase tracking-wider">
                Online
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#111111]/50 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
            >
              {/* User Profile Header */}
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F6AF31] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111111] truncate">{currentUser?.name}</p>
                  {/* <p className="text-[10px] text-[#111111]/60 font-mono truncate">{currentUser?.email}</p> */}
                  {/* <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#F6AF31]/20 text-[#111111]">
                    <ShieldCheck className="w-2.5 h-2.5 text-[#111111]" /> 
                  </div> */}
                </div>
              </div>

              {/* Navigation Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setActiveView('settings');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-[#F7F6F3] flex items-center gap-2.5 font-medium transition"
                >
                  <Settings className="w-3.5 h-3.5 text-[#111111]/60" />
                  <span>Store Settings & Profile</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('inventory');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-[#F7F6F3] flex items-center gap-2.5 font-medium transition"
                >
                  <Boxes className="w-3.5 h-3.5 text-[#111111]/60" />
                  <span>Manage Parts Catalog</span>
                </button>
              </div>

              {/* System Currency Switcher */}
              <div className="px-3 py-2 my-1 border-t border-b border-slate-100 bg-[#F7F6F3]/50">
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60 flex items-center gap-1.5">
                    <Coins className="w-3 h-3 text-[#111111]" /> System Currency
                  </span>
                  <span className="text-[9px] text-[#111111]/40 font-mono">Systemwide</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCurrencySelect('USD')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                      currency === 'USD'
                        ? 'bg-[#111111] text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-[#111111] border border-slate-200/80'
                    }`}
                  >
                    <span>USD ($)</span>
                    {currency === 'USD' && <Check className="w-3.5 h-3.5 text-[#F6AF31]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCurrencySelect('UGX')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                      currency === 'UGX'
                        ? 'bg-[#111111] text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-[#111111] border border-slate-200/80'
                    }`}
                  >
                    <span>UGX (USh)</span>
                    {currency === 'UGX' && <Check className="w-3.5 h-3.5 text-[#F6AF31]" />}
                  </button>
                </div>
              </div>

              {/* Sign Out */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    logout();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#DC2626] hover:bg-red-50 flex items-center gap-2.5 font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out (Lock Shop)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
