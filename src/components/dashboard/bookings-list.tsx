'use client';

import { User, Clock, Phone } from 'lucide-react';

interface BookingItem {
  id: string;
  start_timestamp: string;
  end_timestamp: string;
  total_price: number;
  status: string;
  renter: { full_name: string; phone_number: string | null } | null;
}

interface BookingsListProps {
  bookings: BookingItem[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  const now = new Date();

  const activeNow = bookings.filter((b) => {
    const start = new Date(b.start_timestamp);
    const end = new Date(b.end_timestamp);
    return start <= now && end >= now && b.status === 'active';
  });

  const upcoming = bookings.filter((b) => {
    const start = new Date(b.start_timestamp);
    return start > now;
  });

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('he-IL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(start: string, end: string) {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.round(ms / (1000 * 60 * 60) * 10) / 10;
    return hours === 1 ? 'שעה' : `${hours} שעות`;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-black mb-5">הזמנות</h3>

      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <User size={32} className="mx-auto mb-2" />
          <p className="text-sm">אין הזמנות פעילות כרגע</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Active now */}
          {activeNow.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-sm font-bold text-orange-600">פעיל עכשיו</p>
              </div>
              <div className="space-y-2">
                {activeNow.map((b) => (
                  <BookingCard key={b.id} booking={b} isActive formatTime={formatTime} formatDuration={formatDuration} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                הזמנות קרובות ({upcoming.length})
              </p>
              <div className="space-y-2">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} isActive={false} formatTime={formatTime} formatDuration={formatDuration} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  booking,
  isActive,
  formatTime,
  formatDuration,
}: {
  booking: BookingItem;
  isActive: boolean;
  formatTime: (iso: string) => string;
  formatDuration: (start: string, end: string) => string;
}) {
  return (
    <div className={`
      rounded-xl border px-4 py-3
      ${isActive
        ? 'bg-orange-50 border-orange-200'
        : 'bg-gray-50 border-gray-100'
      }
    `}>
      {/* Renter */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}
          `}>
            <User size={16} />
          </div>
          <span className="font-bold text-black text-base">
            {booking.renter?.full_name ?? 'משתמש'}
          </span>
        </div>
        <span className="text-lg font-black text-black">
          {booking.total_price}
          <span className="text-xs font-medium text-gray-400 mr-0.5">ש"ח</span>
        </span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <Clock size={14} />
        <span>{formatTime(booking.start_timestamp)}</span>
        <span className="text-gray-300">·</span>
        <span>{formatDuration(booking.start_timestamp, booking.end_timestamp)}</span>
      </div>

      {/* Phone — only for active */}
      {isActive && booking.renter?.phone_number && (
        <a
          href={`tel:${booking.renter.phone_number}`}
          className="
            flex items-center gap-1.5 mt-2 text-sm text-orange-600 font-medium
            hover:underline
          "
        >
          <Phone size={14} />
          <span>{booking.renter.phone_number}</span>
        </a>
      )}
    </div>
  );
}
