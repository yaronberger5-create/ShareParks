'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const OVERTIME_RATE = 1.5; // 150% of normal rate per overtime hour

// ─── End parking session ────────────────────────────────────
interface EndSessionResult {
  success: boolean;
  error?: string;
  summary?: {
    bookingId: string;
    basePrice: number;
    overtimeMinutes: number;
    overtimeCharge: number;
    finalPrice: number;
  };
}

export async function endParkingSession(bookingId: string): Promise<EndSessionResult> {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'לא מחובר' };

  // Get the active booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, parking_id, renter_id, start_timestamp, end_timestamp, total_price, status')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: 'ההזמנה לא נמצאה' };
  }

  if (booking.status !== 'active') {
    return { success: false, error: 'ההזמנה לא פעילה' };
  }

  // Only renter or parking owner can end
  const { data: parking } = await supabase
    .from('parkings')
    .select('owner_id, price_per_hour')
    .eq('id', booking.parking_id)
    .single();

  if (!parking) {
    return { success: false, error: 'החניה לא נמצאה' };
  }

  const isRenter = booking.renter_id === user.id;
  const isOwner = parking.owner_id === user.id;
  if (!isRenter && !isOwner) {
    return { success: false, error: 'אין הרשאה לסיים את ההזמנה' };
  }

  // Calculate actual duration and overtime
  const now = new Date();
  const bookedEnd = new Date(booking.end_timestamp);
  const bookedStart = new Date(booking.start_timestamp);

  let overtimeMinutes = 0;
  let overtimeCharge = 0;

  if (now > bookedEnd) {
    // Overstayed — calculate overtime
    overtimeMinutes = Math.ceil((now.getTime() - bookedEnd.getTime()) / 60000);
    const overtimeHours = overtimeMinutes / 60;
    overtimeCharge = Math.round(
      Number(parking.price_per_hour) * OVERTIME_RATE * overtimeHours * 100
    ) / 100;
  }

  const finalPrice = Math.round((Number(booking.total_price) + overtimeCharge) * 100) / 100;

  // Update booking
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      actual_end_timestamp: now.toISOString(),
      overtime_minutes: overtimeMinutes,
      overtime_charge: overtimeCharge,
      final_price: finalPrice,
    })
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, error: 'שגיאה בסיום ההזמנה' };
  }

  // Notify owner about completion (with earnings)
  await supabase.from('notifications').insert({
    user_id: parking.owner_id,
    type: 'booking_completed',
    title: overtimeMinutes > 0 ? 'חניה הסתיימה (עם חריגה)' : 'חניה הסתיימה',
    body: overtimeMinutes > 0
      ? `רווח: ${finalPrice} ש"ח (כולל ${overtimeCharge} ש"ח overtime על ${overtimeMinutes} דקות חריגה)`
      : `רווח: ${finalPrice} ש"ח`,
    data: {
      booking_id: bookingId,
      parking_id: booking.parking_id,
      final_price: finalPrice,
      overtime_minutes: overtimeMinutes,
      overtime_charge: overtimeCharge,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/my-bookings');

  return {
    success: true,
    summary: {
      bookingId,
      basePrice: Number(booking.total_price),
      overtimeMinutes,
      overtimeCharge,
      finalPrice,
    },
  };
}

// ─── Get active session for renter ──────────────────────────
export async function getActiveSession() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id,
      parking_id,
      start_timestamp,
      end_timestamp,
      total_price,
      status,
      parkings!bookings_parking_id_fkey ( address, city, price_per_hour, owner_id )
    `)
    .eq('renter_id', user.id)
    .eq('status', 'active')
    .is('actual_end_timestamp', null)
    .order('start_timestamp', { ascending: false })
    .limit(1)
    .single();

  if (!booking) {
    return { success: true as const, session: null };
  }

  const parkingData = booking.parkings as unknown as {
    address: string;
    city: string;
    price_per_hour: number;
    owner_id: string;
  };

  return {
    success: true as const,
    session: {
      bookingId: booking.id,
      parkingId: booking.parking_id,
      parkingAddress: parkingData.address,
      parkingCity: parkingData.city,
      pricePerHour: Number(parkingData.price_per_hour),
      startTime: booking.start_timestamp,
      endTime: booking.end_timestamp,
      totalPrice: Number(booking.total_price),
    },
  };
}

// ─── "I'm Home Early" — owner side ─────────────────────────
interface ComingHomeResult {
  success: boolean;
  error?: string;
  hasActiveBooking?: boolean;
  renterInfo?: {
    name: string;
    phone: string | null;
    bookingEnd: string;
  };
}

export async function comingHomeEarly(parkingId: string): Promise<ComingHomeResult> {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'לא מחובר' };

  // Verify ownership
  const { data: parking } = await supabase
    .from('parkings')
    .select('id, owner_id')
    .eq('id', parkingId)
    .eq('owner_id', user.id)
    .single();

  if (!parking) return { success: false, error: 'החניה לא נמצאה' };

  // Check for active bookings
  const now = new Date().toISOString();
  const { data: activeBooking } = await supabase
    .from('bookings')
    .select(`
      id,
      end_timestamp,
      renter_id,
      profiles!bookings_renter_id_fkey ( full_name, phone_number )
    `)
    .eq('parking_id', parkingId)
    .in('status', ['active', 'pending'])
    .lt('start_timestamp', now)
    .gt('end_timestamp', now)
    .limit(1)
    .single();

  if (activeBooking) {
    const renter = activeBooking.profiles as unknown as {
      full_name: string;
      phone_number: string | null;
    };

    // Notify renter that owner is coming home early
    await supabase.from('notifications').insert({
      user_id: activeBooking.renter_id,
      type: 'system',
      title: 'בעל החניה חוזר מוקדם',
      body: 'בעל החניה הודיע שהוא בדרך הביתה. אנא פנה את החניה בהקדם.',
      data: { booking_id: activeBooking.id, parking_id: parkingId },
    });

    return {
      success: true,
      hasActiveBooking: true,
      renterInfo: {
        name: renter.full_name,
        phone: renter.phone_number,
        bookingEnd: activeBooking.end_timestamp,
      },
    };
  }

  // No active booking — deactivate parking
  await supabase
    .from('parkings')
    .update({ is_active: false })
    .eq('id', parkingId);

  revalidatePath('/dashboard');

  return {
    success: true,
    hasActiveBooking: false,
  };
}
