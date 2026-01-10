import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Enums } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Order = Tables<'orders'>;
type OrderStatus = Enums<'order_status'>;

interface UseOrdersOptions {
  status?: OrderStatus | 'all';
}

export const useOrders = (options: UseOrdersOptions = {}) => {
  const { status = 'all' } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-orders', status],
    queryFn: async () => {
      let q = supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        q = q.eq('status', status);
      }

      const { data, error } = await q;

      if (error) throw error;
      return data;
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useOrder = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles(full_name, phone, avatar_url),
          order_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: OrderStatus;
    }) => {
      const updates: Partial<Order> = { status };

      // Set timestamps based on status
      if (status === 'confirmed') {
        updates.confirmed_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updates.delivered_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', data.id] });
      toast({
        title: 'Order status updated',
        description: `Order ${data.order_number} is now ${data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useOrderMessages = (orderId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-order-messages', orderId],
    queryFn: async () => {
      if (!orderId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
};

export const useTodayOrdersStats = () => {
  return useQuery({
    queryKey: ['admin-today-orders-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .gte('created_at', today.toISOString());

      if (error) throw error;

      const totalOrders = data.length;
      const totalRevenue = data.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
      const activeOrders = data.filter(
        (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'on_the_way'
      ).length;

      return {
        totalOrders,
        totalRevenue,
        activeOrders,
      };
    },
  });
};
