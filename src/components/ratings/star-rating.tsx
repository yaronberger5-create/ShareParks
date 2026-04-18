'use client';

import { useState, useTransition } from 'react';
import { submitRating } from '@/actions/rating-actions';
import { Star, Check } from 'lucide-react';

interface StarRatingProps {
  bookingId: string;
  alreadyRated?: boolean;
}

export function StarRating({ bookingId, alreadyRated }: StarRatingProps) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(alreadyRated ?? false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (score === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await submitRating({
        bookingId,
        score,
        comment: comment.trim() || undefined,
      });
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-green-600">
        <Check size={16} />
        <span className="font-medium">תודה על הדירוג!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stars */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setScore(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform active:scale-110"
          >
            <Star
              size={28}
              fill={(hover || score) >= s ? '#f97316' : 'none'}
              stroke={(hover || score) >= s ? '#f97316' : '#d1d5db'}
              strokeWidth={2}
            />
          </button>
        ))}
        {score > 0 && (
          <span className="text-sm text-gray-400 mr-2">
            {score === 5 ? 'מצוין' : score === 4 ? 'טוב מאוד' : score === 3 ? 'סביר' : score === 2 ? 'לא טוב' : 'גרוע'}
          </span>
        )}
      </div>

      {/* Comment */}
      {score > 0 && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="הערה (אופציונלי)..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm resize-none placeholder:text-gray-300"
          />
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="
              px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold
              shadow-lg shadow-orange-200 transition-all active:scale-95
              disabled:opacity-50
            "
          >
            {isPending ? 'שולח...' : 'שלח דירוג'}
          </button>
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
