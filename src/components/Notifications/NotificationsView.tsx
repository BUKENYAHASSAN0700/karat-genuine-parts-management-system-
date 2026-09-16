import React from 'react';
import { useInertia } from '../../context/InertiaContext';
import { UIcon } from '../Common/UIcon';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    clearNotification, 
    clearAllNotifications, 
    markNotificationAsRead,
    setActiveView 
  } = useInertia();

  const handleOpenLink = (notifId: string, linkView?: string) => {
    markNotificationAsRead(notifId);
    if (linkView) {
      setActiveView(linkView);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#111111] shadow-2xs shrink-0">
            <UIcon name="bell" className="text-base" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight font-mono flex items-center gap-2.5">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#111111] text-white">
                  {notifications.length}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              System alerts, stock warnings, and transaction logs
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={clearAllNotifications}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <UIcon name="trash" className="text-xs text-slate-500" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/80 mx-auto flex items-center justify-center text-slate-400">
            <UIcon name="bell-slash" className="text-xl" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1">All alerts and updates have been cleared.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => {
            const getCategoryIcon = () => {
              switch (notif.category) {
                case 'stock':
                  return 'boxes';
                case 'sale':
                  return 'shopping-cart';
                case 'system':
                default:
                  return 'info';
              }
            };

            return (
              <div
                key={notif.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-2xs transition flex items-start justify-between gap-4 ${
                  notif.read ? 'border-slate-200/80' : 'border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                    <UIcon name={getCategoryIcon()} className="text-sm" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
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
                          <span>{notif.linkView === 'inventory' ? 'Open Inventory' : notif.linkView === 'pos' ? 'Open Shop' : 'View'}</span>
                          <UIcon name="arrow-right" className="text-[10px]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dismiss/Clear Button */}
                <button
                  onClick={() => clearNotification(notif.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                  title="Clear notification"
                  aria-label="Clear notification"
                >
                  <UIcon name="cross" className="text-xs" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
