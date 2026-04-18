'use server';

import { createSupabaseServer } from '@/lib/supabase/server';

export async function getNotifications() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { success: false as const, error: 'שגיאה בטעינת התראות' };

  const unreadCount = (notifications ?? []).filter((n) => !n.is_read).length;

  return {
    success: true as const,
    notifications: notifications ?? [],
    unreadCount,
  };
}

export async function markAllAsRead() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  const { error } = await supabase.rpc('mark_notifications_read', {
    p_user_id: user.id,
  });

  if (error) return { success: false as const, error: 'שגיאה בעדכון' };
  return { success: true as const };
}

export async function markOneAsRead(notificationId: string) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: 'לא מחובר' };

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  return { success: true as const };
}
