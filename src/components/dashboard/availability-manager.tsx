'use client';

import { useState, useTransition } from 'react';
import { addAvailabilitySlot, removeAvailabilitySlot } from '@/actions/owner-actions';
import { Plus, Trash2, Clock, RotateCcw } from 'lucide-react';

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;

interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
}

interface AvailabilityManagerProps {
  parkingId: string;
  slots: Slot[];
}

export function AvailabilityManager({ parkingId, slots: initialSlots }: AvailabilityManagerProps) {
  const [slots, setSlots] = useState(initialSlots);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [day, setDay] = useState(0);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isRecurring, setIsRecurring] = useState(true);

  function handleAdd() {
    if (startTime >= endTime) return;

    startTransition(async () => {
      const result = await addAvailabilitySlot({
        parkingId,
        dayOfWeek: day,
        startTime,
        endTime,
        isRecurring,
      });
      if (result.success) {
        setShowForm(false);
        // Optimistic — real data comes on revalidation
        setSlots((prev) => [...prev, {
          id: crypto.randomUUID(),
          day_of_week: day,
          start_time: startTime + ':00',
          end_time: endTime + ':00',
          is_recurring: isRecurring,
        }]);
      }
    });
  }

  function handleRemove(slotId: string) {
    startTransition(async () => {
      const result = await removeAvailabilitySlot(slotId);
      if (result.success) {
        setSlots((prev) => prev.filter((s) => s.id !== slotId));
      }
    });
  }

  // Group slots by day
  const slotsByDay = new Map<number, Slot[]>();
  for (const slot of slots) {
    const existing = slotsByDay.get(slot.day_of_week) ?? [];
    existing.push(slot);
    slotsByDay.set(slot.day_of_week, existing);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-black">זמינות</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
            transition-all active:scale-95
            ${showForm
              ? 'bg-gray-100 text-gray-500'
              : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
            }
          `}
        >
          <Plus size={16} strokeWidth={3} />
          <span>{showForm ? 'ביטול' : 'הוסף משבצת'}</span>
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-5 space-y-3">
          {/* Day selector */}
          <div className="flex flex-wrap gap-2">
            {DAYS_HE.map((label, i) => (
              <button
                key={i}
                onClick={() => setDay(i)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${day === i
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Time inputs */}
          <div className="flex items-center gap-3">
            <label className="flex-1">
              <span className="text-xs text-gray-500 block mb-1">משעה</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-base bg-white"
              />
            </label>
            <span className="text-gray-300 mt-5">—</span>
            <label className="flex-1">
              <span className="text-xs text-gray-500 block mb-1">עד שעה</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-base bg-white"
              />
            </label>
          </div>

          {/* Recurring toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 rounded accent-orange-500"
            />
            <span className="text-sm text-gray-600">חוזר כל שבוע</span>
          </label>

          {/* Submit */}
          <button
            onClick={handleAdd}
            disabled={isPending || startTime >= endTime}
            className="
              w-full py-3 rounded-xl bg-black text-white text-base font-bold
              transition-all active:scale-[0.98] disabled:opacity-40
            "
          >
            {isPending ? 'שומר...' : 'שמור משבצת'}
          </button>
        </div>
      )}

      {/* Slots list grouped by day */}
      {slots.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock size={32} className="mx-auto mb-2" />
          <p className="text-sm">אין משבצות זמינות. הוסף את הזמנים שהחניה פנויה.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(slotsByDay.entries())
            .sort(([a], [b]) => a - b)
            .map(([dayNum, daySlots]) => (
              <div key={dayNum}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  יום {DAYS_HE[dayNum]}
                </p>
                <div className="space-y-2">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="
                        flex items-center justify-between
                        bg-gray-50 rounded-xl border border-gray-100 px-4 py-3
                      "
                    >
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-orange-400" />
                        <span className="text-base font-medium text-black">
                          {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                        </span>
                        {slot.is_recurring && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <RotateCcw size={12} />
                            שבועי
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(slot.id)}
                        disabled={isPending}
                        className="
                          p-2 rounded-lg text-gray-300 hover:text-red-500
                          hover:bg-red-50 transition-all active:scale-90
                        "
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
