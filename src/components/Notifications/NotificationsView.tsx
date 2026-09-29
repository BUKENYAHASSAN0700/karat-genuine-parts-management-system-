import React, { useState } from 'react';
import { useInertia } from '../../context/InertiaContext';
import { UIcon } from '../Common/UIcon';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    notificationsEnabled,
    toggleNotificationsEnabled,
    clearNotification, 
    clearAllNotifications, 
    markNotificationAsRead,
    setActiveView 
  } = useInertia();

  const [activeFilter, setActiveFilter] = useState<'all' | 'sale' | 'stock' | 'order' | 'delete' | 'system'>('all');
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [deleteConfirmNotif, setDeleteConfirmNotif] = useState<{ id: string; title: string } | null>(null);

  const handleOpenLink = (notifId: string, linkView?: string) => {
    markNotificationAsRead(notifId);
    if (linkView) {
      setActiveView(linkView);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#111111] shadow-2xs shrink-0">
            <UIcon name={notificationsEnabled ? 'bell' : 'bell-slash'} className="text-base" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight font-poppins flex items-center gap-2.5">
              <span>Notifications & Activity Log</span>
              {notifications.length > 0 && notificationsEnabled && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#111111] text-white">
                  {notifications.length}
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Sliding switch button from left to right showing ON or OFF */}
          <div
            onClick={toggleNotificationsEnabled}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs select-none"
            role="button"
            tabIndex={0}
            title={notificationsEnabled ? 'Click to turn notifications OFF' : 'Click to turn notifications ON'}
          >
            <span className="text-xs font-bold text-[#111111]">
              Alerts
            </span>
            <div
              className={`relative inline-flex items-center h-5 w-12 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                notificationsEnabled ? 'bg-[#111111]' : 'bg-slate-300'
              }`}
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

          {notifications.length > 0 && (
            <button
              onClick={() => setIsClearAllModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-xs font-bold text-rose-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <UIcon name="trash" className="text-xs text-rose-600" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Activity', count: notifications.length },
          { id: 'sale', label: 'Sales & Receipts', count: notifications.filter(n => n.category === 'sale').length },
          { id: 'stock', label: 'Stock & Inventory', count: notifications.filter(n => n.category === 'stock').length },
          { id: 'order', label: 'Commercial Orders', count: notifications.filter(n => n.category === 'order').length },
          { id: 'delete', label: 'Deletions', count: notifications.filter(n => n.category === 'delete').length },
          { id: 'system', label: 'System & Settings', count: notifications.filter(n => n.category === 'system').length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-[#111111] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-black hover:border-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeFilter === tab.id ? 'bg-[#F6AF31] text-[#111111]' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {!notificationsEnabled && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <UIcon name="bell-slash" className="text-sm text-amber-700 shrink-0" />
            <span>Notifications are currently turned <strong>OFF</strong>. Toggle the switch to ON to resume alerts.</span>
          </div>
          <button
            onClick={toggleNotificationsEnabled}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
          >
            Turn ON
          </button>
        </div>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 mx-auto flex items-center justify-center text-slate-400">
            <UIcon name="bell-slash" className="text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1">
              {activeFilter === 'all' 
                ? 'All alerts and activity updates have been cleared.' 
                : `No notifications in the ${activeFilter} category.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifications.map((notif) => {
            const getCategoryStyle = () => {
              switch (notif.category) {
                case 'stock':
                  return {
                    icon: 'boxes',
                    iconBg: 'bg-amber-50 text-amber-700 border-amber-200/70',
                    tag: 'bg-amber-100/70 text-amber-900',
                    tagLabel: 'Stock'
                  };
                case 'sale':
                  return {
                    icon: 'shopping-cart',
                    iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
                    tag: 'bg-emerald-100/70 text-emerald-900',
                    tagLabel: 'Sale'
                  };
                case 'order':
                  return {
                    icon: 'document',
                    iconBg: 'bg-blue-50 text-blue-700 border-blue-200/70',
                    tag: 'bg-blue-100/70 text-blue-900',
                    tagLabel: 'Order'
                  };
                case 'delete':
                  return {
                    icon: 'trash',
                    iconBg: 'bg-rose-50 text-rose-700 border-rose-200/70',
                    tag: 'bg-rose-100/70 text-rose-900',
                    tagLabel: 'Deletion'
                  };
                case 'system':
                default:
                  return {
                    icon: 'settings',
                    iconBg: 'bg-slate-100 text-slate-700 border-slate-200/80',
                    tag: 'bg-slate-200 text-slate-800',
                    tagLabel: 'System'
                  };
              }
            };

            const style = getCategoryStyle();

            return (
              <div
                key={notif.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs transition flex items-start justify-between gap-4 ${
                  notif.read ? 'border-slate-200/80' : 'border-slate-300 bg-slate-50/20'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${style.iconBg}`}>
                    <UIcon name={style.icon} className="text-sm" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${style.tag}`}>
                        {style.tagLabel}
                      </span>
                      <h4 className="text-sm font-bold text-[#111111] leading-tight">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#111111] shrink-0" title="Unread" />
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.linkView && (
                      <div className="pt-1">
                        <button
                          onClick={() => handleOpenLink(notif.id, notif.linkView)}
                          className="text-[11px] font-bold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{notif.linkView === 'inventory' ? 'Open Inventory' : notif.linkView === 'pos' ? 'Open Shop' : notif.linkView === 'restock' ? 'Open Restock' : notif.linkView === 'inquiries' ? 'Open Orders' : notif.linkView === 'settings' ? 'Open Settings' : 'View Module'}</span>
                          <UIcon name="arrow-right" className="text-[10px]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dismiss/Clear Button with Confirmation */}
                <button
                  onClick={() => setDeleteConfirmNotif({ id: notif.id, title: notif.title })}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                  title="Remove notification"
                  aria-label="Remove notification"
                >
                  <UIcon name="cross" className="text-xs" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Clearing a Single Notification */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteConfirmNotif)}
        title="Remove Notification?"
        message={`Are you sure you want to dismiss and remove this notification?`}
        itemDetails={deleteConfirmNotif ? [{ label: 'Notification', value: deleteConfirmNotif.title }] : []}
        confirmText="Yes, Remove"
        onConfirm={() => {
          if (deleteConfirmNotif) {
            clearNotification(deleteConfirmNotif.id);
            setDeleteConfirmNotif(null);
          }
        }}
        onCancel={() => setDeleteConfirmNotif(null)}
      />

      {/* Confirmation Modal for Clearing All Notifications */}
      <ConfirmDeleteModal
        isOpen={isClearAllModalOpen}
        title="Clear All Notifications?"
        message="Are you sure you want to clear all notifications and system activity logs? This action will permanently empty the activity feed."
        itemDetails={[{ label: 'Total Records', value: `${notifications.length} notifications` }]}
        confirmText="Yes, Clear All"
        onConfirm={() => {
          clearAllNotifications();
          setIsClearAllModalOpen(false);
        }}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </div>
  );
};

