import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from '@/contexts/LocationContext';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface DealProduct extends Product {
  is_popular: boolean;
  original_price: number | null;
  discount_percent: number | null;
}

export const useDealsProducts = () => {
  const { selectedRestaurant } = useLocation();

  return useQuery({
    queryKey: ['deals-products', selectedRestaurant?.id],
    queryFn: async (): Promise<DealProduct[]> => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .gt('discount_percent', 0)
        .order('discount_percent', { ascending: false });

      // Filter by restaurant if one is selected
      if (selectedRestaurant?.id) {
        query = query.eq('restaurant_id', selectedRestaurant.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching deals products:', error);
        throw error;
      }

      return (data || []) as DealProduct[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
