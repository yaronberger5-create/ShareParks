'use client';

import { useState, useEffect, useTransition } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
} from '@/actions/notification-actions';
import { createSupabaseBrowser } from '@/lib/supabase/client';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface NotificationBellProps {
  initialCount: number;
  initialNotifications: Notification[];
}

export function NotificationBell({ initialCount, initialNotifications }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();

  // ─── Realtime subscription for new notifications ──────────
  useEffect(() => {
    const supabase = createSupabaseBrowser();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleMarkAllRead() {
    startTransition(async () => {
      const result = await markAllAsRead();
      if (result.success) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
    });
  }

  function handleMarkOneRead(id: string) {
    startTransition(async () => {
      await markOneAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'עכשיו';
    if (mins < 60) return `לפני ${mins} דק'`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `לפני ${hours} שע'`;
    return `לפני ${Math.floor(hours / 24)} ימים`;
  }

  const typeIcon: Record<string, string> = {
    booking_new: '🅿️',
    booking_cancelled: '❌',
    booking_completed: '✅',
    payout: '💰',
    system: '⚙️',
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-all active:scale-90"
      >
        <Bell size={22} className="text-white" />
        {unreadCount > 0 && (
          <span className="
            absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
            bg-orange-500 text-white text-[11px] font-bold
            rounded-full flex items-center justify-center
            animate-scale-in
          ">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="
            absolute top-full left-0 mt-2 z-50
            w-[340px] max-h-[70vh] overflow-y-auto
            bg-white rounded-2xl shadow-2xl border border-gray-100
            animate-slide-up
          ">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-black">התראות</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs text-orange-500 font-bold hover:underline"
                >
                  <CheckCheck size={14} />
                  סמן הכל כנקרא
                </button>
              )}
            </div>

            {/* List */}
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Bell size={28} className="mx-auto mb-2" />
                <p className="text-sm">אין התראות</p>
              </div>
            ) : (
              <div>
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) handleMarkOneRead(notif.id);
                    }}
                    className={`
                      w-full text-right px-4 py-3 border-b border-gray-50
                      transition-colors hover:bg-gray-50
                      ${!notif.is_read ? 'bg-orange-50/50' : ''}
                    `}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <span className="text-lg mt-0.5">
                        {typeIcon[notif.type] ?? '🔔'}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-black truncate">
                            {notif.title}
                          </p>
                          {!notif.is_read && (
                            <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                          {notif.body}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
