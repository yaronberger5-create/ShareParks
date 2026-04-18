'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreateParkingParams {
  address: string;
  city: string;
  lat: number;
  lng: number;
  description?: string;
  pricePerHour: number;
  entryInstructions?: string;
  gateType: 'manual' | 'phone_dial' | 'api_integration';
  gatePhoneNumber?: string;
}

export async function createParking(params: CreateParkingParams) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  // Mark user as owner if not already
  await supabase
    .from('profiles')
    .update({ is_owner: true })
    .eq('id', user.id);

  // Create the parking spot
  // coordinates as PostGIS geography point
  const { data, error } = await supabase
    .from('parkings')
    .insert({
      owner_id: user.id,
      address: params.address,
      city: params.city,
      // PostGIS point: SRID 4326 (WGS84)
      coordinates: `SRID=4326;POINT(${params.lng} ${params.lat})`,
      description: params.description ?? null,
      price_per_hour: params.pricePerHour,
      entry_instructions: params.entryInstructions ?? null,
      gate_type: params.gateType,
      gate_phone_number: params.gatePhoneNumber ?? null,
      is_active: true,
    } as Record<string, unknown>)
    .select('id')
    .single();

  if (error) {
    return { success: false as const, error: 'שגיאה ביצירת חניה: ' + error.message };
  }

  revalidatePath('/dashboard');

  return { success: true as const, parkingId: data.id };
}
