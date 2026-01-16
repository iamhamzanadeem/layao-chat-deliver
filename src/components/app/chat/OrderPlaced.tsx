import { useEffect, useState } from 'react';
import { CheckCircle2, Package, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DeliveryType } from '@/contexts/OrderContext';

interface OrderPlacedProps {
  orderNumber: string;
  deliveryType: DeliveryType;
}

// Simple confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    initial={{ 
      y: -20, 
      x: Math.random() * 200 - 100,
      opacity: 1,
      scale: 0,
      rotate: 0
    }}
    animate={{ 
      y: 150, 
      x: Math.random() * 200 - 100,
      opacity: 0,
      scale: [0, 1, 1, 0.5],
      rotate: Math.random() * 360
    }}
    transition={{ 
      duration: 2,
      delay,
      ease: 'easeOut'
    }}
    className={`absolute w-2 h-2 rounded-sm ${color}`}
  />
);

const confettiColors = [
  'bg-success',
  'bg-primary',
  'bg-accent',
  'bg-warning',
  'bg-info',
];

const OrderPlaced = ({ orderNumber, deliveryType }: OrderPlacedProps) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%] relative overflow-hidden">
      {/* Confetti celebration */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <ConfettiParticle 
                key={i} 
                delay={i * 0.05} 
                color={confettiColors[i % confettiColors.length]}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4 relative"
        >
          <CheckCircle2 className="w-10 h-10 text-success" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ delay: 0.5, duration: 1.5, repeat: 2 }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="w-5 h-5 text-warning" />
          </motion.div>
        </motion.div>

        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-bold text-foreground text-xl mb-1"
        >
          Order Placed! 🎉
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground mb-4"
        >
          Your order has been received
        </motion.p>

        {/* Animated order number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="inline-block bg-primary/10 rounded-xl px-4 py-2 mb-4"
        >
          <p className="text-xs text-muted-foreground">Order Number</p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-mono font-bold text-xl text-primary tracking-wider"
          >
            {orderNumber.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-card rounded-lg p-3 border border-border"
        >
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
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-xs text-muted-foreground mt-4"
        >
          We'll keep you updated on your order status! 📱
        </motion.p>
      </motion.div>
    </div>
  );
};

export default OrderPlaced;
