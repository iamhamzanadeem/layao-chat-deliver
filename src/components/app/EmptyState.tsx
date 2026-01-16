import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Package, 
  MapPin, 
  MessageCircle,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyStateType = 'cart' | 'orders' | 'addresses' | 'chat';

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  emoji: string;
}

const emptyStateConfigs: Record<EmptyStateType, EmptyStateConfig> = {
  cart: {
    icon: ShoppingBag,
    title: 'Your cart is empty',
    description: 'Add items by chatting or browsing the menu',
    emoji: '🛒',
  },
  orders: {
    icon: Package,
    title: 'No orders yet',
    description: 'Your order history will appear here',
    emoji: '📦',
  },
  addresses: {
    icon: MapPin,
    title: 'No saved addresses',
    description: 'Add a delivery address to get started',
    emoji: '📍',
  },
  chat: {
    icon: MessageCircle,
    title: 'Start a conversation',
    description: 'Tell us what you\'d like to order',
    emoji: '💬',
  },
};

interface EmptyStateProps {
  type: EmptyStateType;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ type, actionLabel, onAction }: EmptyStateProps) => {
  const config = emptyStateConfigs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4"
      >
        <span className="text-4xl">{config.emoji}</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-foreground text-lg mb-1">
          {config.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          {config.description}
        </p>
      </motion.div>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button onClick={onAction} className="gap-2">
            <Icon className="w-4 h-4" />
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
