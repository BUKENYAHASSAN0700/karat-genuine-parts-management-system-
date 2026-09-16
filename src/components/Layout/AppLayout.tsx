import React from 'react';
import { useInertia } from '../../context/InertiaContext';
import { Header } from '../Navigation/Header';
import { Sidebar } from '../Navigation/Sidebar';
import { DashboardView } from '../Dashboard/DashboardView';
import { InventoryPreview } from '../Inventory/InventoryPreview';
import { SalesTerminalView } from '../Sales/SalesTerminalView';
import { StoreSettingsView } from '../Settings/StoreSettingsView';
import { NotificationsView } from '../Notifications/NotificationsView';
import { AddPartModal } from '../Inventory/AddPartModal';
import { LoginView } from '../Auth/LoginView';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, activeView } = useInertia();

  // Enforce Login First requirement
  if (!isAuthenticated) {
    return <LoginView />;
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
      case 'notifications':
        return <NotificationsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-shell h-screen w-screen max-w-full overflow-hidden bg-[#F8F9FA] text-[#111111] font-sans selection:bg-[#F6AF31] selection:text-[#111111] p-2 sm:p-4 lg:p-6 flex flex-col">
      {/* Unified Connected Layout Shell: Fixed to screen, no window scrolling */}
      <div className="max-w-[1600px] w-full mx-auto flex gap-3 sm:gap-4 lg:gap-5 items-stretch flex-1 min-h-0 overflow-hidden">
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
