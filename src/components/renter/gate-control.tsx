'use client';

import { useState, useEffect, useTransition } from 'react';
import { getGateAccess, logGateAccess } from '@/actions/gate-actions';
import {
  DoorOpen,
  Phone,
  KeyRound,
  Lock,
  Clock,
  Wifi,
  ShieldCheck,
} from 'lucide-react';

interface GateControlProps {
  parkingId: string;
  bookingId?: string;
}

interface GateState {
  access: boolean;
  reason?: string;
  gateType?: 'manual' | 'phone_dial' | 'api_integration';
  gatePhoneNumber?: string;
  entryInstructions?: string;
  gateApiProvider?: string;
  bookingEnds?: string;
  startsAt?: string;
}

export function GateControl({ parkingId, bookingId }: GateControlProps) {
  const [gate, setGate] = useState<GateState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [apiStatus, setApiStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadGateAccess();
  }, [parkingId]);

  function loadGateAccess() {
    startTransition(async () => {
      const result = await getGateAccess(parkingId);
      setGate(result);
    });
  }

  async function handlePhoneDial() {
    if (!gate?.gatePhoneNumber) return;

    // Log the access attempt
    await logGateAccess({
      parkingId,
      bookingId,
      method: 'phone_dial',
      success: true,
    });

    // Trigger phone call
    window.location.href = `tel:${gate.gatePhoneNumber}`;
  }

  async function handleApiOpen() {
    setApiStatus('sending');

    // Log attempt
    await logGateAccess({
      parkingId,
      bookingId,
      method: 'api_call',
      success: true,
    });

    // TODO: actual API integration with PalGate/CellGate
    // For now, simulate success
    setTimeout(() => {
      setApiStatus('success');
      setTimeout(() => setApiStatus('idle'), 3000);
    }, 1500);
  }

  // Loading
  if (isPending || !gate) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
        <div className="h-12 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  // No access — too early
  if (!gate.access && gate.reason === 'too_early' && gate.startsAt) {
    const startsAt = new Date(gate.startsAt);
    const minutesUntil = Math.ceil((startsAt.getTime() - Date.now()) / 60000);

    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={18} className="text-gray-400" />
          <h3 className="font-bold text-black text-sm">פתיחת שער</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>
            הגישה תיפתח {minutesUntil <= 10
              ? `עוד ${minutesUntil} דקות`
              : `ב-${startsAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
            }
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          ניתן לפתוח את השער עד 10 דקות לפני תחילת ההזמנה
        </p>
      </div>
    );
  }

  // No access — other reasons
  if (!gate.access) {
    return null; // Don't show gate UI at all
  }

  // ─── Access granted ───────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <DoorOpen size={18} className="text-orange-500" />
          <h3 className="font-bold text-black text-sm">פתיחת שער</h3>
        </div>
        <ShieldCheck size={14} className="text-green-500" />
      </div>

      <div className="p-5">
        {/* ─── Phone Dial ─── */}
        {gate.gateType === 'phone_dial' && gate.gatePhoneNumber && (
          <div className="space-y-3">
            <button
              onClick={handlePhoneDial}
              className="
                w-full py-4 rounded-2xl bg-orange-500 text-white
                text-lg font-black flex items-center justify-center gap-3
                shadow-xl shadow-orange-200 transition-all active:scale-[0.97]
              "
            >
              <Phone size={22} />
              <span>פתח שער</span>
            </button>
            <p className="text-xs text-gray-400 text-center">
              לחיצה תחייג אוטומטית למספר השער
            </p>
          </div>
        )}

        {/* ─── API Integration ─── */}
        {gate.gateType === 'api_integration' && (
          <div className="space-y-3">
            <button
              onClick={handleApiOpen}
              disabled={apiStatus === 'sending'}
              className={`
                w-full py-4 rounded-2xl text-lg font-black
                flex items-center justify-center gap-3
                transition-all active:scale-[0.97]
                ${apiStatus === 'success'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                  : apiStatus === 'sending'
                    ? 'bg-orange-300 text-white'
                    : 'bg-orange-500 text-white shadow-xl shadow-orange-200'
                }
              `}
            >
              {apiStatus === 'sending' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>פותח...</span>
                </>
              ) : apiStatus === 'success' ? (
                <>
                  <ShieldCheck size={22} />
                  <span>השער נפתח!</span>
                </>
              ) : (
                <>
                  <Wifi size={22} />
                  <span>פתח שער</span>
                </>
              )}
            </button>
            {gate.gateApiProvider && (
              <p className="text-xs text-gray-400 text-center">
                דרך {gate.gateApiProvider === 'palgate' ? 'PalGate' : gate.gateApiProvider}
              </p>
            )}
          </div>
        )}

        {/* ─── Manual ─── */}
        {gate.gateType === 'manual' && (
          <div className="space-y-3">
            {gate.entryInstructions ? (
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                <div className="flex items-start gap-2">
                  <KeyRound size={16} className="text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {gate.entryInstructions}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center">
                בעל החניה לא הוסיף הוראות כניסה
              </p>
            )}
          </div>
        )}

        {/* Booking end reminder */}
        {gate.bookingEnds && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <Clock size={12} />
            <span>
              הגישה פעילה עד{' '}
              {new Date(gate.bookingEnds).toLocaleTimeString('he-IL', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
