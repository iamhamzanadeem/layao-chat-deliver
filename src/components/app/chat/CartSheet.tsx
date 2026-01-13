import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/contexts/OrderContext';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout?: () => void;
}

const CartSheet = ({ open, onOpenChange, onCheckout }: CartSheetProps) => {
  const { items, updateQuantity, itemCount, subtotal, deliveryFee, total, deliveryType } = useOrder();

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 flex flex-col h-[calc(100%-4rem)]">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Rs. {item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery ({deliveryType === 'instant' ? 'Instant' : 'Flexible'})</span>
                  <span>Rs. {deliveryFee}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total}</span>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-primary" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
