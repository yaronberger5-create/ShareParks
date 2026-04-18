'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type GateType = 'code' | 'phone' | 'palgate';
type ParkingType = 'covered' | 'underground' | 'open';
type ParkingSize = 'regular' | 'suv';
type AvailMode = 'schedule' | 'manual' | 'gps';

const CITIES = [
  'אשדוד', 'אשקלון', 'אילת', 'תל אביב', 'ירושלים', 'חיפה',
  'באר שבע', 'רמת גן', 'הרצליה', 'נתניה', 'פתח תקווה', 'ראשון לציון',
  'חולון', 'בת ים', 'רחובות', 'כפר סבא', 'רעננה', 'מודיעין',
];

const STREETS: Record<string, string[]> = {
  'אשדוד': ['אגס', 'הבנקים', 'רוגוזין', 'שד׳ ירושלים', 'הרצל', 'תמר', 'האורן', 'הדקל', 'הזית', 'התאנה', 'הרימון', 'שד׳ בני ברית'],
  'תל אביב': ['הרצל', 'דיזנגוף', 'אלנבי', 'בן יהודה', 'רוטשילד', 'אבן גבירול', 'קינג ג׳ורג׳', 'בוגרשוב', 'פרישמן'],
  'ירושלים': ['יפו', 'בן יהודה', 'הלל', 'שמאי', 'אגריפס', 'עמק רפאים'],
  'חיפה': ['הנביאים', 'הרצל', 'בן גוריון', 'מוריה', 'שד׳ הציונות'],
  'באר שבע': ['הרצל', 'קרן קיימת', 'שד׳ רגר', 'דרך חברון'],
  'רמת גן': ['ז׳בוטינסקי', 'ביאליק', 'הרצל', 'אבא הלל'],
  'הרצליה': ['סוקולוב', 'בן גוריון', 'הנשיא'],
  'אשקלון': ['הרצל', 'שד׳ בן גוריון', 'התקווה'],
};

interface DaySlot {
  active: boolean;
  start: string;
  end: string;
}

export function OwnerOnboardInteractive() {
  // Step
  const [step, setStep] = useState(1);

  // Step 1 — Details
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [streetQuery, setStreetQuery] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);
  const [streetNumber, setStreetNumber] = useState('');
  const [parkingType, setParkingType] = useState<ParkingType>('covered');
  const [parkingSize, setParkingSize] = useState<ParkingSize>('regular');
  const [description, setDescription] = useState('');

  // Step 2 — Photos & Gate
  const [photos, setPhotos] = useState<string[]>([]);
  const [gateType, setGateType] = useState<GateType>('code');
  const [gateCode, setGateCode] = useState('');
  const [gatePhone, setGatePhone] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 3 — Pricing & Availability
  const [rentalType, setRentalType] = useState<'hourly' | 'monthly' | 'both'>('hourly');
  const [price, setPrice] = useState('12');
  const [monthlyPrice, setMonthlyPrice] = useState('350');
  const [availMode, setAvailMode] = useState<AvailMode>('schedule');
  const [schedule, setSchedule] = useState<Record<string, DaySlot>>({
    'ראשון': { active: true, start: '08:00', end: '17:00' },
    'שני': { active: true, start: '08:00', end: '17:00' },
    'שלישי': { active: true, start: '08:00', end: '17:00' },
    'רביעי': { active: true, start: '08:00', end: '17:00' },
    'חמישי': { active: true, start: '08:00', end: '17:00' },
    'שישי': { active: true, start: '08:00', end: '13:00' },
    'שבת': { active: false, start: '00:00', end: '23:59' },
  });
  const [isManualFree, setIsManualFree] = useState(false);

  // Done
  const [done, setDone] = useState(false);

  function handlePhoto() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(files[i]);
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleDay(day: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));
  }

  function updateDayTime(day: string, field: 'start' | 'end', value: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  function handleGetLocation() {
    // Demo mode — simulate GPS (real GPS needs HTTPS)
    setCityQuery('אשדוד');
    setCity('אשדוד');
    setStreetQuery('אגס');
    setStreetNumber('9');
    setAddress('אגס 9');
  }

  // Calc earnings
  const priceNum = Number(price) || 0;
  const monthlyPriceNum = Number(monthlyPrice) || 0;
  const weeklyHours = Object.values(schedule).reduce((sum, d) => {
    if (!d.active) return sum;
    const s = d.start.split(':').map(Number);
    const e = d.end.split(':').map(Number);
    return sum + ((e[0] * 60 + e[1]) - (s[0] * 60 + s[1])) / 60;
  }, 0);
  const hourlyMonthlyGross = Math.round(weeklyHours * 4.3 * priceNum);
  const monthlyGross = rentalType === 'monthly' ? monthlyPriceNum : rentalType === 'both' ? hourlyMonthlyGross + monthlyPriceNum : hourlyMonthlyGross;
  const fee = Math.round(monthlyGross * 0.1);
  const monthlyNet = monthlyGross - fee;

  // ─── DONE screen ─────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-[calc(100dvh-44px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-4xl">✅</div>
        <h2 className="text-2xl font-black text-black mb-2">החניה נרשמה!</h2>
        <p className="text-gray-500 mb-2">{address}, {city}</p>
        <p className="text-sm text-gray-400 mb-6">
          {parkingType === 'covered' ? 'מקורה' : parkingType === 'underground' ? 'תת קרקעי' : 'פתוחה'} · {parkingSize === 'suv' ? 'SUV' : 'רגיל'} · {rentalType === 'monthly' ? `${monthlyPriceNum}₪/חודש` : rentalType === 'both' ? `${priceNum}₪/שעה + ${monthlyPriceNum}₪/חודש` : `${priceNum}₪/שעה`}
        </p>
        <div className="bg-orange-50 rounded-2xl border border-orange-200 px-6 py-4 mb-6">
          <p className="text-sm text-orange-600 mb-1">תחזית הכנסה חודשית</p>
          <p className="text-3xl font-black text-black">{monthlyNet.toLocaleString()} ₪</p>
        </div>
        <Link href="/demo?s=dashboard" className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 block mb-3">
          עבור לדשבורד
        </Link>
        <Link href="/demo?s=home" className="text-sm text-gray-400">חזרה לדף הבית</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-44px)] flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 pt-6 pb-5 relative">
        <a href="/demo?r=owner&s=home" className="absolute right-4 top-6 text-gray-400 text-sm">חזרה →</a>
        <h1 className="text-xl font-black text-white mb-1 text-center">הרווח מהחניה שלך 💰</h1>
        <p className="text-gray-400 text-sm text-center">שלב {step} מתוך 3</p>
        {/* Progress bar */}
        <div className="flex gap-1.5 mt-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-orange-500' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-5">

        {/* ═══════════ STEP 1 — Details ═══════════ */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-black text-lg">📍 פרטי החניה</h3>

            {/* Auto-location */}
            <button
              type="button"
              onClick={handleGetLocation}
              className="w-full py-3 rounded-xl bg-gray-100 text-orange-500 text-sm font-bold text-center active:scale-[0.98] transition-transform"
            >
              📡 השתמש במיקום הנוכחי שלי
            </button>

            {/* City — autocomplete */}
            <div className="relative">
              <span className="text-sm text-gray-500 block mb-1">עיר</span>
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => { setCityQuery(e.target.value); setShowCitySuggestions(true); }}
                onFocus={() => { setCityQuery(''); setShowCitySuggestions(true); }}
                placeholder="🔍 הקלד שם עיר..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
              {showCitySuggestions && (
                <div className="absolute top-full inset-x-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-30 overflow-hidden max-h-48 overflow-y-auto">
                  {CITIES.filter((c) => cityQuery.length === 0 || c.includes(cityQuery)).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCity(c); setCityQuery(c); setShowCitySuggestions(false); setStreetQuery(''); setAddress(''); }}
                      className="w-full text-right px-4 py-3 border-b border-gray-50 last:border-0 active:bg-orange-50 flex items-center gap-2"
                    >
                      <span>🏙️</span>
                      <span className="text-sm font-bold text-black">{c}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Street — autocomplete (filtered by city) */}
            <div className="relative">
              <span className="text-sm text-gray-500 block mb-1">רחוב</span>
              <input
                type="text"
                value={streetQuery}
                onChange={(e) => { setStreetQuery(e.target.value); setShowStreetSuggestions(true); }}
                onFocus={() => setShowStreetSuggestions(true)}
                placeholder={city ? `🔍 רחוב ב${city}...` : '🔍 בחר עיר קודם'}
                disabled={!city}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:opacity-50"
              />
              {showStreetSuggestions && city && (STREETS[city] ?? []).length > 0 && (
                <div className="absolute top-full inset-x-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-30 overflow-hidden max-h-48 overflow-y-auto">
                  {(STREETS[city] ?? []).filter((s) => streetQuery.length === 0 || s.includes(streetQuery)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setStreetQuery(s); setShowStreetSuggestions(false); setAddress(s + (streetNumber ? ' ' + streetNumber : '')); }}
                      className="w-full text-right px-4 py-3 border-b border-gray-50 last:border-0 active:bg-orange-50 flex items-center gap-2"
                    >
                      <span>📍</span>
                      <span className="text-sm font-bold text-black">{s}</span>
                      <span className="text-[10px] text-gray-400">{city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Street number */}
            <label className="block">
              <span className="text-sm text-gray-500 block mb-1">מספר בית</span>
              <input
                type="text"
                value={streetNumber}
                onChange={(e) => { setStreetNumber(e.target.value); setAddress(streetQuery + (e.target.value ? ' ' + e.target.value : '')); }}
                placeholder="9"
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </label>

            {/* Selected address preview */}
            {city && streetQuery && (
              <div className="bg-green-50 rounded-xl border border-green-200 px-4 py-3 flex items-center gap-2">
                <span>✅</span>
                <span className="text-sm font-bold text-green-700">{address}{streetNumber ? '' : ''}, {city}</span>
              </div>
            )}

            {/* Type */}
            <div>
              <span className="text-sm text-gray-500 block mb-2">סוג חניה</span>
              <div className="grid grid-cols-3 gap-2">
                {([['covered', '🏠 מקורה'], ['underground', '⬇️ תת קרקעי'], ['open', '☀️ פתוחה']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setParkingType(val)}
                    className={`py-3 rounded-xl text-sm font-bold text-center transition-all active:scale-95 ${
                      parkingType === val
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : 'bg-gray-50 border border-gray-200 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <span className="text-sm text-gray-500 block mb-2">גודל</span>
              <div className="grid grid-cols-2 gap-2">
                {([['regular', '🚗 רגיל'], ['suv', '🚙 SUV / ג׳יפ']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setParkingSize(val)}
                    className={`py-3 rounded-xl text-sm font-bold text-center transition-all active:scale-95 ${
                      parkingSize === val
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : 'bg-gray-50 border border-gray-200 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-sm text-gray-500 block mb-1">תיאור (אופציונלי)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="חניה מקורה ליד הכניסה, קל להגיע..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base resize-none outline-none focus:border-orange-400"
              />
            </label>

            <button
              type="button"
              onClick={() => step < 3 && setStep(2)}
              disabled={!address || !city}
              className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 disabled:opacity-40 disabled:shadow-none active:scale-[0.97] transition-transform"
            >
              המשך →
            </button>
          </div>
        )}

        {/* ═══════════ STEP 2 — Photos & Gate ═══════════ */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-black text-lg">📷 תמונות וכניסה</h3>

            {/* Photos */}
            <div>
              <span className="text-sm text-gray-500 block mb-2">צלם את החניה</span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 border-orange-400">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-gray-800/60 text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handlePhoto}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center shrink-0 text-gray-400 active:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl mb-1">📷</span>
                  <span className="text-[10px]">הוסף תמונה</span>
                </button>
              </div>
              {photos.length > 0 && (
                <p className="text-xs text-green-600 mt-1">✓ {photos.length} תמונות הועלו</p>
              )}
            </div>

            {/* Gate type */}
            <div>
              <span className="text-sm text-gray-500 block mb-2">🚪 סוג כניסה</span>
              <div className="grid grid-cols-3 gap-2">
                {([['code', '🔑 קוד'], ['phone', '📞 חיוג'], ['palgate', '📱 PalGate']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGateType(val)}
                    className={`py-3 rounded-xl text-xs font-bold text-center transition-all active:scale-95 ${
                      gateType === val
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : 'bg-gray-50 border border-gray-200 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {gateType === 'code' && (
              <label className="block">
                <span className="text-sm text-gray-500 block mb-1">הוראות כניסה / קוד</span>
                <textarea
                  value={gateCode}
                  onChange={(e) => setGateCode(e.target.value)}
                  placeholder="קוד 1234, פנה ימינה, חניה מספר 7"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base resize-none outline-none focus:border-orange-400"
                />
              </label>
            )}

            {gateType === 'phone' && (
              <label className="block">
                <span className="text-sm text-gray-500 block mb-1">מספר טלפון של השער</span>
                <input
                  type="tel"
                  value={gatePhone}
                  onChange={(e) => setGatePhone(e.target.value)}
                  placeholder="03-1234567"
                  dir="ltr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400"
                />
              </label>
            )}

            {gateType === 'palgate' && (
              <div className="bg-orange-50 rounded-xl border border-orange-200 px-4 py-3">
                <p className="text-sm text-orange-700">📱 חיבור PalGate ייעשה לאחר ההרשמה דרך ההגדרות.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 text-base font-bold text-center active:scale-95 transition-transform"
              >
                חזרה →
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-[2] py-3 rounded-xl bg-orange-500 text-white text-base font-black text-center shadow-lg shadow-orange-200 active:scale-[0.97] transition-transform"
              >
                המשך →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3 — Pricing & Availability ═══════════ */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-black text-lg">💰 מחיר וזמינות</h3>

            {/* Rental type */}
            <div>
              <span className="text-sm text-gray-500 block mb-2">סוג השכרה</span>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ['hourly', '⏱️ שעתי'],
                  ['monthly', '📅 חודשי'],
                  ['both', '🔄 שניהם'],
                ] as const).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRentalType(val)}
                    className={`py-3 rounded-xl text-xs font-bold text-center transition-all active:scale-95 ${
                      rentalType === val
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                        : 'bg-gray-50 border border-gray-200 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hourly price */}
            {(rentalType === 'hourly' || rentalType === 'both') && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <span className="text-sm text-gray-500 block mb-2">⏱️ מחיר לשעה (ש״ח)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={1}
                    max={100}
                    className="w-24 text-3xl font-black text-black text-center bg-white rounded-xl border border-gray-200 py-2 outline-none focus:border-orange-400"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">מחיר מומלץ באזור</p>
                    <p className="text-sm font-bold text-orange-500">10-15 ₪</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {[8, 10, 12, 15, 20].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrice(String(p))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${
                        price === String(p)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-500'
                      }`}
                  >
                    {p}₪
                  </button>
                ))}
              </div>
            </div>
            )}

            {/* Monthly price */}
            {(rentalType === 'monthly' || rentalType === 'both') && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <span className="text-sm text-gray-500 block mb-2">📅 מחיר חודשי (ש״ח)</span>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    min={100}
                    max={5000}
                    className="w-28 text-3xl font-black text-black text-center bg-white rounded-xl border border-gray-200 py-2 outline-none focus:border-orange-400"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">מחיר מומלץ באזור</p>
                    <p className="text-sm font-bold text-orange-500">300-500 ₪</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {[250, 350, 450, 550, 700].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMonthlyPrice(String(p))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        monthlyPrice === String(p)
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-500'
                      }`}
                    >
                      {p}₪
                    </button>
                  ))}
                </div>
                <div className="mt-3 bg-orange-50 rounded-xl border border-orange-200 px-4 py-3">
                  <p className="text-xs text-orange-700">💡 השכרה חודשית = הכנסה קבועה בלי תלות בשעות. מתאים לחניות שלא בשימוש כלל.</p>
                </div>
              </div>
            )}

            {/* Availability mode */}
            <div>
              <span className="text-sm text-gray-500 block mb-2">📅 איך לנהל זמינות?</span>
              <div className="space-y-2">
                {([
                  ['schedule', '🕐 לוח זמנים קבוע', 'הגדר שעות — המערכת מפרסמת אוטומטי'],
                  ['manual', '👆 פנוי/תפוס ידני', 'לחץ כפתור כשפנוי, לחץ שוב כשחוזר'],
                  ['gps', '📡 זיהוי GPS אוטומטי', 'יצאת מהבית = פנוי, חזרת = תפוס'],
                ] as const).map(([val, label, desc]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAvailMode(val)}
                    className={`w-full text-right rounded-xl p-4 transition-all active:scale-[0.98] ${
                      availMode === val
                        ? 'border-2 border-orange-400 bg-orange-50'
                        : 'border border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        availMode === val ? 'border-orange-500' : 'border-gray-300'
                      }`}>
                        {availMode === val && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                      </div>
                      <span className="text-sm font-black text-black">{label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mr-8 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule editor */}
            {availMode === 'schedule' && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-2">
                {Object.entries(schedule).map(([day, slot]) => (
                  <div key={day} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                        slot.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {slot.active ? '✓' : '—'}
                    </button>
                    <span className="text-sm font-bold text-black w-14">{day}</span>
                    {slot.active ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateDayTime(day, 'start', e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white outline-none"
                        />
                        <span className="text-gray-300">—</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateDayTime(day, 'end', e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white outline-none"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 flex-1">לא פעיל</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Manual toggle */}
            {availMode === 'manual' && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-center">
                <p className="text-sm text-gray-500 mb-3">לחץ לשנות מצב:</p>
                <button
                  type="button"
                  onClick={() => setIsManualFree(!isManualFree)}
                  className={`w-full py-4 rounded-xl text-lg font-black transition-all active:scale-95 ${
                    isManualFree
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                      : 'bg-red-500 text-white shadow-lg shadow-red-200'
                  }`}
                >
                  {isManualFree ? '🟢 פנוי — לחץ לסגור' : '🔴 תפוס — לחץ לפתוח'}
                </button>
              </div>
            )}

            {/* GPS mode */}
            {availMode === 'gps' && (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-bold text-green-600">GPS פעיל</span>
                </div>
                <p className="text-xs text-gray-500">המערכת תזהה אוטומטית כשתעזוב את הכתובת {address || '...'} ותפרסם את החניה.</p>
              </div>
            )}

            {/* Earnings preview */}
            {priceNum > 0 && (
              <div className="bg-gray-800 rounded-2xl p-5 text-white">
                <h4 className="font-bold mb-3">📊 תחזית הכנסות</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{Math.round(weeklyHours)} שעות/שבוע × {priceNum}₪</span>
                    <span className="font-bold">{monthlyGross.toLocaleString()} ₪/חודש</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">עמלת ShareParks (10%)</span>
                    <span className="text-gray-500">-{fee.toLocaleString()} ₪</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="font-bold">💰 נטו</span>
                    <span className="text-2xl font-black text-orange-500">{monthlyNet.toLocaleString()} ₪</span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-xs text-gray-500 space-y-0.5">
              <p>✓ בלי התחייבות — תפסיק מתי שתרצה</p>
              <p>✓ ביטוח נזקים כלול — עד 50,000 ₪</p>
              <p>✓ תשלום ישירות לחשבון הבנק שלך</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 text-base font-bold text-center active:scale-95 transition-transform"
              >
                חזרה →
              </button>
              <button
                type="button"
                onClick={() => setDone(true)}
                disabled={!price}
                className="flex-[2] py-4 rounded-xl bg-orange-500 text-white text-base font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform disabled:opacity-40"
              >
                🚀 התחל להרוויח
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
