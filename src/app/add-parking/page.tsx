'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createParking } from '@/actions/parking-actions';
import {
  MapPin,
  DollarSign,
  KeyRound,
  Phone,
  Check,
  ArrowRight,
  Car,
} from 'lucide-react';

type GateType = 'manual' | 'phone_dial' | 'api_integration';

export default function AddParkingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [entryInstructions, setEntryInstructions] = useState('');
  const [gateType, setGateType] = useState<GateType>('manual');
  const [gatePhone, setGatePhone] = useState('');

  function handleGetLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => setError('לא הצלחנו לקבל מיקום. הזן ידנית.')
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !city || !lat || !lng || !price) {
      setError('יש למלא את כל השדות החובה');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createParking({
        address,
        city,
        lat: Number(lat),
        lng: Number(lng),
        description: description || undefined,
        pricePerHour: Number(price),
        entryInstructions: entryInstructions || undefined,
        gateType,
        gatePhoneNumber: gateType === 'phone_dial' ? gatePhone : undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(result.error);
      }
    });
  }

  // Success screen
  if (success) {
    return (
      <div dir="rtl" className="min-h-dvh bg-white flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-scale-in">
          <Check size={40} strokeWidth={3} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-black mb-2">החניה נוצרה!</h2>
        <p className="text-gray-500 mb-4">מעביר אותך לדשבורד...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white px-5 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Car size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-bold">הוספת חניה</h1>
          </div>
          <span className="text-xs text-gray-500">ShareParks</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address */}
          <label className="block">
            <span className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
              <MapPin size={14} /> כתובת *
            </span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="רחוב הרצל 15"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </label>

          {/* City */}
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-2 block">עיר *</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="תל אביב"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </label>

          {/* Location */}
          <div>
            <span className="text-sm font-medium text-gray-500 mb-2 block">מיקום GPS *</span>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="קו רוחב"
                dir="ltr"
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 outline-none transition-all"
              />
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="קו אורך"
                dir="ltr"
                className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-orange-400 outline-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              className="text-sm text-orange-500 font-bold hover:underline"
            >
              השתמש במיקום הנוכחי שלי
            </button>
          </div>

          {/* Price */}
          <label className="block">
            <span className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
              <DollarSign size={14} /> מחיר לשעה (ש"ח) *
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min={1}
              placeholder="15"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all"
            />
          </label>

          {/* Description */}
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-2 block">תיאור (אופציונלי)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="חניה מקורה, קרובה לכניסה..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base resize-none focus:border-orange-400 outline-none transition-all"
            />
          </label>

          {/* Gate type */}
          <div>
            <span className="text-sm font-medium text-gray-500 mb-2 block">סוג כניסה</span>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'manual' as const, label: 'ידני / קוד' },
                { value: 'phone_dial' as const, label: 'חיוג לשער' },
                { value: 'api_integration' as const, label: 'PalGate' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGateType(opt.value)}
                  className={`
                    py-2.5 rounded-xl text-sm font-bold transition-all
                    ${gateType === opt.value
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                      : 'bg-gray-50 border border-gray-200 text-gray-500'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gate phone (conditional) */}
          {gateType === 'phone_dial' && (
            <label className="block">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
                <Phone size={14} /> מספר טלפון של השער
              </span>
              <input
                type="tel"
                value={gatePhone}
                onChange={(e) => setGatePhone(e.target.value)}
                placeholder="03-1234567"
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:border-orange-400 outline-none transition-all"
              />
            </label>
          )}

          {/* Entry instructions */}
          <label className="block">
            <span className="text-sm font-medium text-gray-500 flex items-center gap-1 mb-2">
              <KeyRound size={14} /> הוראות כניסה (אופציונלי)
            </span>
            <textarea
              value={entryInstructions}
              onChange={(e) => setEntryInstructions(e.target.value)}
              placeholder="קוד 1234, פנה שמאלה, חניה מספר 7"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base resize-none focus:border-orange-400 outline-none transition-all"
            />
          </label>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="
              w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black
              shadow-xl shadow-orange-200 transition-all active:scale-[0.97]
              disabled:opacity-40 disabled:shadow-none
            "
          >
            {isPending ? 'יוצר חניה...' : 'צור חניה'}
          </button>
        </form>
      </main>

      <div className="h-8" />
    </div>
  );
}
