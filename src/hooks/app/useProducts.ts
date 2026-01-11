import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Product = Tables<'products'>;

interface UseProductsOptions {
  categoryId?: string | null;
  search?: string;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { categoryId, search } = options;

  return useQuery({
    queryKey: ['products', categoryId, search],
    queryFn: async (): Promise<Product[]> => {
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
    },
  });
};
