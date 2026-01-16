import { motion } from 'framer-motion';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton = ({ count = 3 }: ProductSkeletonProps) => {
  return (
    <div className="bg-muted/30 rounded-2xl rounded-tl-sm p-3 max-w-[90%]">
      <div className="h-4 w-48 bg-muted rounded animate-pulse mb-3" />
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: index * 0.2,
            }}
            className="flex-shrink-0 w-36 bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Image skeleton */}
            <div className="aspect-square bg-muted" />
            
            {/* Content skeleton */}
            <div className="p-2 space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-7 w-full bg-muted rounded-lg mt-2" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductSkeleton;
