import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type OrderWithPreview = Tables<'orders'> & {
  firstItemName: string | null;
  itemCount: number;
};

export const useUserOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async (): Promise<OrderWithPreview[]> => {
      if (!user) return [];

      // Fetch orders with first item name
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            product_name,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (orders || []).map((order) => ({
        ...order,
        order_items: undefined,
        firstItemName: order.order_items?.[0]?.product_name || null,
        itemCount: order.order_items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0,
      }));
    },
    enabled: !!user,
  });
};

// Group orders by date for sidebar display
export const groupOrdersByDate = (orders: OrderWithPreview[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: { label: string; orders: OrderWithPreview[] }[] = [
    { label: 'Today', orders: [] },
    { label: 'Yesterday', orders: [] },
    { label: 'Previous 7 Days', orders: [] },
    { label: 'Older', orders: [] },
  ];

  orders.forEach((order) => {
    const orderDate = new Date(order.created_at);
    orderDate.setHours(0, 0, 0, 0);

    if (orderDate.getTime() === today.getTime()) {
      groups[0].orders.push(order);
    } else if (orderDate.getTime() === yesterday.getTime()) {
      groups[1].orders.push(order);
    } else if (orderDate > lastWeek) {
      groups[2].orders.push(order);
    } else {
      groups[3].orders.push(order);
    }
  });

  return groups.filter((g) => g.orders.length > 0);
};
