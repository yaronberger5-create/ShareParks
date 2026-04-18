'use client';

import { useState, useEffect } from 'react';
import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

interface ParkingSpot {
  id: string;
  lat: number;
  lng: number;
  price: number;
  address: string;
  available: boolean;
}

interface LiveMapProps {
  parkings: ParkingSpot[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  userLat?: number;
  userLng?: number;
}

export function LiveMap({ parkings, onSelect, selectedId, userLat, userLng }: LiveMapProps) {
  const centerLat = userLat ?? 31.7928;
  const centerLng = userLng ?? 34.6500;

  return (
    <Map
      initialViewState={{
        latitude: centerLat,
        longitude: centerLng,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
    >
      <NavigationControl position="bottom-left" showCompass={false} />
      <GeolocateControl position="bottom-left" />

      {parkings.map((p) => (
        <Marker
          key={p.id}
          latitude={p.lat}
          longitude={p.lng}
          anchor="bottom"
          onClick={() => onSelect(p.id)}
        >
          <button
            className="relative group"
            onClick={() => onSelect(p.id)}
          >
            <div className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-full shadow-lg transition-all
              ${selectedId === p.id
                ? 'bg-gray-800 text-white scale-110'
                : p.available
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-400 text-white'
              }
            `}>
              <span className="text-xs font-bold">{p.price}₪</span>
            </div>
            <div className={`w-3 h-3 rotate-45 mx-auto -mt-1.5 ${
              selectedId === p.id ? 'bg-gray-800' : p.available ? 'bg-orange-500' : 'bg-gray-400'
            }`} />
          </button>
        </Marker>
      ))}
    </Map>
  );
}
