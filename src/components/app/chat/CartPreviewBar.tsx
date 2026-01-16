import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';

interface CartPreviewBarProps {
  onClick: () => void;
}

const CartPreviewBar = ({ onClick }: CartPreviewBarProps) => {
  const { itemCount, total } = useOrder();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="sticky bottom-0 z-30 px-4 pb-2"
        >
          <Button
            onClick={onClick}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 flex items-center justify-between px-4 gap-3"
          >
            <div className="flex items-center gap-3">
              <motion.div
                key={itemCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              </motion.div>
              <div className="flex flex-col items-start">
                <span className="text-xs text-primary-foreground/70">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-primary-foreground"
                >
                  Rs. {total.toFixed(0)}
                </motion.span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-primary-foreground">
              <span className="font-semibold">View Cart</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartPreviewBar;
