import { Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeliveryType } from '@/contexts/OrderContext';

interface DeliveryTypeSelectorProps {
  onSelect: (type: DeliveryType) => void;
}

const DeliveryTypeSelector = ({ onSelect }: DeliveryTypeSelectorProps) => {
  return (
    <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
      <p className="text-sm text-chat-bot-foreground mb-3">
        Choose your delivery speed: 🚀
      </p>
      <div className="space-y-2">
        <button
          onClick={() => onSelect('instant')}
          className={cn(
            'w-full p-3 rounded-xl border-2 border-primary/20 bg-card',
            'hover:border-primary hover:bg-primary/5 transition-all',
            'flex items-start gap-3 text-left'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Instant Delivery</span>
              <span className="text-primary font-bold">Rs. 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Delivered in 30-45 minutes
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelect('flexible')}
          className={cn(
            'w-full p-3 rounded-xl border-2 border-success/20 bg-card',
            'hover:border-success hover:bg-success/5 transition-all',
            'flex items-start gap-3 text-left'
          )}
        >
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-success" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Flexible Delivery</span>
              <span className="text-success font-bold">Rs. 50</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Batched delivery, anytime today (we optimize routes)
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DeliveryTypeSelector;
