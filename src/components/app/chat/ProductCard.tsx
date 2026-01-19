import { Plus, Minus, Flame, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/contexts/OrderContext';
import { cn } from '@/lib/utils';
import type { ProductCardData } from '@/types/chat';

interface ProductCardProps {
  data: ProductCardData;
}

const ProductCard = ({ data }: ProductCardProps) => {
  const { items, addItem, updateQuantity, removeItem } = useOrder();
  const cartItem = items.find((item) => item.productId === data.productId);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem({
      productId: data.productId,
      name: data.name,
      price: data.price,
      quantity: 1,
      unit: data.unit,
      imageUrl: data.imageUrl,
    });
  };

  const handleIncrease = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, quantity + 1);
    } else {
      handleAdd();
    }
  };

  const handleDecrease = () => {
    if (cartItem && quantity > 1) {
      updateQuantity(cartItem.id, quantity - 1);
    } else if (cartItem) {
      removeItem(cartItem.id);
    }
  };

  const hasDiscount = data.discountPercent && data.discountPercent > 0 && data.originalPrice;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mx-4 my-2 relative">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {data.isPopular && (
          <Badge 
            variant="secondary" 
            className="bg-orange-500/90 text-white hover:bg-orange-500 gap-1 text-[10px] px-1.5 py-0.5"
          >
            <Flame className="w-3 h-3" />
            Popular
          </Badge>
        )}
        {hasDiscount && (
          <Badge 
            variant="secondary" 
            className="bg-success/90 text-white hover:bg-success gap-1 text-[10px] px-1.5 py-0.5"
          >
            <Tag className="w-3 h-3" />
            {data.discountPercent}% OFF
          </Badge>
        )}
      </div>

      <div className="flex gap-3 p-3">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.name}
            className={cn(
              "w-20 h-20 rounded-lg object-cover bg-muted",
              (data.isPopular || hasDiscount) && "ring-2 ring-primary/20"
            )}
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{data.name}</h4>
          {data.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {data.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold">
                Rs. {data.price.toFixed(0)}/{data.unit}
              </span>
              {hasDiscount && data.originalPrice && (
                <span className="text-muted-foreground text-xs line-through">
                  Rs. {data.originalPrice.toFixed(0)}
                </span>
              )}
            </div>
            
            {quantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleDecrease}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-6 text-center font-medium">{quantity}</span>
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={handleIncrease}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                className="h-8 rounded-full px-4"
                onClick={handleAdd}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;