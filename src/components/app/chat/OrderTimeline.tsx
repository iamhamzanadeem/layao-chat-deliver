import { motion } from 'framer-motion';
import { 
  ClipboardCheck, 
  ChefHat, 
  Bike, 
  CheckCircle2, 
  Clock,
  XCircle 
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  confirmedAt?: string | null;
  deliveredAt?: string | null;
}

const statusSteps = [
  { 
    key: 'pending', 
    label: 'Order Placed', 
    icon: ClipboardCheck,
    description: 'We received your order'
  },
  { 
    key: 'confirmed', 
    label: 'Confirmed', 
    icon: CheckCircle2,
    description: 'Order confirmed by store'
  },
  { 
    key: 'preparing', 
    label: 'Preparing', 
    icon: ChefHat,
    description: 'Getting your items ready'
  },
  { 
    key: 'on_the_way', 
    label: 'On the Way', 
    icon: Bike,
    description: 'Your order is out for delivery'
  },
  { 
    key: 'delivered', 
    label: 'Delivered', 
    icon: CheckCircle2,
    description: 'Enjoy your order!'
  },
] as const;

const statusOrder: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  preparing: 2,
  on_the_way: 3,
  delivered: 4,
  cancelled: -1,
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

const OrderTimeline = ({ status, createdAt, confirmedAt, deliveredAt }: OrderTimelineProps) => {
  const currentStep = statusOrder[status];

  if (status === 'cancelled') {
    return (
      <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20">
        <div className="flex items-center gap-3 text-destructive">
          <XCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Order Cancelled</p>
            <p className="text-xs text-muted-foreground">This order was cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">Order Status</h4>
        {status !== 'delivered' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. 30-45 min</span>
          </div>
        )}
      </div>

      <div className="relative">
        {statusSteps.map((step, index) => {
          const isCompleted = currentStep >= index;
          const isCurrent = currentStep === index;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 relative"
            >
              {/* Vertical line connector */}
              {index < statusSteps.length - 1 && (
                <div 
                  className={`absolute left-[15px] top-8 w-0.5 h-8 transition-colors ${
                    isCompleted && currentStep > index ? 'bg-success' : 'bg-border'
                  }`}
                />
              )}

              {/* Step icon */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? [1, 1.1, 1] : 1,
                  backgroundColor: isCompleted 
                    ? 'hsl(var(--success))' 
                    : 'hsl(var(--muted))',
                }}
                transition={{
                  scale: { repeat: isCurrent ? Infinity : 0, duration: 2 },
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'text-success-foreground' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </motion.div>

              {/* Step content */}
              <div className="pb-6 flex-1">
                <p className={`font-medium text-sm ${
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
                {/* Show timestamps */}
                {step.key === 'pending' && createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(createdAt)}
                  </p>
                )}
                {step.key === 'confirmed' && confirmedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(confirmedAt)}
                  </p>
                )}
                {step.key === 'delivered' && deliveredAt && (
                  <p className="text-xs text-success mt-1">
                    {formatTime(deliveredAt)}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
