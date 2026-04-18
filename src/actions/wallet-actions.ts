'use server';

import { createSupabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ─── Get wallet data ────────────────────────────────────────
export async function getWallet() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('balance, total_earned, total_withdrawn')
    .eq('id', user.id)
    .single();

  if (!profile) return { success: false as const, error: 'פרופיל לא נמצא' };

  // Recent transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Pending withdrawals
  const { data: pendingWithdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false });

  return {
    success: true as const,
    balance: Number(profile.balance),
    totalEarned: Number(profile.total_earned),
    totalWithdrawn: Number(profile.total_withdrawn),
    transactions: transactions ?? [],
    pendingWithdrawals: pendingWithdrawals ?? [],
  };
}

// ─── Request withdrawal ─────────────────────────────────────
interface WithdrawParams {
  amount: number;
  bankCode: string;
  branchNumber: string;
  accountNumber: string;
}

export async function requestWithdrawal(params: WithdrawParams) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { data: result, error } = await supabase.rpc('request_withdrawal', {
    p_user_id: user.id,
    p_amount: params.amount,
    p_bank_details: {
      bank_code: params.bankCode,
      branch: params.branchNumber,
      account_number: params.accountNumber,
    },
  });

  if (error) return { success: false as const, error: 'שגיאה בבקשת המשיכה' };

  const res = result as { success: boolean; error?: string; new_balance?: number };
  if (!res.success) {
    return { success: false as const, error: res.error ?? 'שגיאה' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/wallet');

  return {
    success: true as const,
    newBalance: res.new_balance,
  };
}

// ─── Get entry instructions (secure) ────────────────────────
export async function getEntryInstructions(parkingId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  // Check access via DB function
  const { data: hasAccess } = await supabase
    .rpc('can_see_entry_instructions', {
      p_parking_id: parkingId,
      p_user_id: user.id,
    });

  if (!hasAccess) {
    return { success: false as const, error: 'אין הרשאה לצפות בהוראות כניסה' };
  }

  const { data: parking } = await supabase
    .from('parkings')
    .select('entry_instructions, gate_type')
    .eq('id', parkingId)
    .single();

  if (!parking) return { success: false as const, error: 'חניה לא נמצאה' };

  return {
    success: true as const,
    entryInstructions: parking.entry_instructions,
    gateType: parking.gate_type,
  };
}
