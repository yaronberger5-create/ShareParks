'use client';

import { useState, useTransition } from 'react';
import { getAvailableParkings } from '@/actions/search-parkings';
import { ParkingCard } from '@/components/parking-card';

type ParkingResult = {
  id: string;
  owner_id: string;
  address: string;
  city: string;
  description: string | null;
  images: string[];
  price_per_hour: number;
  distance_meters: number;
};

export default function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [parkings, setParkings] = useState<ParkingResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [radius, setRadius] = useState(1000);

  function handleSearch() {
    if (!startTime || !endTime) {
      setError('יש לבחור שעת התחלה וסיום');
      return;
    }

    setError(null);
    startTransition(async () => {
      // Get user location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }).catch(() => null);

      if (!position) {
        setError('יש לאשר גישה למיקום כדי לחפש חניות');
        return;
      }

      const result = await getAvailableParkings({
        userLat: position.coords.latitude,
        userLng: position.coords.longitude,
        radiusMeters: radius,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      if (result.success) {
        setParkings(result.data);
        if (result.data.length === 0) {
          setError('לא נמצאו חניות זמינות באזור ובשעות שנבחרו');
        }
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div dir="rtl" style={{
      maxWidth: 800,
      margin: '0 auto',
      padding: 24,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: 28, marginBottom: 24 }}>חיפוש חניה</h1>

      {/* Search form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <label>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>מתי מתחיל</span>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
          />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>מתי נגמר</span>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
          />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>רדיוס (מטרים)</span>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
          >
            <option value={500}>500 מ'</option>
            <option value={1000}>1 ק"מ</option>
            <option value={2000}>2 ק"מ</option>
            <option value={5000}>5 ק"מ</option>
          </select>
        </label>
      </div>

      <button
        onClick={handleSearch}
        disabled={isPending}
        style={{
          padding: '10px 32px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#2563eb',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.7 : 1,
          marginBottom: 24,
        }}
      >
        {isPending ? 'מחפש...' : 'חפש חניות'}
      </button>

      {/* Error */}
      {error && (
        <p style={{ color: '#dc2626', marginBottom: 16 }}>{error}</p>
      )}

      {/* Results */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {parkings.map((parking) => (
          <ParkingCard
            key={parking.id}
            parking={parking}
            startTime={new Date(startTime).toISOString()}
            endTime={new Date(endTime).toISOString()}
          />
        ))}
      </div>
    </div>
  );
}
