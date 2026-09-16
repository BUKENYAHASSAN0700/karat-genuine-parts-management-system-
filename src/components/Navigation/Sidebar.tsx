import React from 'react';
import { useInertia } from '../../context/InertiaContext';
import { UIcon } from '../Common/UIcon';

const karatLogo = new URL('../../../karat.svg', import.meta.url).href;

export const Sidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    logout, 
    parts, 
    currentUser,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    closeMobileMenu,
    receipts,
    unreadNotificationsCount
  } = useInertia();

  const lowStockCount = parts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.stock_quantity <= p.min_stock_alert).length;

  const navigationSections = [
    {
      group: 'Core Management',
      items: [
        { 
          id: 'dashboard', 
          uicon: 'apps', 
          label: 'Dashboard'
        },
        { 
          id: 'inventory', 
          uicon: 'boxes', 
          label: 'Inventory',
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          badgeColor: 'bg-[#DC2626] text-white'
        },
        { 
          id: 'notifications', 
          uicon: 'bell', 
          label: 'Notifications',
          badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined,
          badgeColor: 'bg-[#111111] text-white'
        },
      ]
    },
    {
      group: 'Commercial & OEM',
      items: [
        { 
          id: 'pos', 
          uicon: 'shopping-bag', 
          label: 'Shop'
        },
      ]
    },
    {
      group: 'Preferences',
      items: [
        { 
          id: 'settings', 
          uicon: 'settings', 
          label: 'Settings'
        },
      ]
    }
  ];

  return (
    <>
      <aside 
        className={`hidden md:flex flex-col justify-between bg-white border border-slate-200/90 rounded-3xl shadow-xs transition-all duration-300 shrink-0 h-full max-h-full overflow-hidden ${
          isSidebarCollapsed ? 'w-16 p-2' : 'w-56 p-3.5'
        }`}
      >
      {/* 1. Top Fixed Brand Logo & Collapse Toggle */}
      {isSidebarCollapsed ? (
        <div className="flex flex-col items-center gap-2 pb-3 border-b border-slate-100 shrink-0">
          <div 
            className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center font-black shrink-0 shadow-2xs p-1 cursor-pointer"
            onClick={() => setActiveView('dashboard')}
            title="Karat Dashboard"
          >
            <img src={karatLogo} alt="Karat logo" className="w-full h-full object-contain" />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            className="w-5.5 h-5.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            title="Expand Sidebar"
          >
            <UIcon name="angle-right" className="text-[9px] text-[#111111]" />
          </button>
        </div>
      ) : (
        <div 
          className="flex items-center justify-between px-1 pb-3 border-b border-slate-100 cursor-pointer shrink-0"
          onClick={() => setActiveView('dashboard')}
        >
          <div className="flex items-center gap-2 overflow-hidden select-none">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center font-black shrink-0 shadow-2xs p-1">
              <img src={karatLogo} alt="Karat logo" className="w-full h-full object-contain" />
            </div>
            <div className="truncate">
              <div>
                <span className="text-xs font-black tracking-tight text-[#111111] font-mono leading-none block truncate">
                  Karat Heavy Machinery
                </span>
              </div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-[#111111]/40 truncate mt-0.5">
                Spare Parts
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar();
            }}
            className="w-5.5 h-5.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-all shadow-2xs cursor-pointer shrink-0"
            title="Minimize Sidebar"
          >
            <UIcon name="angle-left" className="text-[9px] text-[#111111]" />
          </button>
        </div>
      )}

      {/* 2. Scrollable Middle Navigation Menu (Hidden Scrollbar) */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4 min-h-0">
        {navigationSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                {section.group}
              </div>
            )}
            {section.items.map(item => {
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-2xl transition-all relative ${
                    isSidebarCollapsed 
                      ? 'justify-center h-11 w-11 mx-auto' 
                      : 'justify-between px-3 py-2.5 text-left'
                  } ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#F7F6F3]'
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : 'min-w-0'}`}>
                    <div className={`shrink-0 ${isActive ? 'text-[#F6AF31]' : 'text-[#111111]/70'}`}>
                      <UIcon name={item.uicon} className="text-base" />
                    </div>
                    
                    {!isSidebarCollapsed && (
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">
                          {item.label}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  {item.badge ? (
                    isSidebarCollapsed ? (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#DC2626] border-2 border-white" />
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-[#F7F6F3] text-[#111111]'}`}>
                        {item.badge}
                      </span>
                    )
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. Bottom Fixed Profile & Lock Section */}
      <div className="pt-3 border-t border-slate-100 space-y-2 shrink-0">
        {!isSidebarCollapsed ? (
          <div className="p-2 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-between">
            <div 
              className="flex items-center gap-2 min-w-0 cursor-pointer"
              onClick={() => setActiveView('settings')}
              title="View Profile Settings"
            >
              <div className="w-7 h-7 rounded-xl bg-white text-[#111111] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden border border-slate-200 p-0.5">
                <img 
                  src={currentUser?.avatar || karatLogo} 
                  alt={currentUser?.name || 'Owner'} 
                  className={`w-full h-full ${!currentUser?.avatar || currentUser.avatar.includes('karat') ? 'object-contain' : 'object-cover'}`} 
                />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#111111] truncate">
                  {currentUser?.name || 'Arafat'}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1 rounded-lg text-slate-400 hover:text-[#DC2626] hover:bg-red-50 transition cursor-pointer"
              title="Sign Out"
            >
              <UIcon name="sign-out-alt" className="text-xs" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div 
              className="w-7 h-7 rounded-xl bg-white text-[#111111] flex items-center justify-center shadow-2xs cursor-pointer overflow-hidden border border-slate-200 p-0.5"
              title={`${currentUser?.name || 'Arafat'}`}
              onClick={() => setActiveView('settings')}
            >
              <img 
                src={currentUser?.avatar || karatLogo} 
                alt={currentUser?.name || 'Owner'} 
                className={`w-full h-full ${!currentUser?.avatar || currentUser.avatar.includes('karat') ? 'object-contain' : 'object-cover'}`} 
              />
            </div>
            <button
              onClick={logout}
              className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-[#DC2626] flex items-center justify-center transition border border-slate-200/80 cursor-pointer"
              title="Sign Out"
            >
              <UIcon name="sign-out-alt" className="text-xs" />
            </button>
          </div>
        )}
      </div>
    </aside>

    {/* Mobile Slide-in Drawer with Hidden Scrollbar */}
    {isMobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-50 flex">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={closeMobileMenu}
        />
        <div className="relative flex flex-col justify-between w-72 max-w-[85vw] bg-white h-full p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200 overflow-hidden">
          {/* Mobile Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center font-black shrink-0 shadow-2xs p-1">
                <img src={karatLogo} alt="Karat logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-xs font-black tracking-tight text-[#111111] font-mono leading-none block">
                  Karat Heavy Machinery
                </span>
                <div className="text-[9px] uppercase font-bold tracking-wider text-[#111111]/40 mt-0.5">
                  Spare Parts
                </div>
              </div>
            </div>

            <button
              onClick={closeMobileMenu}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[#111111] flex items-center justify-center border border-slate-200 transition cursor-pointer"
            >
              <UIcon name="cross" className="text-xs" />
            </button>
          </div>

          {/* Mobile Scrollable Navigation Items without Scrollbar */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-4 min-h-0">
            {navigationSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">
                  {section.group}
                </div>
                {section.items.map(item => {
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        closeMobileMenu();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-[#111111] text-white shadow-xs'
                          : 'text-[#111111]/70 hover:text-[#111111] hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UIcon name={item.uicon} className={`text-base ${isActive ? 'text-[#F6AF31]' : 'text-[#111111]/70'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.label}</div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-slate-100 text-[#111111]'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Mobile Footer */}
          <div className="pt-3 border-t border-slate-100 shrink-0">
            <div className="p-2 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-between">
              <div 
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                onClick={() => {
                  setActiveView('settings');
                  closeMobileMenu();
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 p-0.5">
                  <img 
                    src={currentUser?.avatar || karatLogo} 
                    alt={currentUser?.name || 'Owner'} 
                    className={`w-full h-full ${!currentUser?.avatar || currentUser.avatar.includes('karat') ? 'object-contain' : 'object-cover'}`} 
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#111111] truncate">{currentUser?.name || 'Arafat'}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-[#DC2626] hover:bg-red-50 transition cursor-pointer"
                title="Sign Out"
              >
                <UIcon name="sign-out-alt" className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
