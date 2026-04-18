'use client';

import { useState, useEffect } from 'react';

export function EvacuationScreen({ onConfirm }: { onConfirm: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 minutes
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (confirmed || secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [confirmed, secondsLeft]);

  const mins = Math.floor(Math.abs(secondsLeft) / 60);
  const secs = Math.abs(secondsLeft) % 60;
  const isOvertime = secondsLeft < 0;
  const isUrgent = secondsLeft <= 60 && secondsLeft > 0;

  if (confirmed) {
    return (
      <div className="min-h-[60dvh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-4xl">✅</div>
        <h2 className="text-2xl font-black text-black mb-2">תודה! החניה פונתה</h2>
        <p className="text-sm text-gray-500 mb-6">הבעלים קיבל הודעה. חיוב חלקי לפי זמן השימוש בפועל.</p>
        <a href="/demo?r=renter&s=home" className="w-full py-4 rounded-2xl bg-gray-800 text-white text-base font-black text-center block">🏠 חזרה לדף הבית</a>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100dvh-78px)] flex flex-col ${isOvertime ? 'bg-red-50' : isUrgent ? 'bg-orange-50' : 'bg-white'}`}>
      {/* Pulsing header */}
      <div className={`px-4 py-5 text-center ${isOvertime ? 'bg-red-500' : 'bg-orange-500'} ${!confirmed ? 'animate-pulse' : ''}`}>
        <p className="text-white text-2xl font-black">⚠️ בעל החניה חוזר!</p>
        <p className="text-white/80 text-sm mt-1">יש לפנות את החניה בהקדם</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Countdown */}
        <div className="text-center mb-8">
          <p className={`text-xs font-bold mb-2 ${isOvertime ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-gray-400'}`}>
            {isOvertime ? '⚠️ חריגה מהזמן!' : isUrgent ? '⏰ ממהר!' : 'זמן שנותר לפינוי'}
          </p>
          <p className={`text-7xl font-black tabular-nums ${isOvertime ? 'text-red-500' : isUrgent ? 'text-orange-500' : 'text-black'}`}>
            {isOvertime ? '+' : ''}{mins}:{secs.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Progress ring */}
        <div className="w-32 h-3 rounded-full bg-gray-200 mb-8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${isOvertime ? 'bg-red-500' : isUrgent ? 'bg-orange-500' : 'bg-green-500'}`}
            style={{ width: `${Math.max(0, (secondsLeft / 300) * 100)}%` }}
          />
        </div>

        {/* Info */}
        <div className={`w-full rounded-2xl border-2 p-4 mb-6 ${isOvertime ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">📍 חניה</span>
            <span className="text-sm font-bold text-black">אגס 9, אשדוד</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">💰 חיוב</span>
            <span className="text-sm font-bold text-black">חלקי — לפי זמן שימוש בפועל</span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => { setConfirmed(true); onConfirm(); }}
          className={`w-full py-5 rounded-2xl text-white text-xl font-black text-center shadow-xl active:scale-[0.97] transition-transform ${
            isOvertime ? 'bg-red-500 shadow-red-200' : 'bg-orange-500 shadow-orange-200'
          }`}
        >
          ✅ פיניתי את החניה
        </button>

        <p className="text-xs text-gray-400 mt-4 text-center">
          לחיצה מאשרת שפינית את הרכב. החיוב יותאם לזמן בפועל.
        </p>
      </div>
    </div>
  );
}
