import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useCategories } from '@/hooks/app/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategorySelector = ({ selectedCategoryId, onSelectCategory }: CategorySelectorProps) => {
  const { data: categories = [], isLoading } = useCategories();
  const [parentStack, setParentStack] = useState<string[]>([]);

  // Get current parent (last in stack, or null for root)
  const currentParentId = parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;

  // Filter categories to show children of current parent
  const visibleCategories = categories.filter(c => c.parent_id === currentParentId);

  // Check if a category has children
  const hasChildren = (categoryId: string) => 
    categories.some(c => c.parent_id === categoryId);

  // Get parent category name for breadcrumb
  const getParentName = (parentId: string | null): string => {
    if (!parentId) return 'All';
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || 'All';
  };

  const handleCategoryClick = (category: Category) => {
    if (hasChildren(category.id)) {
      // Navigate into subcategory
      setParentStack([...parentStack, category.id]);
      onSelectCategory(category.id);
    } else {
      // Select leaf category
      onSelectCategory(selectedCategoryId === category.id ? currentParentId : category.id);
    }
  };

  const handleBack = () => {
    const newStack = parentStack.slice(0, -1);
    setParentStack(newStack);
    onSelectCategory(newStack.length > 0 ? newStack[newStack.length - 1] : null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 px-1">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-20 flex-shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No categories available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Back button when in subcategory */}
      {parentStack.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-1 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {getParentName(parentStack.length > 1 ? parentStack[parentStack.length - 2] : null)}
        </Button>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
        {/* All button only at root level */}
        {parentStack.length === 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(null)}
            className={`flex flex-col items-center p-3 rounded-xl border transition-colors flex-shrink-0 min-w-[72px] ${
              selectedCategoryId === null
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:bg-muted/50'
            }`}
          >
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">All</span>
          </motion.button>
        )}

        {visibleCategories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(category)}
            className={`flex flex-col items-center p-3 rounded-xl border transition-colors flex-shrink-0 min-w-[72px] ${
              selectedCategoryId === category.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:bg-muted/50'
            }`}
          >
            <span className="text-xl mb-1">{category.icon || '📦'}</span>
            <span className="text-xs font-medium truncate max-w-[60px]">
              {category.name}
            </span>
            {hasChildren(category.id) && (
              <span className="text-[10px] text-muted-foreground">▼</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
