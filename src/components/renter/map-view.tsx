'use client';

import { useState, useCallback, useTransition } from 'react';
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { getAvailableParkings } from '@/actions/search-parkings';
import { useUserLocation } from '@/hooks/use-user-location';
import { SearchBar } from './search-bar';
import { ParkingMarker } from './parking-marker';
import { BottomSheet } from './bottom-sheet';
import { Loader2 } from 'lucide-react';

interface ParkingResult {
  id: string;
  owner_id: string;
  address: string;
  city: string;
  description: string | null;
  images: string[];
  price_per_hour: number;
  distance_meters: number;
}

// Free tile server (no API key needed for development)
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export function MapView() {
  const location = useUserLocation();
  const [isPending, startTransition] = useTransition();

  // Search params
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [radius, setRadius] = useState(1000);

  // Results
  const [parkings, setParkings] = useState<ParkingResult[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedParking = parkings.find((p) => p.id === selectedId) ?? null;

  const handleSearch = useCallback(() => {
    if (!startTime || !endTime) return;
    if (location.status !== 'success') return;

    setError(null);
    setSelectedId(null);

    startTransition(async () => {
      const result = await getAvailableParkings({
        userLat: location.location.lat,
        userLng: location.location.lng,
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
  }, [startTime, endTime, radius, location]);

  // Loading state
  if (location.status === 'loading') {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-white gap-3">
        <Loader2 size={32} className="text-orange-500 animate-spin" />
        <p className="text-sm text-gray-400">מאתר מיקום...</p>
      </div>
    );
  }

  const center = location.status === 'success'
    ? location.location
    : { lat: 32.0853, lng: 34.7818 };

  return (
    <div className="h-dvh w-full relative" dir="rtl">
      {/* Map */}
      <Map
        initialViewState={{
          latitude: center.lat,
          longitude: center.lng,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={false}
      >
        <NavigationControl position="bottom-left" showCompass={false} />
        <GeolocateControl position="bottom-left" />

        {/* Parking markers */}
        {parkings.map((p) => (
          <ParkingMarker
            key={p.id}
            lat={center.lat + (Math.random() - 0.5) * 0.01} // placeholder until real coords
            lng={center.lng + (Math.random() - 0.5) * 0.01}
            price={p.price_per_hour}
            isSelected={p.id === selectedId}
            onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
          />
        ))}
      </Map>

      {/* Search bar */}
      <SearchBar
        startTime={startTime}
        endTime={endTime}
        radius={radius}
        onStartTimeChange={setStartTime}
        onEndTimeChange={setEndTime}
        onRadiusChange={setRadius}
        onSearch={handleSearch}
        isPending={isPending}
      />

      {/* Results count badge */}
      {parkings.length > 0 && !selectedParking && (
        <div className="absolute bottom-6 inset-x-0 z-10 flex justify-center pointer-events-none">
          <div className="
            bg-black text-white px-5 py-2.5 rounded-full
            text-sm font-bold shadow-xl pointer-events-auto
          ">
            {parkings.length} חניות זמינות
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && !selectedParking && (
        <div className="absolute bottom-6 inset-x-0 z-10 flex justify-center pointer-events-none">
          <div className="
            bg-red-500 text-white px-5 py-2.5 rounded-full
            text-sm font-bold shadow-xl pointer-events-auto
          ">
            {error}
          </div>
        </div>
      )}

      {/* Bottom sheet */}
      {selectedParking && (
        <BottomSheet
          parking={selectedParking}
          startTime={new Date(startTime).toISOString()}
          endTime={new Date(endTime).toISOString()}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
