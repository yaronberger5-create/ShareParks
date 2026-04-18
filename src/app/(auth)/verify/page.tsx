'use client';

import { Suspense, useState, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyOtp } from '@/actions/auth-actions';
import { ShieldCheck } from 'lucide-react';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') ?? '';
  const isNew = searchParams.get('new') === 'true';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      handleSubmit(fullCode);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      handleSubmit(pasted);
    }
  }

  function handleSubmit(fullCode: string) {
    setError(null);
    startTransition(async () => {
      const result = await verifyOtp(phone, fullCode);
      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    });
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto">
          <ShieldCheck size={32} className="text-orange-500" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-black mb-2">אימות טלפון</h1>
          <p className="text-sm text-gray-500">
            שלחנו קוד בן 6 ספרות ל-
            <span dir="ltr" className="font-bold text-black">{phone}</span>
          </p>
        </div>

        {/* OTP input */}
        <div dir="ltr" className="flex justify-center gap-2" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-12 h-14 rounded-xl border-2 text-center text-2xl font-black
                transition-all outline-none
                ${digit
                  ? 'border-orange-400 bg-orange-50 text-black'
                  : 'border-gray-200 bg-gray-50 text-gray-300'
                }
                focus:border-orange-500 focus:ring-2 focus:ring-orange-100
              `}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
        )}

        {isPending && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <span>מאמת...</span>
          </div>
        )}
      </div>
    </div>
  );
}
