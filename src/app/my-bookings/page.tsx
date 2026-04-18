import { redirect } from 'next/navigation';
import { getMyBookings } from '@/actions/my-bookings-actions';
import { MyBookingsClient } from './my-bookings-client';

export default async function MyBookingsPage() {
  const result = await getMyBookings();

  if (!result.success) {
    redirect('/login');
  }

  return <MyBookingsClient bookings={result.bookings} />;
}
