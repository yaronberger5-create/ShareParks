'use client';

import { useState, useTransition } from 'react';
import { getEntryInstructions } from '@/actions/wallet-actions';
import { KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

interface EntryInstructionsProps {
  parkingId: string;
}

export function EntryInstructions({ parkingId }: EntryInstructionsProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [gateType, setGateType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleReveal() {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    startTransition(async () => {
      const result = await getEntryInstructions(parkingId);
      if (result.success) {
        setInstructions(result.entryInstructions ?? null);
        setGateType(result.gateType ?? null);
        setIsRevealed(true);
        setError(null);
      } else {
        setError(result.error);
      }
    });
  }

  const gateLabels: Record<string, string> = {
    open: 'כניסה חופשית',
    code: 'קוד כניסה',
    remote: 'שלט / שער חשמלי',
    palgate: 'PalGate',
  };

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={handleReveal}
        disabled={isPending}
        className="
          w-full flex items-center justify-between px-4 py-3
          text-right transition-all hover:bg-gray-100
        "
      >
        <div className="flex items-center gap-2">
          <KeyRound size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-black">הוראות כניסה</span>
          {gateType && isRevealed && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
              {gateLabels[gateType] ?? gateType}
            </span>
          )}
        </div>
        {isPending ? (
          <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        ) : isRevealed ? (
          <EyeOff size={16} className="text-gray-400" />
        ) : (
          <Eye size={16} className="text-gray-400" />
        )}
      </button>

      {isRevealed && instructions && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3">
          <div className="flex items-start gap-2">
            <Lock size={14} className="text-orange-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {instructions}
            </p>
          </div>
        </div>
      )}

      {isRevealed && !instructions && (
        <div className="px-4 pb-3 border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-400">בעל החניה לא הוסיף הוראות כניסה</p>
        </div>
      )}

      {error && (
        <div className="px-4 pb-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
