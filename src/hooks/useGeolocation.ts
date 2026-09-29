import { useState, useEffect, useCallback } from 'react';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  cityName: string;
  status: 'idle' | 'fetching' | 'acquired' | 'denied' | 'error';
  errorMessage?: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    cityName: 'Acquiring Location...',
    status: 'idle',
  });

  const fetchCityName = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (!res.ok) throw new Error('Geocoding failed');
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || data.countryName;
      if (city) return city;
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
    return 'Your Location';
  };

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({
        lat: 12.9716,
        lng: 77.5946,
        cityName: 'Bengaluru (Fallback)',
        status: 'error',
        errorMessage: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setLocation((prev) => ({ ...prev, status: 'fetching', cityName: 'Acquiring Location...' }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const cityName = await fetchCityName(lat, lng);

        setLocation({
          lat,
          lng,
          cityName,
          status: 'acquired',
        });
      },
      (error) => {
        console.warn('Geolocation access failed:', error.message);
        setLocation({
          lat: 12.9716,
          lng: 77.5946,
          cityName: 'Bengaluru (Default)',
          status: 'denied',
          errorMessage: error.message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, requestLocation };
}