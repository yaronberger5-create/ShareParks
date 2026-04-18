'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type IssueType =
  | 'spot_occupied'
  | 'wrong_location'
  | 'wrong_instructions'
  | 'damage'
  | 'no_show'
  | 'renter_overstay'
  | 'trash_left'
  | 'other';

interface SubmitReportParams {
  bookingId: string;
  issueType: IssueType;
  description?: string;
}

export async function submitReport(params: SubmitReportParams) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  // Get booking to identify the other party
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, renter_id, parking_id, status')
    .eq('id', params.bookingId)
    .single();

  if (!booking) return { success: false as const, error: 'ההזמנה לא נמצאה' };

  // Determine who is the reported party
  const { data: parking } = await supabase
    .from('parkings')
    .select('owner_id')
    .eq('id', booking.parking_id)
    .single();

  const isRenter = booking.renter_id === user.id;
  const isOwner = parking?.owner_id === user.id;

  if (!isRenter && !isOwner) {
    return { success: false as const, error: 'אין הרשאה לדווח על הזמנה זו' };
  }

  const reportedId = isRenter ? parking?.owner_id : booking.renter_id;

  const { error } = await supabase
    .from('reports')
    .insert({
      booking_id: params.bookingId,
      reporter_id: user.id,
      reported_id: reportedId ?? null,
      issue_type: params.issueType,
      description: params.description ?? null,
    });

  if (error) return { success: false as const, error: 'שגיאה בשליחת הדיווח' };

  revalidatePath('/my-bookings');
  revalidatePath('/dashboard');

  // spot_occupied auto-resolves via DB trigger
  const autoResolved = params.issueType === 'spot_occupied';

  return {
    success: true as const,
    autoResolved,
    message: autoResolved
      ? 'הדיווח התקבל — ההזמנה בוטלה והחיוב הוחזר אוטומטית.'
      : 'הדיווח נשלח ויטופל בהקדם.',
  };
}
