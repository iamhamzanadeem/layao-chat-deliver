import { Zap, Clock, MapPin, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';
import { cn } from '@/lib/utils';

interface OrderConfirmationProps {
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

const OrderConfirmation = ({ onConfirm, onEdit, isLoading }: OrderConfirmationProps) => {
  const { items, deliveryType, deliveryAddress, subtotal, deliveryFee, total } = useOrder();

  return (
    <div className="bg-chat-bot rounded-2xl rounded-tl-md p-4 max-w-[90%]">
      <p className="text-sm text-chat-bot-foreground font-medium mb-3">
        Please confirm your order: 📋
      </p>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Items */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <ShoppingBag className="w-4 h-4" />
            <span>Order Items ({items.length})</span>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-foreground font-medium">
                  Rs. {(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Type */}
        <div className="p-3 border-b border-border">
          <div className={cn(
            'flex items-center gap-2 text-sm',
            deliveryType === 'instant' ? 'text-primary' : 'text-success'
          )}>
            {deliveryType === 'instant' ? (
              <Zap className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="font-medium">
              {deliveryType === 'instant' ? 'Instant Delivery' : 'Flexible Delivery'}
            </span>
            <span className="text-muted-foreground ml-auto">
              {deliveryType === 'instant' ? '30-45 min' : 'Anytime today'}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="p-3 border-b border-border">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary mt-0.5" />
            <div>
              <span className="font-medium text-foreground">{deliveryAddress?.label}</span>
              <p className="text-muted-foreground text-xs mt-0.5">
                {deliveryAddress?.fullAddress}
              </p>
              {deliveryAddress?.landmark && (
                <p className="text-muted-foreground text-xs">
                  Near: {deliveryAddress.landmark}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="p-3 bg-muted/30">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery ({deliveryType === 'instant' ? 'Instant' : 'Flexible'})</span>
              <span>Rs. {deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-1 border-t border-border">
              <span>Total</span>
              <span className="text-primary">Rs. {total.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          onClick={onEdit}
          className="flex-1"
          disabled={isLoading}
        >
          Edit Cart
        </Button>
        <Button 
          onClick={onConfirm}
          className="flex-1 bg-gradient-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        💵 Cash on Delivery • Free cancellation before dispatch
      </p>
    </div>
  );
};

export default OrderConfirmation;
