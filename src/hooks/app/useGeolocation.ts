import { useState, useEffect, useCallback } from 'react';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isLoading: boolean;
  isSupported: boolean;
  requestPermission: () => void;
  clearPosition: () => void;
}

const GEOLOCATION_STORAGE_KEY = 'user_geolocation';
const POSITION_MAX_AGE = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for managing user geolocation with caching and permission handling
 */
export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watchPosition = false,
  } = options;

  const [position, setPosition] = useState<GeolocationPosition | null>(() => {
    // Try to restore from localStorage
    try {
      const cached = localStorage.getItem(GEOLOCATION_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as GeolocationPosition;
        // Check if cached position is still valid
        if (Date.now() - parsed.timestamp < POSITION_MAX_AGE) {
          return parsed;
        }
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  });

  const [error, setError] = useState<GeolocationError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported] = useState(() => 'geolocation' in navigator);

  const handleSuccess = useCallback((pos: GeolocationPositionType) => {
    const newPosition: GeolocationPosition = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: Date.now(),
    };

    setPosition(newPosition);
    setError(null);
    setIsLoading(false);

    // Cache position in localStorage
    try {
      localStorage.setItem(GEOLOCATION_STORAGE_KEY, JSON.stringify(newPosition));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const errorMap: Record<number, string> = {
      1: 'Location permission denied. Please enable location access in your browser settings.',
      2: 'Unable to determine your location. Please check your GPS or network connection.',
      3: 'Location request timed out. Please try again.',
    };

    setError({
      code: err.code,
      message: errorMap[err.code] || 'An unknown error occurred while getting your location.',
    });
    setIsLoading(false);
  }, []);

  const requestPermission = useCallback(() => {
    if (!isSupported) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    if (watchPosition) {
      navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);
    } else {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);
    }
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, watchPosition, handleSuccess, handleError]);

  const clearPosition = useCallback(() => {
    setPosition(null);
    setError(null);
    try {
      localStorage.removeItem(GEOLOCATION_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Auto-request on mount if we have a cached position (user has previously granted permission)
  useEffect(() => {
    if (position && Date.now() - position.timestamp > maximumAge) {
      // Cached position is stale, request fresh one
      requestPermission();
    }
  }, []);

  return {
    position,
    error,
    isLoading,
    isSupported,
    requestPermission,
    clearPosition,
  };
};

// Type alias for native GeolocationPosition
type GeolocationPositionType = globalThis.GeolocationPosition;
