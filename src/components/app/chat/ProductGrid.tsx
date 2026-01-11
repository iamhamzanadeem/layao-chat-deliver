import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts, type Product } from '@/hooks/app/useProducts';
import { useOrder } from '@/contexts/OrderContext';

interface ProductGridProps {
  categoryId: string | null;
  search?: string;
}

const ProductGrid = ({ categoryId, search }: ProductGridProps) => {
  const { data: products = [], isLoading } = useProducts({ categoryId, search });
  const { items, addItem, updateQuantity } = useOrder();

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const getCartItemId = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    return item?.id;
  };

  const handleAddProduct = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      imageUrl: product.image_url || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No products found</p>
        <p className="text-xs mt-1">Try a different category or search term</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => {
        const qty = getItemQuantity(product.id);
        const cartItemId = getCartItemId(product.id);

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-3"
          >
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center text-3xl mb-2 overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                '📦'
              )}
            </div>
            <h4 className="font-medium text-sm truncate">{product.name}</h4>
            <p className="text-primary font-semibold text-sm">Rs. {product.price}</p>
            <p className="text-xs text-muted-foreground">per {product.unit}</p>
            
            <div className="mt-2">
              {qty > 0 && cartItemId ? (
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => updateQuantity(cartItemId, qty - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="font-medium">{qty}</span>
                  <Button
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => updateQuantity(cartItemId, qty + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full h-8"
                  onClick={() => handleAddProduct(product)}
                >
                  Add
                </Button>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
