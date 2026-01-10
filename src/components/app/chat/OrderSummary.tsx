import { Button } from '@/components/ui/button';
import { MapPin, CreditCard } from 'lucide-react';
import type { OrderSummaryData } from '@/types/chat';

interface OrderSummaryProps {
  data: OrderSummaryData;
  onConfirm?: () => void;
  showActions?: boolean;
}

const OrderSummary = ({ data, onConfirm, showActions = true }: OrderSummaryProps) => {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mx-4 my-2">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">Order Summary</h4>
          <span className="text-xs text-muted-foreground">#{data.orderNumber}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Items */}
        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.quantity}x {item.name}
              </span>
              <span className="text-muted-foreground">
                Rs. {(item.price * item.quantity).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs. {data.subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span>Rs. {data.deliveryFee.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground pt-1">
            <span>Total</span>
            <span className="text-primary">Rs. {data.total.toFixed(0)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="flex items-start gap-2 pt-2 border-t border-border">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">{data.address}</p>
        </div>

        {/* Payment Method */}
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">Cash on Delivery</p>
        </div>

        {showActions && onConfirm && (
          <Button
            className="w-full mt-3"
            onClick={onConfirm}
          >
            Confirm Order
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
