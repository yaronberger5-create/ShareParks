'use server';

import { createSupabaseServer } from '@/lib/supabase/server';

export async function getMyBookings() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      parking_id,
      start_timestamp,
      end_timestamp,
      total_price,
      final_price,
      overtime_minutes,
      overtime_charge,
      status,
      actual_end_timestamp,
      created_at,
      parkings!bookings_parking_id_fkey ( address, city, price_per_hour )
    `)
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return { success: false as const, error: 'שגיאה בטעינת הזמנות' };

  // Check which bookings already have a rating from this user
  const bookingIds = (bookings ?? []).map((b) => b.id);
  const { data: myRatings } = await supabase
    .from('ratings')
    .select('booking_id')
    .in('booking_id', bookingIds)
    .eq('rater_id', user.id);

  const ratedBookingIds = new Set((myRatings ?? []).map((r) => r.booking_id));

  return {
    success: true as const,
    bookings: (bookings ?? []).map((b) => {
      const parking = b.parkings as unknown as {
        address: string;
        city: string;
        price_per_hour: number;
      };
      return {
        id: b.id,
        parkingId: b.parking_id,
        address: parking.address,
        city: parking.city,
        startTime: b.start_timestamp,
        endTime: b.end_timestamp,
        totalPrice: Number(b.total_price),
        finalPrice: b.final_price ? Number(b.final_price) : null,
        overtimeMinutes: b.overtime_minutes ?? 0,
        overtimeCharge: b.overtime_charge ? Number(b.overtime_charge) : 0,
        status: b.status,
        createdAt: b.created_at,
        alreadyRated: ratedBookingIds.has(b.id),
      };
    }),
  };
}
