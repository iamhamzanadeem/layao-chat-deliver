import { useState } from 'react';
import { Plus, Minus, Check, AlertTriangle, Flame, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/contexts/OrderContext';
import type { ExtendedProduct } from '@/types/chat';

interface ProductResultsProps {
  products: ExtendedProduct[];
  keywords: string[];
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

const getStockInfo = (status: string): { label: string; variant: StockStatus; color: string } => {
  switch (status) {
    case 'low_stock':
      return { label: 'Low Stock', variant: 'low_stock', color: 'text-warning bg-warning/10 border-warning/20' };
    case 'out_of_stock':
      return { label: 'Out of Stock', variant: 'out_of_stock', color: 'text-destructive bg-destructive/10 border-destructive/20' };
    default:
      return { label: 'In Stock', variant: 'in_stock', color: 'text-success bg-success/10 border-success/20' };
  }
};

const ProductResults = ({ products, keywords }: ProductResultsProps) => {
  const { items, addItem, updateQuantity, removeItem } = useOrder();
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const handleAdd = (product: ExtendedProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      unit: product.unit,
      imageUrl: product.image_url || undefined,
    });
    
    // Show checkmark animation
    setJustAdded(product.id);
    setTimeout(() => setJustAdded(null), 1000);
  };

  const handleIncrease = (product: ExtendedProduct) => {
    const existing = items.find((item) => item.productId === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      handleAdd(product);
    }
  };

  const handleDecrease = (product: ExtendedProduct) => {
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
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {products.map((product, index) => {
          const quantity = getQuantity(product.id);
          const stockInfo = getStockInfo(product.stock_status);
          const isOutOfStock = product.stock_status === 'out_of_stock';
          const wasJustAdded = justAdded === product.id;
          const hasDiscount = product.discount_percent && product.discount_percent > 0;
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="flex-shrink-0 w-36 bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-opacity ${isOutOfStock ? 'opacity-50' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-3xl">🛒</span>
                  </div>
                )}
                
                {/* Badges container */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {/* Popular badge */}
                  {product.is_popular && (
                    <Badge 
                      variant="secondary" 
                      className="bg-orange-500/90 text-white hover:bg-orange-500 gap-0.5 text-[9px] px-1 py-0"
                    >
                      <Flame className="w-2.5 h-2.5" />
                      Hot
                    </Badge>
                  )}
                  
                  {/* Discount badge */}
                  {hasDiscount && (
                    <Badge 
                      variant="secondary" 
                      className="bg-success/90 text-white hover:bg-success gap-0.5 text-[9px] px-1 py-0"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {product.discount_percent}%
                    </Badge>
                  )}
                  
                  {/* Stock badge */}
                  {product.stock_status !== 'in_stock' && (
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] px-1 py-0 ${stockInfo.color}`}
                    >
                      {stockInfo.variant === 'low_stock' && (
                        <AlertTriangle className="w-2 h-2 mr-0.5" />
                      )}
                      {stockInfo.label}
                    </Badge>
                  )}
                </div>

                {/* Added checkmark overlay */}
                <AnimatePresence>
                  {wasJustAdded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute inset-0 bg-success/80 flex items-center justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        <Check className="w-10 h-10 text-success-foreground" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Product Info */}
              <div className="p-2">
                <h4 className="font-medium text-sm truncate" title={product.name}>
                  {product.name}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-primary font-medium">
                    Rs. {Number(product.price).toFixed(0)}/{product.unit}
                  </span>
                  {hasDiscount && product.original_price && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      Rs. {Number(product.original_price).toFixed(0)}
                    </span>
                  )}
                </div>
                
                {/* Add/Quantity Controls */}
                <div className="mt-2">
                  {isOutOfStock ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full h-7 text-xs opacity-50 cursor-not-allowed"
                      disabled
                    >
                      Unavailable
                    </Button>
                  ) : quantity > 0 ? (
                    <motion.div 
                      layout
                      className="flex items-center justify-between bg-primary/10 rounded-lg p-1"
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-primary/20"
                        onClick={() => handleDecrease(product)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <motion.span 
                        key={quantity}
                        initial={{ scale: 1.3 }}
                        animate={{ scale: 1 }}
                        className="text-sm font-medium text-primary"
                      >
                        {quantity}
                      </motion.span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-primary/20"
                        onClick={() => handleIncrease(product)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={() => handleAdd(product)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </motion.div>
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
