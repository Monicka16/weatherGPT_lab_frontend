import { useState, useEffect, useCallback } from 'react';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  cityName: string;
  status: 'idle' | 'fetching' | 'acquired' | 'denied' | 'error';
  permissionState?: 'prompt' | 'granted' | 'denied' | 'unknown';
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

      const city =
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        data.countryName;

      if (city) return city;
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }

    return 'Your Location';
  };

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocation({
        lat: null,
        lng: null,
        cityName: '',
        status: 'error',
        errorMessage: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    // Check the browser's current permission state when supported.
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({
          name: 'geolocation',
        });

        if (permission.state === 'denied') {
          setLocation({
            lat: null,
            lng: null,
            cityName: '',
            status: 'denied',
            permissionState: 'denied',
            errorMessage:
              'Location access is blocked. Please allow location access in your browser settings.',
          });
          return;
        }
      } catch (err) {
        // Some browsers may not support querying geolocation permissions.
        console.warn('Could not check geolocation permission:', err);
      }
    }

    setLocation((prev) => ({
      ...prev,
      status: 'fetching',
      permissionState: 'prompt',
      cityName: 'Acquiring Location...',
      errorMessage: undefined,
    }));

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
          permissionState: 'granted',
        });
      },
      (error) => {
        console.warn('Geolocation access failed:', error.message);

        setLocation({
          lat: null,
          lng: null,
          cityName: '',
          status: error.code === error.PERMISSION_DENIED ? 'denied' : 'error',
          permissionState:
            error.code === error.PERMISSION_DENIED ? 'denied' : 'unknown',
          errorMessage:
            error.code === error.PERMISSION_DENIED
              ? 'Location access was denied. Please allow location access in your browser settings.'
              : error.message,
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

  return {
    location,
    requestLocation,
  };
}