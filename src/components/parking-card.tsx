'use client';

import { useState, useTransition } from 'react';
import { createBooking } from '@/actions/create-booking';

interface ParkingCardProps {
  parking: {
    id: string;
    address: string;
    city: string;
    description: string | null;
    price_per_hour: number;
    distance_meters: number;
    images: string[];
  };
  startTime: string;
  endTime: string;
}

export function ParkingCard({ parking, startTime, endTime }: ParkingCardProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const distanceLabel = parking.distance_meters < 1000
    ? `${Math.round(parking.distance_meters)} מ'`
    : `${(parking.distance_meters / 1000).toFixed(1)} ק"מ`;

  const durationHours =
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
  const estimatedPrice = Math.round(parking.price_per_hour * durationHours * 100) / 100;

  function handleBook() {
    setResult(null);
    startTransition(async () => {
      const res = await createBooking({
        parkingId: parking.id,
        startTime,
        endTime,
      });

      if (res.success) {
        setResult({
          type: 'success',
          message: `ההזמנה נוצרה! מחיר: ${res.totalPrice} ש"ח`,
        });
      } else {
        setResult({ type: 'error', message: res.error });
      }
    });
  }

  return (
    <div dir="rtl" style={{
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: 16,
      maxWidth: 360,
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Image */}
      {parking.images.length > 0 && (
        <img
          src={parking.images[0]}
          alt={parking.address}
          style={{
            width: '100%',
            height: 180,
            objectFit: 'cover',
            borderRadius: 8,
            marginBottom: 12,
          }}
        />
      )}

      {/* Details */}
      <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{parking.address}</h3>
      <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: 14 }}>
        {parking.city} · {distanceLabel}
      </p>

      {parking.description && (
        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#475569' }}>
          {parking.description}
        </p>
      )}

      {/* Price */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>
          {parking.price_per_hour} ש"ח/שעה
        </span>
        <span style={{ color: '#64748b', fontSize: 14 }}>
          סה"כ: ~{estimatedPrice} ש"ח
        </span>
      </div>

      {/* Book button */}
      <button
        onClick={handleBook}
        disabled={isPending || result?.type === 'success'}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 8,
          border: 'none',
          backgroundColor: result?.type === 'success' ? '#16a34a' : '#2563eb',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'מזמין...' : result?.type === 'success' ? 'הוזמן!' : 'הזמן עכשיו'}
      </button>

      {/* Result message */}
      {result && (
        <p style={{
          marginTop: 8,
          fontSize: 14,
          color: result.type === 'success' ? '#16a34a' : '#dc2626',
          textAlign: 'center',
        }}>
          {result.message}
        </p>
      )}
    </div>
  );
}
