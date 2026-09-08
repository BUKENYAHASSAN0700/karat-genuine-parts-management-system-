import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  ShoppingCart, 
  Receipt,
  Truck, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  User,
  X
} from 'lucide-react';
import { useInertia } from '../../context/InertiaContext';

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
    inquiries,
    orders,
    oemOrders
  } = useInertia();

  const lowStockCount = parts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock' || p.stock_quantity <= p.min_stock_alert).length;
  const activeInquiriesCount = inquiries.filter(i => i.status !== 'Declined' && i.status !== 'Converted to Order').length;
  const inboundShipmentsCount = oemOrders.filter(o => o.status !== 'Received & Stocked' && o.status !== 'Cancelled').length;

  const navigationSections = [
    {
      group: 'Core Management',
      items: [
        { 
          id: 'dashboard', 
          icon: LayoutDashboard, 
          label: 'Dashboard', 
          description: 'Overview & Metrics' 
        },
        { 
          id: 'inventory', 
          icon: Boxes, 
          label: 'Spare Parts', 
          description: 'CAT, Komatsu, Volvo SKUs',
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          badgeColor: 'bg-[#DC2626] text-white'
        },
        { 
          id: 'inquiries', 
          icon: FileText, 
          label: 'Inquiries & Orders', 
          description: 'Customer requests',
          badge: activeInquiriesCount > 0 ? `${activeInquiriesCount} Active` : undefined,
          badgeColor: 'bg-[#F6AF31] text-[#111111]'
        },
      ]
    },
    {
      group: 'Commercial & OEM',
      items: [
        { 
          id: 'pos', 
          icon: Receipt, 
          label: 'Sell Parts / POS', 
          description: 'Register & receipts',
          badge: 'POS',
          badgeColor: 'bg-[#F6AF31] text-[#111111]'
        },
        { 
          id: 'purchases', 
          icon: Truck, 
          label: 'OEM Restock', 
          description: 'Factory POs & Ingest',
          badge: inboundShipmentsCount > 0 ? `${inboundShipmentsCount} Inbound` : undefined,
          badgeColor: 'bg-blue-600 text-white'
        },
        { 
          id: 'reports', 
          icon: BarChart3, 
          label: 'Financial Reports', 
          description: 'P&L, aging & URA taxes',
          badge: 'P&L',
          badgeColor: 'bg-emerald-600 text-white'
        },
      ]
    },
    {
      group: 'Preferences',
      items: [
        { 
          id: 'settings', 
          icon: Settings, 
          label: 'Store Settings', 
          description: 'Depot, FX & EFRIS tax',
          badge: 'Y4 Depot',
          badgeColor: 'bg-[#111111] text-[#F6AF31]'
        },
      ]
    }
  ];

  return (
    <>
      <aside 
        className={`hidden md:flex flex-col justify-between bg-white border border-slate-200/90 rounded-3xl shadow-xs transition-all duration-300 shrink-0 sticky top-3 sm:top-5 lg:top-6 z-20 h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2.5rem)] lg:h-[calc(100vh-3rem)] max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] lg:max-h-[calc(100vh-3rem)] overflow-hidden ${
          isSidebarCollapsed ? 'w-20 p-3' : 'w-64 p-4'
        }`}
      >
      {/* 1. Top Fixed Brand Logo & Collapse Toggle */}
      <div 
        className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'} pb-3.5 border-b border-slate-100 cursor-pointer shrink-0`}
        onClick={() => setActiveView('dashboard')}
      >
        {/* Logo Brand Header */}
        <div className="flex items-center gap-2.5 overflow-hidden select-none">
          <div className="w-9 h-9 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black shrink-0 shadow-xs">
            <Cpu className="w-4 h-4 text-[#F6AF31]" />
          </div>
          {!isSidebarCollapsed && (
            <div className="truncate">
              <div>
                <span className="text-sm font-black tracking-tight text-[#111111] font-mono leading-none block truncate">
                  KARAT GENUINE PARTS
                </span>
              </div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-[#111111]/40 truncate mt-0.5">
                Heavy Machinery Parts
              </div>
            </div>
          )}
        </div>

        {/* Minimize / Expand Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          className={`w-8 h-8 rounded-xl bg-[#F7F6F3] hover:bg-slate-200/80 text-[#111111] border border-slate-200/70 flex items-center justify-center transition-all shadow-2xs ${
            isSidebarCollapsed ? 'mt-2' : ''
          }`}
          title={isSidebarCollapsed ? 'Expand Sidebar (Show Words & Labels)' : 'Minimize Sidebar (Icons Only)'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-[#111111]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#111111]" />
          )}
        </button>
      </div>

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
              const IconComponent = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  title={isSidebarCollapsed ? `${item.label} - ${item.description}` : undefined}
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
                      <IconComponent className="w-4 h-4" />
                    </div>
                    
                    {!isSidebarCollapsed && (
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate leading-tight">
                          {item.label}
                        </div>
                        <div className={`text-[10px] truncate ${isActive ? 'text-white/60' : 'text-[#111111]/40'}`}>
                          {item.description}
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
          <div className="p-2.5 rounded-2xl bg-[#F7F6F3] border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center shrink-0 shadow-2xs">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#111111] truncate">
                  {currentUser?.name || 'Owner'}
                </div>
                <div className="text-[10px] text-[#22A06B] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Master Owner
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-xl text-[#111111]/40 hover:text-[#DC2626] hover:bg-red-50 transition"
              title="Sign Out (Lock Shop)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div 
              className="w-9 h-9 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center shadow-2xs cursor-pointer"
              title={`${currentUser?.name} (Shop Owner)`}
              onClick={() => setActiveView('settings')}
            >
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={logout}
              className="w-9 h-9 rounded-2xl bg-[#F7F6F3] hover:bg-red-50 text-[#111111]/50 hover:text-[#DC2626] flex items-center justify-center transition border border-slate-200/60"
              title="Sign Out (Lock Shop)"
            >
              <LogOut className="w-4 h-4" />
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
              <div className="w-9 h-9 rounded-2xl bg-[#111111] text-[#F6AF31] flex items-center justify-center font-black shadow-xs">
                <Cpu className="w-4 h-4 text-[#F6AF31]" />
              </div>
              <div>
                <span className="text-sm font-black tracking-tight text-[#111111] font-mono leading-none block">
                  KARAT GENUINE PARTS
                </span>
                <div className="text-[9px] uppercase font-bold tracking-wider text-[#111111]/40 mt-0.5">
                  Heavy Machinery Depot
                </div>
              </div>
            </div>

            <button
              onClick={closeMobileMenu}
              className="w-8 h-8 rounded-xl bg-[#F7F6F3] hover:bg-slate-200/80 text-[#111111] flex items-center justify-center border border-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
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
                  const IconComponent = item.icon;

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
                          : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#F7F6F3]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#F6AF31]' : 'text-[#111111]/70'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{item.label}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-white/60' : 'text-[#111111]/40'}`}>
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor || 'bg-[#F7F6F3] text-[#111111]'}`}>
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
            <div className="p-2.5 rounded-2xl bg-[#F7F6F3] border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F6AF31] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#111111] truncate">{currentUser?.name || 'Owner'}</div>
                  <div className="text-[10px] text-[#22A06B] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Master Owner
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-xl text-[#111111]/40 hover:text-[#DC2626] hover:bg-red-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
