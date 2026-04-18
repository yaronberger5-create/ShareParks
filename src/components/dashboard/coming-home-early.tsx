'use client';

import { useState, useTransition } from 'react';
import { comingHomeEarly } from '@/actions/session-actions';
import { Home, Phone, Clock, X, AlertTriangle } from 'lucide-react';

interface ComingHomeEarlyProps {
  parkingId: string;
  onDeactivated: () => void;
}

type ViewState =
  | { step: 'idle' }
  | { step: 'confirm' }
  | { step: 'has-booking'; name: string; phone: string | null; bookingEnd: string }
  | { step: 'deactivated' };

export function ComingHomeEarly({ parkingId, onDeactivated }: ComingHomeEarlyProps) {
  const [view, setView] = useState<ViewState>({ step: 'idle' });
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (view.step === 'idle') {
      setView({ step: 'confirm' });
      return;
    }

    startTransition(async () => {
      const result = await comingHomeEarly(parkingId);

      if (!result.success) return;

      if (result.hasActiveBooking && result.renterInfo) {
        setView({
          step: 'has-booking',
          name: result.renterInfo.name,
          phone: result.renterInfo.phone,
          bookingEnd: result.renterInfo.bookingEnd,
        });
      } else {
        setView({ step: 'deactivated' });
        onDeactivated();
      }
    });
  }

  // ─── Idle — just the button ───────────────────────────────
  if (view.step === 'idle') {
    return (
      <button
        onClick={handleClick}
        className="
          w-full flex items-center justify-center gap-2
          py-3 rounded-2xl border-2 border-gray-200 text-gray-500
          text-base font-bold transition-all active:scale-[0.97]
          hover:border-orange-300 hover:text-orange-500
        "
      >
        <Home size={18} />
        <span>חזרתי מוקדם</span>
      </button>
    );
  }

  // ─── Confirm ──────────────────────────────────────────────
  if (view.step === 'confirm') {
    return (
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-5 space-y-3">
        <div className="flex items-center gap-2 text-orange-600">
          <Home size={20} />
          <p className="font-bold">חוזר הביתה מוקדם?</p>
        </div>
        <p className="text-sm text-gray-600">
          אם יש הזמנה פעילה — נודיע לנהג שאתה בדרך ונציג לך את פרטי הקשר שלו.
          אם אין הזמנה — החניה תוסתר מחיפוש.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setView({ step: 'idle' })}
            className="py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-bold transition-all active:scale-95"
          >
            ביטול
          </button>
          <button
            onClick={handleClick}
            disabled={isPending}
            className="py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? 'בודק...' : 'אישור'}
          </button>
        </div>
      </div>
    );
  }

  // ─── Active booking — show renter info ────────────────────
  if (view.step === 'has-booking') {
    const endTime = new Date(view.bookingEnd);
    const endStr = endTime.toLocaleString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="bg-red-50 rounded-2xl border border-red-200 p-5 space-y-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={20} />
          <p className="font-bold">יש הזמנה פעילה!</p>
        </div>

        <p className="text-sm text-gray-600">
          שלחנו הודעה לנהג שאתה בדרך. הנה פרטי הקשר שלו:
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-black text-base">{view.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} />
            <span>ההזמנה מסתיימת ב-{endStr}</span>
          </div>
          {view.phone && (
            <a
              href={`tel:${view.phone}`}
              className="
                flex items-center gap-2 mt-2 px-4 py-2.5 rounded-xl
                bg-orange-500 text-white text-sm font-bold
                transition-all active:scale-95 w-fit
              "
            >
              <Phone size={16} />
              <span>התקשר — {view.phone}</span>
            </a>
          )}
        </div>

        <button
          onClick={() => setView({ step: 'idle' })}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
        >
          סגור
        </button>
      </div>
    );
  }

  // ─── Deactivated ──────────────────────────────────────────
  return (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center space-y-2">
      <Home size={28} className="mx-auto text-gray-400" />
      <p className="font-bold text-black">החניה הוסתרה</p>
      <p className="text-sm text-gray-500">החניה לא מופיעה בחיפוש. תוכל להפעיל אותה מחדש בלחיצה על הכפתור למעלה.</p>
    </div>
  );
}
