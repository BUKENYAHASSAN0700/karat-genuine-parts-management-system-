import React from 'react';
import { useInertia } from '../../context/InertiaContext';
import { UIcon } from '../Common/UIcon';

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
            <UIcon name={notificationsEnabled ? 'bell' : 'bell-slash'} className="text-base" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight font-poppins flex items-center gap-2.5">
              <span>Notifications</span>
              {notifications.length > 0 && notificationsEnabled && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#111111] text-white">
                  {notifications.length}
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Sliding switch button from left to right showing ON or OFF */}
          <div
            onClick={toggleNotificationsEnabled}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs select-none"
            role="button"
            tabIndex={0}
            title={notificationsEnabled ? 'Click to turn notifications OFF' : 'Click to turn notifications ON'}
          >
            <span className="text-xs font-bold text-[#111111]">
              {notificationsEnabled ? 'Notifications' : 'Notifications'}
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
              onClick={clearAllNotifications}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <UIcon name="trash" className="text-xs text-slate-500" />
              <span>Clear All</span>
            </button>
          )}
        </div>
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
