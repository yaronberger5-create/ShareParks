'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Slot {
  id: number;
  day: string;
  start: string;
  end: string;
}

export function DashboardInteractive() {
  const [isActive, setIsActive] = useState(true);
  const [parkingOpen, setParkingOpen] = useState(true);
  const [availableUntil, setAvailableUntil] = useState('');
  const [showAvailPicker, setShowAvailPicker] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showEmergencySection, setShowEmergencySection] = useState(false);
  const [notifsRead, setNotifsRead] = useState(false);

  // Availability slots
  const [slots, setSlots] = useState<Slot[]>([
    { id: 1, day: 'ראשון', start: '08:00', end: '18:00' },
    { id: 2, day: 'שני', start: '08:00', end: '16:00' },
    { id: 3, day: 'רביעי', start: '10:00', end: '20:00' },
  ]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newDay, setNewDay] = useState('חמישי');
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('17:00');

  // Message to renter
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Coming home early
  const [showComingHome, setShowComingHome] = useState(false);
  const [comingHomeResult, setComingHomeResult] = useState<'renter' | 'closed' | null>(null);

  function addSlot() {
    setSlots((prev) => [...prev, { id: Date.now(), day: newDay, start: newStart, end: newEnd }]);
    setShowAddSlot(false);
  }

  function removeSlot(id: number) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function handleSendMessage() {
    if (!message.trim()) return;
    setMessageSent(true);
    setTimeout(() => { setShowMessage(false); setMessageSent(false); setMessage(''); }, 2000);
  }

  function handleComingHome() {
    // Simulate: there's an active booking
    setComingHomeResult('renter');
  }

  const NOTIFS = [
    { title: 'הזמנה חדשה!', body: 'דני כהן הזמין חניה 14:00-17:00. רווח: 45₪', time: 'לפני 2 שע׳', unread: true },
    { title: 'חניה הסתיימה', body: 'רווח: 60₪ מיכל לוי', time: 'אתמול', unread: true },
    { title: 'קיבלת 105₪!', body: 'הועבר לארנק שלך', time: 'אתמול', unread: true },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <a href="/demo?r=owner&s=home" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
        <h1 className="text-lg font-bold">📊 דשבורד</h1>
        <button type="button" onClick={() => { setShowNotifs(!showNotifs); setNotifsRead(true); }} className="absolute left-4 top-3 p-2">
          <span className="text-white text-lg">🔔</span>
          {!notifsRead && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">3</span>}
        </button>
      </div>

      {/* Notifications dropdown */}
      {showNotifs && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-2">
          {NOTIFS.map((n, i) => (
            <div key={i} className="bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-black">{n.title}</span>
                <span className="text-[10px] text-gray-400">{n.time}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 py-5 space-y-4">
        {/* Status toggle */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-black">אגס 9, אשדוד</h2>
              <p className={`text-sm font-medium mt-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                {isActive ? 'פעילה — מופיעה בחיפוש' : 'לא פעילה — מוסתרת'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-500 border border-gray-300'
              }`}
            >
              {isActive ? '⚡ פעילה' : '⏸ כבויה'}
            </button>
          </div>
        </div>

        {/* Earnings */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">📅 החודש</p>
            <p className="text-xl font-black text-black">840<span className="text-[10px] text-gray-400 mr-0.5">₪</span></p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-xs text-gray-500">📈 סה״כ</p>
            <p className="text-xl font-black text-black">3,240<span className="text-[10px] text-gray-400 mr-0.5">₪</span></p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /><span className="text-[10px] text-orange-600">פעילות</span></div>
            <p className="text-xl font-black text-black">2</p>
          </div>
        </div>

        {/* Active booking + message */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-black mb-3">הזמנות</h3>
          <div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /><p className="text-xs font-bold text-orange-600">פעיל עכשיו</p></div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 px-4 py-3 mb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">ד</div>
                <div>
                  <span className="font-bold text-black text-sm">דני כהן</span>
                  <p className="text-[10px] text-gray-400">📞 050-1234567</p>
                </div>
              </div>
              <span className="text-lg font-black text-black">45<span className="text-[10px] text-gray-400 mr-0.5">₪</span></span>
            </div>
            <p className="text-xs text-gray-500">🕐 14:00 — 17:00 · 3 שעות</p>
          </div>

          {/* Message to renter */}
          {!showMessage ? (
            <button type="button" onClick={() => setShowMessage(true)} className="w-full py-2.5 rounded-xl bg-gray-800 text-white text-xs font-bold text-center active:scale-[0.97] transition-transform mb-2">
              💬 שלח הודעה לדני
            </button>
          ) : messageSent ? (
            <div className="bg-green-50 rounded-xl px-4 py-2.5 text-center mb-2">
              <span className="text-green-600 font-bold text-xs">✅ ההודעה נשלחה!</span>
            </div>
          ) : (
            <div className="space-y-2 mb-2">
              <div className="flex gap-1.5 flex-wrap">
                {['חוזר מוקדם', 'פנה בזמן בבקשה', 'יש בעיה'].map((q) => (
                  <button key={q} type="button" onClick={() => setMessage(q)} className={`px-2 py-1 rounded-lg text-[10px] font-medium active:scale-95 ${message === q ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>{q}</button>
                ))}
              </div>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="כתוב הודעה..." rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none outline-none focus:border-orange-400" />
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowMessage(false); setMessage(''); }} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold active:scale-95">ביטול</button>
                <button type="button" onClick={handleSendMessage} disabled={!message.trim()} className="flex-[2] py-2 rounded-lg bg-orange-500 text-white text-xs font-bold active:scale-95 disabled:opacity-40">📤 שלח</button>
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">מ</div>
                <span className="font-bold text-black text-sm">מיכל לוי</span>
              </div>
              <span className="text-lg font-black text-black">60<span className="text-[10px] text-gray-400 mr-0.5">₪</span></span>
            </div>
            <p className="text-xs text-gray-500">🕐 מחר, 09:00 — 13:00 · 4 שעות</p>
          </div>
        </div>

        {/* Availability — editable */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-black">📅 זמינות</h3>
            <button type="button" onClick={() => setShowAddSlot(!showAddSlot)} className={`px-3 py-1.5 rounded-xl text-xs font-bold active:scale-95 transition-all ${showAddSlot ? 'bg-gray-100 text-gray-500' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'}`}>
              {showAddSlot ? '✕ ביטול' : '+ הוסף'}
            </button>
          </div>

          {/* Add slot form */}
          {showAddSlot && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 mb-3 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map((d) => (
                  <button key={d} type="button" onClick={() => setNewDay(d)} className={`px-2.5 py-1 rounded-lg text-xs font-medium active:scale-95 ${newDay === d ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>{d}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="flex-1 px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none" />
                <span className="text-gray-300">—</span>
                <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="flex-1 px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none" />
              </div>
              <button type="button" onClick={addSlot} className="w-full py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold active:scale-[0.97]">✓ שמור משבצת</button>
            </div>
          )}

          {/* Slots list */}
          {slots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">אין משבצות. לחץ "+ הוסף".</p>
          ) : (
            <div className="space-y-1.5">
              {slots.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 text-sm">🕐</span>
                    <span className="text-sm font-medium text-black">{s.day} · {s.start} — {s.end}</span>
                  </div>
                  <button type="button" onClick={() => removeSlot(s.id)} className="text-gray-300 active:text-red-500 transition-colors p-1">🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick open/close + until when */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-black mb-3">⚡ סטטוס חניה</h3>

          {/* Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button type="button" onClick={() => { setParkingOpen(true); setShowAvailPicker(true); }} className={`py-3.5 rounded-xl text-base font-bold text-center transition-all active:scale-95 ${parkingOpen ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-400'}`}>
              🟢 פנוי
            </button>
            <button type="button" onClick={() => { setParkingOpen(false); setShowAvailPicker(false); setAvailableUntil(''); }} className={`py-3.5 rounded-xl text-base font-bold text-center transition-all active:scale-95 ${!parkingOpen ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-400'}`}>
              🔴 תפוס
            </button>
          </div>

          {/* Available until picker */}
          {parkingOpen && (showAvailPicker || !availableUntil) && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 mb-3 space-y-3">
              <p className="text-sm font-bold text-green-700">🕐 עד מתי החניה פנויה?</p>
              <p className="text-xs text-gray-500">הנהג יראה את השעה הזו ויידע מתי לפנות.</p>

              {/* Quick time buttons */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { label: 'שעה', hours: 1 },
                  { label: '2 שעות', hours: 2 },
                  { label: '3 שעות', hours: 3 },
                  { label: '4 שעות', hours: 4 },
                  { label: '6 שעות', hours: 6 },
                  { label: '8 שעות', hours: 8 },
                ].map((opt) => {
                  const d = new Date();
                  d.setHours(d.getHours() + opt.hours);
                  const targetTime = d.toTimeString().slice(0, 5);
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => { setAvailableUntil(targetTime); setShowAvailPicker(false); }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        availableUntil === targetTime
                          ? 'bg-green-500 text-white'
                          : 'bg-white border border-green-200 text-green-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom time */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">או בחר שעה:</span>
                <input
                  type="time"
                  value={availableUntil}
                  onChange={(e) => { setAvailableUntil(e.target.value); setShowAvailPicker(false); }}
                  className="flex-1 px-3 py-2 rounded-lg border border-green-200 text-sm bg-white outline-none"
                />
              </div>
            </div>
          )}

          {/* Status display */}
          {parkingOpen && availableUntil && !showAvailPicker && (
            <div className="bg-green-50 rounded-xl px-4 py-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-700 font-bold">פנויה עד {availableUntil}</span>
                </div>
                <button type="button" onClick={() => setShowAvailPicker(true)} className="text-xs text-green-600 font-bold">שנה</button>
              </div>
              <p className="text-xs text-green-600 mt-1">הנהגים רואים: "פנוי עד {availableUntil}"</p>
            </div>
          )}

          {!parkingOpen && (
            <div className="bg-red-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-red-600">החניה מוסתרת מחיפוש</span>
            </div>
          )}
        </div>

        {/* Emergency evacuation — hidden by default */}
        {!showEmergencySection && !showComingHome && !comingHomeResult && (
          <button type="button" onClick={() => setShowEmergencySection(true)} className="w-full py-2.5 rounded-2xl border border-gray-200 text-gray-400 text-xs font-medium text-center">
            חוזר לפני הזמן? לחץ כאן ▼
          </button>
        )}

        {showEmergencySection && !showComingHome && !comingHomeResult && (
          <div className="space-y-2">
            <button type="button" onClick={() => setShowComingHome(true)} className="w-full py-4 rounded-2xl bg-red-500 text-white text-base font-black text-center shadow-lg shadow-red-200 active:scale-[0.97] transition-transform">
              🚨 חזרתי הביתה — פנו את החניה
            </button>
            <button type="button" onClick={() => setShowEmergencySection(false)} className="w-full py-1.5 text-xs text-gray-400 text-center">הסתר</button>
          </div>
        )}

        {showComingHome && !comingHomeResult && (
          <div className="bg-red-50 rounded-2xl border-2 border-red-300 p-5 space-y-4">
            <div className="text-center">
              <span className="text-4xl">🚨</span>
              <p className="font-black text-red-700 text-lg mt-2">פינוי חירום</p>
              <p className="text-sm text-gray-600 mt-1">הנהג יקבל התראה מיידית עם טיימר של 5 דקות לפנות את החניה.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">ד</div>
                <div>
                  <p className="font-bold text-black text-sm">דני כהן</p>
                  <p className="text-xs text-gray-400">📞 050-1234567 · עד 17:00</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl px-4 py-3 text-xs text-orange-700">
              💡 הנהג יחויב רק על הזמן שהשתמש בפועל (מינימום 50% מהסכום).
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setShowComingHome(false)} className="py-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-bold active:scale-95">ביטול</button>
              <button type="button" onClick={handleComingHome} className="py-3 rounded-xl bg-red-500 text-white text-sm font-black shadow-lg shadow-red-200 active:scale-95">🚨 שלח התראה</button>
            </div>
          </div>
        )}

        {comingHomeResult === 'renter' && (
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5 space-y-3">
            <div className="text-center">
              <span className="text-4xl">✅</span>
              <p className="font-bold text-green-700 text-lg mt-2">ההתראה נשלחה!</p>
              <p className="text-sm text-gray-600 mt-1">דני כהן קיבל התראת פינוי עם טיימר של 5 דקות.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">ד</div>
                  <span className="font-bold text-black text-sm">דני כהן</span>
                </div>
                <a href="tel:0501234567" className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold active:scale-95">📞 התקשר</a>
              </div>
            </div>
            <a href="/demo?r=renter&s=session" className="block w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold text-center">👁️ ראה מסך הנהג (דמו)</a>
            <button type="button" onClick={() => { setComingHomeResult(null); setShowComingHome(false); }} className="w-full py-2 text-xs text-gray-400 text-center">סגור</button>
          </div>
        )}

        {/* Links */}
        <div className="grid grid-cols-2 gap-2">
          <Link href="/demo?s=wallet" className="py-3 rounded-xl bg-gray-100 text-black text-sm font-bold text-center active:scale-[0.97]">💰 ארנק</Link>
          <Link href="/demo?s=home" className="py-3 rounded-xl bg-gray-100 text-black text-sm font-bold text-center active:scale-[0.97]">🏠 דף הבית</Link>
        </div>
      </div>
    </>
  );
}
