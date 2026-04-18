'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type VerifyStep = 'intro' | 'form' | 'review' | 'done';
type DocType = 'id_card' | 'driver_license' | 'car_registration';

export function DriverVerification() {
  const [step, setStep] = useState<VerifyStep>('intro');
  const [fullName, setFullName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [docs, setDocs] = useState<Record<DocType, string | null>>({
    id_card: null,
    driver_license: null,
    car_registration: null,
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentDoc, setCurrentDoc] = useState<DocType>('id_card');

  function handleUpload(docType: DocType) {
    setCurrentDoc(docType);
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setDocs((prev) => ({ ...prev, [currentDoc]: ev.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  const allDocsUploaded = docs.id_card && docs.driver_license && docs.car_registration;
  const canSubmit = fullName.trim() && licensePlate.trim() && allDocsUploaded;

  const DOC_LABELS: Record<DocType, { icon: string; label: string; desc: string }> = {
    id_card: { icon: '🪪', label: 'תעודת זהות', desc: 'צד קדמי עם תמונה' },
    driver_license: { icon: '🚗', label: 'רישיון נהיגה', desc: 'צד קדמי, בתוקף' },
    car_registration: { icon: '📄', label: 'רישיון רכב', desc: 'רישיון רכב עדכני' },
  };

  // ─── INTRO ────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div>
        {/* Header — no logo (comes from top bar) */}
        <div className="bg-gray-800 px-4 py-5 flex items-center justify-center relative">
          <a href="/demo?r=renter&s=home" className="absolute right-4 top-5 text-gray-400 text-sm">חזרה →</a>
          <h2 className="text-xl font-black text-white">🛡️ אימות נהג</h2>
          <p className="text-sm text-gray-400 mt-1">אימות חד פעמי כדי להזמין חניות</p>
        </div>

        <div className="px-4 py-5 space-y-4">

        <div className="space-y-3">
          <div className="flex gap-3 bg-gray-50 rounded-xl border border-gray-100 p-4">
            <span className="text-2xl">🪪</span>
            <div>
              <p className="text-sm font-bold text-black">תעודת זהות</p>
              <p className="text-xs text-gray-500">צילום צד קדמי</p>
            </div>
          </div>
          <div className="flex gap-3 bg-gray-50 rounded-xl border border-gray-100 p-4">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-sm font-bold text-black">רישיון נהיגה</p>
              <p className="text-xs text-gray-500">בתוקף</p>
            </div>
          </div>
          <div className="flex gap-3 bg-gray-50 rounded-xl border border-gray-100 p-4">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-sm font-bold text-black">רישיון רכב</p>
              <p className="text-xs text-gray-500">עדכני</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl border border-green-200 px-4 py-3 text-xs text-green-700 space-y-1">
          <p>✓ המסמכים מאובטחים ומוצפנים</p>
          <p>✓ אימות תוך 5 דקות (אוטומטי)</p>
          <p>✓ פעם אחת — תקף לכל ההזמנות</p>
        </div>

        <button
          type="button"
          onClick={() => setStep('form')}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform"
        >
          🛡️ התחל אימות
        </button>

        <Link href="/demo?r=renter&s=home" className="block w-full py-2 text-sm text-gray-300 text-center">🏠 חזרה לדף הבית</Link>
        </div>
      </div>
    );
  }

  // ─── FORM ─────────────────────────────────────────────
  if (step === 'form') {
    return (
      <div>
        <div className="bg-gray-800 px-4 py-5 flex items-center justify-center relative">
          <button type="button" onClick={() => setStep('intro')} className="absolute right-4 top-5 text-gray-400 text-sm">חזרה →</button>
          <h2 className="text-lg font-black text-white">🛡️ אימות נהג — שלב 1</h2>
        </div>
        <div className="px-4 py-5 space-y-4">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

        {/* Progress */}
        <div className="flex gap-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-orange-500" />
          <div className={`flex-1 h-1.5 rounded-full ${allDocsUploaded ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
        </div>

        {/* Personal details */}
        <label className="block">
          <span className="text-sm text-gray-500 block mb-1">שם מלא</span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ישראל ישראלי"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-500 block mb-1">מספר רכב</span>
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            placeholder="12-345-67"
            dir="ltr"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </label>

        {/* Document uploads */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">📎 העלאת מסמכים</p>
          {(Object.keys(DOC_LABELS) as DocType[]).map((docType) => {
            const { icon, label, desc } = DOC_LABELS[docType];
            const uploaded = docs[docType];

            return (
              <div key={docType} className={`rounded-xl border-2 overflow-hidden ${uploaded ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                {uploaded ? (
                  <div className="relative">
                    <img src={uploaded} alt={label} className="w-full h-32 object-cover" />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">✓ הועלה</div>
                    <button
                      type="button"
                      onClick={() => setDocs((prev) => ({ ...prev, [docType]: null }))}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gray-800/60 text-white text-xs flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpload(docType)}
                    className="w-full px-4 py-4 flex items-center gap-3 active:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold text-black">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <span className="text-orange-500 text-sm font-bold">📷 צלם</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setStep('review')}
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform disabled:opacity-40 disabled:shadow-none"
        >
          המשך לאישור →
        </button>

        <button type="button" onClick={() => setStep('intro')} className="w-full py-2 text-sm text-gray-400 text-center">חזרה →</button>
        </div>
      </div>
    );
  }

  // ─── REVIEW ───────────────────────────────────────────
  if (step === 'review') {
    return (
      <div>
        <div className="bg-gray-800 px-4 py-5 flex items-center justify-center relative">
          <button type="button" onClick={() => setStep('form')} className="absolute right-4 top-5 text-gray-400 text-sm">חזרה →</button>
          <h2 className="text-lg font-black text-white">📋 אישור פרטים</h2>
        </div>
        <div className="px-4 py-5 space-y-4">

        {/* Progress */}
        <div className="flex gap-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-orange-500" />
          <div className="flex-1 h-1.5 rounded-full bg-orange-500" />
          <div className="flex-1 h-1.5 rounded-full bg-orange-500" />
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">👤 שם</span>
            <span className="font-bold text-black text-sm">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">🚗 מספר רכב</span>
            <span className="font-bold text-black text-sm" dir="ltr">{licensePlate}</span>
          </div>
        </div>

        {/* Document thumbnails */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DOC_LABELS) as DocType[]).map((docType) => {
            const { icon, label } = DOC_LABELS[docType];
            return (
              <div key={docType} className="rounded-xl border border-green-400 overflow-hidden">
                {docs[docType] && (
                  <img src={docs[docType]!} alt={label} className="w-full h-20 object-cover" />
                )}
                <div className="bg-green-50 px-2 py-1 flex items-center justify-center gap-1">
                  <span className="text-xs">{icon}</span>
                  <span className="text-[9px] text-green-700 font-bold">✓</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-orange-50 rounded-xl border border-orange-200 px-4 py-3 text-xs text-orange-700">
          ⚠️ לאחר השליחה, האימות ייבדק אוטומטית תוך מספר דקות. תקבל התראה כשהאימות יאושר.
        </div>

        <button
          type="button"
          onClick={() => setStep('done')}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform"
        >
          ✓ שלח לאימות
        </button>

        <button type="button" onClick={() => setStep('form')} className="w-full py-2 text-sm text-gray-400 text-center">חזרה → לעריכה</button>
        </div>
      </div>
    );
  }

  // ─── DONE ─────────────────────────────────────────────
  return (
    <div className="px-4 py-5 flex flex-col items-center justify-center min-h-[60dvh] text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 text-4xl">✅</div>
      <h2 className="text-2xl font-black text-black mb-2">המסמכים נשלחו!</h2>
      <p className="text-gray-500 mb-1">{fullName}</p>
      <p className="text-sm text-gray-400 mb-6" dir="ltr">{licensePlate}</p>

      <div className="w-full max-w-sm bg-green-50 rounded-2xl border border-green-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">✅</span>
          <span className="text-sm font-bold text-green-700">אומת בהצלחה!</span>
        </div>
        <p className="text-xs text-green-600">עכשיו צריך להוסיף אמצעי תשלום.</p>
      </div>

      <Link
        href="/demo?r=renter&s=payment"
        className="w-full max-w-sm py-4 rounded-2xl bg-orange-500 text-white text-lg font-black text-center block shadow-xl shadow-orange-200 active:scale-[0.97] transition-transform mb-3"
      >
        💳 הוסף כרטיס אשראי
      </Link>
      <Link
        href="/demo?r=renter&s=home"
        className="w-full max-w-sm py-3 rounded-2xl bg-gray-800 text-white text-base font-bold text-center block active:scale-[0.97] transition-transform"
      >
        🏠 חזרה לדף הבית
      </Link>
    </div>
  );
}
