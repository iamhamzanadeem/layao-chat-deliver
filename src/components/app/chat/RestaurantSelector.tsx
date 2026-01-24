import { motion } from 'framer-motion';
import { Utensils, MapPin, Clock, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePartnerRestaurants } from '@/hooks/app/usePartnerRestaurants';
import { useLocation } from '@/contexts/LocationContext';
import { fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface RestaurantSelectorProps {
  onSelect: (restaurantId: string) => void;
  onClose: () => void;
}

const RestaurantSelector = ({ onSelect, onClose }: RestaurantSelectorProps) => {
  const { position } = useLocation();
  const { data: restaurants, isLoading } = usePartnerRestaurants({
    lat: position?.latitude,
    lng: position?.longitude,
    radiusKm: 15,
  });

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Utensils className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Partner Restaurants</h3>
            <p className="text-xs text-muted-foreground">Order from your favorite places</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Restaurant List */}
      <div className="max-h-80 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))
        ) : restaurants && restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelect(restaurant.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Image or Icon */}
                  {restaurant.image_url ? (
                    <img
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Utensils className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground truncate">
                        {restaurant.name}
                      </h4>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>

                    {restaurant.cuisine_type && (
                      <p className="text-sm text-muted-foreground">{restaurant.cuisine_type}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{restaurant.average_prep_time || 30} min</span>
                      </div>
                      {restaurant.address && (
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{restaurant.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No partner restaurants available in your area yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Use "Get Job Done" to order from any restaurant!
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {restaurants && restaurants.length > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <p className="text-xs text-center text-muted-foreground">
            Tap a restaurant to view their menu
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RestaurantSelector;
