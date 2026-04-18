'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Receipt, Wallet, Settings, LayoutDashboard } from 'lucide-react';

interface BottomNavProps {
  isOwner: boolean;
}

export function BottomNav({ isOwner }: BottomNavProps) {
  const pathname = usePathname();

  const renterLinks = [
    { href: '/', label: 'מפה', icon: Map },
    { href: '/my-bookings', label: 'הזמנות', icon: Receipt },
    { href: '/wallet', label: 'ארנק', icon: Wallet },
  ];

  const ownerLinks = [
    { href: '/dashboard', label: 'דשבורד', icon: LayoutDashboard },
    { href: '/wallet', label: 'ארנק', icon: Wallet },
    { href: '/', label: 'מפה', icon: Map },
  ];

  const links = isOwner ? ownerLinks : renterLinks;

  return (
    <nav dir="rtl" className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl
                transition-all active:scale-90
                ${isActive
                  ? 'text-orange-500'
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
