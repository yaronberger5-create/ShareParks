'use client';

import { useState, useTransition } from 'react';
import { createBooking } from '@/actions/create-booking';
import { EntryInstructions } from './entry-instructions';
import { ReportModal } from './report-modal';
import {
  MapPin,
  Clock,
  Navigation,
  X,
  Check,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

interface ParkingData {
  id: string;
  address: string;
  city: string;
  description: string | null;
  images: string[];
  price_per_hour: number;
  distance_meters: number;
}

interface BottomSheetProps {
  parking: ParkingData;
  startTime: string;
  endTime: string;
  onClose: () => void;
}

type BookingState = 'idle' | 'confirm' | 'pending' | 'success' | 'error';

export function BottomSheet({ parking, startTime, endTime, onClose }: BottomSheetProps) {
  const [state, setState] = useState<BookingState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingPrice, setBookingPrice] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showReport, setShowReport] = useState(false);

  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
  const estimatedPrice = Math.round(parking.price_per_hour * durationHours * 100) / 100;

  const distanceLabel = parking.distance_meters < 1000
    ? `${Math.round(parking.distance_meters)} מ'`
    : `${(parking.distance_meters / 1000).toFixed(1)} ק"מ`;

  function handleBook() {
    setState('confirm');
  }

  function handleConfirm() {
    setState('pending');
    startTransition(async () => {
      const result = await createBooking({
        parkingId: parking.id,
        startTime,
        endTime,
      });
      if (result.success) {
        setBookingPrice(result.totalPrice);
        setBookingId(result.bookingId);
        setState('success');
      } else {
        setErrorMsg(result.error);
        setState('error');
      }
    });
  }

  // Google Maps navigation link
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parking.address + ', ' + parking.city)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="
        absolute bottom-0 inset-x-0 z-40
        bg-white rounded-t-3xl shadow-2xl
        animate-slide-up
        max-h-[85vh] overflow-y-auto
      ">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-all active:scale-90"
        >
          <X size={18} />
        </button>

        <div className="px-5 pb-8">
          {/* ─── Image ─── */}
          {parking.images.length > 0 ? (
            <img
              src={parking.images[0]}
              alt={parking.address}
              className="w-full h-44 object-cover rounded-2xl mt-2 mb-4"
            />
          ) : (
            <div className="w-full h-32 bg-gray-100 rounded-2xl mt-2 mb-4 flex items-center justify-center">
              <MapPin size={32} className="text-gray-300" />
            </div>
          )}

          {/* ─── Info ─── */}
          <h2 className="text-xl font-black text-black mb-1">{parking.address}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <MapPin size={14} />
            <span>{parking.city}</span>
            <span className="text-gray-300">·</span>
            <span>{distanceLabel}</span>
          </div>

          {parking.description && (
            <p className="text-sm text-gray-500 mb-4">{parking.description}</p>
          )}

          {/* ─── Price + Time summary ─── */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">מחיר לשעה</span>
              <span className="text-2xl font-black text-black">
                {parking.price_per_hour}
                <span className="text-sm font-medium text-gray-400 mr-1">ש"ח</span>
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock size={14} />
                <span>משך</span>
              </div>
              <span className="text-sm font-bold text-black">
                {durationHours === 1 ? 'שעה' : `${durationHours} שעות`}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">סה"כ</span>
              <span className="text-xl font-black text-orange-500">
                {estimatedPrice} ש"ח
              </span>
            </div>
          </div>

          {/* ─── States ─── */}

          {/* IDLE — Book + Navigate buttons */}
          {state === 'idle' && (
            <div className="space-y-3">
              <button
                onClick={handleBook}
                className="
                  w-full py-4 rounded-2xl bg-orange-500 text-white text-lg font-black
                  shadow-xl shadow-orange-200 transition-all active:scale-[0.97]
                "
              >
                הזמן עכשיו
              </button>
              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600
                  text-base font-bold flex items-center justify-center gap-2
                  transition-all active:scale-[0.97] hover:border-gray-300
                "
              >
                <Navigation size={18} />
                <span>נווט לחניה</span>
              </a>
            </div>
          )}

          {/* CONFIRM — Are you sure? */}
          {state === 'confirm' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-4">
              <p className="text-base font-bold text-black text-center">
                להזמין את החניה ב-{estimatedPrice} ש"ח?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setState('idle')}
                  className="
                    py-3 rounded-xl bg-gray-100 text-gray-500 text-base font-bold
                    transition-all active:scale-95
                  "
                >
                  ביטול
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="
                    py-3 rounded-xl bg-orange-500 text-white text-base font-bold
                    shadow-lg shadow-orange-200 transition-all active:scale-95
                    disabled:opacity-50
                  "
                >
                  {isPending ? 'שולח...' : 'אישור'}
                </button>
              </div>
            </div>
          )}

          {/* PENDING */}
          {state === 'pending' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">מאשר הזמנה...</p>
            </div>
          )}

          {/* SUCCESS */}
          {state === 'success' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-scale-in">
                  <Check size={40} strokeWidth={3} className="text-green-600" />
                </div>
                <p className="text-xl font-black text-black">ההזמנה אושרה!</p>
                <p className="text-sm text-gray-500">
                  {bookingPrice} ש"ח · {parking.address}
                </p>
              </div>

              {/* Entry instructions — only visible after booking */}
              <EntryInstructions parkingId={parking.id} />

              <a
                href={navUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-full py-3 rounded-2xl bg-black text-white
                  text-base font-bold flex items-center justify-center gap-2
                  transition-all active:scale-95
                "
              >
                <Navigation size={18} />
                <span>נווט לחניה</span>
              </a>

              {/* Help / Report button */}
              <button
                onClick={() => setShowReport(true)}
                className="
                  w-full py-3 rounded-2xl border-2 border-gray-200
                  text-orange-500 text-base font-bold
                  flex items-center justify-center gap-2
                  transition-all active:scale-95 hover:border-orange-200
                "
              >
                <ShieldAlert size={18} />
                <span>דיווח על בעיה</span>
              </button>
            </div>
          )}

          {/* Report Modal */}
          {showReport && bookingId && (
            <ReportModal
              bookingId={bookingId}
              onClose={() => setShowReport(false)}
            />
          )}

          {/* ERROR */}
          {state === 'error' && (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <X size={32} className="text-red-500" />
              </div>
              <p className="text-base font-bold text-black">{errorMsg}</p>
              <button
                onClick={() => setState('idle')}
                className="
                  px-6 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold
                  transition-all active:scale-95
                "
              >
                נסה שוב
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
