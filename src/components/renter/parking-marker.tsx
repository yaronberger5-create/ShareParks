'use client';

import { Marker } from 'react-map-gl/maplibre';
import { Car } from 'lucide-react';

interface ParkingMarkerProps {
  lat: number;
  lng: number;
  price: number;
  isSelected: boolean;
  onClick: () => void;
}

export function ParkingMarker({ lat, lng, price, isSelected, onClick }: ParkingMarkerProps) {
  return (
    <Marker latitude={lat} longitude={lng} anchor="bottom" onClick={onClick}>
      <button className="relative group" onClick={onClick}>
        {/* Pin */}
        <div className={`
          flex items-center gap-1 px-2.5 py-1.5 rounded-full
          shadow-lg transition-all duration-200
          ${isSelected
            ? 'bg-black text-white scale-110'
            : 'bg-orange-500 text-white hover:bg-orange-600'
          }
        `}>
          <Car size={14} strokeWidth={2.5} />
          <span className="text-xs font-bold whitespace-nowrap">
            {price}₪
          </span>
        </div>
        {/* Arrow */}
        <div className={`
          w-3 h-3 rotate-45 mx-auto -mt-1.5
          transition-colors duration-200
          ${isSelected ? 'bg-black' : 'bg-orange-500'}
        `} />
      </button>
    </Marker>
  );
}
