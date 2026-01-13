import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder, type DeliveryType, type CartItem, type DeliveryAddress } from '@/contexts/OrderContext';
import { useToast } from '@/hooks/use-toast';

interface CreateOrderInput {
  items: CartItem[];
  deliveryType: DeliveryType;
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
}

interface OrderResult {
  orderId: string;
  orderNumber: string;
}

// Generate order number: LAY-YYYYMMDD-XXXX
const generateOrderNumber = (): string => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return `LAY-${datePart}-${randomPart}`;
};

export const useCreateOrder = () => {
  const { user } = useAuth();
  const { clearCart } = useOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<OrderResult> => {
      if (!user) throw new Error('User not authenticated');

      const orderNumber = generateOrderNumber();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          delivery_type: input.deliveryType,
          delivery_address: {
            label: input.deliveryAddress.label,
            fullAddress: input.deliveryAddress.fullAddress,
            area: input.deliveryAddress.area,
            landmark: input.deliveryAddress.landmark,
          },
          subtotal: input.subtotal,
          delivery_fee: input.deliveryFee,
          total: input.total,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        product_image: item.imageUrl || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return {
        orderId: order.id,
        orderNumber: order.order_number,
      };
    },
    onSuccess: (result) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      toast({
        title: 'Order placed successfully! 🎉',
        description: `Order ${result.orderNumber} is being processed.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to place order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
