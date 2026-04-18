// Types for Parking Sharing App — ShareParks
// NOTE: Supabase client is used without generic type param,
// so these types are for reference and manual casting only.

export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type NotificationType = 'booking_new' | 'booking_cancelled' | 'booking_completed' | 'payout' | 'system';

export interface Profile {
  id: string;
  full_name: string;
  phone_number: string | null;
  is_owner: boolean;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  avg_rating: number;
  rating_count: number;
  created_at: string;
}

export interface Parking {
  id: string;
  owner_id: string;
  address: string;
  city: string;
  coordinates: unknown; // PostGIS geography
  description: string | null;
  images: string[];
  price_per_hour: number;
  is_active: boolean;
  entry_instructions: string | null;
  gate_type: 'manual' | 'phone_dial' | 'api_integration';
  gate_phone_number: string | null;
  gate_api_provider: string | null;
  gate_api_key: string | null;
  gate_api_data: unknown;
  avg_rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  id: string;
  parking_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  parking_id: string;
  renter_id: string;
  start_timestamp: string;
  end_timestamp: string;
  total_price: number;
  final_price: number | null;
  overtime_minutes: number;
  overtime_charge: number;
  actual_end_timestamp: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface Rating {
  id: string;
  booking_id: string;
  rater_id: string;
  rated_id: string;
  parking_id: string;
  score: number;
  comment: string | null;
  rater_role: 'renter' | 'owner';
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  booking_id: string | null;
  type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}
