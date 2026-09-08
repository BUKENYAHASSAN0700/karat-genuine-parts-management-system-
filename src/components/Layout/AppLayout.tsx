import React from 'react';
import { useInertia } from '../../context/InertiaContext';
import { Header } from '../Navigation/Header';
import { Sidebar } from '../Navigation/Sidebar';
import { DashboardView } from '../Dashboard/DashboardView';
import { InventoryPreview } from '../Inventory/InventoryPreview';
import { SalesView } from '../Operations/OperationsViews';
import { InquiriesOrdersView } from '../Inquiries/InquiriesOrdersView';
import { OEMRestockView } from '../Restock/OEMRestockView';
import { SalesTerminalView } from '../Sales/SalesTerminalView';
import { FinancialReportsView } from '../Reports/FinancialReportsView';
import { StoreSettingsView } from '../Settings/StoreSettingsView';
import { AddPartModal } from '../Inventory/AddPartModal';
import { LoginView } from '../Auth/LoginView';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { div } from 'motion/react-client';

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
      case 'inquiries':
      case 'orders':
        return <InquiriesOrdersView />;
      case 'purchases':
      case 'restock':
        return <OEMRestockView />;
      case 'reports':
        return <FinancialReportsView />;
      case 'settings':
        return <StoreSettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#111111] font-sans selection:bg-[#F6AF31] selection:text-[#111111] p-3 sm:p-5 lg:p-6">
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

      {/* Unified Connected Layout Shell */}
      <div className="max-w-[1600px] w-full mx-auto flex gap-4 lg:gap-5 items-start">
        {/* Left Sidebar attached with the SINGLE Brand Logo at top-left */}
        <Sidebar />

        {/* Right Flow: Attached Top Bar + Main Workspace View */}
        <div className="flex-1 w-full min-w-0 flex flex-col gap-4 lg:gap-5">
          {/* Sticky Solid Top Bar container that hides scrolling content underneath */}
          <div className="sticky top-0 z-30 pt-3 sm:pt-5 lg:pt-6 pb-2 bg-[#F7F6F3]">
            <Header />
          </div>

          {/* Main View Area */}
          <main className="flex-1 w-full min-w-0 pb-6">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Global Add Part Modal */}
      <AddPartModal />
    </div>
  );
};
