import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/app/useCategories';
import { Skeleton } from '@/components/ui/skeleton';

interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategorySelector = ({ selectedCategoryId, onSelectCategory }: CategorySelectorProps) => {
  const { data: categories = [], isLoading } = useCategories();

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
    <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
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

      {categories.map((category) => (
        <motion.button
          key={category.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(
            selectedCategoryId === category.id ? null : category.id
          )}
          className={`flex flex-col items-center p-3 rounded-xl border transition-colors flex-shrink-0 min-w-[72px] ${
            selectedCategoryId === category.id
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card hover:bg-muted/50'
          }`}
        >
          <span className="text-xl mb-1">{category.icon || '📦'}</span>
          <span className="text-xs font-medium truncate max-w-[60px]">{category.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default CategorySelector;
