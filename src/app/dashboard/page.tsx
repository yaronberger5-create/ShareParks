import { redirect } from 'next/navigation';
import { getOwnerDashboard } from '@/actions/owner-actions';
import { getNotifications } from '@/actions/notification-actions';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const [result, notifResult] = await Promise.all([
    getOwnerDashboard(),
    getNotifications(),
  ]);

  if (!result.success) {
    redirect('/login');
  }

  return (
    <DashboardClient
      parking={result.parking}
      slots={result.slots}
      bookings={result.bookings}
      monthlyEarnings={result.monthlyEarnings}
      totalEarnings={result.totalEarnings}
      notifications={notifResult.success ? notifResult.notifications : []}
      unreadCount={notifResult.success ? notifResult.unreadCount : 0}
    />
  );
}
