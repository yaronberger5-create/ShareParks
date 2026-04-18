'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Toggle parking active/inactive ─────────────────────────
export async function toggleParkingStatus(parkingId: string, isActive: boolean) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { error } = await supabase
    .from('parkings')
    .update({ is_active: isActive })
    .eq('id', parkingId)
    .eq('owner_id', user.id);

  if (error) return { success: false as const, error: 'שגיאה בעדכון סטטוס' };

  revalidatePath('/dashboard');
  return { success: true as const };
}

// ─── Add availability slot ──────────────────────────────────
interface AddSlotParams {
  parkingId: string;
  dayOfWeek: number;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  isRecurring: boolean;
}

export async function addAvailabilitySlot(params: AddSlotParams) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  // Verify ownership
  const { data: parking } = await supabase
    .from('parkings')
    .select('id')
    .eq('id', params.parkingId)
    .eq('owner_id', user.id)
    .single();

  if (!parking) return { success: false as const, error: 'החניה לא נמצאה' };

  const { error } = await supabase
    .from('availability_slots')
    .insert({
      parking_id: params.parkingId,
      day_of_week: params.dayOfWeek,
      start_time: params.startTime + ':00',
      end_time: params.endTime + ':00',
      is_recurring: params.isRecurring,
    });

  if (error) return { success: false as const, error: 'שגיאה בהוספת משבצת' };

  revalidatePath('/dashboard');
  return { success: true as const };
}

// ─── Remove availability slot ───────────────────────────────
export async function removeAvailabilitySlot(slotId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { error } = await supabase
    .from('availability_slots')
    .delete()
    .eq('id', slotId);

  if (error) return { success: false as const, error: 'שגיאה במחיקת משבצת' };

  revalidatePath('/dashboard');
  return { success: true as const };
}

// ─── Get owner dashboard data ───────────────────────────────
export async function getOwnerDashboard() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  // Get owner's parking (for MVP — one parking per owner)
  const { data: parking } = await supabase
    .from('parkings')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .single();

  if (!parking) return { success: false as const, error: 'לא נמצאה חניה' };

  // Availability slots
  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('parking_id', parking.id)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  // Active & upcoming bookings
  const now = new Date().toISOString();
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      start_timestamp,
      end_timestamp,
      total_price,
      status,
      renter_id,
      profiles!bookings_renter_id_fkey ( full_name, phone_number )
    `)
    .eq('parking_id', parking.id)
    .in('status', ['pending', 'active'])
    .gte('end_timestamp', now)
    .order('start_timestamp', { ascending: true });

  // Earnings this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: monthBookings } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('parking_id', parking.id)
    .eq('status', 'completed')
    .gte('end_timestamp', monthStart.toISOString());

  const monthlyEarnings = (monthBookings ?? []).reduce(
    (sum, b) => sum + Number(b.total_price), 0
  );

  // Total earnings all time
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('total_price')
    .eq('parking_id', parking.id)
    .eq('status', 'completed');

  const totalEarnings = (allBookings ?? []).reduce(
    (sum, b) => sum + Number(b.total_price), 0
  );

  return {
    success: true as const,
    parking,
    slots: slots ?? [],
    bookings: (bookings ?? []).map((b) => ({
      ...b,
      renter: (b.profiles as unknown as { full_name: string; phone_number: string | null }) ?? null,
    })),
    monthlyEarnings,
    totalEarnings,
  };
}
