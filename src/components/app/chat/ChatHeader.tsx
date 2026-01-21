import { motion } from 'framer-motion';
import { ShoppingCart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppSidebarMobile } from '@/components/app/AppSidebar';
import { cartBounce } from '@/lib/animations';

interface Restaurant {
  id: string;
  name: string;
}

interface ChatHeaderProps {
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string | null) => void;
  selectedRestaurant: Restaurant | null;
  onRequestLocation: () => void;
  itemCount: number;
  total: number;
  isCheckoutActive: boolean;
  onOpenCart: () => void;
}

const ChatHeader = ({
  selectedOrderId,
  onSelectOrder,
  selectedRestaurant,
  onRequestLocation,
  itemCount,
  total,
  isCheckoutActive,
  onOpenCart,
}: ChatHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-sidebar backdrop-blur-sm border-b border-sidebar-border px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AppSidebarMobile 
          selectedOrderId={selectedOrderId} 
          onSelectOrder={onSelectOrder} 
        />
        
        {/* Logo */}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold">L</span>
        </div>
        
        {/* Brand & Status */}
        <div>
          <h1 className="font-semibold text-foreground">Layao</h1>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-success">● Online</span>
            <span className="text-muted-foreground">•</span>
            {selectedRestaurant ? (
              <span className="flex items-center gap-1 text-primary">
                <MapPin className="w-3 h-3" />
                {selectedRestaurant.name}
              </span>
            ) : (
              <button 
                onClick={onRequestLocation}
                className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <MapPin className="w-3 h-3" />
                Set location
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Cart Button */}
      {itemCount > 0 && !isCheckoutActive && (
        <motion.div
          variants={cartBounce}
          initial="initial"
          animate="animate"
        >
          <Button
            size="sm"
            className="gap-2 relative"
            onClick={onOpenCart}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Rs. {total.toFixed(0)}</span>
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-accent text-accent-foreground"
            >
              {itemCount}
            </Badge>
          </Button>
        </motion.div>
      )}
    </header>
  );
};

export default ChatHeader;
