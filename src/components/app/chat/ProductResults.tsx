import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface ProductResultsProps {
  products: Product[];
  keywords: string[];
}

const ProductResults = ({ products, keywords }: ProductResultsProps) => {
  const { items, addItem, updateQuantity, removeItem } = useOrder();

  const handleAdd = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      unit: product.unit,
      imageUrl: product.image_url || undefined,
    });
  };

  const handleIncrease = (product: Product) => {
    const existing = items.find((item) => item.productId === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      handleAdd(product);
    }
  };

  const handleDecrease = (product: Product) => {
    const existing = items.find((item) => item.productId === product.id);
    if (existing) {
      if (existing.quantity <= 1) {
        removeItem(product.id);
      } else {
        updateQuantity(product.id, existing.quantity - 1);
      }
    }
  };

  const getQuantity = (productId: string): number => {
    const item = items.find((item) => item.productId === productId);
    return item?.quantity || 0;
  };

  return (
    <div className="bg-muted/30 rounded-2xl rounded-tl-sm p-3 max-w-[90%]">
      <p className="text-sm text-muted-foreground mb-3">
        Found {products.length} item{products.length !== 1 ? 's' : ''} matching "{keywords.join(', ')}":
      </p>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {products.map((product, index) => {
          const quantity = getQuantity(product.id);
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-36 bg-card rounded-xl border border-border overflow-hidden shadow-sm"
            >
              {/* Product Image */}
              <div className="aspect-square bg-muted relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-3xl">🛒</span>
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-2">
                <h4 className="font-medium text-sm truncate" title={product.name}>
                  {product.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Rs. {Number(product.price).toFixed(0)}/{product.unit}
                </p>
                
                {/* Add/Quantity Controls */}
                <div className="mt-2">
                  {quantity > 0 ? (
                    <div className="flex items-center justify-between bg-primary/10 rounded-lg p-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleDecrease(product)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium">{quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleIncrease(product)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs"
                      onClick={() => handleAdd(product)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductResults;
