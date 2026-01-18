import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useGeolocation, type GeolocationPosition, type GeolocationError } from '@/hooks/app/useGeolocation';
import { useNearbyRestaurants, type Restaurant } from '@/hooks/app/useRestaurants';

interface LocationContextValue {
  // Geolocation state
  position: GeolocationPosition | null;
  locationError: GeolocationError | null;
  isLoadingLocation: boolean;
  isLocationSupported: boolean;
  
  // Restaurant state
  nearbyRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  isLoadingRestaurants: boolean;
  hasNearbyRestaurants: boolean;
  
  // Actions
  requestLocation: () => void;
  selectRestaurant: (restaurant: Restaurant | null) => void;
  clearLocation: () => void;
  
  // Computed
  isWithinDeliveryZone: boolean;
  deliveryMessage: string;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const {
    position,
    error: locationError,
    isLoading: isLoadingLocation,
    isSupported: isLocationSupported,
    requestPermission: requestLocation,
    clearPosition: clearLocation,
  } = useGeolocation({ watchPosition: false });

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const {
    data: nearbyRestaurants = [],
    isLoading: isLoadingRestaurants,
  } = useNearbyRestaurants({
    latitude: position?.latitude ?? null,
    longitude: position?.longitude ?? null,
    maxDistanceKm: 15,
    enabled: !!position,
  });

  // Auto-select first restaurant within delivery radius
  useEffect(() => {
    if (nearbyRestaurants.length > 0 && !selectedRestaurant) {
      const withinRadius = nearbyRestaurants.find((r) => r.is_within_delivery_radius);
      if (withinRadius) {
        setSelectedRestaurant(withinRadius);
      }
    }
  }, [nearbyRestaurants, selectedRestaurant]);

  const selectRestaurant = useCallback((restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant);
  }, []);

  const hasNearbyRestaurants = nearbyRestaurants.length > 0;
  
  const isWithinDeliveryZone = nearbyRestaurants.some((r) => r.is_within_delivery_radius);

  const deliveryMessage = (() => {
    if (isLoadingLocation) return 'Getting your location...';
    if (locationError) return locationError.message;
    if (!position) return 'Enable location to see nearby stores';
    if (isLoadingRestaurants) return 'Finding nearby stores...';
    if (!hasNearbyRestaurants) return 'No stores found in your area';
    if (!isWithinDeliveryZone) {
      const closestDistance = nearbyRestaurants[0]?.distance_km;
      return `Nearest store is ${closestDistance?.toFixed(1)}km away (outside delivery zone)`;
    }
    if (selectedRestaurant) {
      return `Delivering from ${selectedRestaurant.name} (${selectedRestaurant.distance_km?.toFixed(1)}km)`;
    }
    return `${nearbyRestaurants.filter((r) => r.is_within_delivery_radius).length} stores can deliver to you`;
  })();

  const value: LocationContextValue = {
    position,
    locationError,
    isLoadingLocation,
    isLocationSupported,
    nearbyRestaurants,
    selectedRestaurant,
    isLoadingRestaurants,
    hasNearbyRestaurants,
    requestLocation,
    selectRestaurant,
    clearLocation,
    isWithinDeliveryZone,
    deliveryMessage,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
