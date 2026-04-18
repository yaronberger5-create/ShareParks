'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithPhone } from '@/actions/auth-actions';
import { Phone } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await loginWithPhone(phone);
      if (result.success) {
        router.push(`/verify?phone=${encodeURIComponent(result.phone)}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="bg-black px-6 pt-16 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="mb-6">
            <Logo size="lg" variant="light" />
          </div>
          <p className="text-gray-400">חניה שיתופית חכמה</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-5">
          <div>
            <h2 className="text-xl font-bold text-black mb-1">התחברות</h2>
            <p className="text-sm text-gray-500">הזן את מספר הטלפון שלך ונשלח לך קוד</p>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-gray-500 block mb-2">מספר טלפון</span>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <Phone size={18} className="text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="050-1234567"
                dir="ltr"
                className="flex-1 bg-transparent outline-none text-base text-black placeholder:text-gray-300"
                autoFocus
              />
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !phone.trim()}
            className="
              w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black
              shadow-xl shadow-orange-200 transition-all active:scale-[0.97]
              disabled:opacity-40 disabled:shadow-none
            "
          >
            {isPending ? 'שולח קוד...' : 'שלח קוד'}
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
