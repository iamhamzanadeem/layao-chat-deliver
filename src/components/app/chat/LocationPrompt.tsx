import { MapPin, Navigation, AlertCircle, Store, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/contexts/LocationContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LocationPromptProps {
  compact?: boolean;
}

const LocationPrompt = ({ compact = false }: LocationPromptProps) => {
  const {
    position,
    locationError,
    isLoadingLocation,
    isLocationSupported,
    nearbyRestaurants,
    selectedRestaurant,
    isLoadingRestaurants,
    isWithinDeliveryZone,
    deliveryMessage,
    requestLocation,
    selectRestaurant,
  } = useLocation();

  // If location is available and we're in delivery zone, show compact status
  if (position && isWithinDeliveryZone && compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs"
      >
        <Store className="w-3 h-3" />
        <span className="truncate max-w-[200px]">{deliveryMessage}</span>
      </motion.div>
    );
  }

  // No location support
  if (!isLocationSupported) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Location Not Supported</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your browser doesn't support location services. Please use a different browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No location yet - prompt to enable
  if (!position) {
    return (
      <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-chat-bot-foreground">
              Enable Location
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              See stores that can deliver to you
            </p>
          </div>
        </div>

        {locationError && (
          <div className="mb-3 p-2 bg-destructive/10 rounded-lg">
            <p className="text-xs text-destructive">{locationError.message}</p>
          </div>
        )}

        <Button
          onClick={requestLocation}
          disabled={isLoadingLocation}
          className="w-full gap-2"
          size="sm"
        >
          {isLoadingLocation ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Share My Location
            </>
          )}
        </Button>
      </div>
    );
  }

  // Loading restaurants
  if (isLoadingRestaurants) {
    return (
      <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          <p className="text-sm text-chat-bot-foreground">Finding nearby stores...</p>
        </div>
      </div>
    );
  }

  // No nearby restaurants
  if (nearbyRestaurants.length === 0) {
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Store className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">No Stores Nearby</p>
            <p className="text-xs text-muted-foreground mt-1">
              We don't have any stores in your area yet. Check back soon!
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={requestLocation}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry Location
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Outside delivery zone
  if (!isWithinDeliveryZone) {
    const closestRestaurant = nearbyRestaurants[0];
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Outside Delivery Zone</p>
            <p className="text-xs text-muted-foreground mt-1">
              The nearest store ({closestRestaurant?.name}) is {closestRestaurant?.distance_km?.toFixed(1)}km away, 
              which is outside their {closestRestaurant?.delivery_radius_km}km delivery radius.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show available restaurants in delivery zone
  const deliverableRestaurants = nearbyRestaurants.filter((r) => r.is_within_delivery_radius);

  return (
    <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
      <p className="text-sm text-chat-bot-foreground mb-3">
        📍 {deliverableRestaurants.length} store{deliverableRestaurants.length > 1 ? 's' : ''} can deliver to you:
      </p>
      <div className="space-y-2">
        {deliverableRestaurants.slice(0, 3).map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() => selectRestaurant(restaurant)}
            className={cn(
              'w-full p-3 rounded-xl border-2 transition-all text-left',
              selectedRestaurant?.id === restaurant.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">{restaurant.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {restaurant.distance_km?.toFixed(1)}km
              </span>
            </div>
            {restaurant.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {restaurant.description}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LocationPrompt;
