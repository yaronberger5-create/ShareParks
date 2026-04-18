'use client';

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
  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
          <span className="text-base font-black text-white">P</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-black">שלום, ירון 👋</h1>
          <p className="text-xs text-gray-400">מחפש חניה? בוא נמצא לך.</p>
        </div>
      </div>
      <a href="/demo?r=renter&s=verify-driver" className="block w-full py-5 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200">📍 חפש חניה ליד המיקום שלי</a>
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
  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center"><span className="text-base font-black text-orange-500">P</span></div>
        <div><h1 className="text-lg font-black text-black">שלום, ירון 👋</h1><p className="text-xs text-gray-400">הנה מה שקורה בחניה שלך.</p></div>
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
      <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-center relative">
        <a href="/demo?s=home" className="absolute right-4 top-3 text-gray-400 text-sm py-1">חזרה →</a>
        <h1 className="text-lg font-bold">📋 תקנון</h1>
      </div>
      <div className="px-4 py-5 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-base font-black text-black">1. הגדרות</h2>
        <p><strong>&quot;השירות&quot;</strong> — פלטפורמת ShareParks. <strong>&quot;משכיר&quot;</strong> — בעל חניה. <strong>&quot;שוכר&quot;</strong> — משתמש המזמין. <strong>&quot;עמלה&quot;</strong> — 10%.</p>
        <h2 className="text-base font-black text-black">2. תשלומים</h2>
        <p>ביטול עד שעה לפני — החזר מלא. חניה תפוסה — החזר אוטומטי. Overtime — x1.5.</p>
        <h2 className="text-base font-black text-black">3. ביטוח</h2>
        <p>ביטוח נזקים עד 50,000 ש&quot;ח. דיווח תוך 24 שעות.</p>
        <h2 className="text-base font-black text-black">4. פרטיות</h2>
        <p>שרתי Supabase (SOC2). GPS רק בחיפוש. כרטיסי אשראי לא נשמרים.</p>
        <h2 className="text-base font-black text-black">5. צור קשר</h2>
        <p>📧 support@shareparks.com · 📞 *6275</p>
        <a href="/demo?s=home" className="block w-full py-3 rounded-xl bg-gray-800 text-white text-sm font-bold text-center mt-4">🏠 חזרה לדף הבית</a>
      </div>
    </div>
  );
}
