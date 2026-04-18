'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { MapPin, Car, ArrowLeft, Shield, Zap, Banknote } from 'lucide-react';

interface HomeClientProps {
  isLoggedIn: boolean;
  isOwner: boolean;
}

export function HomeClient({ isLoggedIn, isOwner }: HomeClientProps) {
  return (
    <div dir="rtl" className="min-h-dvh bg-white flex flex-col">
      {/* ─── Hero ─── */}
      <section className="bg-black relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 right-10 w-40 h-40 rounded-full border-[20px] border-orange-500" />
          <div className="absolute bottom-5 left-20 w-24 h-24 rounded-full border-[12px] border-orange-500" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border-[16px] border-white" />
        </div>

        <div className="relative max-w-lg mx-auto px-6 pt-14 pb-12">
          {/* Logo */}
          <div className="mb-12">
            <Logo size="lg" variant="light" />
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
            החניה שלך פנויה?
            <br />
            <span className="text-orange-500">תן לה לעבוד בשבילך.</span>
          </h1>

          <p className="text-gray-400 text-base mb-10 max-w-xs">
            מצא חניה פנויה ברגע או השכר את שלך וצור הכנסה פסיבית.
          </p>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href={isLoggedIn ? '/search' : '/register'}
              className="
                w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black
                shadow-xl shadow-orange-500/30
                flex items-center justify-center gap-3
                transition-all active:scale-[0.97] hover:bg-orange-600
              "
            >
              <MapPin size={22} />
              <span>אני צריך חניה</span>
            </Link>

            <Link
              href={isLoggedIn ? (isOwner ? '/dashboard' : '/add-parking') : '/register'}
              className="
                w-full py-4 rounded-2xl bg-transparent text-white text-lg font-black
                border-2 border-orange-500
                flex items-center justify-center gap-3
                transition-all active:scale-[0.97] hover:bg-orange-500/10
              "
            >
              <Car size={22} />
              <span>יש לי חניה</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-6 py-12">
        <div className="max-w-lg mx-auto space-y-8">
          <h2 className="text-xl font-black text-black text-center mb-8">
            למה <span className="text-orange-500">ShareParks</span>?
          </h2>

          <div className="grid gap-5">
            <FeatureCard
              icon={<Zap size={24} className="text-orange-500" />}
              title="מהיר"
              desc="מצא חניה ב-30 שניות. חיפוש GPS, סינון לפי שעות, הזמנה בלחיצה."
            />
            <FeatureCard
              icon={<Shield size={24} className="text-orange-500" />}
              title="בטוח"
              desc="אבטחה ברמת הבנק. תשלום מאובטח, ביטוח נזקים, ודיווח מיידי."
            />
            <FeatureCard
              icon={<Banknote size={24} className="text-orange-500" />}
              title="משתלם"
              desc='הרווח מהחניה הריקה שלך. ממוצע של 1,200 ש"ח בחודש לבעלי חניות.'
            />
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="bg-gray-50 px-6 py-12 border-t border-gray-100">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-black text-black text-center mb-8">איך זה עובד?</h2>

          <div className="space-y-6">
            <Step num={1} title="חפש" desc="פתח את המפה, בחר שעות, וראה חניות זמינות באזור שלך." />
            <Step num={2} title="הזמן" desc="לחץ על חניה, ראה מחיר ומרחק, ואשר בלחיצה אחת." />
            <Step num={3} title="חנה" desc="קבל הוראות כניסה, פתח את השער מהנייד, וחנה בביטחון." />
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-black text-white px-6 py-8">
        <div className="max-w-lg mx-auto text-center">
          <Logo size="sm" variant="light" />
          <p className="text-gray-500 text-xs mt-4">
            © {new Date().getFullYear()} ShareParks.com — כל הזכויות שמורות
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-orange-500 transition-colors">תנאי שימוש</Link>
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">פרטיות</Link>
            <Link href="/contact" className="hover:text-orange-500 transition-colors">צור קשר</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start bg-white rounded-2xl border border-gray-100 p-5">
      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-black text-base mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Step({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-lg shrink-0">
        {num}
      </div>
      <div>
        <h3 className="font-bold text-black text-base mb-0.5">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
