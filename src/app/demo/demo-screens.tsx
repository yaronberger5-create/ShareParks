'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

function useUserName() {
  const [name, setName] = useState('');
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      if (meta?.full_name) setName(meta.full_name);
    });
  }, []);
  return name || 'משתמש';
}

type ScreenType = 'renter-home' | 'owner-home' | 'bookings' | 'wallet' | 'terms';

export function DemoScreens({ screen }: { screen: ScreenType }) {
  switch (screen) {
    case 'renter-home': return <RenterHome />;
    case 'owner-home': return <OwnerHome />;
    case 'bookings': return <Bookings />;
    case 'wallet': return <Wallet />;
    case 'terms': return <Terms />;
  }
}

function RenterHome() {
  const userName = useUserName();
  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
          <span className="text-base font-black text-white">{userName.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-black">שלום, {userName} 👋</h1>
          <p className="text-xs text-gray-400">מחפש חניה? בוא נמצא לך.</p>
        </div>
      </div>
      {/* Search bar */}
      <a href="/demo?r=renter&s=verify-driver" className="block w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4 active:bg-gray-100 transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <p className="text-base font-bold text-gray-400">לאן נוסעים?</p>
            <p className="text-xs text-gray-300">חפש כתובת, עיר או חניה</p>
          </div>
        </div>
      </a>
      <a href="/demo?r=renter&s=locate" className="block w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200">📍 חפש ליד המיקום שלי</a>
      <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
        <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" /><span className="text-sm font-bold text-green-700">חניה פעילה</span></div>
        <p className="font-bold text-black">אגס 9, אשדוד</p>
        <p className="text-xs text-gray-500 mb-3">עד 17:00 · 45₪</p>
        <a href="/demo?r=renter&s=session" className="block w-full py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold text-center">⏱️ עבור לחניה חיה</a>
      </div>
      <a href="/demo?r=renter&s=verify-driver" className="block bg-orange-50 rounded-2xl border border-orange-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🛡️</div>
          <div className="flex-1"><p className="text-sm font-bold text-orange-700">אמת את החשבון שלך</p><p className="text-xs text-orange-500">אימות חד פעמי כדי להזמין חניה</p></div>
        </div>
      </a>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-black">הזמנות אחרונות</h3>
          <a href="/demo?r=renter&s=bookings" className="text-xs text-orange-500 font-bold">הכל →</a>
        </div>
        {[{ addr: 'הבנקים 3', price: 72, date: 'אתמול' }, { addr: 'רוגוזין 12', price: 40, date: '15/04' }].map((b) => (
          <div key={b.addr} className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 mb-2">
            <div><p className="text-sm font-bold text-black">{b.addr}</p><p className="text-xs text-gray-400">{b.date}</p></div>
            <span className="text-sm font-bold text-black">{b.price}₪ ✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnerHome() {
  const userName = useUserName();
  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center"><span className="text-base font-black text-orange-500">{userName.charAt(0)}</span></div>
        <div><h1 className="text-lg font-black text-black">שלום, {userName} 👋</h1><p className="text-xs text-gray-400">הנה מה שקורה בחניה שלך.</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div><h3 className="font-bold text-black">🅿️ אגס 9, אשדוד</h3><p className="text-xs text-green-600 font-medium">פנויה · מופיעה בחיפוש</p></div>
          <div className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">🟢 פנוי</div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <a href="/demo?r=owner&s=dashboard" className="py-3 rounded-xl bg-green-500 text-white text-sm font-bold text-center shadow-lg shadow-green-200">🟢 פנוי</a>
          <a href="/demo?r=owner&s=dashboard" className="py-3 rounded-xl bg-gray-100 text-gray-400 text-sm font-bold text-center">🔴 סגור</a>
        </div>
        <div className="bg-green-50 rounded-xl px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-xs text-green-700 font-bold">פנויה עד 17:00</span></div>
          <a href="/demo?r=owner&s=dashboard" className="text-[10px] text-green-600 font-bold">שנה</a>
        </div>
      </div>
      <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4">
        <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /><span className="text-sm font-bold text-orange-700">שוכר פעיל</span></div><span className="text-lg font-black text-black">45₪</span></div>
        <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">ד</div><div><p className="font-bold text-black text-sm">דני כהן</p><p className="text-xs text-gray-400">📞 050-1234567 · עד 17:00</p></div></div>
        <a href="/demo?r=owner&s=dashboard" className="block w-full py-2.5 rounded-xl bg-gray-800 text-white text-sm font-bold text-center">💬 שלח הודעה לשוכר</a>
      </div>
      <div className="bg-gray-800 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3"><span className="text-sm text-gray-400">הכנסות החודש</span><a href="/demo?r=owner&s=wallet" className="text-xs text-orange-500 font-bold">ארנק →</a></div>
        <p className="text-3xl font-black">840 <span className="text-sm text-gray-400">ש״ח</span></p>
        <div className="flex gap-4 mt-3 text-xs text-gray-500"><span>12 הזמנות</span><span>★ 4.8 דירוג</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href="/demo?r=owner&s=dashboard" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center"><span className="text-2xl block mb-1">📊</span><span className="text-xs font-bold text-black">דשבורד מלא</span></a>
        <a href="/demo?r=owner&s=wallet" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center"><span className="text-2xl block mb-1">💰</span><span className="text-xs font-bold text-black">ארנק ומשיכות</span></a>
        <a href="/demo?r=owner&s=onboard" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center"><span className="text-2xl block mb-1">➕</span><span className="text-xs font-bold text-black">הוסף חניה</span></a>
        <a href="/demo?r=owner&s=dashboard" className="py-4 rounded-xl bg-gray-50 border border-gray-200 text-center"><span className="text-2xl block mb-1">📅</span><span className="text-xs font-bold text-black">זמינות</span></a>
      </div>
    </div>
  );
}

function Bookings() {
  return (
    <>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <h1 className="text-lg font-bold">🧾 ההזמנות שלי</h1>
        <a href="/demo?r=renter&s=home" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
      </div>
      <div className="px-4 py-6 space-y-3">
        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider">פעילות (1)</h2>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3"><span className="px-2.5 py-1 rounded-full text-xs font-bold text-green-600 bg-green-50 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" /> פעיל</span><span className="text-lg font-black text-black">60 <span className="text-xs text-gray-400">ש״ח</span></span></div>
          <p className="font-bold text-black mb-1">📍 רחוב דיזנגוף 99 <span className="text-xs text-gray-400 font-normal">תל אביב</span></p>
          <p className="text-sm text-gray-500">🕐 יום ד׳ · 14:00 — 18:00</p>
        </div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-6">היסטוריה (2)</h2>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4"><div className="flex items-center justify-between mb-3"><span className="px-2.5 py-1 rounded-full text-xs font-bold text-gray-500 bg-gray-50">✓ הושלם</span><span className="text-lg font-black text-black">45 <span className="text-xs text-gray-400">ש״ח</span></span></div><p className="font-bold text-black mb-1">📍 רחוב אלנבי 42</p><p className="text-sm text-gray-500">🕐 יום ב׳ · 10:00 — 13:00</p></div>
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50"><p className="text-xs text-gray-400 mb-2">דרג את החניה</p><div className="flex gap-0.5 text-xl"><span className="text-orange-500">★★★★</span><span className="text-gray-300">★</span></div></div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4"><div className="flex items-center justify-between mb-3"><span className="px-2.5 py-1 rounded-full text-xs font-bold text-red-500 bg-red-50">✕ בוטל</span><span className="text-lg font-black text-black line-through text-gray-400">30 <span className="text-xs">ש״ח</span></span></div><p className="font-bold text-black mb-1">📍 רחוב בן יהודה 8</p><p className="text-sm text-gray-500">🕐 יום א׳ · 09:00 — 11:00</p><span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-bold">החניה היתה תפוסה — הוחזר מלא</span></div>
        </div>
      </div>
    </>
  );
}

function Wallet() {
  return (
    <>
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <h1 className="text-lg font-bold">💰 ארנק</h1>
        <a href="/demo?r=owner&s=home" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
      </div>
      <div className="px-4 py-6 space-y-5">
        <div className="bg-gray-800 rounded-3xl p-6 text-white">
          <p className="text-sm text-gray-400 mb-1">יתרה זמינה</p>
          <p className="text-4xl font-black mb-6">840 <span className="text-lg text-gray-400">ש״ח</span></p>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-white/10 rounded-xl px-4 py-3"><p className="text-xs text-gray-400 mb-1">📈 סה״כ הכנסות</p><p className="text-lg font-bold">3,240 ש״ח</p></div>
            <div className="bg-white/10 rounded-xl px-4 py-3"><p className="text-xs text-gray-400 mb-1">📤 סה״כ משיכות</p><p className="text-lg font-bold">2,400 ש״ח</p></div>
          </div>
          <div className="w-full py-3.5 rounded-2xl bg-orange-500 text-white text-base font-black text-center shadow-lg shadow-orange-500/30">⬇️ משוך לחשבון הבנק</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-bold text-black">היסטוריית תנועות</h3></div>
          {[
            { type: 'הכנסה', c: 'text-green-600', amount: '+45', desc: 'חניה ברחוב הרצל', d: 'היום' },
            { type: 'עמלה', c: 'text-gray-400', amount: '-4.50', desc: 'עמלת פלטפורמה 10%', d: 'היום' },
            { type: 'הכנסה', c: 'text-green-600', amount: '+60', desc: 'חניה ברחוב הרצל', d: 'אתמול' },
            { type: 'משיכה', c: 'text-black', amount: '-500', desc: 'משיכה לבנק', d: '12/04' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
              <div><div className="flex items-center gap-2"><span className={`text-xs font-bold ${tx.c}`}>{tx.type}</span><span className="text-xs text-gray-300">{tx.d}</span></div><p className="text-sm text-gray-500 mt-0.5">{tx.desc}</p></div>
              <span className={`text-base font-black ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-black'}`}>{tx.amount} ש״ח</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Terms() {
  return (
    <div>
      <div className="bg-gray-800 text-white px-5 py-3 text-center relative">
        <a href="/" className="absolute right-4 top-5 text-gray-400 text-sm">חזרה →</a>
        <a href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
            <span className="text-base font-black text-white">P</span>
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-white">Share</span>
            <span className="text-orange-500">Parks</span>
          </span>
        </a>
        <h1 className="text-lg font-bold">📋 תקנון</h1>
      </div>
      {/* Tab navigation */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 bg-white px-2">
        {['תקנון', 'פרטיות', 'תנאי שימוש', 'ביטוח', 'שאלות', 'צור קשר'].map((t, i) => (
          <a key={t} href={`#section-${i}`} className="px-3 py-2.5 text-xs font-bold whitespace-nowrap text-gray-500 hover:text-orange-500 border-b-2 border-transparent hover:border-orange-500">{t}</a>
        ))}
      </div>

      <div className="px-4 py-5 space-y-6 text-sm text-gray-600 leading-relaxed">

        {/* תקנון */}
        <section id="section-0">
          <h2 className="text-lg font-black text-black mb-3">📋 תקנון ShareParks</h2>
          <p className="text-xs text-gray-400 mb-3">עדכון אחרון: אפריל 2026</p>

          <h3 className="font-bold text-black mt-4 mb-1">1. כללי</h3>
          <p>ברוכים הבאים ל-ShareParks (&quot;החברה&quot;, &quot;אנחנו&quot;). ShareParks היא פלטפורמה טכנולוגית לשיתוף חניות פרטיות, המחברת בין בעלי חניות פנויות (&quot;משכירים&quot;) לבין נהגים המחפשים חניה (&quot;שוכרים&quot;). השימוש בפלטפורמה מהווה הסכמה מלאה לתנאים המפורטים להלן.</p>

          <h3 className="font-bold text-black mt-4 mb-1">2. הגדרות</h3>
          <p><strong>&quot;השירות&quot;</strong> — פלטפורמת ShareParks, לרבות האתר, האפליקציה וכל שירות נלווה.</p>
          <p><strong>&quot;משכיר&quot;</strong> — בעל חניה פרטית המפרסם אותה להשכרה דרך הפלטפורמה.</p>
          <p><strong>&quot;שוכר&quot;</strong> — משתמש רשום המזמין חניה דרך הפלטפורמה.</p>
          <p><strong>&quot;עמלה&quot;</strong> — 10% מסכום ההזמנה, המנוכה מהמשכיר לפני מע&quot;מ.</p>
          <p><strong>&quot;Overtime&quot;</strong> — חריגה מזמן החניה שהוזמן, בתעריף של 150% מהמחיר הרגיל.</p>

          <h3 className="font-bold text-black mt-4 mb-1">3. הרשמה ואימות</h3>
          <p>3.1 ההרשמה לשירות פתוחה לכל אדם מעל גיל 17 בעל רישיון נהיגה בתוקף.</p>
          <p>3.2 שוכרים נדרשים לעבור תהליך אימות הכולל: תעודת זהות, רישיון נהיגה ורישיון רכב.</p>
          <p>3.3 משכירים נדרשים לאמת בעלות או זכות שימוש בחניה המפורסמת.</p>
          <p>3.4 החברה רשאית לסרב לאשר הרשמה או לבטל חשבון ללא הודעה מוקדמת.</p>

          <h3 className="font-bold text-black mt-4 mb-1">4. תשלומים וביטולים</h3>
          <p>4.1 התשלום מבוצע באמצעות כרטיס אשראי מאובטח העומד בתקן PCI DSS.</p>
          <p>4.2 ביטול עד שעה לפני מועד ההזמנה — החזר מלא של 100%.</p>
          <p>4.3 ביטול תוך השעה שלפני ההזמנה — חיוב של 50% מהסכום.</p>
          <p>4.4 דיווח &quot;חניה תפוסה&quot; — ביטול אוטומטי והחזר מלא של 100%.</p>
          <p>4.5 חריגת זמן (Overtime) — חיוב אוטומטי בתעריף של 150% (x1.5) מהמחיר הרגיל.</p>
          <p>4.6 משיכת כספים למשכירים — שלוש פעמים בחודש: ב-10, ב-20 וב-30 לחודש. עמלת פלטפורמה 10% לפני מע&quot;מ.</p>
        </section>

        {/* מדיניות פרטיות */}
        <section id="section-1">
          <h2 className="text-lg font-black text-black mb-3">🔒 מדיניות פרטיות</h2>

          <h3 className="font-bold text-black mt-4 mb-1">1. מידע שאנו אוספים</h3>
          <p>אנו אוספים מידע אישי הנחוץ להפעלת השירות, לרבות: שם מלא, כתובת דואר אלקטרוני, מספר טלפון, מספר רכב, ומסמכי זיהוי לצורך אימות.</p>

          <h3 className="font-bold text-black mt-4 mb-1">2. מיקום (GPS)</h3>
          <p>נתוני מיקום נאספים אך ורק בעת חיפוש חניה פעיל, ואינם נשמרים לאחר סיום החיפוש. המשתמש יכול לבטל את שיתוף המיקום בכל עת דרך הגדרות המכשיר.</p>

          <h3 className="font-bold text-black mt-4 mb-1">3. אחסון ואבטחה</h3>
          <p>המידע מאוחסן בשרתי Supabase המאובטחים (תקן SOC2), הממוקמים באירופה. כל התקשורת מוצפנת בפרוטוקול SSL/TLS. פרטי כרטיסי אשראי לא נשמרים בשרתינו — הם מעובדים ישירות דרך ספק הסליקה.</p>

          <h3 className="font-bold text-black mt-4 mb-1">4. שיתוף מידע</h3>
          <p>איננו מוכרים או משתפים מידע אישי עם צדדים שלישיים, למעט: ספקי שירות הנחוצים להפעלת הפלטפורמה (סליקה, SMS), רשויות חוק על פי צו שיפוטי, ומידע סטטיסטי אנונימי.</p>

          <h3 className="font-bold text-black mt-4 mb-1">5. זכויות המשתמש</h3>
          <p>לכל משתמש הזכות לבקש: עיון במידע השמור אודותיו, תיקון מידע שגוי, מחיקת המידע (&quot;הזכות להישכח&quot;), וייצוא המידע בפורמט דיגיטלי.</p>
        </section>

        {/* תנאי שימוש */}
        <section id="section-2">
          <h2 className="text-lg font-black text-black mb-3">⚖️ תנאי שימוש</h2>

          <h3 className="font-bold text-black mt-4 mb-1">1. התנהגות משתמשים</h3>
          <p>המשתמש מתחייב: למסור פרטים מדויקים ועדכניים, לא להשתמש בשירות לצרכים בלתי חוקיים, לכבד את זמני החניה שהוזמנו, ולשמור על ניקיון ותקינות מקום החניה.</p>

          <h3 className="font-bold text-black mt-4 mb-1">2. אחריות המשכיר</h3>
          <p>המשכיר מתחייב: שהחניה המפורסמת נמצאת בבעלותו או ברשותו החוקית, שפרטי החניה (כתובת, גודל, הוראות כניסה) מדויקים, ושהחניה תהיה זמינה בזמנים שפורסמו.</p>

          <h3 className="font-bold text-black mt-4 mb-1">3. אחריות השוכר</h3>
          <p>השוכר מתחייב: לפנות את החניה בזמן שהוזמן, לא לגרום נזק לחניה או לרכוש הסמוך, ולדווח על כל בעיה דרך מערכת הדיווחים באפליקציה.</p>

          <h3 className="font-bold text-black mt-4 mb-1">4. השעיה וביטול חשבון</h3>
          <p>ShareParks שומרת על הזכות להשעות או לבטל חשבון משתמש במקרים של: 3 דיווחי &quot;חניה תפוסה&quot; או יותר, הפרת תנאי שימוש חוזרת, התנהגות פוגענית כלפי משתמשים אחרים, או חשד להונאה.</p>

          <h3 className="font-bold text-black mt-4 mb-1">5. הגבלת אחריות</h3>
          <p>ShareParks משמשת כפלטפורמת תיווך בלבד ואינה צד לעסקה בין המשכיר לשוכר. החברה אינה אחראית לנזקים ישירים או עקיפים הנובעים משימוש בחניה, למעט כיסוי הביטוח המפורט בסעיף הביטוח.</p>
        </section>

        {/* ביטוח ואחריות */}
        <section id="section-3">
          <h2 className="text-lg font-black text-black mb-3">🛡️ ביטוח ואחריות</h2>

          <h3 className="font-bold text-black mt-4 mb-1">1. כיסוי ביטוחי</h3>
          <p>כל הזמנה דרך ShareParks כוללת כיסוי ביטוחי עד 50,000 ש&quot;ח למקרה ביטוח, הכולל: נזק לרכב השוכר בתוך החניה, נזק לרכוש המשכיר שנגרם על ידי השוכר, וגניבת חפצים מהרכב בתוך שטח החניה (עד 5,000 ש&quot;ח).</p>

          <h3 className="font-bold text-black mt-4 mb-1">2. תהליך דיווח נזק</h3>
          <p>יש לדווח על כל נזק תוך 24 שעות מרגע הגילוי, דרך כפתור &quot;דיווח על בעיה&quot; באפליקציה. הדיווח חייב לכלול: תיאור הנזק, צילומים, ותאריך ושעה משוערים. צוות ShareParks יטפל בתביעה תוך 5 ימי עסקים.</p>

          <h3 className="font-bold text-black mt-4 mb-1">3. חריגים</h3>
          <p>הביטוח אינו מכסה: נזק שנגרם בכוונה, בלאי טבעי, נזק שנגרם מחוץ לשטח החניה, או נזק שלא דווח תוך 24 שעות.</p>
        </section>

        {/* שאלות נפוצות */}
        <section id="section-4">
          <h2 className="text-lg font-black text-black mb-3">❓ שאלות נפוצות</h2>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="font-bold text-black mb-1">איך מוצאים חניה?</p>
              <p>לחצו על &quot;חפש חניה&quot;, אשרו מיקום GPS או הקלידו כתובת, בחרו משך חניה — ותקבלו רשימה של חניות זמינות ממוינות לפי מרחק.</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="font-bold text-black mb-1">כמה זה עולה?</p>
              <p>המחיר נקבע על ידי בעל החניה ומוצג בשקיפות מלאה. אין עלויות נסתרות. שוכרים משלמים את המחיר המוצג, ומשכירים מקבלים 90% (אחרי עמלה).</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="font-bold text-black mb-1">מה קורה אם החניה תפוסה?</p>
              <p>לחצו &quot;דיווח על בעיה&quot; → &quot;החניה תפוסה&quot;. ההזמנה תבוטל אוטומטית ותקבלו החזר מלא של 100% מיידי.</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="font-bold text-black mb-1">איך משכירים חניה?</p>
              <p>לחצו &quot;יש לי חניה להשכרה&quot;, מלאו כתובת, צלמו את החניה, הגדירו מחיר ושעות זמינות — ותתחילו להרוויח. ההרשמה לוקחת 3 דקות.</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="font-bold text-black mb-1">מתי אני מקבל את הכסף?</p>
              <p>משיכת כספים מתבצעת ב-3 מועדים קבועים בחודש: 10, 20 ו-30. הכסף מועבר לחשבון הבנק תוך 1-3 ימי עסקים. עמלה: 10% + מע&quot;מ.</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="font-bold text-black mb-1">מה קורה אם בעל החניה חוזר מוקדם?</p>
              <p>בעל החניה לוחץ &quot;חזרתי הביתה&quot;, אתם מקבלים התראה עם טיימר של 5 דקות לפנות. החיוב מותאם לזמן השימוש בפועל (מינימום 50%).</p>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="font-bold text-black mb-1">האם המידע שלי מאובטח?</p>
              <p>כן. אנו משתמשים בהצפנת SSL, שרתים מאובטחים (SOC2), ולא שומרים פרטי כרטיס אשראי. מסמכי אימות מאוחסנים בצורה מוצפנת.</p>
            </div>
          </div>
        </section>

        {/* צור קשר */}
        <section id="section-5">
          <h2 className="text-lg font-black text-black mb-3">📞 צור קשר</h2>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm text-gray-600">נשמח לעמוד לשירותכם בכל שאלה, בקשה או הצעה. צוות ShareParks זמין עבורכם:</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="text-sm font-bold text-black">דואר אלקטרוני</p>
                  <p className="text-xs text-orange-500">support@shareparks.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <span className="text-xl">📞</span>
                <div>
                  <p className="text-sm font-bold text-black">טלפון</p>
                  <p className="text-xs text-orange-500">*6275 (ShareParks)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <span className="text-xl">💬</span>
                <div>
                  <p className="text-sm font-bold text-black">צ׳אט באפליקציה</p>
                  <p className="text-xs text-gray-400">לחצו על כפתור הצ׳אט (💬) בכל מסך</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
                <span className="text-xl">🕐</span>
                <div>
                  <p className="text-sm font-bold text-black">שעות פעילות</p>
                  <p className="text-xs text-gray-400">ימים א׳-ה׳, 08:00-20:00 · שישי 08:00-13:00</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-2">ShareParks בע&quot;מ · ח.פ. 516XXXXXX · אשדוד, ישראל</p>
          </div>
        </section>

        <a href="/" className="block w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold text-center mt-4">🏠 חזרה לדף הבית</a>
      </div>
    </div>
  );
}
