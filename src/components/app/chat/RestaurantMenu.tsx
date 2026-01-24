import { motion } from 'framer-motion';
import { ArrowLeft, Utensils, Clock, MapPin, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePartnerRestaurant, useRestaurantMenu } from '@/hooks/app/usePartnerRestaurants';
import { useOrder } from '@/contexts/OrderContext';
import { fadeInUp } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface RestaurantMenuProps {
  restaurantId: string;
  onBack: () => void;
  onClose: () => void;
}

const RestaurantMenu = ({ restaurantId, onBack, onClose }: RestaurantMenuProps) => {
  const { data: restaurant, isLoading: isLoadingRestaurant } = usePartnerRestaurant(restaurantId);
  const { data: menuItems, isLoading: isLoadingMenu } = useRestaurantMenu(restaurantId);
  const { items, addItem, updateQuantity, removeItem } = useOrder();

  const isLoading = isLoadingRestaurant || isLoadingMenu;

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const handleAddItem = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      unit: product.unit,
      imageUrl: product.image_url,
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const currentQty = getItemQuantity(productId);
    const newQty = currentQty + delta;
    
    if (newQty <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQty);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg"
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            {isLoadingRestaurant ? (
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              </div>
            ) : restaurant ? (
              <>
                <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {restaurant.cuisine_type && <span>{restaurant.cuisine_type}</span>}
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {restaurant.average_prep_time || 30} min
                  </div>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">Restaurant not found</span>
            )}
          </div>
        </div>

        {restaurant?.address && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{restaurant.address}</span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="max-h-96 overflow-y-auto p-2 space-y-2">
        {isLoadingMenu ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))
        ) : menuItems && menuItems.length > 0 ? (
          menuItems.map((item) => {
            const quantity = getItemQuantity(item.id);
            
            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Image */}
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {item.name}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-primary">
                          Rs. {Number(item.price).toFixed(0)}
                        </span>

                        {/* Add/Update Controls */}
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-6 text-center font-medium text-sm">
                              {quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddItem(item)}
                            className="h-7"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Utensils className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No menu items available yet.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-center text-muted-foreground">
          Items will be added to your cart
        </p>
      </div>
    </motion.div>
  );
};

export default RestaurantMenu;
