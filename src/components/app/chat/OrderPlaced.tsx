import { CheckCircle2, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DeliveryType } from '@/contexts/OrderContext';

interface OrderPlacedProps {
  orderNumber: string;
  deliveryType: DeliveryType;
}

const OrderPlaced = ({ orderNumber, deliveryType }: OrderPlacedProps) => {
  return (
    <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3"
        >
          <CheckCircle2 className="w-8 h-8 text-success" />
        </motion.div>

        <h3 className="font-bold text-foreground text-lg mb-1">
          Order Placed! 🎉
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          Your order <span className="font-mono font-bold text-primary">{orderNumber}</span> has been received.
        </p>

        <div className="bg-card rounded-lg p-3 border border-border">
          <div className="flex items-center justify-center gap-2 text-sm">
            {deliveryType === 'instant' ? (
              <>
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-foreground">
                  Expected delivery in <strong className="text-primary">30-45 minutes</strong>
                </span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4 text-success" />
                <span className="text-foreground">
                  Flexible delivery <strong className="text-success">anytime today</strong>
                </span>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          We'll keep you updated on your order status! 📱
        </p>
      </motion.div>
    </div>
  );
};

export default OrderPlaced;
