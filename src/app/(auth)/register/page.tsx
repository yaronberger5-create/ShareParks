'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) return;
    if (password.length < 6) { setError('סיסמה חייבת להיות לפחות 6 תווים'); return; }

    setError(null);
    setIsPending(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          is_owner: isOwner,
        },
      },
    });

    setIsPending(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/demo';
      }, 1500);
    }
  }

  if (success) {
    return (
      <div dir="rtl" className="min-h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-4xl">✅</div>
        <h2 className="text-2xl font-black text-black mb-2">נרשמת בהצלחה!</h2>
        <p className="text-gray-500">מעביר אותך לדף הבית...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-white flex flex-col">
      <div className="bg-gray-800 px-6 pt-16 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="mb-6">
            <Logo size="lg" variant="light" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">הרשמה</h1>
          <p className="text-gray-400">צור חשבון חדש ב-ShareParks</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-gray-500 block mb-2">שם מלא</span>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ישראל ישראלי"
                className="flex-1 bg-transparent outline-none text-base text-black placeholder:text-gray-300"
                autoFocus
              />
            </div>
          </label>

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
                placeholder="לפחות 6 תווים"
                dir="ltr"
                className="flex-1 bg-transparent outline-none text-base text-black placeholder:text-gray-300"
              />
            </div>
          </label>

          <div>
            <span className="text-sm font-medium text-gray-500 block mb-2">מה אתה מחפש?</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsOwner(false)}
                className={`py-4 rounded-xl text-center font-bold transition-all ${!isOwner ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-50 border border-gray-200 text-gray-500'}`}
              >
                <span className="text-2xl block mb-1">🚗</span>
                <span className="text-sm">מחפש חניה</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOwner(true)}
                className={`py-4 rounded-xl text-center font-bold transition-all ${isOwner ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-50 border border-gray-200 text-gray-500'}`}
              >
                <span className="text-2xl block mb-1">🅿️</span>
                <span className="text-sm">משכיר חניה</span>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !fullName.trim() || !email.trim() || !password.trim()}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black shadow-xl shadow-orange-200 transition-all active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
          >
            {isPending ? 'נרשם...' : 'הרשמה'}
          </button>

          <p className="text-center text-sm text-gray-400">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-orange-500 font-bold hover:underline">
              התחברות
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
