import { useState } from 'react';
import { Plus, Minus, Check, AlertTriangle, Flame, Tag, List, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrder } from '@/contexts/OrderContext';
import type { ExtendedProduct } from '@/types/chat';

interface ProductResultsProps {
  products: ExtendedProduct[];
  keywords: string[];
  groupedProducts?: Record<string, ExtendedProduct[]>;
}

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
type ViewMode = 'list' | 'grid';

interface StockInfo {
  label: string;
  variant: StockStatus;
  color: string;
}

const getStockInfo = (status: string): StockInfo => {
  switch (status) {
    case 'low_stock':
      return { label: 'Low Stock', variant: 'low_stock', color: 'text-warning bg-warning/10 border-warning/20' };
    case 'out_of_stock':
      return { label: 'Out of Stock', variant: 'out_of_stock', color: 'text-destructive bg-destructive/10 border-destructive/20' };
    default:
      return { label: 'In Stock', variant: 'in_stock', color: 'text-success bg-success/10 border-success/20' };
  }
};

// Emoji mapping for common product categories
const getTermEmoji = (term: string): string => {
  const emojiMap: Record<string, string> = {
    egg: '🥚',
    eggs: '🥚',
    bread: '🍞',
    milk: '🥛',
    chicken: '🍗',
    meat: '🥩',
    fish: '🐟',
    fruit: '🍎',
    fruits: '🍎',
    vegetable: '🥬',
    vegetables: '🥬',
    rice: '🍚',
    juice: '🧃',
    water: '💧',
    cheese: '🧀',
    butter: '🧈',
    oil: '🫒',
    sugar: '🍬',
    salt: '🧂',
    tomato: '🍅',
    potato: '🥔',
    onion: '🧅',
    apple: '🍎',
    banana: '🍌',
    orange: '🍊',
  };
  
  const lowerTerm = term.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerTerm.includes(key)) {
      return emoji;
    }
  }
  return '🛒';
};

interface ProductItemProps {
  product: ExtendedProduct;
  quantity: number;
  wasJustAdded: boolean;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  index: number;
}

// Shared quantity controls component
const QuantityControls = ({ 
  quantity, 
  isOutOfStock, 
  onAdd, 
  onIncrease, 
  onDecrease,
  compact = false 
}: { 
  quantity: number; 
  isOutOfStock: boolean;
  onAdd: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  compact?: boolean;
}) => {
  if (isOutOfStock) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className={`${compact ? 'h-7 px-2' : 'w-full h-7'} text-xs opacity-50 cursor-not-allowed`}
        disabled
      >
        Unavailable
      </Button>
    );
  }

  if (quantity > 0) {
    return (
      <motion.div 
        layout
        className={`flex items-center justify-between bg-primary/10 rounded-lg ${compact ? 'p-0.5 gap-1' : 'p-1'}`}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 hover:bg-primary/20"
          onClick={onDecrease}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <motion.span 
          key={quantity}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-sm font-medium text-primary min-w-[1.25rem] text-center"
        >
          {quantity}
        </motion.span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 hover:bg-primary/20"
          onClick={onIncrease}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        size="sm"
        className={`${compact ? 'h-7 px-3' : 'w-full h-7'} text-xs`}
        onClick={onAdd}
      >
        <Plus className="w-3 h-3 mr-1" />
        Add
      </Button>
    </motion.div>
  );
};

// Added checkmark overlay component
const AddedOverlay = ({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
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
);

// List View Item - Compact horizontal row
const ProductListItem = ({ product, quantity, wasJustAdded, onAdd, onIncrease, onDecrease, index }: ProductItemProps) => {
  const stockInfo = getStockInfo(product.stock_status);
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const hasDiscount = product.discount_percent && product.discount_percent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 bg-card rounded-xl border border-border p-2 hover:shadow-sm transition-shadow"
    >
      {/* Small square image */}
      <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-xl">🛒</span>
          </div>
        )}
        <AddedOverlay show={wasJustAdded} />
      </div>

      {/* Product info - grows to fill space */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="font-medium text-sm truncate max-w-[140px]" title={product.name}>
            {product.name}
          </h4>
          {product.is_popular && (
            <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
          )}
          {hasDiscount && (
            <Badge 
              variant="secondary" 
              className="bg-success/90 text-white hover:bg-success text-[9px] px-1 py-0 h-4"
            >
              {product.discount_percent}%
            </Badge>
          )}
          {product.stock_status === 'low_stock' && (
            <Badge 
              variant="outline" 
              className={`text-[9px] px-1 py-0 h-4 ${stockInfo.color}`}
            >
              <AlertTriangle className="w-2 h-2 mr-0.5" />
              Low
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-primary font-medium">
            Rs. {Number(product.price).toFixed(0)}/{product.unit}
          </span>
          {hasDiscount && product.original_price && (
            <span className="text-[10px] text-muted-foreground line-through">
              Rs. {Number(product.original_price).toFixed(0)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity controls - fixed width on right */}
      <div className="flex-shrink-0">
        <QuantityControls
          quantity={quantity}
          isOutOfStock={isOutOfStock}
          onAdd={onAdd}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          compact
        />
      </div>
    </motion.div>
  );
};

// Grid View Item - Vertical card for horizontal scroll
const ProductGridItem = ({ product, quantity, wasJustAdded, onAdd, onIncrease, onDecrease, index }: ProductItemProps) => {
  const stockInfo = getStockInfo(product.stock_status);
  const isOutOfStock = product.stock_status === 'out_of_stock';
  const hasDiscount = product.discount_percent && product.discount_percent > 0;

  return (
    <motion.div
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
          {product.is_popular && (
            <Badge 
              variant="secondary" 
              className="bg-orange-500/90 text-white hover:bg-orange-500 gap-0.5 text-[9px] px-1 py-0"
            >
              <Flame className="w-2.5 h-2.5" />
              Hot
            </Badge>
          )}
          
          {hasDiscount && (
            <Badge 
              variant="secondary" 
              className="bg-success/90 text-white hover:bg-success gap-0.5 text-[9px] px-1 py-0"
            >
              <Tag className="w-2.5 h-2.5" />
              {product.discount_percent}%
            </Badge>
          )}
          
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

        <AddedOverlay show={wasJustAdded} />
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
          <QuantityControls
            quantity={quantity}
            isOutOfStock={isOutOfStock}
            onAdd={onAdd}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
          />
        </div>
      </div>
    </motion.div>
  );
};

// Section header for grouped results
const GroupHeader = ({ term, count }: { term: string; count: number }) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 mb-2"
  >
    <span className="text-lg">{getTermEmoji(term)}</span>
    <h3 className="font-medium text-sm capitalize text-foreground">{term}</h3>
    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
      {count} item{count !== 1 ? 's' : ''}
    </Badge>
  </motion.div>
);

const ProductResults = ({ products, keywords, groupedProducts }: ProductResultsProps) => {
  const { items, addItem, updateQuantity, removeItem } = useOrder();
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleAdd = (product: ExtendedProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      unit: product.unit,
      imageUrl: product.image_url || undefined,
    });
    
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

  // Render products for a section (grouped or flat)
  const renderProductList = (sectionProducts: ExtendedProduct[], startIndex = 0) => {
    if (viewMode === 'list') {
      return (
        <div className="flex flex-col gap-2">
          {sectionProducts.map((product, index) => (
            <ProductListItem
              key={product.id}
              product={product}
              quantity={getQuantity(product.id)}
              wasJustAdded={justAdded === product.id}
              onAdd={() => handleAdd(product)}
              onIncrease={() => handleIncrease(product)}
              onDecrease={() => handleDecrease(product)}
              index={startIndex + index}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {sectionProducts.map((product, index) => (
          <ProductGridItem
            key={product.id}
            product={product}
            quantity={getQuantity(product.id)}
            wasJustAdded={justAdded === product.id}
            onAdd={() => handleAdd(product)}
            onIncrease={() => handleIncrease(product)}
            onDecrease={() => handleDecrease(product)}
            index={startIndex + index}
          />
        ))}
      </div>
    );
  };

  // Check if we should show grouped view
  const hasGroupedResults = groupedProducts && Object.keys(groupedProducts).length > 1;

  return (
    <div className="bg-muted/30 rounded-2xl rounded-tl-sm p-3 max-w-[90%]">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">
          Found {products.length} item{products.length !== 1 ? 's' : ''} matching "{keywords.join(', ')}":
        </p>
        <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
          <Button
            size="icon"
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            className="h-6 w-6"
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            className="h-6 w-6"
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Product display - Grouped or Flat */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {hasGroupedResults ? (
            // Grouped view - separate sections for each search term
            <div className="space-y-4">
              {Object.entries(groupedProducts).map(([term, termProducts], groupIndex) => (
                <div key={term}>
                  <GroupHeader term={term} count={termProducts.length} />
                  {renderProductList(termProducts, groupIndex * 10)}
                </div>
              ))}
            </div>
          ) : (
            // Flat list - single section
            renderProductList(products)
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductResults;
