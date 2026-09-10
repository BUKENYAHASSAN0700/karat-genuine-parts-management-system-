import React from 'react';
import { useInertia } from '../../context/InertiaContext';
import { Header } from '../Navigation/Header';
import { Sidebar } from '../Navigation/Sidebar';
import { DashboardView } from '../Dashboard/DashboardView';
import { InventoryPreview } from '../Inventory/InventoryPreview';
import { SalesTerminalView } from '../Sales/SalesTerminalView';
import { StoreSettingsView } from '../Settings/StoreSettingsView';
import { AddPartModal } from '../Inventory/AddPartModal';
import { LoginView } from '../Auth/LoginView';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, activeView, props, clearFlash } = useInertia();
  const flash = props.flash;

  // Enforce Login First requirement
  if (!isAuthenticated) {
    return (
      <>
        {/* Flash Message in Login */}
        {flash.success && (
          <div className="fixed top-4 right-4 z-50 bg-[#111111] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#22A06B]" />
            <span>{flash.success}</span>
            <button onClick={clearFlash} className="ml-2 text-white/50 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {flash.error && (
          <div className="fixed top-4 right-4 z-50 bg-[#DC2626] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-white" />
            <span>{flash.error}</span>
            <button onClick={clearFlash} className="ml-2 text-white/70 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <LoginView />
      </>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryPreview />;
      case 'pos':
      case 'sell':
      case 'sales':
        return <SalesTerminalView />;
      case 'settings':
        return <StoreSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-shell h-screen w-screen max-w-full overflow-hidden bg-[#F7F6F3] text-[#111111] font-sans selection:bg-[#F6AF31] selection:text-[#111111] p-3 sm:p-5 lg:p-6 flex flex-col">
      {/* Flash Messages */}
      {flash.success && (
        <div className="fixed top-5 right-5 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-[#22A06B]" />
          <span>{flash.success}</span>
          <button onClick={clearFlash} className="ml-2 text-white/50 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {flash.error && (
        <div className="fixed top-5 right-5 z-50 bg-[#DC2626] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-white" />
          <span>{flash.error}</span>
          <button onClick={clearFlash} className="ml-2 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {flash.info && (
        <div className="fixed top-5 right-5 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in border border-[#F6AF31]/50">
          <Info className="w-4 h-4 text-[#F6AF31]" />
          <span>{flash.info}</span>
          <button onClick={clearFlash} className="ml-2 text-white/70 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Unified Connected Layout Shell: Fixed to screen, no window scrolling */}
      <div className="max-w-[1600px] w-full mx-auto flex gap-4 lg:gap-5 items-stretch flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar: Fixed height, locked in place, never scrolls with workspace */}
        <Sidebar />

        {/* Right Flow: Fixed Top Bar + Independently Scrollable Workspace */}
        <div className="flex-1 w-full min-w-0 flex flex-col h-full overflow-hidden">
          {/* Top Bar: Stationary, does not scroll */}
          <div className="shrink-0 pb-3 sm:pb-4">
            <Header />
          </div>

          {/* Main View Area: ONLY this part scrolls, with clean hidden scrollbar */}
          <main className="flex-1 w-full min-w-0 overflow-y-auto no-scrollbar pb-6 focus:outline-none">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Global Add Part Modal */}
      <AddPartModal />
    </div>
  );
};
