'use client';

import { useState } from 'react';
import Link from 'next/link';

type Tab = 'overview' | 'users' | 'parkings' | 'bookings' | 'revenue' | 'reports' | 'settings';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'סקירה', icon: '📊' },
    { key: 'users', label: 'משתמשים', icon: '👥' },
    { key: 'parkings', label: 'חניות', icon: '🅿️' },
    { key: 'bookings', label: 'הזמנות', icon: '📋' },
    { key: 'revenue', label: 'הכנסות', icon: '💰' },
    { key: 'reports', label: 'דיווחים', icon: '🛡️' },
    { key: 'settings', label: 'הגדרות', icon: '⚙️' },
  ];

  return (
    <div dir="rtl" className="min-h-dvh bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <span className="text-sm font-black text-white">P</span>
            </div>
            <div>
              <span className="text-lg font-black">Share<span className="text-orange-500">Parks</span></span>
              <span className="text-xs text-gray-400 block">Admin Dashboard</span>
            </div>
          </div>
          <a href="/demo" className="text-xs text-gray-400 hover:text-orange-500">חזרה לאתר →</a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-l border-gray-200 min-h-[calc(100dvh-56px)] p-3 space-y-1 shrink-0 hidden md:block">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right ${
                tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 flex overflow-x-auto no-scrollbar px-2 py-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-bold whitespace-nowrap ${
                tab === t.key ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {tab === 'overview' && <OverviewTab />}
          {tab === 'users' && <UsersTab />}
          {tab === 'parkings' && <ParkingsTab />}
          {tab === 'bookings' && <BookingsTab />}
          {tab === 'revenue' && <RevenueTab />}
          {tab === 'reports' && <ReportsTab />}
          {tab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ OVERVIEW ═══ */
function OverviewTab() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-black">📊 סקירה כללית</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="👥" label="משתמשים" value="1,247" change="+12%" positive />
        <KpiCard icon="🅿️" label="חניות פעילות" value="342" change="+8%" positive />
        <KpiCard icon="📋" label="הזמנות החודש" value="2,891" change="+23%" positive />
        <KpiCard icon="💰" label="הכנסות החודש" value="₪87,430" change="+18%" positive />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenue chart placeholder */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-black mb-4">📈 הכנסות — 7 ימים אחרונים</h3>
          <div className="flex items-end gap-2 h-32">
            {[65, 45, 78, 52, 88, 73, 95].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-orange-500 rounded-t-lg" style={{ height: `${h}%` }} />
                <span className="text-[9px] text-gray-400">{['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-bold text-black mb-4">📋 הזמנות — 7 ימים אחרונים</h3>
          <div className="flex items-end gap-2 h-32">
            {[40, 55, 70, 45, 80, 60, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-green-500 rounded-t-lg" style={{ height: `${h}%` }} />
                <span className="text-[9px] text-gray-400">{['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-black mb-4">🔔 פעילות אחרונה</h3>
        <div className="space-y-3">
          {[
            { time: 'לפני 2 דק׳', text: 'דני כהן הזמין חניה באגס 9, אשדוד', type: 'booking' },
            { time: 'לפני 15 דק׳', text: 'משה לוי נרשם כמשכיר חדש', type: 'user' },
            { time: 'לפני 30 דק׳', text: 'דיווח: חניה תפוסה — רוגוזין 12', type: 'report' },
            { time: 'לפני שעה', text: 'משיכת כספים: ₪500 — יוסי ברגר', type: 'payout' },
            { time: 'לפני 2 שע׳', text: 'חניה חדשה נוספה: הרצל 7, אשדוד', type: 'parking' },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="text-lg">{a.type === 'booking' ? '📋' : a.type === 'user' ? '👤' : a.type === 'report' ? '🛡️' : a.type === 'payout' ? '💸' : '🅿️'}</span>
              <div className="flex-1">
                <p className="text-sm text-black">{a.text}</p>
                <p className="text-xs text-gray-400">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="עמלות שנגבו" value="₪8,743" />
        <MiniStat label="דיווחים פתוחים" value="3" />
        <MiniStat label="משיכות ממתינות" value="7" />
        <MiniStat label="אימותים ממתינים" value="12" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ USERS ═══ */
function UsersTab() {
  const users = [
    { name: 'דני כהן', email: 'dani@test.com', role: 'נהג', verified: true, bookings: 15, joined: '12/03/26' },
    { name: 'יוסי ברגר', email: 'yossi@test.com', role: 'משכיר', verified: true, bookings: 0, joined: '01/02/26', parkings: 2, earned: 3240 },
    { name: 'מיכל לוי', email: 'michal@test.com', role: 'נהג', verified: true, bookings: 8, joined: '15/03/26' },
    { name: 'רונית שמעון', email: 'ronit@test.com', role: 'משכיר', verified: false, bookings: 0, joined: '10/04/26', parkings: 1, earned: 450 },
    { name: 'אבי מלכה', email: 'avi@test.com', role: 'נהג', verified: false, bookings: 0, joined: '17/04/26' },
    { name: 'סיגל דוד', email: 'sigal@test.com', role: 'שניהם', verified: true, bookings: 5, joined: '20/02/26', parkings: 1, earned: 890 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-black">👥 משתמשים</h1>
        <span className="text-sm text-gray-400">{users.length} רשומים</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">הכל (6)</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">נהגים (3)</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">משכירים (2)</span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">ממתינים לאימות (2)</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {users.map((u, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${u.verified ? 'bg-green-500' : 'bg-gray-300'}`}>
              {u.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-black truncate">{u.name}</p>
                {u.verified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">מאומת</span>}
                {!u.verified && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">ממתין</span>}
              </div>
              <p className="text-xs text-gray-400">{u.email} · {u.role} · הצטרף {u.joined}</p>
            </div>
            <div className="text-left shrink-0">
              {u.role === 'משכיר' || u.role === 'שניהם' ? (
                <p className="text-sm font-bold text-black">₪{(u as { earned?: number }).earned?.toLocaleString()}</p>
              ) : (
                <p className="text-sm font-bold text-black">{u.bookings} הזמנות</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ PARKINGS ═══ */
function ParkingsTab() {
  const parkings = [
    { addr: 'אגס 9', city: 'אשדוד', owner: 'יוסי ברגר', price: 12, rating: 4.8, bookings: 23, active: true, type: 'מקורה' },
    { addr: 'הבנקים 3', city: 'אשדוד', owner: 'רונית שמעון', price: 18, rating: 4.5, bookings: 14, active: true, type: 'מקורה' },
    { addr: 'רוגוזין 12', city: 'אשדוד', owner: 'אבי מלכה', price: 10, rating: 4.2, bookings: 8, active: true, type: 'פתוחה' },
    { addr: 'הרצל 7', city: 'אשדוד', owner: 'סיגל דוד', price: 15, rating: 4.9, bookings: 31, active: false, type: 'מקורה' },
    { addr: 'הדקל 5', city: 'אשדוד', owner: 'יוסי ברגר', price: 0, rating: 4.7, bookings: 11, active: true, type: 'תת קרקעי', monthly: 350 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-black">🅿️ חניות</h1>
        <span className="text-sm text-gray-400">{parkings.length} חניות</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="פעילות" value="4" />
        <MiniStat label="לא פעילות" value="1" />
        <MiniStat label="ממוצע דירוג" value="4.6 ★" />
        <MiniStat label="סה״כ הזמנות" value="87" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {parkings.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            <div className={`w-3 h-3 rounded-full ${p.active ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black">{p.addr}, {p.city}</p>
              <p className="text-xs text-gray-400">{p.owner} · {p.type} · ★{p.rating} · {p.bookings} הזמנות</p>
            </div>
            <div className="text-left shrink-0">
              <p className="text-sm font-bold text-black">{p.monthly ? `₪${p.monthly}/חודש` : `₪${p.price}/שעה`}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ BOOKINGS ═══ */
function BookingsTab() {
  const bookings = [
    { id: '#1247', renter: 'דני כהן', parking: 'אגס 9', date: '18/04', time: '14:00-17:00', price: 45, status: 'active' },
    { id: '#1246', renter: 'מיכל לוי', parking: 'הבנקים 3', date: '18/04', time: '10:00-14:00', price: 72, status: 'completed' },
    { id: '#1245', renter: 'סיגל דוד', parking: 'רוגוזין 12', date: '17/04', time: '08:00-12:00', price: 40, status: 'completed' },
    { id: '#1244', renter: 'דני כהן', parking: 'הרצל 7', date: '17/04', time: '15:00-18:00', price: 45, status: 'cancelled' },
    { id: '#1243', renter: 'מיכל לוי', parking: 'אגס 9', date: '16/04', time: '09:00-13:00', price: 48, status: 'completed' },
  ];

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'פעיל', color: 'bg-green-100 text-green-700' },
    completed: { label: 'הושלם', color: 'bg-gray-100 text-gray-500' },
    cancelled: { label: 'בוטל', color: 'bg-red-100 text-red-600' },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-black">📋 הזמנות</h1>
        <span className="text-sm text-gray-400">{bookings.length} אחרונות</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="פעילות עכשיו" value="12" />
        <MiniStat label="היום" value="34" />
        <MiniStat label="ביטולים" value="2" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {bookings.map((b, i) => {
          const s = statusMap[b.status];
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-300 w-12">{b.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black">{b.renter} → {b.parking}</p>
                <p className="text-xs text-gray-400">{b.date} · {b.time}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.color}`}>{s.label}</span>
              <span className="text-sm font-bold text-black w-14 text-left">₪{b.price}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ REVENUE ═══ */
function RevenueTab() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-black">💰 הכנסות</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon="💰" label="הכנסות החודש" value="₪87,430" change="+18%" positive />
        <KpiCard icon="📊" label="עמלות (10%)" value="₪8,743" change="+18%" positive />
        <KpiCard icon="💸" label="משיכות החודש" value="₪62,100" change="+15%" positive />
        <KpiCard icon="🏦" label="יתרה בפלטפורמה" value="₪25,330" change="" positive />
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-black mb-4">📊 פירוט הכנסות</h3>
        <div className="space-y-3">
          {[
            { label: 'הזמנות שעתיות', amount: 72400, pct: 83 },
            { label: 'מנויים חודשיים', amount: 12600, pct: 14 },
            { label: 'overtime charges', amount: 2430, pct: 3 },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">{r.label}</span>
                <span className="text-sm font-bold text-black">₪{r.amount.toLocaleString()} ({r.pct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top earners */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-black mb-4">🏆 משכירים מובילים</h3>
        <div className="space-y-2">
          {[
            { name: 'יוסי ברגר', earned: 3240, parkings: 2 },
            { name: 'סיגל דוד', earned: 890, parkings: 1 },
            { name: 'רונית שמעון', earned: 450, parkings: 1 },
          ].map((o, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-orange-500">{i + 1}</span>
                <div>
                  <p className="text-sm font-bold text-black">{o.name}</p>
                  <p className="text-xs text-gray-400">{o.parkings} חניות</p>
                </div>
              </div>
              <span className="text-sm font-bold text-black">₪{o.earned.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ REPORTS ═══ */
function ReportsTab() {
  const reports = [
    { id: '#R-42', reporter: 'דני כהן', type: 'חניה תפוסה', parking: 'רוגוזין 12', date: '17/04', status: 'open' },
    { id: '#R-41', reporter: 'מיכל לוי', type: 'הוראות שגויות', parking: 'הבנקים 3', date: '16/04', status: 'open' },
    { id: '#R-40', reporter: 'יוסי ברגר', type: 'נזק', parking: 'אגס 9', date: '15/04', status: 'resolved' },
    { id: '#R-39', reporter: 'סיגל דוד', type: 'חניה תפוסה', parking: 'הרצל 7', date: '14/04', status: 'resolved' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-black">🛡️ דיווחים</h1>
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">2 פתוחים</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="פתוחים" value="2" />
        <MiniStat label="נפתרו" value="2" />
        <MiniStat label="החזרים" value="₪70" />
        <MiniStat label="זמן ממוצע" value="4 שע׳" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {reports.map((r, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
            <span className={`w-3 h-3 rounded-full ${r.status === 'open' ? 'bg-red-500' : 'bg-green-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-black">{r.type} — {r.parking}</p>
              <p className="text-xs text-gray-400">{r.reporter} · {r.date} · {r.id}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'open' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
              {r.status === 'open' ? 'פתוח' : 'נפתר'}
            </span>
          </div>
        ))}
      </div>

      {/* Verification queue */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h3 className="font-bold text-black mb-4">🛡️ אימותים ממתינים</h3>
        <div className="space-y-2">
          {[
            { name: 'אבי מלכה', plate: '12-345-67', date: '17/04' },
            { name: 'רונית שמעון', plate: '98-765-43', date: '16/04' },
          ].map((v, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-bold text-black">{v.name}</p>
                <p className="text-xs text-gray-400">רכב: {v.plate} · {v.date}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold">✓ אשר</button>
                <button type="button" className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 text-xs font-bold">✕ דחה</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ SETTINGS ═══ */
function SettingsTab() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-black">⚙️ הגדרות</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-bold text-black">💰 עמלות</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">עמלת פלטפורמה</span>
          <span className="text-lg font-bold text-black">10%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">מינימום משיכה</span>
          <span className="text-lg font-bold text-black">₪50</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">תעריף overtime</span>
          <span className="text-lg font-bold text-black">x1.5</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-bold text-black">🔒 אבטחה</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Auth Provider</span>
          <span className="text-sm font-bold text-green-600">Email + Password ✓</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">RLS</span>
          <span className="text-sm font-bold text-green-600">מופעל ✓</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">PostGIS</span>
          <span className="text-sm font-bold text-green-600">מופעל ✓</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-bold text-black">🌐 דומיין</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Production</span>
          <span className="text-sm font-bold text-black">shareparks.com</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Vercel</span>
          <span className="text-sm font-bold text-black">share-parks.vercel.app</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Supabase</span>
          <span className="text-sm font-bold text-black">ejlhdzpfdwtoawdtruou</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ HELPERS ═══ */
function KpiCard({ icon, label, value, change, positive }: { icon: string; label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-black text-black">{value}</p>
      {change && <p className={`text-xs font-bold mt-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>{change}</p>}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
      <p className="text-lg font-black text-black">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}
