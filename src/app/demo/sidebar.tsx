'use client';

import { useState } from 'react';
import Link from 'next/link';

export function SideBarWithButton({ role }: { role: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating hamburger button — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-3.5 right-3 z-50 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-base text-white active:scale-90 transition-transform"
      >
        ☰
      </button>

      {/* Sidebar overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-gray-800/40" onClick={() => setIsOpen(false)} />
          <div dir="rtl" className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 px-5 py-6">
              <div className="flex items-center justify-between mb-3">
                <Link href="/demo" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                    <span className="text-sm font-black text-white">P</span>
                  </div>
                  <span className="text-xl font-black">
                    <span className="text-white">Share</span>
                    <span className="text-orange-500">Parks</span>
                  </span>
                </Link>
                <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 text-lg p-1">✕</button>
              </div>
              <p className="text-gray-400 text-xs">שלום, ירון 👋</p>
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase px-3 mb-2">ניווט</p>
              <SideLink href="/demo" icon="🏠" label="דף הבית" onClick={() => setIsOpen(false)} />

              {(role === 'renter' || role === 'none') && (
                <>
                  <SideLink href="/demo?r=renter&s=locate" icon="📍" label="חפש חניה" onClick={() => setIsOpen(false)} />
                  <SideLink href="/demo?r=renter&s=map" icon="🗺️" label="חניות קרובות" onClick={() => setIsOpen(false)} />
                  <SideLink href="/demo?r=renter&s=bookings" icon="📑" label="ההזמנות שלי" onClick={() => setIsOpen(false)} />
                  <SideLink href="/demo?r=renter&s=verify-driver" icon="🛡️" label="אימות נהג" onClick={() => setIsOpen(false)} />
                  <SideLink href="/demo?r=renter&s=evacuate" icon="🚨" label="דמו פינוי חירום" onClick={() => setIsOpen(false)} />
                </>
              )}

              {(role === 'owner' || role === 'none') && (
                <>
                  <SideLink href="/demo?r=owner&s=dashboard" icon="📊" label="דשבורד" onClick={() => setIsOpen(false)} />
                  <SideLink href="/demo?r=owner&s=onboard" icon="➕" label="הוסף חניה" onClick={() => setIsOpen(false)} />
                  <SideLink href="/demo?r=owner&s=wallet" icon="💰" label="ארנק" onClick={() => setIsOpen(false)} />
                </>
              )}

              <div className="border-t border-gray-100 my-3" />
              <p className="text-[10px] font-bold text-gray-400 uppercase px-3 mb-2">מידע</p>
              <SideLink href="/demo?s=terms" icon="📋" label="תקנון" onClick={() => setIsOpen(false)} />
              <SideLink href="/demo?s=terms" icon="🔒" label="מדיניות פרטיות" onClick={() => setIsOpen(false)} />
              <SideLink href="/demo?s=terms" icon="⚖️" label="תנאי שימוש" onClick={() => setIsOpen(false)} />
              <SideLink href="/demo?s=terms" icon="🛡️" label="ביטוח ואחריות" onClick={() => setIsOpen(false)} />
              <SideLink href="/demo?s=terms" icon="❓" label="שאלות נפוצות" onClick={() => setIsOpen(false)} />
              <SideLink href="/demo?s=terms" icon="📞" label="צור קשר" onClick={() => setIsOpen(false)} />

              <div className="border-t border-gray-100 my-3" />
              <p className="text-[10px] font-bold text-gray-400 uppercase px-3 mb-2">חשבון</p>
              <SideLink href="/demo" icon="👤" label="הפרופיל שלי" onClick={() => setIsOpen(false)} />
              <SideLink href="/demo" icon="⚙️" label="הגדרות" onClick={() => setIsOpen(false)} />
              <SideLink href="/demo" icon="🚪" label="התנתק" onClick={() => setIsOpen(false)} />
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center">ShareParks v1.0 · © 2026</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function SideLink({ href, icon, label, onClick }: { href: string; icon: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 active:bg-orange-100 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
