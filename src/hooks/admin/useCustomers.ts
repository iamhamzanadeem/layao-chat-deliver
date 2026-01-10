import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseCustomersOptions {
  search?: string;
}

export const useCustomers = (options: UseCustomersOptions = {}) => {
  const { search } = options;

  return useQuery({
    queryKey: ['admin-customers', search],
    queryFn: async () => {
      // Get all profiles (customers)
      let query = supabase.from('profiles').select('*');

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data: profiles, error } = await query;

      if (error) throw error;

      // Get order stats for each customer
      const customersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('id, total, created_at')
            .eq('user_id', profile.id);

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
          const lastOrderDate = orders?.length
            ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
            : null;

          return {
            ...profile,
            totalOrders,
            totalSpent,
            lastOrderDate,
          };
        })
      );

      return customersWithStats;
    },
  });
};

export const useCustomer = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-customer', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCustomerOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-customer-orders', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCustomerAddresses = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-customer-addresses', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useCustomerRatings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-customer-ratings', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('ratings')
        .select('*, orders(order_number)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useTotalCustomers = () => {
  return useQuery({
    queryKey: ['admin-total-customers'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });
};
