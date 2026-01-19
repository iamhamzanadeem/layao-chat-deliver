import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder, type CartItem } from '@/contexts/OrderContext';
import type { Tables } from '@/integrations/supabase/types';

type OrderItem = Tables<'order_items'>;

interface ReorderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export const useReorder = () => {
  const { user } = useAuth();
  const { addItem } = useOrder();

  // Fetch recent order items
  const { data: recentOrderItems, isLoading, refetch } = useQuery({
    queryKey: ['recent-order-items', user?.id],
    queryFn: async (): Promise<ReorderItem[]> => {
      if (!user?.id) return [];

      // Get the most recent order
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (ordersError || !orders?.length) {
        return [];
      }

      const lastOrderId = orders[0].id;

      // Get items from the last order
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', lastOrderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        return [];
      }

      return (items || []).map((item: OrderItem) => ({
        productId: item.product_id || item.id,
        name: item.product_name,
        price: Number(item.unit_price),
        quantity: item.quantity,
        unit: 'piece',
        imageUrl: item.product_image || undefined,
      }));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Function to add all items from the last order to cart
  const reorderLastOrder = useCallback((): { success: boolean; itemCount: number } => {
    if (!recentOrderItems?.length) {
      return { success: false, itemCount: 0 };
    }

    recentOrderItems.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        imageUrl: item.imageUrl,
      });
    });

    return { success: true, itemCount: recentOrderItems.length };
  }, [recentOrderItems, addItem]);

  return {
    recentOrderItems: recentOrderItems || [],
    isLoading,
    reorderLastOrder,
    refetch,
    hasRecentOrders: (recentOrderItems?.length || 0) > 0,
  };
};
