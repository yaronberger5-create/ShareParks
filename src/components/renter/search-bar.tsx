'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchBarProps {
  startTime: string;
  endTime: string;
  radius: number;
  onStartTimeChange: (v: string) => void;
  onEndTimeChange: (v: string) => void;
  onRadiusChange: (v: number) => void;
  onSearch: () => void;
  isPending: boolean;
}

export function SearchBar({
  startTime,
  endTime,
  radius,
  onStartTimeChange,
  onEndTimeChange,
  onRadiusChange,
  onSearch,
  isPending,
}: SearchBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="absolute top-0 inset-x-0 z-20 p-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        {/* Main bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3">
            <Search size={20} className="text-gray-400 shrink-0" />
            <button
              onClick={onSearch}
              disabled={isPending || !startTime || !endTime}
              className="flex-1 text-right text-base text-gray-500 truncate"
            >
              {isPending
                ? 'מחפש חניות...'
                : startTime && endTime
                  ? `${new Date(startTime).toLocaleString('he-IL', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} — ${new Date(endTime).toLocaleString('he-IL', { hour: '2-digit', minute: '2-digit' })}`
                  : 'מתי צריך חניה?'
              }
            </button>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`
                p-2 rounded-xl transition-all active:scale-90
                ${filtersOpen ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}
              `}
            >
              {filtersOpen ? <X size={18} /> : <SlidersHorizontal size={18} />}
            </button>
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div className="border-t border-gray-100 px-4 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="text-xs font-medium text-gray-400 block mb-1">מתחיל</span>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50"
                  />
                </label>
                <label>
                  <span className="text-xs font-medium text-gray-400 block mb-1">נגמר</span>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => onEndTimeChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50"
                  />
                </label>
              </div>

              {/* Radius chips */}
              <div>
                <span className="text-xs font-medium text-gray-400 block mb-2">רדיוס חיפוש</span>
                <div className="flex gap-2">
                  {[
                    { value: 500, label: '500מ\'' },
                    { value: 1000, label: '1 ק"מ' },
                    { value: 2000, label: '2 ק"מ' },
                    { value: 5000, label: '5 ק"מ' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onRadiusChange(opt.value)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${radius === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search button */}
              <button
                onClick={() => { onSearch(); setFiltersOpen(false); }}
                disabled={isPending || !startTime || !endTime}
                className="
                  w-full py-3 rounded-xl bg-orange-500 text-white text-base font-bold
                  shadow-lg shadow-orange-200 transition-all active:scale-[0.98]
                  disabled:opacity-40 disabled:shadow-none
                "
              >
                {isPending ? 'מחפש...' : 'חפש חניות'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
