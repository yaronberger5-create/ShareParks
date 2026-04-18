'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { OwnerOnboardInteractive } from './owner-onboard-interactive';
import { RenterFlowInteractive } from './renter-flow-interactive';
import { HomeInteractive } from './home-interactive';
import { DashboardInteractive } from './dashboard-interactive';
import { Chatbot } from './chatbot';
import { SideBarWithButton } from './sidebar';
import { DriverVerification } from './driver-verification';
import { DemoScreens } from './demo-screens';
import { EvacuationScreen } from './evacuation-screen';

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <DemoInner />
    </Suspense>
  );
}

function DemoInner() {
  const searchParams = useSearchParams();
  const screen = searchParams.get('s') ?? 'home';
  const role = searchParams.get('r') ?? 'none';

  return (
    <div dir="rtl" className="min-h-dvh bg-gray-100 overscroll-none">
      {/* Top bar — logo only */}
      {role !== 'none' && (
        <nav className="fixed top-0 inset-x-0 z-40 bg-gray-800 px-3 py-3 no-scrollbar">
          <div className="flex items-center justify-center pr-9">
            <a href="/demo" className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <span className="text-base font-black text-white">P</span>
              </div>
              <span className="text-2xl font-black tracking-tight">
                <span className="text-white">Share</span>
                <span className="text-orange-500">Parks</span>
              </span>
            </a>
          </div>
        </nav>
      )}

      {/* Spacer for fixed nav + breathing room */}
      <div className={role === 'none' ? '' : 'h-[78px]'} />

      <div className="max-w-md mx-auto bg-white min-h-[calc(100dvh-78px)] shadow-2xl">
        {/* Home */}
        {screen === 'home' && role === 'none' && <HomeInteractive />}
        {screen === 'home' && role === 'renter' && <DemoScreens screen="renter-home" />}
        {screen === 'home' && role === 'owner' && <DemoScreens screen="owner-home" />}

        {/* Renter */}
        {screen === 'locate' && <RenterFlowInteractive initialStep="locate" />}
        {screen === 'map' && <RenterFlowInteractive initialStep="list" />}
        {screen === 'detail' && <RenterFlowInteractive initialStep="detail" />}
        {screen === 'booking' && <RenterFlowInteractive initialStep="confirm" />}
        {screen === 'session' && <RenterFlowInteractive initialStep="active" />}
        {screen === 'bookings' && <DemoScreens screen="bookings" />}
        {screen === 'verify-driver' && <DriverVerification />}

        {/* Owner */}
        {screen === 'onboard' && <OwnerOnboardInteractive />}
        {screen === 'dashboard' && <DashboardInteractive />}
        {screen === 'wallet' && <DemoScreens screen="wallet" />}

        {/* Evacuation */}
        {screen === 'evacuate' && <EvacuationScreen onConfirm={() => {}} />}

        {/* Account */}
        {screen === 'profile' && <ProfileScreen />}
        {screen === 'settings' && <SettingsScreen />}

        {/* Info */}
        {screen === 'terms' && <DemoScreens screen="terms" />}
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
          <a href="/demo?s=terms" className="text-gray-400">📋 תקנון</a>
          <a href="/demo?s=terms" className="text-gray-400">🔒 פרטיות</a>
          <a href="/demo?s=terms" className="text-gray-400">⚖️ תנאי שימוש</a>
        </div>
        <div className="flex justify-center gap-4 mb-4 text-xs">
          <a href="/demo?s=terms" className="text-gray-500">📞 צור קשר</a>
          <a href="/demo?s=terms" className="text-gray-500">❓ שאלות נפוצות</a>
        </div>
        <p className="text-gray-600 text-xs text-center">© 2026 ShareParks.com — כל הזכויות שמורות</p>
      </footer>

      <Chatbot />
      <SideBarWithButton role={role} />
    </div>
  );
}

function ProfileScreen() {
  const [name, setName] = useState('ירון ברגר');
  const [email, setEmail] = useState('yaronberger5@gmail.com');
  const [phone, setPhone] = useState('050-6445333');
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <a href="/demo" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
        <h1 className="text-lg font-bold">👤 הפרופיל שלי</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-black mb-2">י</div>
          <p className="text-lg font-black text-black">{name}</p>
          <p className="text-xs text-gray-400">חבר מאז אפריל 2026</p>
        </div>

        <label className="block">
          <span className="text-sm text-gray-500 block mb-1">שם מלא</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400" />
        </label>

        <label className="block">
          <span className="text-sm text-gray-500 block mb-1">אימייל</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400" />
        </label>

        <label className="block">
          <span className="text-sm text-gray-500 block mb-1">טלפון</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400" />
        </label>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-lg font-black text-black">15</p>
            <p className="text-[10px] text-gray-400">הזמנות</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-lg font-black text-orange-500">★ 4.8</p>
            <p className="text-[10px] text-gray-400">דירוג</p>
          </div>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 text-center">
            <p className="text-lg font-black text-green-600">✓</p>
            <p className="text-[10px] text-gray-400">מאומת</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform"
        >
          {saved ? '✅ נשמר!' : '💾 שמור שינויים'}
        </button>
      </div>
    </div>
  );
}

function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [gps, setGps] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('he');

  return (
    <div>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <a href="/demo" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
        <h1 className="text-lg font-bold">⚙️ הגדרות</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-bold text-black">🔔 התראות</h3>
          <ToggleSetting label="התראות push" desc="הזמנות, עדכונים, הודעות" value={notifications} onChange={setNotifications} />
          <ToggleSetting label="התראות SMS" desc="שליחת SMS לטלפון" value={false} onChange={() => {}} />
          <ToggleSetting label="התראות מייל" desc="עדכונים למייל" value={true} onChange={() => {}} />
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-bold text-black">🔒 פרטיות</h3>
          <ToggleSetting label="שיתוף מיקום GPS" desc="נדרש לחיפוש חניות" value={gps} onChange={setGps} />
          <ToggleSetting label="הצג פרופיל למשכירים" desc="שם ודירוג" value={true} onChange={() => {}} />
        </div>

        {/* Display */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-bold text-black">🎨 תצוגה</h3>
          <ToggleSetting label="מצב כהה" desc="עיצוב כהה (בקרוב)" value={darkMode} onChange={setDarkMode} />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-black">🌐 שפה</p>
              <p className="text-xs text-gray-400">שפת הממשק</p>
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-gray-50">
              <option value="he">עברית</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-bold text-black">👤 חשבון</h3>
          <a href="/demo?s=profile" className="flex items-center justify-between py-2">
            <span className="text-sm text-black">עריכת פרופיל</span>
            <span className="text-gray-400">←</span>
          </a>
          <a href="/demo?r=renter&s=verify-driver" className="flex items-center justify-between py-2">
            <span className="text-sm text-black">אימות נהג</span>
            <span className="text-gray-400">←</span>
          </a>
          <a href="/demo?s=terms" className="flex items-center justify-between py-2">
            <span className="text-sm text-black">תנאי שימוש</span>
            <span className="text-gray-400">←</span>
          </a>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
          <h3 className="font-bold text-red-600 mb-2">אזור מסוכן</h3>
          <button type="button" className="w-full py-2.5 rounded-xl border border-red-300 text-red-500 text-sm font-bold text-center">🗑️ מחק חשבון</button>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-black">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-12 h-7 rounded-full transition-all ${value ? 'bg-orange-500' : 'bg-gray-200'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all ${value ? 'mr-1' : 'mr-6'}`} />
      </button>
    </div>
  );
}
