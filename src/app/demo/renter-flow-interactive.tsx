'use client';

import { useState } from 'react';
import Link from 'next/link';

const PARKINGS = [
  { id: 'agas9', addr: 'אגס 9', city: 'אשדוד', area: 'רובע ו׳', dist: 20, price: 12, rating: 4.8, reviews: 23, tags: ['מקורה', 'שער חשמלי'], availUntil: '18:00', hours: 4, type: 'hourly' as const },
  { id: 'bank3', addr: 'הבנקים 3', city: 'אשדוד', area: 'סיטי', dist: 180, price: 18, rating: 4.5, reviews: 14, tags: ['מקורה', 'SUV', 'מצלמה'], availUntil: '16:30', hours: 2.5, type: 'hourly' as const },
  { id: 'hadkl5', addr: 'הדקל 5', city: 'אשדוד', area: 'רובע ו׳', dist: 300, price: 0, rating: 4.7, reviews: 11, tags: ['מקורה', 'תת קרקעי', 'שער חשמלי'], availUntil: '24/7', hours: 0, type: 'monthly' as const, monthlyPrice: 350 },
  { id: 'rog12', addr: 'רוגוזין 12', city: 'אשדוד', area: 'מרכז', dist: 450, price: 10, rating: 4.2, reviews: 8, tags: ['פתוחה'], availUntil: '20:00', hours: 5, type: 'hourly' as const },
  { id: 'yeru44', addr: 'שד׳ ירושלים 44', city: 'אשדוד', area: 'רובע ב׳', dist: 800, price: 8, rating: 4.0, reviews: 5, tags: ['פתוחה', 'קל להגיע'], availUntil: '22:00', hours: 8, type: 'hourly' as const },
  { id: 'brit12', addr: 'שד׳ בני ברית 12', city: 'אשדוד', area: 'רובע ג׳', dist: 950, price: 0, rating: 4.6, reviews: 7, tags: ['מקורה', 'SUV', 'מצלמה', 'שער חשמלי'], availUntil: '24/7', hours: 0, type: 'monthly' as const, monthlyPrice: 450 },
  { id: 'herzl7', addr: 'הרצל 7', city: 'אשדוד', area: 'מרכז', dist: 1200, price: 15, rating: 4.9, reviews: 31, tags: ['מקורה', 'SUV', 'שער חשמלי'], availUntil: '17:00', hours: 3, type: 'hourly' as const },
  { id: 'tamar22', addr: 'תמר 22', city: 'אשדוד', area: 'רובע ח׳', dist: 1500, price: 7, rating: 3.8, reviews: 3, tags: ['פתוחה'], availUntil: '21:00', hours: 5, type: 'hourly' as const },
];

type Step = 'locate' | 'list' | 'detail' | 'confirm' | 'success' | 'active';

const CITIES_AND_STREETS = [
  { label: 'אשדוד', type: 'city' },
  { label: 'אשקלון', type: 'city' },
  { label: 'אילת', type: 'city' },
  { label: 'תל אביב', type: 'city' },
  { label: 'ירושלים', type: 'city' },
  { label: 'חיפה', type: 'city' },
  { label: 'באר שבע', type: 'city' },
  { label: 'רמת גן', type: 'city' },
  { label: 'הרצליה', type: 'city' },
  { label: 'נתניה', type: 'city' },
  { label: 'אגס 9, אשדוד', type: 'address' },
  { label: 'אגס 12, אשדוד', type: 'address' },
  { label: 'הבנקים 3, אשדוד', type: 'address' },
  { label: 'רוגוזין 12, אשדוד', type: 'address' },
  { label: 'שד׳ ירושלים 44, אשדוד', type: 'address' },
  { label: 'הרצל 7, אשדוד', type: 'address' },
  { label: 'תמר 22, אשדוד', type: 'address' },
  { label: 'הרצל 15, תל אביב', type: 'address' },
  { label: 'דיזנגוף 99, תל אביב', type: 'address' },
  { label: 'אלנבי 42, תל אביב', type: 'address' },
  { label: 'בן יהודה 8, תל אביב', type: 'address' },
  { label: 'ז׳בוטינסקי 30, רמת גן', type: 'address' },
];

export function RenterFlowInteractive({ initialStep = 'locate' }: { initialStep?: Step }) {
  const [step, setStep] = useState<Step>(initialStep);
  const [duration, setDuration] = useState(4);
  const [selectedId, setSelectedId] = useState<string | null>(initialStep === 'detail' || initialStep === 'confirm' || initialStep === 'active' ? 'agas9' : null);
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(initialStep !== 'locate');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = searchQuery.length > 0
    ? CITIES_AND_STREETS.filter((s) => s.label.includes(searchQuery)).slice(0, 6)
    : [];

  const selected = PARKINGS.find((p) => p.id === selectedId);
  const totalPrice = selected ? selected.price * duration : 0;

  function handleLocate() {
    setLocating(true);
    // Simulate GPS
    setTimeout(() => {
      setLocating(false);
      setLocated(true);
    }, 1500);
  }

  function handleSelectParking(id: string) {
    setSelectedId(id);
    setStep('detail');
  }

  // ─── LOCATE ─────────────────────────────────────────
  if (step === 'locate') {
    return (
      <div className="min-h-[calc(100dvh-44px)] flex flex-col">
        <div className="bg-gray-800 px-6 pt-6 pb-5 flex items-center justify-center relative">
          <a href="/demo?r=renter&s=home" className="absolute right-4 top-6 text-gray-400 text-sm">חזרה →</a>
          <div className="text-center">
            <h1 className="text-xl font-black text-white mb-1">מצא חניה קרובה 📍</h1>
            <p className="text-gray-400 text-sm">נאתר את המיקום שלך ונמצא חניות פנויות</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-5 space-y-4">
          {!located ? (
            <>
              <button
                type="button"
                onClick={handleLocate}
                disabled={locating}
                className="w-full py-5 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform disabled:opacity-70"
              >
                {locating ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    מאתר מיקום...
                  </span>
                ) : '📡 אתר את המיקום שלי'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">או הקלד כתובת / עיר</p>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                  placeholder="🔍 הקלד עיר או רחוב..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full inset-x-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-30 overflow-hidden">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => {
                          setSearchQuery(s.label);
                          setShowSuggestions(false);
                          setLocating(true);
                          setTimeout(() => { setLocating(false); setLocated(true); }, 800);
                        }}
                        className="w-full text-right px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 active:bg-orange-50 transition-colors flex items-center gap-3"
                      >
                        <span className={`text-lg ${s.type === 'city' ? '' : ''}`}>
                          {s.type === 'city' ? '🏙️' : '📍'}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-black">{s.label}</p>
                          <p className="text-[10px] text-gray-400">{s.type === 'city' ? 'עיר' : 'כתובת'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent searches + popular */}
              <div className="mt-4">
                <h4 className="text-sm font-bold text-black mb-2">🕐 חיפושים אחרונים</h4>
                <div className="space-y-1.5">
                  {['אגס 9, אשדוד', 'הרצל 7, אשדוד'].map((s) => (
                    <button key={s} type="button" onClick={() => { setSearchQuery(s); setLocating(true); setTimeout(() => { setLocating(false); setLocated(true); }, 800); }}
                      className="w-full text-right px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600 active:bg-orange-50 flex items-center gap-2">
                      <span>🔄</span><span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-black mb-2">🔥 פופולרי באזורך</h4>
                <div className="flex gap-2 flex-wrap">
                  {['אשדוד', 'תל אביב', 'ירושלים'].map((c) => (
                    <button key={c} type="button" onClick={() => { setSearchQuery(c); setLocating(true); setTimeout(() => { setLocating(false); setLocated(true); }, 800); }}
                      className="px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-bold active:bg-orange-100">
                      🏙️ {c}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Located! */}
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-lg">📍</div>
                  <div>
                    <p className="text-xs text-green-600 font-bold">זיהינו את המיקום שלך</p>
                    <h2 className="text-lg font-black text-black">רחוב אגס, אשדוד</h2>
                  </div>
                </div>
                <p className="text-xs text-green-600">🎯 דיוק: 8 מטר · {PARKINGS.length} חניות נמצאו</p>
              </div>

              {/* Duration */}
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <span className="text-sm text-gray-500 block mb-2">🕐 לכמה זמן?</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 6, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDuration(h)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                        duration === h
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                          : 'bg-white border border-gray-200 text-gray-500'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">{duration} {duration === 1 ? 'שעה' : 'שעות'}</p>
              </div>

              <button
                type="button"
                onClick={() => setStep('list')}
                className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform"
              >
                הצג {PARKINGS.length} חניות קרובות
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── LIST ───────────────────────────────────────────
  if (step === 'list') {
    return (
      <div>
        {/* Header with logo */}
        <div className="bg-gray-800 px-4 pt-3 pb-3 relative">
          <a href="/demo?r=renter&s=locate" className="absolute top-3 right-3 text-gray-400 text-sm">חזרה →</a>
          <p className="text-white text-base font-black text-center mb-1">🗺️ חניות באשדוד</p>
          <p className="text-white/70 text-xs text-center">{duration} שעות · {PARKINGS.length} חניות</p>
        </div>

        {/* Parking map illustration */}
        <div className="px-4 pt-3 pb-2">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-3 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-black">🗺️ מפת חניות</span>
              <div className="flex items-center gap-2.5 text-[9px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" /> פנוי</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> תפוס</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" /> מנוי</span>
              </div>
            </div>

            {/* Street illustration */}
            <div className="bg-gray-300 rounded-lg h-36 relative overflow-hidden">
              {/* Road */}
              <div className="absolute top-[45%] inset-x-0 h-6 bg-gray-400" />
              <div className="absolute top-[48%] inset-x-0 h-0.5 border-t-2 border-dashed border-yellow-300" />

              {/* Street label */}
              <div className="absolute top-[38%] right-2 text-[8px] font-bold text-gray-600 bg-white/70 px-1 py-0.5 rounded">רח׳ אגס</div>

              {/* Your location */}
              <div className="absolute top-[42%] right-[45%] z-20">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>

              {/* Parking spots — top row */}
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="w-8 h-6 rounded bg-green-500 flex items-center justify-center text-[7px] text-white font-bold">P</div>
                <div className="w-8 h-6 rounded bg-blue-500 flex items-center justify-center text-[7px] text-white font-bold">M</div>
                <div className="w-8 h-6 rounded bg-red-400 flex items-center justify-center text-[7px] text-white font-bold">🚗</div>
                <div className="w-8 h-6 rounded bg-green-500 flex items-center justify-center text-[7px] text-white font-bold">P</div>
                <div className="w-8 h-6 rounded bg-red-400 flex items-center justify-center text-[7px] text-white font-bold">🚗</div>
              </div>

              {/* Parking spots — bottom row */}
              <div className="absolute bottom-2 right-2 flex gap-1">
                <div className="w-8 h-6 rounded bg-red-400 flex items-center justify-center text-[7px] text-white font-bold">🚗</div>
                <div className="w-8 h-6 rounded bg-green-500 flex items-center justify-center text-[7px] text-white font-bold">P</div>
                <div className="w-8 h-6 rounded bg-blue-500 flex items-center justify-center text-[7px] text-white font-bold">M</div>
                <div className="w-8 h-6 rounded bg-red-400 flex items-center justify-center text-[7px] text-white font-bold">🚗</div>
                <div className="w-8 h-6 rounded bg-green-500 flex items-center justify-center text-[7px] text-white font-bold">P</div>
              </div>

              {/* Building */}
              <div className="absolute bottom-2 left-2 w-16 h-14 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                <span className="text-[7px] text-gray-400">🏢 בניין</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-3 mt-2 text-[10px]">
              <span className="text-green-600 font-bold">5 פנויות</span>
              <span className="text-gray-300">·</span>
              <span className="text-red-500 font-bold">3 תפוסות</span>
              <span className="text-gray-300">·</span>
              <span className="text-blue-600 font-bold">2 מנויים</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-black">{PARKINGS.length} חניות</span>
            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{PARKINGS.filter(p => p.type === 'hourly').length} שעתי</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{PARKINGS.filter(p => p.type === 'monthly').length} מנוי</span>
          </div>
          <span className="text-xs text-gray-400">מרחק ↑</span>
        </div>
        <div className="px-4 py-3 space-y-3">
          {PARKINGS.map((p) => {
            const dist = p.dist < 1000 ? `${p.dist} מ׳` : `${(p.dist / 1000).toFixed(1)} ק״מ`;
            const isMonthly = p.type === 'monthly';
            const mp = 'monthlyPrice' in p ? (p as { monthlyPrice: number }).monthlyPrice : 0;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectParking(p.id)}
                className={`block w-full text-right rounded-2xl overflow-hidden active:scale-[0.98] transition-transform ${
                  isMonthly ? 'bg-blue-50 border-2 border-blue-300' : 'bg-white border border-gray-200'
                }`}
              >
                {/* Monthly badge */}
                {isMonthly && (
                  <div className="bg-blue-500 text-white px-4 py-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold">🔵 מנוי חודשי</span>
                    <span className="text-xs font-bold">24/7 גישה</span>
                  </div>
                )}

                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isMonthly ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <span className={`text-xs font-bold ${isMonthly ? 'text-blue-600' : 'text-green-600'}`}>
                      {isMonthly ? 'זמין למנוי' : `פנוי עד ${p.availUntil}`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{dist}</span>
                </div>
                <div className="px-4 pb-1">
                  <h3 className="text-lg font-black text-black">{p.addr}</h3>
                  <p className="text-xs text-gray-400">{p.area}</p>
                </div>
                <div className="px-4 py-1 flex gap-1.5 flex-wrap">
                  {p.tags.map((t) => (
                    <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      isMonthly ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-500 border border-gray-100'
                    }`}>{t}</span>
                  ))}
                  {isMonthly && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">מנוי</span>
                  )}
                </div>
                <div className={`px-4 py-3 border-t flex items-center justify-between ${
                  isMonthly ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center gap-2">
                    {isMonthly ? (
                      <>
                        <span className="text-xl font-black text-blue-600">{mp}₪<span className="text-xs text-blue-400">/חודש</span></span>
                        <span className="text-xs text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">~{Math.round(mp / 30)}₪/יום</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-black text-black">{p.price}₪<span className="text-xs text-gray-400">/שעה</span></span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">~{p.price * duration}₪ ל-{duration} שעות</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500 text-sm">★</span>
                    <span className="text-sm font-bold">{p.rating}</span>
                    <span className="text-[10px] text-gray-400">({p.reviews})</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── DETAIL ─────────────────────────────────────────
  if (step === 'detail' && selected) {
    return (
      <div>
        <div className="bg-gray-200 h-40 flex items-center justify-center relative">
          <span className="text-4xl">🏘️</span>
          <button type="button" onClick={() => setStep('list')} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-800/40 text-white flex items-center justify-center text-lg">→</button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h1 className="text-2xl font-black text-white">{selected.addr}</h1>
            <p className="text-white/70 text-sm">{selected.city} · {selected.dist < 1000 ? `${selected.dist} מ׳` : `${(selected.dist / 1000).toFixed(1)} ק״מ`}</p>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Status */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-base font-black text-green-700">פנוי עכשיו</span>
            </div>
            <p className="text-sm text-green-600">עד {selected.availUntil}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {selected.tags.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">{t}</span>
            ))}
          </div>

          {/* Price calc */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">מחיר לשעה</span>
              <span className="text-2xl font-black text-black">{selected.price} ₪</span>
            </div>

            {/* Duration selector */}
            <span className="text-xs text-gray-400 block mb-2">משך חניה</span>
            <div className="flex gap-1.5 mb-3">
              {[1, 2, 3, 4, 6, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDuration(h)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                    duration === h ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-500'
                  }`}
                >
                  {h}שע׳
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">{duration} שעות × {selected.price}₪</span>
              <span className="text-xl font-black text-orange-500">{totalPrice} ₪</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-orange-500">{'★'.repeat(Math.round(selected.rating))}</span>
            <span className="text-sm font-bold">{selected.rating}</span>
            <span className="text-xs text-gray-400">({selected.reviews} ביקורות)</span>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => setStep('confirm')}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform"
          >
            הזמן · {totalPrice} ₪
          </button>
          <Link href="/demo?r=renter&s=home" className="block w-full py-2 text-sm text-gray-300 text-center mt-2">🏠 חזרה לדף הבית</Link>
        </div>
      </div>
    );
  }

  // ─── CONFIRM ────────────────────────────────────────
  if (step === 'confirm' && selected) {
    return (
      <div className="px-4 py-5 space-y-4">
        <h2 className="text-xl font-black text-black text-center">אישור הזמנה</h2>

        {/* Summary card */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">📍 חניה</span><span className="font-bold text-black">{selected.addr}, {selected.city}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">🕐 משך</span><span className="font-bold text-black">{duration} שעות</span></div>
          <div className="flex justify-between"><span className="text-gray-500">💰 מחיר</span><span className="font-bold text-black">{selected.price}₪/שעה</span></div>
          <div className="flex justify-between"><span className="text-gray-500">⭐ דירוג</span><span className="font-bold text-black">{selected.rating} ({selected.reviews})</span></div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-bold text-black">סה״כ לתשלום</span>
            <span className="text-2xl font-black text-orange-500">{totalPrice} ₪</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-black mb-3">💳 אמצעי תשלום</h3>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xl">💳</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-black">Visa ****4567</p>
              <p className="text-[10px] text-gray-400">12/28</p>
            </div>
            <span className="text-xs text-orange-500 font-bold">שנה</span>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-green-50 rounded-xl border border-green-200 px-4 py-3 text-xs text-green-700 space-y-1">
          <p>✓ ביטול חינם עד שעה לפני</p>
          <p>✓ ביטוח נזקים כלול</p>
          <p>✓ החזר מלא אם החניה תפוסה</p>
        </div>

        <button
          type="button"
          onClick={() => setStep('success')}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform"
        >
          ✓ אישור ותשלום · {totalPrice} ₪
        </button>
        <button type="button" onClick={() => setStep('detail')} className="w-full py-2 text-sm text-gray-400 text-center">חזרה → לפרטי חניה</button>
        <Link href="/demo?r=renter&s=home" className="block w-full py-2 text-sm text-gray-300 text-center">🏠 חזרה לדף הבית</Link>
      </div>
    );
  }

  // ─── SUCCESS ────────────────────────────────────────
  if (step === 'success' && selected) {
    return (
      <div className="min-h-[calc(100dvh-44px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-4xl">✅</div>
        <h2 className="text-2xl font-black text-black mb-2">ההזמנה אושרה!</h2>
        <p className="text-gray-500 mb-1">{selected.addr}, {selected.city}</p>
        <p className="text-sm text-gray-400 mb-6">{duration} שעות · {totalPrice} ₪</p>

        <div className="w-full max-w-sm bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-4 text-right">
          <p className="text-xs text-gray-400 mb-1">🔑 הוראות כניסה</p>
          <p className="text-sm text-black font-medium">קוד 1234, כניסה מימין, חניה מספר 7</p>
        </div>

        <button
          type="button"
          onClick={() => setStep('active')}
          className="w-full max-w-sm py-4 rounded-2xl bg-gray-800 text-white text-lg font-black text-center mb-3 active:scale-[0.97] transition-transform"
        >
          🧭 נווט לחניה
        </button>
        <button
          type="button"
          onClick={() => setStep('active')}
          className="w-full max-w-sm py-3 rounded-2xl bg-orange-500 text-white text-base font-bold text-center shadow-lg shadow-orange-200 active:scale-[0.97] transition-transform mb-3"
        >
          📞 פתח שער
        </button>
        <Link href="/demo?r=renter&s=home" className="text-sm text-gray-300">🏠 חזרה לדף הבית</Link>
      </div>
    );
  }

  // ─── ACTIVE SESSION ─────────────────────────────────
  if (step === 'active' && selected) {
    return (
      <div className="px-4 py-5 space-y-4">
        {/* Header with address */}
        <div className="bg-gray-800 rounded-2xl px-5 py-4 text-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-400">📍 חניה פעילה</span>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-black">{selected.addr}, {selected.city}</h2>
          <p className="text-xs text-gray-500 mt-1">{selected.tags.join(' · ')}</p>
        </div>

        {/* Timer */}
        <div className="text-center py-4">
          <p className="text-xs font-medium text-gray-400 mb-1">זמן שנותר</p>
          <p className="text-6xl font-black tabular-nums text-black">{duration - 1}:42:18</p>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
          <span className="text-sm text-gray-500">עלות</span>
          <span className="text-lg font-black text-black">{totalPrice} ₪</span>
        </div>

        {/* Gate */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-orange-500">🚪</span>
            <span className="font-bold text-black text-sm">פתיחת שער</span>
          </div>
          <div className="p-4">
            <div className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200">
              📞 פתח שער
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 text-base font-bold text-center">🧭 נווט</div>
          <button type="button" onClick={() => setStep('locate')} className="py-3.5 rounded-2xl bg-orange-500 text-white text-base font-bold text-center shadow-lg shadow-orange-200">סיים חניה</button>
        </div>

        {/* Report + Home */}
        <div className="w-full py-2.5 rounded-2xl border-2 border-gray-200 text-orange-500 text-sm font-bold text-center">🛡️ דיווח על בעיה</div>
        <Link href="/demo?r=renter&s=home" className="block w-full py-2 text-sm text-gray-300 text-center">🏠 חזרה לדף הבית</Link>
      </div>
    );
  }

  return null;
}
