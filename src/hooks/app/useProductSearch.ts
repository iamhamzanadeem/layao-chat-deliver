import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { extractProductKeywords, buildProductSearchFilter, isProductRequest } from '@/lib/productSearch';

type Product = Tables<'products'>;

interface SearchResult {
  products: Product[];
  keywords: string[];
  hasResults: boolean;
}

/**
 * Hook for searching products based on natural language messages
 */
export const useProductSearch = () => {
  /**
   * Search products by keywords extracted from a natural language message
   * @param message - User's message (e.g., "I want eggs and bread")
   * @returns Search result with matching products and extracted keywords
   */
  const searchByMessage = useCallback(async (message: string): Promise<SearchResult> => {
    const keywords = extractProductKeywords(message);
    
    if (keywords.length === 0) {
      return { products: [], keywords: [], hasResults: false };
    }

    const filter = buildProductSearchFilter(keywords);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .or(filter)
      .order('name', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Product search error:', error);
      return { products: [], keywords, hasResults: false };
    }

    return {
      products: data || [],
      keywords,
      hasResults: (data?.length ?? 0) > 0,
    };
  }, []);

  /**
   * Check if a message appears to be a product request
   */
  const checkIsProductRequest = useCallback((message: string): boolean => {
    return isProductRequest(message);
  }, []);

  return {
    searchByMessage,
    isProductRequest: checkIsProductRequest,
  };
};
