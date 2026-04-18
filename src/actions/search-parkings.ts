'use server';

import { createSupabaseServer } from '@/lib/supabase/server';

interface SearchParams {
  userLat: number;
  userLng: number;
  radiusMeters?: number;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

interface AvailableParking {
  id: string;
  owner_id: string;
  address: string;
  city: string;
  description: string | null;
  images: string[];
  price_per_hour: number;
  distance_meters: number;
}

type SearchResult =
  | { success: true; data: AvailableParking[] }
  | { success: false; error: string };

export async function getAvailableParkings(params: SearchParams): Promise<SearchResult> {
  const { userLat, userLng, radiusMeters = 1000, startTime, endTime } = params;

  const supabase = await createSupabaseServer();

  // 1. Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'יש להתחבר כדי לחפש חניות' };
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

  // 3. Find nearby parkings via PostGIS RPC
  const { data: nearbyParkings, error: rpcError } = await supabase
    .rpc('search_parkings', {
      user_lat: userLat,
      user_lng: userLng,
      radius_meters: radiusMeters,
    });

  if (rpcError) {
    return { success: false, error: 'שגיאה בחיפוש חניות קרובות' };
  }
  if (!nearbyParkings || nearbyParkings.length === 0) {
    return { success: true, data: [] };
  }

  const parkingIds = nearbyParkings.map((p: { id: string }) => p.id);

  // 4. Filter by availability slots —
  //    check that parking has a slot covering the requested time window
  const requestedDayOfWeek = start.getDay(); // 0=Sunday
  const requestedStartTime = start.toTimeString().slice(0, 8); // HH:MM:SS
  const requestedEndTime = end.toTimeString().slice(0, 8);

  const { data: availableSlots, error: slotsError } = await supabase
    .from('availability_slots')
    .select('parking_id')
    .in('parking_id', parkingIds)
    .eq('day_of_week', requestedDayOfWeek)
    .lte('start_time', requestedStartTime)
    .gte('end_time', requestedEndTime);

  if (slotsError) {
    return { success: false, error: 'שגיאה בבדיקת זמינות' };
  }

  const availableParkingIds = new Set(
    (availableSlots ?? []).map((s) => s.parking_id)
  );

  // 5. Filter out parkings with conflicting bookings
  //    A booking conflicts if it overlaps the requested [start, end) range
  //    and its status is 'pending' or 'active'
  const { data: conflictingBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('parking_id')
    .in('parking_id', parkingIds)
    .in('status', ['pending', 'active'])
    .lt('start_timestamp', endTime)   // booking starts before our end
    .gt('end_timestamp', startTime);  // booking ends after our start

  if (bookingsError) {
    return { success: false, error: 'שגיאה בבדיקת הזמנות קיימות' };
  }

  const bookedParkingIds = new Set(
    (conflictingBookings ?? []).map((b) => b.parking_id)
  );

  // 6. Combine filters: must have availability slot AND no conflicting booking
  const result = nearbyParkings.filter(
    (p: { id: string }) => availableParkingIds.has(p.id) && !bookedParkingIds.has(p.id)
  );

  return { success: true, data: result };
}
