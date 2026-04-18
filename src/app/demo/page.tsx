'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
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
