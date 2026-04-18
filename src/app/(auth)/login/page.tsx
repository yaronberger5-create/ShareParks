'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError(null);
    setIsPending(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsPending(false);

    if (authError) {
      setError('אימייל או סיסמה שגויים');
    } else {
      window.location.href = '/demo';
    }
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-white flex flex-col">
      <div className="bg-gray-800 px-6 pt-16 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="mb-6">
            <Logo size="lg" variant="light" />
          </div>
          <p className="text-gray-400">חניה שיתופית חכמה</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-5">
          <div>
            <h2 className="text-xl font-bold text-black mb-1">התחברות</h2>
            <p className="text-sm text-gray-500">הזן אימייל וסיסמה</p>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-500 block mb-2">אימייל</span>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                dir="ltr"
                className="flex-1 bg-transparent outline-none text-base text-black placeholder:text-gray-300"
                autoFocus
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-500 block mb-2">סיסמה</span>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="flex-1 bg-transparent outline-none text-base text-black placeholder:text-gray-300"
              />
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !email.trim() || !password.trim()}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black shadow-xl shadow-orange-200 transition-all active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
          >
            {isPending ? 'מתחבר...' : 'התחבר'}
          </button>

          <p className="text-center text-sm text-gray-400">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-orange-500 font-bold hover:underline">
              הרשמה
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
