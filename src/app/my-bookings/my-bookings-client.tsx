'use client';

import { StarRating } from '@/components/ratings/star-rating';
import { Clock, MapPin, Receipt, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BookingItem {
  id: string;
  parkingId: string;
  address: string;
  city: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  finalPrice: number | null;
  overtimeMinutes: number;
  overtimeCharge: number;
  status: string;
  createdAt: string;
  alreadyRated: boolean;
}

interface MyBookingsClientProps {
  bookings: BookingItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'ממתין', color: 'text-orange-500 bg-orange-50', icon: <Loader2 size={14} className="animate-spin" /> },
  active: { label: 'פעיל', color: 'text-green-600 bg-green-50', icon: <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> },
  completed: { label: 'הושלם', color: 'text-gray-500 bg-gray-50', icon: <Check size={14} /> },
  cancelled: { label: 'בוטל', color: 'text-red-500 bg-red-50', icon: <X size={14} /> },
};

export function MyBookingsClient({ bookings }: MyBookingsClientProps) {
  const active = bookings.filter((b) => b.status === 'active' || b.status === 'pending');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('he-IL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white px-5 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Receipt size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-bold">ההזמנות שלי</h1>
          </div>
          <span className="text-xs text-gray-500">ShareParks</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <Receipt size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">אין הזמנות עדיין</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold transition-all active:scale-95"
            >
              חפש חניה
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active bookings */}
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">
                  פעילות ({active.length})
                </h2>
                <div className="space-y-3">
                  {active.map((b) => (
                    <BookingCard key={b.id} booking={b} formatDate={formatDate} formatTime={formatTime} />
                  ))}
                </div>
              </section>
            )}

            {/* Past bookings */}
            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  היסטוריה ({past.length})
                </h2>
                <div className="space-y-3">
                  {past.map((b) => (
                    <BookingCard key={b.id} booking={b} formatDate={formatDate} formatTime={formatTime} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <div className="h-8" />
    </div>
  );
}

function BookingCard({
  booking: b,
  formatDate,
  formatTime,
}: {
  booking: BookingItem;
  formatDate: (iso: string) => string;
  formatTime: (iso: string) => string;
}) {
  const status = STATUS_MAP[b.status] ?? STATUS_MAP.pending;
  const price = b.finalPrice ?? b.totalPrice;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4">
        {/* Status + price */}
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
            {status.icon}
            <span>{status.label}</span>
          </div>
          <span className="text-lg font-black text-black">
            {price}
            <span className="text-xs font-medium text-gray-400 mr-0.5">ש"ח</span>
          </span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={14} className="text-gray-400 shrink-0" />
          <span className="font-bold text-black text-base">{b.address}</span>
          <span className="text-xs text-gray-400">{b.city}</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock size={14} />
          <span>{formatDate(b.startTime)}</span>
          <span className="text-gray-300">·</span>
          <span>{formatTime(b.startTime)} — {formatTime(b.endTime)}</span>
        </div>

        {/* Overtime badge */}
        {b.overtimeMinutes > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-bold">
              +{b.overtimeMinutes} דק' חריגה
            </span>
            <span className="text-gray-400">+{b.overtimeCharge} ש"ח</span>
          </div>
        )}
      </div>

      {/* Rating section — only for completed bookings */}
      {b.status === 'completed' && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-400 mb-2">דרג את החניה</p>
          <StarRating bookingId={b.id} alreadyRated={b.alreadyRated} />
        </div>
      )}
    </div>
  );
}
