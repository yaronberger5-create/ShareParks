'use client';

import { useState, useTransition } from 'react';
import { submitReport } from '@/actions/report-actions';
import { AlertCircle, X, Check, ShieldAlert } from 'lucide-react';

const ISSUE_TYPES = [
  { value: 'spot_occupied' as const, label: 'החניה תפוסה', icon: '🚗', auto: true },
  { value: 'wrong_location' as const, label: 'מיקום לא נכון', icon: '📍', auto: false },
  { value: 'wrong_instructions' as const, label: 'הוראות כניסה שגויות', icon: '🚧', auto: false },
  { value: 'damage' as const, label: 'נזק בחניה', icon: '⚠️', auto: false },
  { value: 'other' as const, label: 'אחר', icon: '💬', auto: false },
] as const;

interface ReportModalProps {
  bookingId: string;
  onClose: () => void;
}

type Step = 'select' | 'describe' | 'done';

export function ReportModal({ bookingId, onClose }: ReportModalProps) {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<typeof ISSUE_TYPES[number] | null>(null);
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const [resultMessage, setResultMessage] = useState('');
  const [autoResolved, setAutoResolved] = useState(false);

  function handleSelectType(issue: typeof ISSUE_TYPES[number]) {
    setSelectedType(issue);
    if (issue.value === 'spot_occupied') {
      // Critical — submit immediately
      handleSubmit(issue.value);
    } else {
      setStep('describe');
    }
  }

  function handleSubmit(issueType?: string) {
    startTransition(async () => {
      const result = await submitReport({
        bookingId,
        issueType: (issueType ?? selectedType?.value) as Parameters<typeof submitReport>[0]['issueType'],
        description: description || undefined,
      });

      if (result.success) {
        setResultMessage(result.message);
        setAutoResolved(result.autoResolved);
        setStep('done');
      } else {
        setResultMessage(result.error);
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-white rounded-3xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-orange-500" />
            <h2 className="text-lg font-bold text-black">דיווח על בעיה</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          {/* ─── Step 1: Select issue type ─── */}
          {step === 'select' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-3">מה הבעיה?</p>
              {ISSUE_TYPES.map((issue) => (
                <button
                  key={issue.value}
                  onClick={() => handleSelectType(issue)}
                  disabled={isPending}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                    border text-right transition-all active:scale-[0.98]
                    ${issue.value === 'spot_occupied'
                      ? 'border-red-200 bg-red-50 hover:border-red-300'
                      : 'border-gray-100 bg-gray-50 hover:border-orange-200'
                    }
                  `}
                >
                  <span className="text-xl">{issue.icon}</span>
                  <div className="flex-1">
                    <span className="font-bold text-black text-base">{issue.label}</span>
                    {issue.auto && (
                      <p className="text-xs text-red-500 mt-0.5">ביטול + החזר אוטומטי</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ─── Step 2: Description ─── */}
          {step === 'describe' && selectedType && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xl">{selectedType.icon}</span>
                <span className="font-bold text-black">{selectedType.label}</span>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="תאר את הבעיה (אופציונלי)..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base resize-none placeholder:text-gray-300"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setStep('select'); setSelectedType(null); }}
                  className="py-3 rounded-xl bg-gray-100 text-gray-500 text-base font-bold transition-all active:scale-95"
                >
                  חזרה
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={isPending}
                  className="py-3 rounded-xl bg-orange-500 text-white text-base font-bold shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? 'שולח...' : 'שלח דיווח'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Done ─── */}
          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mx-auto animate-scale-in
                ${autoResolved ? 'bg-green-100' : 'bg-orange-100'}
              `}>
                {autoResolved
                  ? <Check size={32} strokeWidth={3} className="text-green-600" />
                  : <AlertCircle size={32} className="text-orange-500" />
                }
              </div>
              <p className="text-base font-bold text-black">{resultMessage}</p>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-black text-white text-base font-bold transition-all active:scale-95"
              >
                סגור
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
