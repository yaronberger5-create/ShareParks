'use client';

import { useState, useEffect, useTransition } from 'react';
import { endParkingSession } from '@/actions/session-actions';
import { GateControl } from './gate-control';
import { ReportModal } from './report-modal';
import { Clock, MapPin, AlertTriangle, Check, Navigation, ShieldAlert } from 'lucide-react';

interface SessionData {
  bookingId: string;
  parkingId: string;
  parkingAddress: string;
  parkingCity: string;
  pricePerHour: number;
  startTime: string;
  endTime: string;
  totalPrice: number;
}

interface LiveSessionProps {
  session: SessionData;
  onSessionEnd: () => void;
}

type TimerStatus = 'normal' | 'warning' | 'overtime';

export function LiveSession({ session, onSessionEnd }: LiveSessionProps) {
  const [now, setNow] = useState(new Date());
  const [isPending, startTransition] = useTransition();
  const [endResult, setEndResult] = useState<{
    finalPrice: number;
    overtimeMinutes: number;
    overtimeCharge: number;
  } | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const endTime = new Date(session.endTime);
  const startTime = new Date(session.startTime);
  const remainingMs = endTime.getTime() - now.getTime();
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const elapsedMs = now.getTime() - startTime.getTime();

  // Timer status
  let status: TimerStatus = 'normal';
  if (remainingMs <= 0) {
    status = 'overtime';
  } else if (remainingMinutes <= 10) {
    status = 'warning';
  }

  // Format time display
  function formatCountdown(ms: number): string {
    const isNegative = ms < 0;
    const absMs = Math.abs(ms);
    const hours = Math.floor(absMs / 3600000);
    const mins = Math.floor((absMs % 3600000) / 60000);
    const secs = Math.floor((absMs % 60000) / 1000);

    const timeStr = hours > 0
      ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${mins}:${String(secs).padStart(2, '0')}`;

    return isNegative ? `+${timeStr}` : timeStr;
  }

  // Current cost (including overtime)
  function calcCurrentCost(): number {
    if (remainingMs >= 0) return session.totalPrice;
    const overtimeHours = Math.abs(remainingMs) / 3600000;
    const overtimeCharge = session.pricePerHour * 1.5 * overtimeHours;
    return Math.round((session.totalPrice + overtimeCharge) * 100) / 100;
  }

  function handleEndSession() {
    startTransition(async () => {
      const result = await endParkingSession(session.bookingId);
      if (result.success && result.summary) {
        setEndResult({
          finalPrice: result.summary.finalPrice,
          overtimeMinutes: result.summary.overtimeMinutes,
          overtimeCharge: result.summary.overtimeCharge,
        });
      }
    });
  }

  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(session.parkingAddress + ', ' + session.parkingCity)}`;

  // ─── Session ended view ───────────────────────────────────
  if (endResult) {
    return (
      <div dir="rtl" className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-scale-in">
          <Check size={40} strokeWidth={3} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-black mb-2">החניה הסתיימה</h2>
        <p className="text-gray-500 mb-6">{session.parkingAddress}</p>

        {/* Price breakdown */}
        <div className="w-full max-w-sm bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">מחיר בסיסי</span>
            <span className="text-sm font-bold text-black">{session.totalPrice} ש"ח</span>
          </div>
          {endResult.overtimeMinutes > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-red-500">
                חריגה ({endResult.overtimeMinutes} דק' x1.5)
              </span>
              <span className="text-sm font-bold text-red-500">
                +{endResult.overtimeCharge} ש"ח
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-bold text-black">סה"כ</span>
            <span className="text-xl font-black text-black">{endResult.finalPrice} ש"ח</span>
          </div>
        </div>

        <button
          onClick={onSessionEnd}
          className="px-8 py-3 rounded-2xl bg-black text-white text-base font-bold transition-all active:scale-95"
        >
          סגור
        </button>
      </div>
    );
  }

  // ─── Active session view ──────────────────────────────────
  const statusColors = {
    normal: { bg: 'bg-white', ring: 'ring-gray-200', text: 'text-black', timer: 'text-black' },
    warning: { bg: 'bg-orange-50', ring: 'ring-orange-300', text: 'text-orange-600', timer: 'text-orange-500' },
    overtime: { bg: 'bg-red-50', ring: 'ring-red-300', text: 'text-red-600', timer: 'text-red-500' },
  };
  const colors = statusColors[status];

  return (
    <div dir="rtl" className={`fixed inset-x-0 bottom-0 z-50 ${colors.bg} rounded-t-3xl shadow-2xl ring-1 ${colors.ring} animate-slide-up`}>
      {/* Handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      <div className="px-5 pb-8 pt-2">
        {/* Overtime warning banner */}
        {status === 'overtime' && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2.5 rounded-xl mb-4 text-sm font-bold">
            <AlertTriangle size={18} />
            <span>חורג מהזמן! חיוב x1.5 פעיל</span>
          </div>
        )}

        {/* Address */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">{session.parkingAddress}, {session.parkingCity}</span>
        </div>

        {/* Timer */}
        <div className="text-center mb-5">
          <p className="text-xs font-medium text-gray-400 mb-1">
            {status === 'overtime' ? 'חריגה' : 'זמן שנותר'}
          </p>
          <p className={`text-5xl font-black tabular-nums ${colors.timer}`}>
            {formatCountdown(remainingMs)}
          </p>
        </div>

        {/* Live cost */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 mb-5">
          <span className="text-sm text-gray-500">עלות נוכחית</span>
          <span className={`text-lg font-black ${status === 'overtime' ? 'text-red-500' : 'text-black'}`}>
            {calcCurrentCost()} ש"ח
          </span>
        </div>

        {/* Gate Control */}
        <div className="mb-4">
          <GateControl parkingId={session.parkingId} bookingId={session.bookingId} />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600
              text-base font-bold flex items-center justify-center gap-2
              transition-all active:scale-95
            "
          >
            <Navigation size={18} />
            <span>נווט</span>
          </a>
          <button
            onClick={handleEndSession}
            disabled={isPending}
            className={`
              py-3.5 rounded-2xl text-white text-base font-bold
              transition-all active:scale-95 disabled:opacity-50
              ${status === 'overtime'
                ? 'bg-red-500 shadow-lg shadow-red-200'
                : 'bg-orange-500 shadow-lg shadow-orange-200'
              }
            `}
          >
            {isPending ? 'מסיים...' : 'סיים חניה'}
          </button>
        </div>

        {/* Help / Report */}
        <button
          onClick={() => setShowReport(true)}
          className="
            w-full mt-3 py-2.5 rounded-2xl border-2 border-gray-200
            text-orange-500 text-sm font-bold
            flex items-center justify-center gap-2
            transition-all active:scale-95 hover:border-orange-200
          "
        >
          <ShieldAlert size={16} />
          <span>דיווח על בעיה</span>
        </button>
      </div>

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          bookingId={session.bookingId}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
