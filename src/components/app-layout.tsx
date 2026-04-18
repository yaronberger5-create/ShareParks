'use client';

import { Logo } from './logo';
import { BottomNav } from './bottom-nav';
import Link from 'next/link';

interface AppLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  isOwner?: boolean;
  showHeader?: boolean;
}

export function AppLayout({
  children,
  showNav = true,
  isOwner = false,
  showHeader = false,
}: AppLayoutProps) {
  return (
    <div dir="rtl" className="min-h-dvh bg-white flex flex-col">
      {showHeader && (
        <header className="bg-black px-5 py-3">
          <div className="max-w-2xl mx-auto">
            <Link href="/">
              <Logo size="sm" variant="light" />
            </Link>
          </div>
        </header>
      )}

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-4 px-5 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} ShareParks.com — חניה שיתופית חכמה
        </p>
      </footer>

      {showNav && <BottomNav isOwner={isOwner} />}
    </div>
  );
}
