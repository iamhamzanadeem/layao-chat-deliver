import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
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

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mx-4 my-2">
      <div className="flex gap-3 p-3">
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt={data.name}
            className="w-20 h-20 rounded-lg object-cover bg-muted"
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
            <span className="text-primary font-semibold">
              Rs. {data.price.toFixed(0)}/{data.unit}
            </span>
            
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
