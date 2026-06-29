import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, Ticket, MessageSquare, CreditCard, Award } from 'lucide-react';
import { NotificationItem } from '@/src/shared/types';
import Badge from '@/src/shared/components/Badge';
import { toast } from '@/src/shared/components/Toast';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = () => {
    const saved = localStorage.getItem('dm_notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('dm_notifications', JSON.stringify(updated));
    toast('Marked all alerts as read.');
  };

  const handleClearAll = () => {
    setNotifications([]);
    localStorage.setItem('dm_notifications', JSON.stringify([]));
    toast('Notifications inbox cleared.');
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'daymate':
        return (
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/10">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'ticketswap':
        return (
          <div className="p-2.5 bg-teal-500 text-white rounded-xl shadow-md shadow-teal-500/10">
            <Ticket className="w-4 h-4" />
          </div>
        );
      case 'chat':
        return (
          <div className="p-2.5 bg-sky-500 text-white rounded-xl shadow-md shadow-sky-500/10">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'payment':
        return (
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/10">
            <CreditCard className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/10">
            <Award className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="px-5 py-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 
            style={{ fontSize: 'clamp(1.125rem, 5vw, 1.625rem)' }}
            className="font-black text-neutral-900 dark:text-white tracking-tight"
          >
            Alerts
          </h2>
          <p className="text-xs text-neutral-400 font-bold mt-0.5">Unified activity & secure transaction logs</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button
              id="mark-all-read"
              onClick={handleMarkAllRead}
              className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-600 transition"
              title="Mark all as read"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              id="clear-all-notifs"
              onClick={handleClearAll}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition"
              title="Clear inbox"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3 pb-24">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-4 p-4 border rounded-2xl transition ${
                notif.read 
                  ? 'border-neutral-100 dark:border-neutral-900 bg-white/65 dark:bg-neutral-950/40 opacity-75' 
                  : 'border-emerald-100 dark:border-emerald-950 bg-emerald-50/10 dark:bg-emerald-950/10 shadow-sm shadow-emerald-500/5'
              }`}
            >
              <div className="shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${notif.read ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-850 dark:text-neutral-100 font-bold'}`}>
                  {notif.text}
                </p>
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-extrabold uppercase tracking-wider">
                    {notif.timestamp}
                  </span>
                  {!notif.read && (
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center py-20 text-center text-neutral-400">
            <div className="p-3 bg-neutral-50 rounded-full border border-dashed border-neutral-200 mb-2">
              <Bell className="w-6 h-6 text-neutral-300" />
            </div>
            <p className="text-xs font-bold">Your alerts feed is quiet.</p>
            <p className="text-[10px] mt-1">You will receive live updates when people join your groups or list tickets.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;
