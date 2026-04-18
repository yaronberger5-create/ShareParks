import Link from 'next/link';
import { OwnerOnboardInteractive } from './owner-onboard-interactive';
import { RenterFlowInteractive } from './renter-flow-interactive';
import { HomeInteractive } from './home-interactive';
import { DashboardInteractive } from './dashboard-interactive';
import { Chatbot } from './chatbot';
import { DriverVerification } from './driver-verification';
import { SideBarWithButton } from './sidebar';

// Role-based screens
const RENTER_SCREENS = [
  { key: 'home', label: '🏠 בית' },
  { key: 'locate', label: '📍 חפש חניה' },
  { key: 'map', label: '🗺️ חניות' },
  { key: 'detail', label: '📋 פרטים' },
  { key: 'booking', label: '✓ הזמנה' },
  { key: 'session', label: '⏱️ חניה חיה' },
  { key: 'bookings', label: '📑 הזמנות שלי' },
] as const;

const OWNER_SCREENS = [
  { key: 'home', label: '🏠 בית' },
  { key: 'onboard', label: '➕ הוסף חניה' },
  { key: 'dashboard', label: '📊 דשבורד' },
  { key: 'wallet', label: '💰 ארנק' },
] as const;

type Screen = string;
type Role = 'none' | 'renter' | 'owner';

export async function DemoContent({ searchParams }: { searchParams: Promise<{ s?: string; r?: string }> }) {
  const params = await searchParams;
  const screen = (params.s ?? 'home') as Screen;
  const role = (params.r ?? 'none') as Role;

  // Determine which tabs to show
  const screens = role === 'owner' ? OWNER_SCREENS : role === 'renter' ? RENTER_SCREENS : [];

  return (
    <div dir="rtl" className="min-h-dvh bg-gray-100 overscroll-none">
      {/* Top bar — logo only */}
      {role !== 'none' && (
        <nav className="fixed top-0 inset-x-0 z-40 bg-gray-800 px-3 py-3 no-scrollbar">
          <div className="flex items-center justify-center pr-9">
            <Link href="/demo" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <span className="text-base font-black text-white">P</span>
              </div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-white">Share</span>
                <span className="text-orange-500">Parks</span>
              </span>
            </Link>
          </div>
        </nav>
      )}

      {/* Spacer for fixed nav + breathing room */}
      <div className={role === 'none' ? '' : 'h-[78px]'} />

      <div className="max-w-md mx-auto bg-white min-h-[calc(100dvh-72px)] shadow-2xl">
        {/* Home — different per role */}
        {screen === 'home' && role === 'none' && <HomeInteractive />}
        {screen === 'home' && role === 'renter' && <RenterHomeScreen />}
        {screen === 'home' && role === 'owner' && <OwnerHomeScreen />}

        {/* Renter screens */}
        {screen === 'locate' && <RenterFlowInteractive initialStep="locate" />}
        {screen === 'map' && <RenterFlowInteractive initialStep="list" />}
        {screen === 'detail' && <RenterFlowInteractive initialStep="detail" />}
        {screen === 'booking' && <RenterFlowInteractive initialStep="confirm" />}
        {screen === 'session' && <RenterFlowInteractive initialStep="active" />}
        {screen === 'bookings' && <BookingsScreen />}

        {/* Owner screens */}
        {screen === 'onboard' && <OwnerOnboardInteractive />}
        {screen === 'dashboard' && <DashboardInteractive />}
        {screen === 'wallet' && <WalletScreen />}

        {/* Verification */}
        {screen === 'verify-driver' && <DriverVerification />}

        {/* Legal / Info */}
        {screen === 'terms' && <TermsScreen />}
      </div>

      {/* Footer */}
      <footer className="max-w-md mx-auto bg-gray-800 text-white px-6 py-8 shadow-2xl">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-xs font-black text-white">P</span>
          </div>
          <span className="text-lg font-black">
            <span className="text-white">Share</span>
            <span className="text-orange-500">Parks</span>
          </span>
        </div>
        <div className="flex justify-center gap-4 mb-3 text-xs">
          <Link href="/demo?s=terms" className="text-gray-400 hover:text-orange-500">📋 תקנון</Link>
          <Link href="/demo?s=terms" className="text-gray-400 hover:text-orange-500">🔒 פרטיות</Link>
          <Link href="/demo?s=terms" className="text-gray-400 hover:text-orange-500">⚖️ תנאי שימוש</Link>
        </div>
        <div className="flex justify-center gap-4 mb-4 text-xs">
          <Link href="/demo?s=terms" className="text-gray-500 hover:text-orange-500">📞 צור קשר</Link>
          <Link href="/demo?s=terms" className="text-gray-500 hover:text-orange-500">❓ שאלות נפוצות</Link>
          <Link href="/demo?s=terms" className="text-gray-500 hover:text-orange-500">🛡️ ביטוח</Link>
        </div>
        <p className="text-gray-600 text-xs text-center">© 2026 ShareParks.com — כל הזכויות שמורות</p>
      </footer>

      {/* Chatbot */}
      <Chatbot />

      {/* Sidebar with floating button */}
      <SideBarWithButton role={role} />
    </div>
  );
}

/* ═══════════════════════════════════════════ HOME ═══ */
/* ═══════════════════════════════════════════ RENTER HOME ═══ */
function RenterHomeScreen() {
  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
          <span className="text-base font-black text-white">P</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-black">שלום 👋</h1>
          <p className="text-xs text-gray-400">מחפש חניה? בוא נמצא לך.</p>
        </div>
      </div>

      {/* Quick search — goes to verification first */}
      <Link href="/demo?r=renter&s=verify-driver" className="block w-full py-5 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200">
        📍 חפש חניה ליד המיקום שלי
      </Link>

      {/* Active session card */}
      <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold text-green-700">חניה פעילה</span>
        </div>
        <p className="font-bold text-black">אגס 9, אשדוד</p>
        <p className="text-xs text-gray-500 mb-3">עד 17:00 · 45₪</p>
        <Link href="/demo?r=renter&s=session" className="block w-full py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold text-center active:scale-[0.97]">
          ⏱️ עבור לחניה חיה
        </Link>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-black">הזמנות אחרונות</h3>
          <Link href="/demo?r=renter&s=bookings" className="text-xs text-orange-500 font-bold">הכל →</Link>
        </div>
        <div className="space-y-2">
          {[
            { addr: 'הבנקים 3', price: 72, date: 'אתמול', status: '✓' },
            { addr: 'רוגוזין 12', price: 40, date: '15/04', status: '✓' },
          ].map((b) => (
            <div key={b.addr} className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-black">{b.addr}</p>
                <p className="text-xs text-gray-400">{b.date}</p>
              </div>
              <span className="text-sm font-bold text-black">{b.price}₪ {b.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification banner */}
      <Link href="/demo?r=renter&s=verify-driver" className="block bg-orange-50 rounded-2xl border border-orange-200 p-4 active:scale-[0.98] transition-transform">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🛡️</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-700">אמת את החשבון שלך</p>
            <p className="text-xs text-orange-500">צריך אימות חד פעמי כדי להזמין חניה</p>
          </div>
          <span className="text-orange-400">←</span>
        </div>
      </Link>

      {/* Favorites */}
      <div>
        <h3 className="font-bold text-black mb-2">⭐ חניות מועדפות</h3>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { addr: 'אגס 9', price: 12, rating: 4.8 },
            { addr: 'הרצל 7', price: 15, rating: 4.9 },
          ].map((p) => (
            <Link key={p.addr} href="/demo?r=renter&s=detail" className="shrink-0 w-36 bg-gray-50 rounded-xl border border-gray-100 p-3 active:scale-95 transition-transform">
              <p className="text-sm font-bold text-black">{p.addr}</p>
              <p className="text-xs text-gray-400">{p.price}₪/שעה · ★{p.rating}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ OWNER HOME ═══ */
function OwnerHomeScreen() {
  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
          <span className="text-base font-black text-orange-500">P</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-black">שלום 👋</h1>
          <p className="text-xs text-gray-400">הנה מה שקורה בחניה שלך.</p>
        </div>
      </div>

      {/* Parking status — quick toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-black">🅿️ אגס 9, אשדוד</h3>
            <p className="text-xs text-green-600 font-medium">פנויה · מופיעה בחיפוש</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">🟢 פנוי</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/demo?r=owner&s=dashboard" className="py-3 rounded-xl bg-green-500 text-white text-sm font-bold text-center shadow-lg shadow-green-200">🟢 פנוי</Link>
          <Link href="/demo?r=owner&s=dashboard" className="py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-bold text-center">🔴 סגור</Link>
        </div>
      </div>

      {/* Active renter */}
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-bold text-orange-700">שוכר פעיל</span>
          </div>
          <span className="text-lg font-black text-black">45₪</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">ד</div>
          <div>
            <p className="font-bold text-black text-sm">דני כהן</p>
            <p className="text-xs text-gray-400">📞 050-1234567 · עד 17:00</p>
          </div>
        </div>
        <Link href="/demo?r=owner&s=dashboard" className="block w-full py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold text-center active:scale-[0.97]">
          💬 שלח הודעה לשוכר
        </Link>
      </div>

      {/* Earnings summary */}
      <div className="bg-gray-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">הכנסות החודש</span>
          <Link href="/demo?r=owner&s=wallet" className="text-xs text-orange-500 font-bold">ארנק →</Link>
        </div>
        <p className="text-3xl font-black">840 <span className="text-sm text-gray-400">ש״ח</span></p>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>12 הזמנות</span>
          <span>★ 4.8 דירוג</span>
          <span>0 דיווחים</span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/demo?r=owner&s=dashboard" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center active:scale-95 transition-transform">
          <span className="text-2xl block mb-1">📊</span>
          <span className="text-xs font-bold text-black">דשבורד מלא</span>
        </Link>
        <Link href="/demo?r=owner&s=wallet" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center active:scale-95 transition-transform">
          <span className="text-2xl block mb-1">💰</span>
          <span className="text-xs font-bold text-black">ארנק ומשיכות</span>
        </Link>
        <Link href="/demo?r=owner&s=onboard" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center active:scale-95 transition-transform">
          <span className="text-2xl block mb-1">➕</span>
          <span className="text-xs font-bold text-black">הוסף חניה</span>
        </Link>
        <Link href="/demo?r=owner&s=dashboard" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center active:scale-95 transition-transform">
          <span className="text-2xl block mb-1">📅</span>
          <span className="text-xs font-bold text-black">זמינות</span>
        </Link>
      </div>
    </div>
  );
}

function HomeScreen() {
  return (
    <>
      <div className="bg-gray-800 px-6 pt-14 pb-12">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="w-14 h-14 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-lg font-black text-white">P</span>
          </div>
          <span className="text-3xl font-black tracking-tight">
            <span className="text-white">Share</span>
            <span className="text-orange-500">Parks</span>
          </span>
        </div>
        <h1 className="text-3xl font-black text-white leading-tight mb-4">
          החניה שלך פנויה?<br />
          <span className="text-orange-500">תן לה לעבוד בשבילך.</span>
        </h1>
        <p className="text-gray-400 mb-10">מצא חניה פנויה ברגע או השכר את שלך וצור הכנסה פסיבית.</p>
        <div className="space-y-3">
          <Link href="/demo?s=locate" className="block w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-500/30">
            📍 אני צריך חניה
          </Link>
          <Link href="/demo?s=onboard" className="block w-full py-4 rounded-2xl text-white text-lg font-black border-2 border-orange-500 text-center">
            🚗 יש לי חניה להשכרה
          </Link>
        </div>
      </div>
      <div className="px-6 py-10">
        <h2 className="text-xl font-black text-black text-center mb-8">למה <span className="text-orange-500">ShareParks</span>?</h2>
        <div className="space-y-4">
          <div className="flex gap-4 rounded-2xl border border-gray-100 p-5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-500 text-xl">⚡</div>
            <div><p className="font-bold text-black mb-1">מהיר</p><p className="text-sm text-gray-500">מצא חניה ב-30 שניות. חיפוש GPS, סינון לפי שעות.</p></div>
          </div>
          <div className="flex gap-4 rounded-2xl border border-gray-100 p-5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-500 text-xl">🛡</div>
            <div><p className="font-bold text-black mb-1">בטוח</p><p className="text-sm text-gray-500">אבטחה ברמת הבנק. תשלום מאובטח, ביטוח נזקים.</p></div>
          </div>
          <div className="flex gap-4 rounded-2xl border border-gray-100 p-5">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-500 text-xl">💰</div>
            <div><p className="font-bold text-black mb-1">משתלם</p><p className="text-sm text-gray-500">ממוצע של 1,200 ש״ח בחודש לבעלי חניות.</p></div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 px-6 py-6 text-center">
        <p className="text-gray-500 text-xs">© 2026 ShareParks.com</p>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════ LOCATE ═══ */
function LocateScreen() {
  return (
    <div className="min-h-[calc(100dvh-44px)] flex flex-col">
      {/* GPS detection result */}
      <div className="bg-gray-800 px-6 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-xl">📍</span>
          </div>
          <div>
            <p className="text-xs text-green-400 font-bold">זיהינו את המיקום שלך</p>
            <h2 className="text-xl font-black text-white">רחוב אגס, אשדוד</h2>
            <p className="text-xs text-gray-500">רובע ו׳ · דיוק: 8 מטר</p>
          </div>
        </div>

        {/* Detected info card */}
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white text-sm font-bold">📡 GPS פעיל</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              <p className="text-gray-400 text-xs">קואורדינטות: 31.7928°N, 34.6500°E</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-orange-500">6</p>
              <p className="text-[10px] text-gray-400">חניות קרובות</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby summary */}
      <div className="flex-1 px-4 py-5 space-y-4">
        <h3 className="font-bold text-black">🏘️ חניות ליד רחוב אגס, אשדוד</h3>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 rounded-xl border border-green-200 p-3 text-center">
            <p className="text-lg font-black text-green-600">4</p>
            <p className="text-[10px] text-green-600 font-medium">פנויות עכשיו</p>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-3 text-center">
            <p className="text-lg font-black text-yellow-600">2</p>
            <p className="text-[10px] text-yellow-600 font-medium">יתפנו בקרוב</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-lg font-black text-black">7-18₪</p>
            <p className="text-[10px] text-gray-500 font-medium">טווח מחירים</p>
          </div>
        </div>

        {/* Closest parking highlight */}
        <div className="bg-orange-50 rounded-2xl border-2 border-orange-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-orange-500 font-bold text-sm">⭐ הכי קרובה אליך</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-black">אגס 9</h4>
              <p className="text-sm text-gray-500">20 מטר · מקורה · שער חשמלי</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-black text-orange-500">12₪</p>
              <p className="text-[10px] text-gray-400">לשעה</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-bold">פנוי עכשיו עד 18:00</span>
            <span className="text-xs text-gray-400">· ★ 4.8</span>
          </div>
        </div>

        {/* Time selector */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <h4 className="font-bold text-black mb-3">🕐 לכמה זמן אתה צריך?</h4>
          <div className="flex gap-2 flex-wrap">
            {['שעה', '2 שעות', '3 שעות', '4 שעות', 'יום שלם'].map((t, i) => (
              <span
                key={t}
                className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  i === 3
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                    : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-sm text-gray-500">4 שעות × 12 ש״ח (הכי קרובה)</span>
            <span className="text-lg font-black text-orange-500">48 ש״ח</span>
          </div>
        </div>

        {/* CTA buttons */}
        <Link
          href="/demo?s=map"
          className="block w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200"
        >
          הצג 6 חניות קרובות
        </Link>

        <Link
          href="/demo?s=detail"
          className="block w-full py-3 rounded-2xl bg-gray-800 text-white text-base font-bold text-center"
        >
          הזמן ישירות — אגס 9 (20 מ׳) · 48₪
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ MAP / LIST ═══ */

const DEMO_PARKINGS = [
  {
    id: 'agas9',
    addr: 'אגס 9',
    city: 'אשדוד',
    area: 'רובע ו׳',
    dist: 20,
    price: 12,
    rating: 4.8,
    reviews: 23,
    avail: 'פנוי עכשיו',
    availUntil: '18:00',
    availHours: 4,
    pct: 65,
    tags: ['מקורה', 'שער חשמלי'],
    owner: 'יוסי ב.',
    status: 'green' as const,
  },
  {
    id: 'habankim3',
    addr: 'הבנקים 3',
    city: 'אשדוד',
    area: 'סיטי',
    dist: 180,
    price: 18,
    rating: 4.5,
    reviews: 14,
    avail: 'פנוי עכשיו',
    availUntil: '16:30',
    availHours: 2.5,
    pct: 40,
    tags: ['מקורה', 'SUV', 'מצלמה'],
    owner: 'רונית ש.',
    status: 'green' as const,
  },
  {
    id: 'rogozin12',
    addr: 'רוגוזין 12',
    city: 'אשדוד',
    area: 'מרכז',
    dist: 450,
    price: 10,
    rating: 4.2,
    reviews: 8,
    avail: 'פנוי מ-15:00',
    availUntil: '20:00',
    availHours: 5,
    pct: 0,
    tags: ['פתוחה', 'רחוב'],
    owner: 'אבי מ.',
    status: 'yellow' as const,
  },
  {
    id: 'shderot44',
    addr: 'שד׳ ירושלים 44',
    city: 'אשדוד',
    area: 'רובע ב׳',
    dist: 800,
    price: 8,
    rating: 4.0,
    reviews: 5,
    avail: 'פנוי עכשיו',
    availUntil: '22:00',
    availHours: 8,
    pct: 85,
    tags: ['פתוחה', 'קל להגיע'],
    owner: 'דנה כ.',
    status: 'green' as const,
  },
  {
    id: 'herzl7',
    addr: 'הרצל 7',
    city: 'אשדוד',
    area: 'מרכז',
    dist: 1200,
    price: 15,
    rating: 4.9,
    reviews: 31,
    avail: 'פנוי עכשיו',
    availUntil: '17:00',
    availHours: 3,
    pct: 50,
    tags: ['מקורה', 'SUV', 'שער חשמלי', 'מצלמה'],
    owner: 'משה ר.',
    status: 'green' as const,
  },
  {
    id: 'tamar22',
    addr: 'תמר 22',
    city: 'אשדוד',
    area: 'רובע ח׳',
    dist: 1500,
    price: 7,
    rating: 3.8,
    reviews: 3,
    avail: 'פנוי מ-16:00',
    availUntil: '21:00',
    availHours: 5,
    pct: 0,
    tags: ['פתוחה'],
    owner: 'סיגל ד.',
    status: 'yellow' as const,
  },
];

function MapScreen() {
  return (
    <div>
      {/* Search header */}
      <div className="bg-gray-800 px-4 pt-4 pb-5">
        <div className="bg-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 mb-3">
          <span>📍</span>
          <span className="text-white/70 flex-1">אשדוד — כל האזורים</span>
          <span className="text-orange-500 text-sm font-bold">שנה</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            🕐 14:00 — 18:00
          </div>
          <div className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs font-bold">
            📏 2 ק״מ
          </div>
          <div className="bg-white/10 text-white/70 px-3 py-1.5 rounded-full text-xs font-bold">
            💰 מחיר ↑
          </div>
        </div>
      </div>

      {/* ─── Visual parking map illustration ─── */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-black">🗺️ מפת חניות — אגס, אשדוד</span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> פנוי</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> תפוס</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 inline-block" /> בקרוב</span>
            </div>
          </div>

          {/* Street illustration */}
          <div className="relative">
            {/* Road */}
            <div className="bg-gray-300 rounded-lg h-[280px] relative overflow-hidden">
              {/* Horizontal road */}
              <div className="absolute top-[45%] inset-x-0 h-10 bg-gray-400" />
              <div className="absolute top-[49%] inset-x-0 h-0.5 border-t-2 border-dashed border-yellow-300" />

              {/* Vertical road */}
              <div className="absolute inset-y-0 left-[40%] w-8 bg-gray-400" />
              <div className="absolute inset-y-0 left-[43.5%] w-0.5 border-r-2 border-dashed border-yellow-300" />

              {/* Street labels */}
              <div className="absolute top-[38%] right-2 text-[9px] font-bold text-gray-600 bg-white/70 px-1.5 py-0.5 rounded">רח׳ אגס</div>
              <div className="absolute top-1 left-[30%] text-[9px] font-bold text-gray-600 bg-white/70 px-1.5 py-0.5 rounded">רח׳ תמר</div>

              {/* Your location */}
              <div className="absolute top-[42%] right-[20%] z-20">
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <p className="text-[8px] font-bold text-blue-600 bg-white/80 px-1 rounded mt-0.5 text-center">אתה כאן</p>
              </div>

              {/* ─── Parking spots ─── */}

              {/* Building block 1 — top right */}
              <div className="absolute top-2 right-2 w-[35%] h-[38%] bg-gray-200 rounded-lg border border-gray-300 flex flex-col items-center justify-center">
                <span className="text-[8px] text-gray-400">בניין מגורים</span>
                {/* Parking row below building */}
                <div className="absolute -bottom-1 right-1 flex gap-0.5">
                  <div className="w-7 h-5 rounded-sm bg-green-500 border border-green-600 flex items-center justify-center text-[7px] text-white font-bold">P</div>
                  <div className="w-7 h-5 rounded-sm bg-green-500 border border-green-600 flex items-center justify-center text-[7px] text-white font-bold">P</div>
                  <div className="w-7 h-5 rounded-sm bg-red-400 border border-red-500 flex items-center justify-center text-[7px] text-white font-bold">🚗</div>
                  <div className="w-7 h-5 rounded-sm bg-green-500 border border-green-600 flex items-center justify-center text-[7px] text-white font-bold">P</div>
                </div>
              </div>

              {/* Building block 2 — top left */}
              <div className="absolute top-2 left-2 w-[20%] h-[38%] bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center">
                <span className="text-[8px] text-gray-400 rotate-90">חנויות</span>
              </div>

              {/* Parking lot — bottom right (the main one) */}
              <div className="absolute bottom-2 right-2 w-[52%] h-[42%] bg-white rounded-lg border-2 border-orange-300 p-1.5">
                <p className="text-[8px] font-bold text-orange-500 mb-1">🅿️ חניון אגס 9</p>
                <div className="grid grid-cols-4 gap-0.5">
                  <div className="h-5 rounded-sm bg-green-500 flex items-center justify-center text-[6px] text-white font-bold">1 ✓</div>
                  <div className="h-5 rounded-sm bg-green-500 flex items-center justify-center text-[6px] text-white font-bold">2 ✓</div>
                  <div className="h-5 rounded-sm bg-red-400 flex items-center justify-center text-[6px] text-white font-bold">3 🚗</div>
                  <div className="h-5 rounded-sm bg-red-400 flex items-center justify-center text-[6px] text-white font-bold">4 🚗</div>
                  <div className="h-5 rounded-sm bg-green-500 flex items-center justify-center text-[6px] text-white font-bold">5 ✓</div>
                  <div className="h-5 rounded-sm bg-yellow-400 flex items-center justify-center text-[6px] text-white font-bold">6 🕐</div>
                  <div className="h-5 rounded-sm bg-red-400 flex items-center justify-center text-[6px] text-white font-bold">7 🚗</div>
                  <div className="h-5 rounded-sm bg-green-500 flex items-center justify-center text-[6px] text-white font-bold">8 ✓</div>
                </div>
                <p className="text-[7px] text-gray-500 mt-1">4 פנויות · 1 בקרוב · 3 תפוסות</p>
              </div>

              {/* Street parking — bottom left */}
              <div className="absolute bottom-2 left-2 w-[20%] h-[42%] flex flex-col gap-1 items-center justify-center">
                <p className="text-[7px] font-bold text-gray-600">חניית רחוב</p>
                <div className="space-y-0.5 w-full px-1">
                  <div className="h-4 rounded-sm bg-green-500 flex items-center justify-center text-[6px] text-white font-bold">P ✓</div>
                  <div className="h-4 rounded-sm bg-red-400 flex items-center justify-center text-[6px] text-white font-bold">🚗</div>
                  <div className="h-4 rounded-sm bg-green-500 flex items-center justify-center text-[6px] text-white font-bold">P ✓</div>
                  <div className="h-4 rounded-sm bg-red-400 flex items-center justify-center text-[6px] text-white font-bold">🚗</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats below map */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-green-50 rounded-xl px-3 py-2 text-center border border-green-200">
              <p className="text-lg font-black text-green-600">7</p>
              <p className="text-[9px] text-green-600 font-medium">פנויות</p>
            </div>
            <div className="bg-yellow-50 rounded-xl px-3 py-2 text-center border border-yellow-200">
              <p className="text-lg font-black text-yellow-600">1</p>
              <p className="text-[9px] text-yellow-600 font-medium">יתפנה בקרוב</p>
            </div>
            <div className="bg-red-50 rounded-xl px-3 py-2 text-center border border-red-200">
              <p className="text-lg font-black text-red-500">6</p>
              <p className="text-[9px] text-red-500 font-medium">תפוסות</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-bold text-black">{DEMO_PARKINGS.length} חניות זמינות</span>
        <span className="text-xs text-gray-400">ממוין לפי מרחק</span>
      </div>

      {/* Parking list */}
      <div className="px-4 py-3 space-y-3">
        {DEMO_PARKINGS.map((p) => {
          const distLabel = p.dist < 1000 ? `${p.dist} מ׳` : `${(p.dist / 1000).toFixed(1)} ק״מ`;
          const isAvailNow = p.status === 'green';

          return (
            <Link
              key={p.id}
              href="/demo?s=detail"
              className="block bg-white rounded-2xl border border-gray-200 overflow-hidden active:scale-[0.98] transition-transform"
            >
              {/* Top row: status + distance */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isAvailNow ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                  <span className={`text-xs font-bold ${isAvailNow ? 'text-green-600' : 'text-yellow-600'}`}>
                    {p.avail}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{distLabel}</span>
              </div>

              {/* Address + area */}
              <div className="px-4 pb-1">
                <h3 className="text-lg font-black text-black">{p.addr}</h3>
                <p className="text-xs text-gray-400">{p.city} · {p.area}</p>
              </div>

              {/* Availability bar */}
              <div className="px-4 py-2">
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isAvailNow ? 'bg-green-400' : 'bg-yellow-400'}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] text-gray-400">{isAvailNow ? 'עכשיו' : p.avail.replace('פנוי מ-', '')}</span>
                  <span className="text-[10px] text-gray-400">עד {p.availUntil}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="px-4 flex gap-1.5 flex-wrap">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-gray-50 text-[10px] font-medium text-gray-500 border border-gray-100">
                    {t}
                  </span>
                ))}
              </div>

              {/* Bottom row: price + rating + owner */}
              <div className="px-4 py-3 mt-1 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Price */}
                  <span className="text-xl font-black text-black">{p.price}<span className="text-xs font-medium text-gray-400 mr-0.5">₪/שעה</span></span>
                  {/* Total estimate */}
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    ~{p.price * 4} ₪ ל-4 שעות
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-orange-500 text-sm">★</span>
                  <span className="text-sm font-bold text-black">{p.rating}</span>
                  <span className="text-[10px] text-gray-400">({p.reviews})</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Compare summary */}
      <div className="mx-4 mb-4 bg-gray-800 rounded-2xl p-4 text-white">
        <h3 className="font-bold mb-3">📊 השוואת מחירים — 4 שעות חניה</h3>
        <div className="space-y-2">
          {DEMO_PARKINGS.sort((a, b) => a.price - b.price).map((p) => (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-gray-400 truncate">{p.addr}</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="flex items-center gap-2 shrink-0 mr-2">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${(p.price / 20) * 60}px` }} />
                <span className="text-sm font-black text-orange-400">{p.price * 4}₪</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-500">הכי זול</span>
          <span className="text-xs text-gray-500">הכי יקר</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ PARKING DETAIL ═══ */
function ParkingDetailScreen() {
  return (
    <div className="pb-4">
      {/* Street View placeholder */}
      <div className="relative h-52 bg-gray-300 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        {/* Simulated street view */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl">🏘️</span>
            <p className="text-white/60 text-xs mt-1">Google Street View</p>
          </div>
        </div>
        {/* Address overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4">
          <h1 className="text-2xl font-black text-white">אגס 9</h1>
          <p className="text-white/70 text-sm">אשדוד · 20 מ׳ ממך</p>
        </div>
        {/* Back button */}
        <Link href="/demo?s=map" className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-800/40 text-white flex items-center justify-center text-lg">
          →
        </Link>
      </div>

      {/* Owner photos carousel */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center border-2 border-orange-500">
          <span className="text-2xl">🅿️</span>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center">
          <span className="text-2xl">🚗</span>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gray-200 shrink-0 flex items-center justify-center">
          <span className="text-2xl">🏢</span>
        </div>
        <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 text-xs">
          +3
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Availability status — live */}
        <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-base font-black text-green-700">פנוי עכשיו</span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full">זמין</span>
          </div>
          <p className="text-sm text-green-600">פנויה ל-4 השעות הקרובות (עד 18:00)</p>
          {/* Countdown bar */}
          <div className="mt-3 h-2 rounded-full bg-green-100 overflow-hidden">
            <div className="h-full rounded-full bg-green-500 w-[65%]" />
          </div>
          <div className="flex justify-between mt-1 text-xs text-green-500">
            <span>עכשיו</span>
            <span>18:00</span>
          </div>
        </div>

        {/* Specs / Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">🏠 מקורה</span>
          <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">🚙 מתאים ל-SUV</span>
          <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">🔒 שער חשמלי</span>
          <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">📹 מצלמה</span>
          <span className="px-3 py-1.5 rounded-full bg-orange-50 text-sm font-medium text-orange-600">⚡ פתיחה מהנייד</span>
        </div>

        {/* Price + Rating card */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">מחיר לשעה</span>
            <span className="text-3xl font-black text-black">15 <span className="text-sm font-medium text-gray-400">ש״ח</span></span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">דירוג</span>
            <div className="flex items-center gap-1">
              <span className="text-orange-500 text-lg">★★★★★</span>
              <span className="text-sm font-bold text-black">4.8</span>
              <span className="text-xs text-gray-400">(23)</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">בעלים</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">י</div>
              <span className="text-sm font-bold text-black">יוסי ברגר</span>
              <span className="text-xs text-gray-400">★ 4.9</span>
            </div>
          </div>
        </div>

        {/* Reviews preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-black mb-3">ביקורות אחרונות</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs shrink-0">ד</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-black">דני כ.</span>
                  <span className="text-orange-500 text-xs">★★★★★</span>
                </div>
                <p className="text-sm text-gray-500">חניה מעולה, שער נפתח מיד. ממליץ!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs shrink-0">מ</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-black">מיכל ל.</span>
                  <span className="text-orange-500 text-xs">★★★★</span>
                </div>
                <p className="text-sm text-gray-500">נוח מאוד, קצת צר ל-SUV אבל בסדר.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time selector */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-black mb-3">בחר זמן חניה</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-white">
              <p className="text-xs text-gray-400 mb-0.5">מתחיל</p>
              <p className="text-sm font-bold text-black">14:00 · היום</p>
            </div>
            <div className="px-4 py-3 rounded-xl border border-gray-200 bg-white">
              <p className="text-xs text-gray-400 mb-0.5">נגמר</p>
              <p className="text-sm font-bold text-black">18:00 · היום</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-gray-500">4 שעות × 15 ש״ח</span>
            <span className="text-lg font-black text-orange-500">60 ש״ח</span>
          </div>
        </div>

        {/* CTA */}
        <Link href="/demo?s=booking" className="block w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200">
          הזמן חניה באגס 9
        </Link>

        {/* Navigate */}
        <div className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-base font-bold text-center">
          🧭 נווט לאגס 9, אשדוד
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ BOOKING ═══ */
function BookingScreen() {
  return (
    <div className="relative h-[calc(100dvh-44px)] bg-gray-200">
      <div className="absolute inset-0 bg-gray-800/20" />
      <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="px-5 pb-8">
          <div className="w-full h-28 bg-gray-100 rounded-2xl mt-2 mb-4 flex items-center justify-center text-3xl">🅿️</div>
          <h2 className="text-xl font-black text-black mb-1">רחוב דיזנגוף 99</h2>
          <p className="text-sm text-gray-500 mb-4">📍 תל אביב · 350 מ׳</p>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">מחיר לשעה</span>
              <span className="text-2xl font-black text-black">15 <span className="text-sm font-medium text-gray-400">ש״ח</span></span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">🕐 משך</span>
              <span className="text-sm font-bold text-black">4 שעות</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">סה״כ</span>
              <span className="text-xl font-black text-orange-500">60 ש״ח</span>
            </div>
          </div>

          <div className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 mb-3">
            הזמן עכשיו
          </div>
          <div className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 text-base font-bold text-center">
            🧭 נווט לחניה
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ SESSION ═══ */
function SessionScreen() {
  return (
    <div className="h-[calc(100dvh-44px)] bg-gray-100 flex flex-col justify-end">
      <div className="bg-orange-50 rounded-t-3xl shadow-2xl ring-1 ring-orange-300">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-300 rounded-full" /></div>
        <div className="px-5 pb-8 pt-2">
          <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2.5 rounded-xl mb-4 text-sm font-bold">
            ⚠️ נשארו 8 דקות!
          </div>
          <p className="text-sm text-gray-500 mb-4">📍 רחוב דיזנגוף 99, תל אביב</p>

          <div className="text-center mb-5">
            <p className="text-xs font-medium text-gray-400 mb-1">זמן שנותר</p>
            <p className="text-5xl font-black tabular-nums text-orange-500">8:24</p>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 mb-4">
            <span className="text-sm text-gray-500">עלות נוכחית</span>
            <span className="text-lg font-black text-black">60 ש״ח</span>
          </div>

          {/* Gate */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-orange-500">🚪</span>
              <span className="font-bold text-black text-sm">פתיחת שער</span>
            </div>
            <div className="p-4">
              <div className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200">
                📞 פתח שער
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">לחיצה תחייג אוטומטית למספר השער</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 text-base font-bold text-center">🧭 נווט</div>
            <div className="py-3.5 rounded-2xl bg-orange-500 text-white text-base font-bold text-center shadow-lg shadow-orange-200">סיים חניה</div>
          </div>
          <div className="w-full mt-3 py-2.5 rounded-2xl border-2 border-gray-200 text-orange-500 text-sm font-bold text-center">
            🛡️ דיווח על בעיה
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ OWNER ONBOARD ═══ */
function OwnerOnboardScreen() {
  return (
    <div className="min-h-[calc(100dvh-44px)] flex flex-col">
      {/* Hero */}
      <div className="bg-gray-800 px-6 pt-8 pb-6">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-base font-black text-white">P</span>
          </div>
          <span className="text-xl font-black">
            <span className="text-white">Share</span>
            <span className="text-orange-500">Parks</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-white leading-tight mb-2">
          הרווח מהחניה שלך 💰
        </h1>
        <p className="text-gray-400 text-sm">3 דקות הרשמה. התחל להרוויח היום.</p>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">

        {/* Income estimate */}
        <div className="bg-orange-50 rounded-2xl border-2 border-orange-200 p-5">
          <p className="text-sm text-orange-600 font-bold mb-1">💡 כמה אפשר להרוויח?</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-4xl font-black text-black">1,200</p>
              <p className="text-xs text-gray-500">ש״ח בממוצע לחודש</p>
            </div>
            <div className="flex-1 bg-white rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">4 שעות/יום</span>
                <span className="font-bold text-black">~800₪</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">8 שעות/יום</span>
                <span className="font-bold text-orange-500">~1,200₪</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">יום שלם</span>
                <span className="font-bold text-black">~1,800₪</span>
              </div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div>
          <h3 className="font-bold text-black mb-4">📋 הרשמה ב-3 שלבים</h3>

          {/* Step 1 — Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-sm">1</div>
              <h4 className="font-bold text-black">פרטי החניה</h4>
            </div>
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">📍 כתובת</span>
                <span className="text-sm font-bold text-black">אגס 9, אשדוד</span>
              </div>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">🏠 סוג</span>
                <div className="flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold">מקורה</span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">פתוחה</span>
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">🚙 גודל</span>
                <div className="flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">רגיל</span>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500 text-white text-xs font-bold">SUV</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 — Photos & Gate */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-sm">2</div>
              <h4 className="font-bold text-black">תמונות וכניסה</h4>
            </div>
            <div className="space-y-3">
              {/* Photos */}
              <div className="flex gap-2">
                <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl">📷</div>
                <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl">+</div>
                <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center p-2">צלם את החניה</div>
              </div>
              {/* Gate type */}
              <p className="text-sm text-gray-500 font-medium">🚪 סוג כניסה</p>
              <div className="flex gap-2">
                <span className="px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold">🔑 קוד ידני</span>
                <span className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold">📞 חיוג לשער</span>
                <span className="px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold">📱 PalGate</span>
              </div>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-400 mb-1">הוראות כניסה</p>
                <p className="text-sm text-black">קוד 1234, כניסה מימין, חניה מספר 7</p>
              </div>
            </div>
          </div>

          {/* Step 3 — Pricing & Availability */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-sm">3</div>
              <h4 className="font-bold text-black">מחיר וזמינות</h4>
            </div>
            <div className="space-y-3">
              {/* Price */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 mb-2">💰 מחיר לשעה</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-black">12</span>
                  <span className="text-sm text-gray-400">ש״ח/שעה</span>
                  <div className="flex-1" />
                  <div className="text-left">
                    <p className="text-xs text-gray-400">מחיר מומלץ באזור</p>
                    <p className="text-sm font-bold text-orange-500">10-15 ₪</p>
                  </div>
                </div>
              </div>
              {/* Availability mode selector */}
              <p className="text-sm text-gray-500 font-medium">📅 איך לנהל זמינות?</p>
              <div className="space-y-2">
                {/* Mode A — Schedule */}
                <div className="rounded-2xl border-2 border-orange-400 bg-orange-50 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 rounded-full border-2 border-orange-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    </div>
                    <span className="text-sm font-black text-black">🕐 לוח זמנים קבוע</span>
                  </div>
                  <p className="text-xs text-gray-500 mr-8 mb-3">הגדר שעות קבועות שהחניה פנויה. המערכת תפרסם אוטומטי.</p>
                  <div className="space-y-1.5 mr-8">
                    {[
                      { day: 'א׳-ה׳', time: '08:00 — 17:00', active: true },
                      { day: 'שישי', time: '08:00 — 13:00', active: true },
                      { day: 'שבת', time: 'כל היום', active: false },
                    ].map((d) => (
                      <div key={d.day} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${d.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-xs font-bold text-black">{d.day}</span>
                        </div>
                        <span className={`text-xs ${d.active ? 'text-black font-medium' : 'text-gray-400'}`}>{d.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mode B — Manual toggle */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    <span className="text-sm font-black text-black">👆 פנוי/תפוס ידני</span>
                  </div>
                  <p className="text-xs text-gray-500 mr-8 mb-3">לחץ כפתור באפליקציה כשהחניה פנויה. לחץ שוב כשחוזר.</p>
                  <div className="mr-8 flex items-center gap-3">
                    <div className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-bold text-center shadow-lg shadow-green-200">
                      🟢 פנוי
                    </div>
                    <div className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-500 text-sm font-bold text-center">
                      🔴 תפוס
                    </div>
                  </div>
                </div>

                {/* Mode C — Auto GPS */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    <span className="text-sm font-black text-black">📡 זיהוי אוטומטי (GPS)</span>
                  </div>
                  <p className="text-xs text-gray-500 mr-8 mb-3">המערכת מזהה שעזבת את הבית ומפרסמת אוטומטית. חוזר = סוגר.</p>
                  <div className="mr-8 bg-gray-50 rounded-xl border border-gray-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs">📍</span>
                      <span className="text-xs text-gray-500">כתובת הבית: אגס 9, אשדוד</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">→</span>
                        <span className="text-gray-600">יצאת מהבית 08:15</span>
                        <span className="text-green-500 font-bold">→ החניה פנויה ✓</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">←</span>
                        <span className="text-gray-600">חזרת הביתה 17:30</span>
                        <span className="text-red-500 font-bold">→ החניה תפוסה ✗</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Combine note */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-500">💡 <span className="font-bold">טיפ:</span> אפשר לשלב! לוח זמנים קבוע + כפתור ידני לשינויים ברגע האחרון. הכפתור תמיד גובר על הלוח.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Earnings preview */}
        <div className="bg-gray-800 rounded-2xl p-5 text-white">
          <h4 className="font-bold mb-3">📊 תחזית הכנסות חודשית</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">ימי עבודה (א׳-ה׳)</span>
              <span className="text-sm font-bold">22 ימים × 9 שעות × 12₪</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">שישי</span>
              <span className="text-sm font-bold">4 ימים × 5 שעות × 12₪</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-400">הכנסה ברוטו</span>
              <span className="text-xl font-black text-white">2,616 ₪</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">עמלת ShareParks (10%)</span>
              <span className="text-sm text-gray-500">-262 ₪</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex items-center justify-between">
              <span className="font-bold">💰 נטו לחשבון שלך</span>
              <span className="text-2xl font-black text-orange-500">2,354 ₪</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-xs text-gray-500 space-y-1">
          <p>✓ אפשר לבטל או לשנות בכל רגע</p>
          <p>✓ ביטוח נזקים כלול — עד 50,000 ש״ח</p>
          <p>✓ תשלום ישירות לחשבון הבנק שלך</p>
          <p>✓ אין התחייבות — תפסיק מתי שתרצה</p>
        </div>

        {/* CTA */}
        <Link
          href="/demo?s=dashboard"
          className="block w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200"
        >
          🚀 התחל להרוויח
        </Link>

        <p className="text-center text-xs text-gray-400 pb-2">
          בלחיצה אתה מסכים ל<span className="text-orange-500">תנאי השימוש</span> ול<span className="text-orange-500">מדיניות הפרטיות</span>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ DASHBOARD ═══ */
function DashboardScreen() {
  return (
    <>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center"><span className="text-xs font-black text-white">P</span></div>
          <span className="text-base font-black"><span className="text-white">Share</span><span className="text-orange-500">Parks</span></span>
        </div>
        <div className="relative p-2">
          <span className="text-white">🔔</span>
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">3</span>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5">
        {/* Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-black">רחוב הרצל 15</h2>
            <p className="text-sm font-medium mt-1 text-orange-500">פעילה — מופיעה בחיפוש</p>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-200">
            ⚡ פעילה
          </div>
        </div>

        {/* Earnings */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">📅 החודש</p>
            <p className="text-2xl font-black text-black">840<span className="text-xs text-gray-400 mr-1">ש״ח</span></p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">📈 סה״כ</p>
            <p className="text-2xl font-black text-black">3,240<span className="text-xs text-gray-400 mr-1">ש״ח</span></p>
          </div>
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
            <div className="flex items-center gap-1 mb-1"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /><span className="text-xs text-orange-600">פעילות</span></div>
            <p className="text-2xl font-black text-black">2</p>
          </div>
        </div>

        {/* Active booking */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-black mb-4">הזמנות</h3>
          <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /><p className="text-sm font-bold text-orange-600">פעיל עכשיו</p></div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 px-4 py-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">👤</div>
                <span className="font-bold text-black">דני כהן</span>
              </div>
              <span className="text-lg font-black text-black">45 <span className="text-xs text-gray-400">ש״ח</span></span>
            </div>
            <p className="text-sm text-gray-500">🕐 היום, 14:00 · 3 שעות</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm">👤</div>
                <span className="font-bold text-black">מיכל לוי</span>
              </div>
              <span className="text-lg font-black text-black">60 <span className="text-xs text-gray-400">ש״ח</span></span>
            </div>
            <p className="text-sm text-gray-500">🕐 מחר, 09:00 · 4 שעות</p>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">זמינות</h3>
            <div className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-200">+ הוסף</div>
          </div>
          {['ראשון · 08:00 — 18:00', 'שני · 08:00 — 16:00', 'רביעי · 10:00 — 20:00'].map((s) => (
            <div key={s} className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🕐</span>
                <span className="text-sm font-medium text-black">{s}</span>
                <span className="text-xs text-gray-400">🔄 שבועי</span>
              </div>
              <span className="text-gray-300">🗑️</span>
            </div>
          ))}
        </div>

        {/* Quick toggle */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-base font-bold text-black mb-3">⚡ שינוי מהיר</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="py-3.5 rounded-xl bg-green-500 text-white text-base font-bold text-center shadow-lg shadow-green-200">
              🟢 פנוי
            </div>
            <div className="py-3.5 rounded-xl bg-gray-100 text-gray-400 text-base font-bold text-center">
              🔴 תפוס
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-700 font-medium">GPS: זוהה שאתה מחוץ לבית. החניה מפורסמת אוטומטית.</span>
          </div>
        </div>

        <div className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-base font-bold text-center">🏠 חזרתי מוקדם</div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════ WALLET ═══ */
/* ═══════════════════════════════════════════ TERMS ═══ */
function TermsScreen() {
  return (
    <div>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <a href="/demo?s=home" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
        <h1 className="text-lg font-bold">📋 תקנון</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
      <p className="text-xs text-gray-400">עדכון אחרון: אפריל 2026</p>

      <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-black text-black mb-2">1. הגדרות</h2>
          <p><strong>&quot;השירות&quot;</strong> — פלטפורמת ShareParks לשיתוף חניות פרטיות.</p>
          <p><strong>&quot;משכיר&quot;</strong> — בעל חניה המפרסם אותה להשכרה.</p>
          <p><strong>&quot;שוכר&quot;</strong> — משתמש המזמין חניה דרך הפלטפורמה.</p>
          <p><strong>&quot;עמלה&quot;</strong> — 10% מסכום ההזמנה, המנוכה מהמשכיר.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-black mb-2">2. תנאי שימוש</h2>
          <p>2.1 השימוש בשירות מותנה בהסכמה לתנאים אלו.</p>
          <p>2.2 המשתמש מתחייב למסור פרטים מדויקים ועדכניים.</p>
          <p>2.3 ShareParks שומרת על הזכות לחסום משתמש שמפר את התנאים.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-black mb-2">3. תשלומים והחזרים</h2>
          <p>3.1 התשלום מבוצע דרך כרטיס אשראי מאובטח (PCI DSS).</p>
          <p>3.2 ביטול עד שעה לפני ההזמנה — החזר מלא.</p>
          <p>3.3 ביטול תוך שעה מתחילת ההזמנה — חיוב של 50%.</p>
          <p>3.4 &quot;חניה תפוסה&quot; — החזר מלא אוטומטי + התראה לבעלים.</p>
          <p>3.5 חריגת זמן (overtime) — חיוב בתעריף x1.5 מהמחיר הרגיל.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-black mb-2">4. אחריות וביטוח</h2>
          <p>4.1 ShareParks אינה אחראית לנזק שנגרם לרכב בחניה.</p>
          <p>4.2 ביטוח נזקים כלול עד 50,000 ש&quot;ח למקרה ביטוח.</p>
          <p>4.3 חובה לדווח על נזק תוך 24 שעות דרך כפתור &quot;דיווח על בעיה&quot;.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-black mb-2">5. פרטיות ומידע</h2>
          <p>5.1 המידע נשמר בשרתי Supabase מאובטחים (SOC2).</p>
          <p>5.2 מיקום GPS נאסף רק בזמן חיפוש פעיל.</p>
          <p>5.3 פרטי כרטיס אשראי לא נשמרים בשרתינו (Stripe/PayPlus).</p>
          <p>5.4 הוראות כניסה גלויות רק לשוכר עם הזמנה פעילה.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-black mb-2">6. משכירים</h2>
          <p>6.1 המשכיר אחראי לדייק בפרטי החניה (כתובת, גודל, הוראות).</p>
          <p>6.2 עמלת הפלטפורמה: 10% מכל הזמנה שהושלמה.</p>
          <p>6.3 משיכת כספים — מינימום 50 ש&quot;ח, תוך 1-3 ימי עסקים.</p>
          <p>6.4 3 דיווחים על &quot;חניה תפוסה&quot; = השעיית חשבון אוטומטית.</p>
        </section>

        <section>
          <h2 className="text-base font-black text-black mb-2">7. יצירת קשר</h2>
          <p>📧 support@shareparks.com</p>
          <p>📞 *6275 (ShareParks)</p>
          <p>🕐 ימים א&apos;-ה&apos;, 08:00-20:00</p>
        </section>
      </div>

      <Link href="/demo?s=home" className="block w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold text-center mt-6">🏠 חזרה לדף הבית</Link>
      </div>
    </div>
  );
}

function WalletScreen() {
  return (
    <>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <h1 className="text-lg font-bold">💰 ארנק</h1>
        <a href="/demo?r=owner&s=home" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
      </div>
      <div className="px-4 py-6 space-y-5">
        <div className="bg-gray-800 rounded-3xl p-6 text-white">
          <p className="text-sm text-gray-400 mb-1">יתרה זמינה</p>
          <p className="text-4xl font-black mb-6">840 <span className="text-lg text-gray-400">ש״ח</span></p>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">📈 סה״כ הכנסות</p>
              <p className="text-lg font-bold">3,240 ש״ח</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">📤 סה״כ משיכות</p>
              <p className="text-lg font-bold">2,400 ש״ח</p>
            </div>
          </div>
          <div className="w-full py-3.5 rounded-2xl bg-orange-500 text-white text-base font-black text-center shadow-lg shadow-orange-500/30">
            ⬇️ משוך לחשבון הבנק
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-bold text-black">היסטוריית תנועות</h3></div>
          {[
            { type: 'הכנסה', c: 'text-green-600', amount: '+45', desc: 'חניה ברחוב הרצל', d: 'היום' },
            { type: 'עמלה', c: 'text-gray-400', amount: '-4.50', desc: 'עמלת פלטפורמה 10%', d: 'היום' },
            { type: 'הכנסה', c: 'text-green-600', amount: '+60', desc: 'חניה ברחוב הרצל', d: 'אתמול' },
            { type: 'משיכה', c: 'text-black', amount: '-500', desc: 'משיכה לבנק', d: '12/04' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
              <div>
                <div className="flex items-center gap-2"><span className={`text-xs font-bold ${tx.c}`}>{tx.type}</span><span className="text-xs text-gray-300">{tx.d}</span></div>
                <p className="text-sm text-gray-500 mt-0.5">{tx.desc}</p>
              </div>
              <span className={`text-base font-black ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-black'}`}>{tx.amount} ש״ח</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════ BOOKINGS ═══ */
function BookingsScreen() {
  return (
    <>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <h1 className="text-lg font-bold">🧾 ההזמנות שלי</h1>
        <a href="/demo?r=renter&s=home" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
      </div>
      <div className="px-4 py-6 space-y-3">
        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider">פעילות (1)</h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-green-600 bg-green-50 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" /> פעיל
            </span>
            <span className="text-lg font-black text-black">60 <span className="text-xs text-gray-400">ש״ח</span></span>
          </div>
          <p className="font-bold text-black mb-1">📍 רחוב דיזנגוף 99 <span className="text-xs text-gray-400 font-normal">תל אביב</span></p>
          <p className="text-sm text-gray-500">🕐 יום ד׳ · 14:00 — 18:00</p>
        </div>

        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-6">היסטוריה (2)</h2>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-gray-500 bg-gray-50">✓ הושלם</span>
              <span className="text-lg font-black text-black">45 <span className="text-xs text-gray-400">ש״ח</span></span>
            </div>
            <p className="font-bold text-black mb-1">📍 רחוב אלנבי 42</p>
            <p className="text-sm text-gray-500">🕐 יום ב׳ · 10:00 — 13:00</p>
          </div>
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
            <p className="text-xs text-gray-400 mb-2">דרג את החניה</p>
            <div className="flex gap-0.5 text-xl">
              <span className="text-orange-500">★</span>
              <span className="text-orange-500">★</span>
              <span className="text-orange-500">★</span>
              <span className="text-orange-500">★</span>
              <span className="text-gray-300">★</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-red-500 bg-red-50">✕ בוטל</span>
              <span className="text-lg font-black text-black line-through text-gray-400">30 <span className="text-xs">ש״ח</span></span>
            </div>
            <p className="font-bold text-black mb-1">📍 רחוב בן יהודה 8</p>
            <p className="text-sm text-gray-500">🕐 יום א׳ · 09:00 — 11:00</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-bold">החניה היתה תפוסה — הוחזר מלא</span>
          </div>
        </div>
      </div>
    </>
  );
}
