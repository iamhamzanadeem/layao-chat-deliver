import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CategorySelector from './CategorySelector';
import ProductGrid from './ProductGrid';
import { collapseVariants, smoothTransition } from '@/lib/animations';

interface BrowsePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const BrowsePanel = ({
  isOpen,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}: BrowsePanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={collapseVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={smoothTransition}
          className="border-b border-border bg-muted/30 overflow-hidden"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Browse Menu</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Categories */}
            <CategorySelector 
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={onSelectCategory}
            />
            
            {/* Products Grid */}
            <div className="mt-4 max-h-64 overflow-y-auto scrollbar-hide">
              <ProductGrid categoryId={selectedCategoryId} />
            </div>

            {/* Collapse Indicator */}
            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center pt-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close browse panel"
            >
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrowsePanel;
