'use client';

import { useState } from 'react';
import { StatusToggle } from '@/components/dashboard/status-toggle';
import { EarningsSummary } from '@/components/dashboard/earnings-summary';
import { AvailabilityManager } from '@/components/dashboard/availability-manager';
import { BookingsList } from '@/components/dashboard/bookings-list';
import { NotificationBell } from '@/components/dashboard/notification-bell';
import { ComingHomeEarly } from '@/components/dashboard/coming-home-early';
import { Logo } from '@/components/logo';
import type { Parking, AvailabilitySlot } from '@/types/database';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface DashboardClientProps {
  parking: Parking;
  slots: AvailabilitySlot[];
  bookings: Array<{
    id: string;
    start_timestamp: string;
    end_timestamp: string;
    total_price: number;
    status: string;
    renter: { full_name: string; phone_number: string | null } | null;
  }>;
  monthlyEarnings: number;
  totalEarnings: number;
  notifications: Notification[];
  unreadCount: number;
}

export function DashboardClient({
  parking: initialParking,
  slots,
  bookings,
  monthlyEarnings,
  totalEarnings,
  notifications,
  unreadCount,
}: DashboardClientProps) {
  const [isActive, setIsActive] = useState(initialParking.is_active);

  const activeBookings = bookings.filter(
    (b) => b.status === 'active' || b.status === 'pending'
  );

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white px-5 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo size="sm" variant="light" />
          <NotificationBell
            initialCount={unreadCount}
            initialNotifications={notifications}
          />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Status toggle */}
        <StatusToggle
          parkingId={initialParking.id}
          isActive={isActive}
          address={initialParking.address}
          onToggle={setIsActive}
        />

        {/* Earnings */}
        <EarningsSummary
          monthlyEarnings={monthlyEarnings}
          totalEarnings={totalEarnings}
          activeBookingsCount={activeBookings.length}
        />

        {/* Bookings */}
        <BookingsList bookings={bookings} />

        {/* Availability */}
        <AvailabilityManager parkingId={initialParking.id} slots={slots} />

        {/* Coming home early */}
        <ComingHomeEarly
          parkingId={initialParking.id}
          onDeactivated={() => setIsActive(false)}
        />
      </main>

      {/* Bottom safe area spacer for mobile */}
      <div className="h-8" />
    </div>
  );
}
