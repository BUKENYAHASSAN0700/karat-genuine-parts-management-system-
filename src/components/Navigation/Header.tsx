import React, { useState, useRef, useEffect } from 'react';
import { useInertia } from '../../context/InertiaContext';
import { CurrencyCode } from '../../types';
import { UIcon } from '../Common/UIcon';
import { ProfileCropModal } from './ProfileCropModal';

const karatLogo = new URL('../../../karat.svg', import.meta.url).href;

export const Header: React.FC = () => {
  const { 
    currentUser, 
    updateUser,
    logout, 
    setActiveView, 
    setAddModalOpen,
    parts,
    toggleMobileMenu,
    currency,
    setCurrency,
    setFlashMessage,
    theme,
    toggleTheme,
    unreadNotificationsCount,
    notificationsEnabled,
    toggleNotificationsEnabled
  } = useInertia();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropFileType, setCropFileType] = useState<string>('image/jpeg');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPngOrJpg = 
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' ||
      lowerName.endsWith('.png') || 
      lowerName.endsWith('.jpg') || 
      lowerName.endsWith('.jpeg');

    if (!isPngOrJpg) {
      setFlashMessage('error', 'Only PNG or JPG/JPEG images are supported.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCropImageSrc(result);
        setCropFileType(file.type || 'image/jpeg');
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
    setFlashMessage('success', `Currency updated to ${code} (${code === 'UGX' ? '1 USD = 3,750 UGX' : 'US Dollar'}).`);
  };

  return (
    <header className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl px-3 sm:px-5 py-2 sm:py-3 shadow-xs flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300">
      {/* Mobile-Only Sidebar Toggle */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[#111111] border border-slate-200/80 flex items-center justify-center shrink-0 transition cursor-pointer"
        title="Toggle Navigation Menu"
      >
        <UIcon name="menu-burger" className="text-xs sm:text-sm text-[#111111]" />
      </button>

      {/* Compact brand mark for screens where the sidebar is hidden */}
      <button
        onClick={() => setActiveView('dashboard')}
        className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
        title="Karat dashboard"
      >
        <img src={karatLogo} alt="Karat logo" className="w-full h-full object-contain" />
      </button>

      {/* Center Search Input - Adapts fluidly whether sidebar is minimized or expanded */}
      <div className="flex-1 max-w-2xl min-w-0">
        <form onSubmit={handleSearchSubmit} className="relative">
          <UIcon name="search" className="text-xs sm:text-sm text-[#111111]/40 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spare parts, SKU, model numbers..."
            className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-[#111111] rounded-full pl-8 sm:pl-10 pr-8 sm:pr-9 py-1.5 sm:py-2 text-xs text-[#111111] placeholder:text-[#111111]/40 outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[#111111]/40 hover:text-[#111111] cursor-pointer"
            >
              <UIcon name="cross" className="text-xs" />
            </button>
          )}
        </form>
      </div>

      {/* Right Controls: Shop, Add Part, User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Shop Button */}
        <button
          onClick={() => setActiveView('pos')}
          className="py-1.5 sm:py-2 px-2.5 sm:px-3.5 rounded-full bg-[#111111] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          title="Open Shop"
        >
          <UIcon name="shopping-bag" className="text-xs text-[#F6AF31]" />
          <span className="hidden xs:inline">Shop</span>
        </button>

        {/* Add New Part Button */}
        <button
          onClick={() => setAddModalOpen(true)}
          className="py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-full bg-[#F6AF31] hover:bg-[#e5a028] text-[#111111] text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          title="Add New Spare Part"
        >
          <UIcon name="plus" className="text-xs text-[#111111]" />
          <span className="hidden md:inline">Add New Part</span>
          <span className="hidden sm:inline md:hidden">Add Part</span>
          <span className="sm:hidden">Part</span>
        </button>

        {/* Hidden Profile Picture Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onChange={handleProfilePictureUpload}
          className="hidden"
        />

        {/* User Profile & Store Settings Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 transition cursor-pointer"
            title="Account & Settings"
          >
            {/* User Icon Capsule - Direct Click to Upload & Crop Profile Picture */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="group/headeravatar relative flex items-center justify-center w-7 h-7 rounded-full bg-white text-white shadow-2xs overflow-hidden shrink-0 border border-slate-200 cursor-pointer"
              title="Click to upload & crop profile picture"
            >
              <img 
                src={currentUser?.avatar || karatLogo} 
                alt={currentUser?.name || 'Arafat'} 
                className={`w-full h-full ${!currentUser?.avatar || currentUser.avatar.includes('karat') ? 'object-contain p-0.5' : 'object-cover'}`} 
              />
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover/headeravatar:opacity-100 transition">
                <UIcon name="camera" className="text-[9px] text-[#F6AF31]" />
              </div>
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#111111] leading-tight flex items-center gap-1.5">
                {currentUser?.name || 'Arafat'}
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/90 text-[#111111] font-extrabold">
                  {currency}
                </span>
              </span>
            </div>

            <UIcon name="angle-small-down" className="text-xs text-[#111111]/50 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
            >
              {/* User Profile Header with Clickable Avatar to Upload Profile Picture */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group/avatar cursor-pointer shrink-0 rounded-full focus:outline-none"
                  title="Click to upload profile picture"
                >
                  <div className="w-11 h-11 rounded-full bg-white text-[#111111] flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-2xs">
                    <img 
                      src={currentUser?.avatar || karatLogo} 
                      alt={currentUser?.name || 'Arafat'} 
                      className={`w-full h-full ${!currentUser?.avatar || currentUser.avatar.includes('karat') ? 'object-contain p-1' : 'object-cover'}`} 
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition shadow-xs">
                    <UIcon name="camera" className="text-xs text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center text-[8px] shadow-xs border border-white">
                    <UIcon name="camera" className="text-[7px]" />
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111111] truncate">{currentUser?.name || 'Arafat'}</p>
                  <p className="text-[10px] text-[#111111]/60 font-mono truncate">{currentUser?.email || 'karat@karat.co.ug'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UIcon name="picture" className="text-[9px]" />
                      <span>Change</span>
                    </button>
                    {currentUser?.avatar && currentUser.avatar !== '/karat.svg' && (
                      <button
                        type="button"
                        onClick={() => {
                          updateUser({ avatar: '/karat.svg' });
                          setFlashMessage('success', 'Profile avatar reset to Karat logo.');
                        }}
                        className="text-[10px] font-medium text-slate-500 hover:text-[#111111] cursor-pointer"
                      >
                        Reset Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Items: Manage Parts Catalog, Notifications, Settings (Settings last) */}
              <div className="py-1">
                {/* 1. Manage Parts Catalog */}
                <button
                  onClick={() => {
                    setActiveView('inventory');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-slate-100 flex items-center gap-2.5 font-medium transition cursor-pointer"
                >
                  <UIcon name="boxes" className="text-sm text-[#111111]/60" />
                  <span>Manage Parts Catalog</span>
                </button>

                {/* 2. Notifications */}
                <div
                  className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-slate-100 flex items-center justify-between font-medium transition cursor-pointer select-none"
                >
                  <button
                    onClick={() => {
                      setActiveView('notifications');
                      setDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                  >
                    <UIcon name={notificationsEnabled ? 'bell' : 'bell-slash'} className="text-sm text-[#111111]/60" />
                    <span>Notifications</span>
                    {unreadNotificationsCount > 0 && notificationsEnabled && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#111111] text-white">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Sliding switch button for Notifications ON / OFF */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNotificationsEnabled();
                    }}
                    className={`relative inline-flex items-center h-5 w-12 rounded-full p-0.5 transition-colors duration-200 shrink-0 cursor-pointer ${
                      notificationsEnabled ? 'bg-[#111111]' : 'bg-slate-300'
                    }`}
                    title={notificationsEnabled ? 'Turn notifications OFF' : 'Turn notifications ON'}
                  >
                    <span
                      className={`inline-flex items-center justify-center h-4 w-5 rounded-full bg-white shadow-xs text-[8px] font-black tracking-tight uppercase transition-transform duration-200 ease-in-out ${
                        notificationsEnabled 
                          ? 'translate-x-6 text-[#111111]' 
                          : 'translate-x-0 text-slate-600'
                      }`}
                    >
                      {notificationsEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* Dark Mode - under Notifications */}
                <div
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-[#111111] hover:bg-slate-100 flex items-center justify-between font-medium transition cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? (
                      <UIcon name="sun" className="text-sm text-[#F6AF31]" />
                    ) : (
                      <UIcon name="moon" className="text-sm text-[#111111]/60" />
                    )}
                    <span>Dark Mode</span>
                  </div>

                  {/* Sliding switch button from left to right showing on or off when clicked */}
                  <div
                    className={`relative inline-flex items-center h-5 w-12 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                      theme === 'dark' ? 'bg-[#111111]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center h-4 w-5 rounded-full bg-white shadow-xs text-[8px] font-black tracking-tight uppercase transition-transform duration-200 ease-in-out ${
                        theme === 'dark' 
                          ? 'translate-x-6 text-[#111111]' 
                          : 'translate-x-0 text-slate-600'
                      }`}
                    >
                      {theme === 'dark' ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* 3. Settings (last one) */}
                <button
                  onClick={() => {
                    setActiveView('settings');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#111111] hover:bg-[#F7F6F3] flex items-center gap-2.5 font-medium transition cursor-pointer"
                >
                  <UIcon name="settings" className="text-sm text-[#111111]/60" />
                  <span>Settings</span>
                </button>
              </div>

              {/* System Currency Switcher */}
              <div className="px-3 py-2 my-1 border-t border-b border-slate-100 bg-[#F7F6F3]/50">
                <div className="flex items-center justify-between px-1 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/60 flex items-center gap-1.5">
                    <UIcon name="coins" className="text-xs text-[#111111]" /> Currency
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCurrencySelect('USD')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      currency === 'USD'
                        ? 'bg-[#111111] text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-[#111111] border border-slate-200/80'
                    }`}
                  >
                    <span>USD ($)</span>
                    {currency === 'USD' && <UIcon name="check" className="text-xs text-[#F6AF31]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCurrencySelect('UGX')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      currency === 'UGX'
                        ? 'bg-[#111111] text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-[#111111] border border-slate-200/80'
                    }`}
                  >
                    <span>UGX (USh)</span>
                    {currency === 'UGX' && <UIcon name="check" className="text-xs text-[#F6AF31]" />}
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
                  className="w-full text-left px-4 py-2 text-xs text-[#DC2626] hover:bg-red-50 flex items-center gap-2.5 font-bold transition cursor-pointer"
                >
                  <UIcon name="sign-out-alt" className="text-xs" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Picture Cropping Modal */}
      <ProfileCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        fileType={cropFileType}
        onClose={() => {
          setCropModalOpen(false);
          setCropImageSrc(null);
        }}
        onSave={(croppedUrl) => {
          updateUser({ avatar: croppedUrl });
          setCropModalOpen(false);
          setCropImageSrc(null);
          setFlashMessage('success', 'Profile picture cropped and updated successfully!');
        }}
      />
    </header>
  );
};
