'use client';

import { useTransition } from 'react';
import { toggleParkingStatus } from '@/actions/owner-actions';
import { Power } from 'lucide-react';

interface StatusToggleProps {
  parkingId: string;
  isActive: boolean;
  address: string;
  onToggle: (newState: boolean) => void;
}

export function StatusToggle({ parkingId, isActive, address, onToggle }: StatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newState = !isActive;
    startTransition(async () => {
      const result = await toggleParkingStatus(parkingId, newState);
      if (result.success) {
        onToggle(newState);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-4">
        {/* Parking info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-black truncate">{address}</h2>
          <p className={`text-sm font-medium mt-1 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
            {isActive ? 'פעילה — מופיעה בחיפוש' : 'לא פעילה — מוסתרת מחיפוש'}
          </p>
        </div>

        {/* Toggle button */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl
            text-base font-bold transition-all duration-200
            min-w-[140px] justify-center
            ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer active:scale-95'}
            ${isActive
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
              : 'bg-gray-100 text-gray-500 border border-gray-300'
            }
          `}
        >
          <Power size={20} strokeWidth={2.5} />
          <span>{isActive ? 'פעילה' : 'כבויה'}</span>
        </button>
      </div>
    </div>
  );
}
