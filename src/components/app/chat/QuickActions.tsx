import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  RotateCcw, 
  MapPin, 
  HelpCircle, 
  Flame,
  Percent 
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const quickActions = [
  { id: 'browse', icon: ShoppingBag, label: 'Browse Menu', highlight: true },
  { id: 'popular', icon: Flame, label: 'Popular' },
  { id: 'deals', icon: Percent, label: 'Deals' },
  { id: 'reorder', icon: RotateCcw, label: 'Reorder' },
  { id: 'track', icon: MapPin, label: 'Track Order' },
  { id: 'help', icon: HelpCircle, label: 'Help' },
];

const QuickActions = ({ onAction }: QuickActionsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollEl.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className="relative px-4 py-3 bg-muted/50 border-t border-border">
      {/* Scroll fade indicators */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-muted/50 to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-muted/50 to-transparent z-10 pointer-events-none" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                variant={action.highlight ? 'default' : 'secondary'}
                size="sm"
                className={`rounded-full h-8 px-3 gap-1.5 text-xs font-medium flex-shrink-0 ${
                  action.highlight 
                    ? 'shadow-sm shadow-primary/20' 
                    : 'hover:bg-secondary/80'
                }`}
                onClick={() => onAction(action.id)}
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
