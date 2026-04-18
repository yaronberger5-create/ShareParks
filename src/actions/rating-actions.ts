'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface SubmitRatingParams {
  bookingId: string;
  score: number; // 1-5
  comment?: string;
}

export async function submitRating(params: SubmitRatingParams) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  if (params.score < 1 || params.score > 5) {
    return { success: false as const, error: 'דירוג חייב להיות בין 1 ל-5' };
  }

  // Get booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, parking_id, renter_id, status')
    .eq('id', params.bookingId)
    .eq('status', 'completed')
    .single();

  if (!booking) {
    return { success: false as const, error: 'ניתן לדרג רק הזמנות שהושלמו' };
  }

  // Get parking owner
  const { data: parking } = await supabase
    .from('parkings')
    .select('owner_id')
    .eq('id', booking.parking_id)
    .single();

  if (!parking) return { success: false as const, error: 'חניה לא נמצאה' };

  const isRenter = booking.renter_id === user.id;
  const isOwner = parking.owner_id === user.id;

  if (!isRenter && !isOwner) {
    return { success: false as const, error: 'אין הרשאה לדרג הזמנה זו' };
  }

  const raterRole = isRenter ? 'renter' : 'owner';
  const ratedId = isRenter ? parking.owner_id : booking.renter_id;

  // Check if already rated
  const { data: existing } = await supabase
    .from('ratings')
    .select('id')
    .eq('booking_id', params.bookingId)
    .eq('rater_role', raterRole)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false as const, error: 'כבר דירגת הזמנה זו' };
  }

  const { error } = await supabase.from('ratings').insert({
    booking_id: params.bookingId,
    rater_id: user.id,
    rated_id: ratedId,
    parking_id: booking.parking_id,
    score: params.score,
    comment: params.comment ?? null,
    rater_role: raterRole,
  });

  if (error) return { success: false as const, error: 'שגיאה בשמירת הדירוג' };

  revalidatePath('/my-bookings');
  revalidatePath('/dashboard');

  return { success: true as const };
}

// Get ratings for a parking
export async function getParkingRatings(parkingId: string) {
  const supabase = await createSupabaseServer();

  const { data: ratings } = await supabase
    .from('ratings')
    .select(`
      id, score, comment, rater_role, created_at,
      profiles!ratings_rater_id_fkey ( full_name )
    `)
    .eq('parking_id', parkingId)
    .eq('rater_role', 'renter')
    .order('created_at', { ascending: false })
    .limit(10);

  return ratings ?? [];
}
