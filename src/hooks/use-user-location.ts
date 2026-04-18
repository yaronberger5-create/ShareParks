'use client';

import { useState, useEffect } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

type LocationState =
  | { status: 'loading' }
  | { status: 'success'; location: UserLocation }
  | { status: 'error'; error: string };

export function useUserLocation(): LocationState {
  const [state, setState] = useState<LocationState>({ status: 'loading' });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', error: 'הדפדפן לא תומך במיקום' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      () => {
        // Fallback: Tel Aviv center
        setState({
          status: 'success',
          location: { lat: 32.0853, lng: 34.7818 },
        });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return state;
}
