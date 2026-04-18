'use server';

import { createSupabaseServer } from '@/lib/supabase/server';

interface CreateBookingParams {
  parkingId: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

type BookingResult =
  | { success: true; bookingId: string; totalPrice: number }
  | { success: false; error: string };

export async function createBooking(params: CreateBookingParams): Promise<BookingResult> {
  const { parkingId, startTime, endTime } = params;

  const supabase = await createSupabaseServer();

  // 1. Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'יש להתחבר כדי להזמין חניה' };
  }

  // 2. Validate time range
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (start >= end) {
    return { success: false, error: 'שעת סיום חייבת להיות אחרי שעת התחלה' };
  }
  if (start < new Date()) {
    return { success: false, error: 'לא ניתן להזמין חניה בעבר' };
  }

  // 3. Get parking details + verify it exists and is active
  const { data: parking, error: parkingError } = await supabase
    .from('parkings')
    .select('id, owner_id, price_per_hour')
    .eq('id', parkingId)
    .eq('is_active', true)
    .single();

  if (parkingError || !parking) {
    return { success: false, error: 'החניה לא נמצאה או לא פעילה' };
  }

  // 4. Prevent owner from booking their own parking
  if (parking.owner_id === user.id) {
    return { success: false, error: 'לא ניתן להזמין חניה שבבעלותך' };
  }

  // 5. Check availability slot exists for this time
  const requestedDayOfWeek = start.getDay();
  const requestedStartTime = start.toTimeString().slice(0, 8);
  const requestedEndTime = end.toTimeString().slice(0, 8);

  const { data: slots, error: slotsError } = await supabase
    .from('availability_slots')
    .select('id')
    .eq('parking_id', parkingId)
    .eq('day_of_week', requestedDayOfWeek)
    .lte('start_time', requestedStartTime)
    .gte('end_time', requestedEndTime)
    .limit(1);

  if (slotsError || !slots || slots.length === 0) {
    return { success: false, error: 'החניה לא זמינה בשעות המבוקשות' };
  }

  // 6. Final conflict check — critical race condition prevention
  //    Must be the LAST check before insert
  const { data: conflicts, error: conflictError } = await supabase
    .from('bookings')
    .select('id')
    .eq('parking_id', parkingId)
    .in('status', ['pending', 'active'])
    .lt('start_timestamp', endTime)
    .gt('end_timestamp', startTime)
    .limit(1);

  if (conflictError) {
    return { success: false, error: 'שגיאה בבדיקת זמינות' };
  }
  if (conflicts && conflicts.length > 0) {
    return { success: false, error: 'החניה כבר הוזמנה בשעות אלה. נסה שעות אחרות.' };
  }

  // 7. Calculate total price
  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  const totalPrice = Math.round(Number(parking.price_per_hour) * durationHours * 100) / 100;

  // 8. Insert the booking
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      parking_id: parkingId,
      renter_id: user.id,
      start_timestamp: startTime,
      end_timestamp: endTime,
      total_price: totalPrice,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !booking) {
    return { success: false, error: 'שגיאה ביצירת ההזמנה' };
  }

  return {
    success: true,
    bookingId: booking.id,
    totalPrice,
  };
}
