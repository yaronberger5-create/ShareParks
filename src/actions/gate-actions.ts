'use server';

import { createSupabaseServer } from '@/lib/supabase/server';

interface GateAccess {
  access: boolean;
  reason?: string;
  role?: 'owner' | 'renter';
  gateType?: 'manual' | 'phone_dial' | 'api_integration';
  gatePhoneNumber?: string;
  entryInstructions?: string;
  gateApiProvider?: string;
  bookingId?: string;
  bookingEnds?: string;
  startsAt?: string;
}

export async function getGateAccess(parkingId: string): Promise<GateAccess> {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { access: false, reason: 'not_authenticated' };

  const { data, error } = await supabase.rpc('get_gate_access', {
    p_parking_id: parkingId,
    p_user_id: user.id,
  });

  if (error || !data) return { access: false, reason: 'error' };

  const result = data as Record<string, unknown>;

  return {
    access: result.access as boolean,
    reason: result.reason as string | undefined,
    role: result.role as 'owner' | 'renter' | undefined,
    gateType: result.gate_type as GateAccess['gateType'],
    gatePhoneNumber: result.gate_phone_number as string | undefined,
    entryInstructions: result.entry_instructions as string | undefined,
    gateApiProvider: result.gate_api_provider as string | undefined,
    bookingId: result.booking_id as string | undefined,
    bookingEnds: result.booking_ends as string | undefined,
    startsAt: result.starts_at as string | undefined,
  };
}

// Log gate access attempt
export async function logGateAccess(params: {
  parkingId: string;
  bookingId?: string;
  method: string;
  success: boolean;
}) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('gate_access_log').insert({
    parking_id: params.parkingId,
    user_id: user.id,
    booking_id: params.bookingId ?? null,
    method: params.method,
    success: params.success,
  });
}
