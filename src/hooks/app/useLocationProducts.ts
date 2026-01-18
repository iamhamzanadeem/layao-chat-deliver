import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface UseLocationProductsOptions {
  latitude: number | null;
  longitude: number | null;
  categoryId?: string | null;
  search?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch products from restaurants within delivery radius of user location
 */
export const useLocationProducts = (options: UseLocationProductsOptions) => {
  const { latitude, longitude, categoryId, search, enabled = true } = options;

  return useQuery({
    queryKey: ['location-products', latitude, longitude, categoryId, search],
    queryFn: async (): Promise<Product[]> => {
      // If no location, fall back to all available products
      if (latitude === null || longitude === null) {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_available', true);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query.order('name', { ascending: true });
        if (error) throw error;
        return data || [];
      }

      // Get products from nearby restaurants using RPC
      const { data: locationProducts, error: rpcError } = await supabase.rpc(
        'get_products_by_location',
        {
          user_lat: latitude,
          user_lng: longitude,
        }
      );

      if (rpcError) {
        console.error('Error fetching location products:', rpcError);
        throw rpcError;
      }

      let products = (locationProducts as Product[]) || [];

      // Apply client-side filters
      if (categoryId) {
        products = products.filter((p) => p.category_id === categoryId);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        products = products.filter((p) => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.search_keywords?.some(k => k.toLowerCase().includes(searchLower))
        );
      }

      return products;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
