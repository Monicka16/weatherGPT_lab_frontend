import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
  useRef,
} from 'react';
import type { ReactNode } from 'react';

export interface LocationState {
  lat: number | null;
  lng: number | null;
  cityName: string;
  status: 'idle' | 'fetching' | 'acquired' | 'denied' | 'error';
  permissionState?: 'prompt' | 'granted' | 'denied' | 'unknown';
  errorMessage?: string;
}

interface LocationContextValue {
  location: LocationState;
  requestLocation: () => Promise<void>;
  waitForLocation: () => Promise<LocationState>;
}

const LocationContext = createContext<LocationContextValue | undefined>(
  undefined
);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    cityName: 'Acquiring Location...',
    status: 'idle',
  });

  // Store waiting promises in a ref instead of React state.
  // These are temporary callbacks, not UI state.
  const waitersRef = useRef<Array<(location: LocationState) => void>>([]);

  const fetchCityName = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );

        if (!res.ok) {
          throw new Error('Geocoding failed');
        }

        const data = await res.json();

        const city =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          data.countryName;

        if (city) {
          return city;
        }
      } catch (err) {
        console.warn('Reverse geocoding error:', err);
      }

      return 'Your Location';
    },
    []
  );

  const resolveWaiters = useCallback((newLocation: LocationState) => {
    const currentWaiters = waitersRef.current;

    // Clear them first so a callback cannot accidentally
    // remain registered if something else happens during resolution.
    waitersRef.current = [];

    currentWaiters.forEach((resolve) => {
      resolve(newLocation);
    });
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const newLocation: LocationState = {
        lat: null,
        lng: null,
        cityName: '',
        status: 'error',
        errorMessage: 'Geolocation is not supported by your browser.',
      };

      setLocation(newLocation);
      resolveWaiters(newLocation);
      return;
    }

    // Check the browser's current permission state when supported.
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({
          name: 'geolocation',
        });

        if (permission.state === 'denied') {
          const newLocation: LocationState = {
            lat: null,
            lng: null,
            cityName: '',
            status: 'denied',
            permissionState: 'denied',
            errorMessage:
              'Location access is blocked. Please allow location access in your browser settings.',
          };

          setLocation(newLocation);
          resolveWaiters(newLocation);
          return;
        }
      } catch (err) {
        console.warn(
          'Could not check geolocation permission:',
          err
        );
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

        // Make the coordinates available immediately.
        // We don't wait for reverse geocoding because the chatbot
        // only needs the coordinates to fetch weather.
        const acquiredLocation: LocationState = {
          lat,
          lng,
          cityName: 'Your Location',
          status: 'acquired',
          permissionState: 'granted',
        };

        setLocation(acquiredLocation);

        // Anything waiting for location can now continue.
        resolveWaiters(acquiredLocation);

        // Reverse geocode separately so it doesn't delay weather requests.
        const cityName = await fetchCityName(lat, lng);

        setLocation((prev) => ({
          ...prev,
          cityName,
        }));
      },
      (error) => {
        console.warn(
          'Geolocation access failed:',
          error.message
        );

        const newLocation: LocationState = {
          lat: null,
          lng: null,
          cityName: '',
          status:
            error.code === error.PERMISSION_DENIED
              ? 'denied'
              : 'error',
          permissionState:
            error.code === error.PERMISSION_DENIED
              ? 'denied'
              : 'unknown',
          errorMessage:
            error.code === error.PERMISSION_DENIED
              ? 'Location access was denied. Please allow location access in your browser settings.'
              : error.message,
        };

        setLocation(newLocation);
        resolveWaiters(newLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [fetchCityName, resolveWaiters]);

  useEffect(() => {
    requestLocation();

    return () => {
      // Prevent unresolved promises from lingering if the provider unmounts.
      waitersRef.current = [];
    };
  }, [requestLocation]);

  const waitForLocation = useCallback((): Promise<LocationState> => {
    // Location has already been resolved.
    if (
      location.status === 'acquired' ||
      location.status === 'denied' ||
      location.status === 'error'
    ) {
      return Promise.resolve(location);
    }

    // Location is still being acquired.
    return new Promise<LocationState>((resolve) => {
      waitersRef.current.push(resolve);
    });
  }, [location]);

  return (
    <LocationContext.Provider
      value={{
        location,
        requestLocation,
        waitForLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useGeolocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      'useGeolocation must be used inside LocationProvider'
    );
  }

  return context;
}
