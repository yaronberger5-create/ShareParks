'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// ─── Register with phone OTP ────────────────────────────────
interface RegisterParams {
  fullName: string;
  phone: string;
  isOwner: boolean;
}

export async function registerWithPhone(params: RegisterParams) {
  const supabase = await createSupabaseServer();

  // Format phone to international
  const phone = params.phone.startsWith('+')
    ? params.phone
    : `+972${params.phone.replace(/^0/, '')}`;

  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      data: {
        full_name: params.fullName,
        phone_number: phone,
        is_owner: params.isOwner,
      },
    },
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const, phone };
}

// ─── Verify OTP ─────────────────────────────────────────────
export async function verifyOtp(phone: string, token: string) {
  const supabase = await createSupabaseServer();

  const formattedPhone = phone.startsWith('+')
    ? phone
    : `+972${phone.replace(/^0/, '')}`;

  const { error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });

  if (error) {
    return { success: false as const, error: 'קוד שגוי. נסה שנית.' };
  }

  return { success: true as const };
}

// ─── Login with phone ───────────────────────────────────────
export async function loginWithPhone(phone: string) {
  const supabase = await createSupabaseServer();

  const formattedPhone = phone.startsWith('+')
    ? phone
    : `+972${phone.replace(/^0/, '')}`;

  const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

  if (error) {
    return { success: false as const, error: error.message };
  }

  return { success: true as const, phone: formattedPhone };
}

// ─── Logout ─────────────────────────────────────────────────
export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect('/login');
}

// ─── Get current user profile ───────────────────────────────
export async function getCurrentUser() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
