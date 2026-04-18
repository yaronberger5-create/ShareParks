'use client';

import { useState } from 'react';
import Link from 'next/link';

export function HomeInteractive() {
  const [parkingOpen, setParkingOpen] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  function handleSendMessage() {
    if (!message.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setShowMessage(false);
      setMessageSent(false);
      setMessage('');
    }, 2000);
  }

  return (
    <>
      {/* Hero — with map illustration background */}
      <div className="bg-gray-800 px-6 pt-10 pb-8 relative overflow-hidden">
        {/* Map grid background */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)', backgroundSize: '30px 30px' }} className="absolute inset-0" />
          <div className="absolute top-[30%] inset-x-0 h-8 bg-orange-500/30 rotate-3" />
          <div className="absolute inset-y-0 right-[35%] w-6 bg-orange-500/30 -rotate-2" />
          <div className="absolute top-[20%] right-[15%] w-4 h-4 rounded-full bg-orange-500" />
          <div className="absolute top-[50%] right-[60%] w-3 h-3 rounded-full bg-orange-500" />
          <div className="absolute top-[65%] right-[25%] w-3 h-3 rounded-full bg-orange-500" />
          <div className="absolute top-[40%] right-[80%] w-5 h-5 rounded-full border-2 border-orange-500" />
        </div>
        <div className="relative z-10">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-base font-black text-white">P</span>
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-white">Share</span>
            <span className="text-orange-500">Parks</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-white leading-tight mb-3">
          החניה שלך פנויה?<br />
          <span className="text-orange-500">תן לה לעבוד בשבילך.</span>
        </h1>
        <p className="text-gray-400 mb-6 text-sm">מצא חניה פנויה ברגע או השכר את שלך וצור הכנסה פסיבית.</p>
        <div className="space-y-3">
          <Link href="/demo?r=renter&s=verify-driver" className="block w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-500/30">
            📍 אני צריך חניה
          </Link>
          <Link href="/demo?s=onboard" className="block w-full py-4 rounded-2xl text-white text-lg font-black border-2 border-orange-500 text-center">
            🚗 יש לי חניה להשכרה
          </Link>
        </div>
        </div>
      </div>

      {/* ─── Quick Actions for Owner ─── */}
      <div className="px-4 py-5">
        <h2 className="text-base font-black text-black mb-3">⚡ פעולות מהירות</h2>
        <div className="space-y-3">

          {/* Open / Close parking */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-black">🅿️ החניה שלי</h3>
                <p className="text-xs text-gray-400">אגס 9, אשדוד</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${parkingOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {parkingOpen ? '🟢 פנויה' : '🔴 תפוסה'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setParkingOpen(true)}
                className={`py-3.5 rounded-xl text-base font-bold text-center transition-all active:scale-95 ${
                  parkingOpen
                    ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                🟢 פתח חניה
              </button>
              <button
                type="button"
                onClick={() => setParkingOpen(false)}
                className={`py-3.5 rounded-xl text-base font-bold text-center transition-all active:scale-95 ${
                  !parkingOpen
                    ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                🔴 סגור חניה
              </button>
            </div>

            {parkingOpen && (
              <div className="mt-3 bg-green-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-700">החניה מופיעה בחיפוש · פנויה לנהגים</span>
              </div>
            )}
            {!parkingOpen && (
              <div className="mt-3 bg-red-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-xs text-red-600">החניה מוסתרת מחיפוש</span>
              </div>
            )}
          </div>

          {/* Active renter info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-black">👤 שוכר נוכחי</h3>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">פעיל</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">ד</div>
              <div>
                <p className="font-bold text-black">דני כהן</p>
                <p className="text-xs text-gray-400">📞 050-1234567 · עד 17:00</p>
              </div>
            </div>

            {/* Message button */}
            {!showMessage ? (
              <button
                type="button"
                onClick={() => setShowMessage(true)}
                className="w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold text-center active:scale-[0.97] transition-transform"
              >
                💬 שלח הודעה לשוכר
              </button>
            ) : (
              <div className="space-y-2">
                {messageSent ? (
                  <div className="bg-green-50 rounded-xl px-4 py-3 text-center">
                    <span className="text-green-600 font-bold text-sm">✅ ההודעה נשלחה לדני!</span>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      {['חוזר מוקדם', 'אנא פנה בזמן', 'בעיה בחניה'].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setMessage(q)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                            message === q
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="כתוב הודעה..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none outline-none focus:border-orange-400"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowMessage(false); setMessage(''); }}
                        className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-bold active:scale-95 transition-transform"
                      >
                        ביטול
                      </button>
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="flex-[2] py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-200 active:scale-95 transition-transform disabled:opacity-40"
                      >
                        📤 שלח
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-lg font-black text-black">840</p>
              <p className="text-[10px] text-gray-500">ש״ח החודש</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-lg font-black text-black">12</p>
              <p className="text-[10px] text-gray-500">הזמנות</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-lg font-black text-orange-500">★ 4.8</p>
              <p className="text-[10px] text-gray-500">דירוג</p>
            </div>
          </div>

          {/* Links */}
          <Link href="/demo?s=dashboard" className="block w-full py-3 rounded-xl bg-gray-100 text-black text-sm font-bold text-center active:scale-[0.97] transition-transform">
            📊 עבור לדשבורד מלא
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-6 border-t border-gray-100">
        <h2 className="text-base font-black text-black text-center mb-5">למה <span className="text-orange-500">ShareParks</span>?</h2>
        <div className="space-y-3">
          {[
            { icon: '⚡', t: 'מהיר', d: 'מצא חניה ב-30 שניות.' },
            { icon: '🛡', t: 'בטוח', d: 'תשלום מאובטח, ביטוח נזקים.' },
            { icon: '💰', t: 'משתלם', d: '~1,200 ש״ח בחודש לבעלי חניות.' },
          ].map((f) => (
            <div key={f.t} className="flex gap-3 rounded-xl border border-gray-100 p-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 text-lg">{f.icon}</div>
              <div><p className="font-bold text-black text-sm">{f.t}</p><p className="text-xs text-gray-500">{f.d}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 px-6 py-5 text-center">
        <p className="text-gray-500 text-xs">© 2026 ShareParks.com</p>
      </div>
    </>
  );
}
