import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { extractProductKeywords, isProductRequest } from '@/lib/productSearch';
import { getSimilarityScore, hasMatchingKeyword } from '@/lib/fuzzySearch';

type Product = Tables<'products'>;

interface ScoredProduct extends Product {
  relevanceScore: number;
}

interface SearchResult {
  products: Product[];
  keywords: string[];
  hasResults: boolean;
}

/**
 * Calculates relevance score for a product based on user keywords
 * Uses fuzzy matching for typo tolerance
 */
function calculateProductScore(product: Product, keywords: string[]): number {
  let totalScore = 0;
  const productName = product.name.toLowerCase();
  const searchKeywords = product.search_keywords as string[] | null;

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // Check product name for exact/partial match
    const nameScore = getSimilarityScore(keywordLower, productName);
    if (nameScore > 0) {
      totalScore += nameScore;
      continue; // Found in name, skip keyword check
    }
    
    // Check search_keywords array for fuzzy match
    if (searchKeywords && searchKeywords.length > 0) {
      // Check if any keyword matches with fuzzy logic
      if (hasMatchingKeyword(keywordLower, searchKeywords)) {
        totalScore += 8; // Good match in keywords
        continue;
      }
      
      // Check for partial matches in keywords
      for (const sk of searchKeywords) {
        const score = getSimilarityScore(keywordLower, sk);
        if (score >= 5) {
          totalScore += score;
          break; // Take best match from keywords
        }
      }
    }
  }

  return totalScore;
}

/**
 * Hook for searching products based on natural language messages
 * Supports fuzzy matching for typo tolerance
 */
export const useProductSearch = () => {
  /**
   * Search products by keywords extracted from a natural language message
   * Uses fuzzy matching to handle typos like "eg" for "eggs" or "bred" for "bread"
   * 
   * @param message - User's message (e.g., "I want eg and pread")
   * @returns Search result with matching products and extracted keywords
   */
  const searchByMessage = useCallback(async (message: string): Promise<SearchResult> => {
    const keywords = extractProductKeywords(message);
    
    if (keywords.length === 0) {
      return { products: [], keywords: [], hasResults: false };
    }

    // Fetch all available products (we need to do client-side fuzzy matching)
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Product search error:', error);
      return { products: [], keywords, hasResults: false };
    }

    if (!allProducts || allProducts.length === 0) {
      return { products: [], keywords, hasResults: false };
    }

    // Score each product based on keyword matches
    const scoredProducts: ScoredProduct[] = allProducts.map(product => ({
      ...product,
      relevanceScore: calculateProductScore(product, keywords),
    }));

    // Filter products with positive scores and sort by relevance
    const matchingProducts = scoredProducts
      .filter(p => p.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 12) // Limit to top 12 results
      .map(({ relevanceScore, ...product }) => product); // Remove score from result

    return {
      products: matchingProducts,
      keywords,
      hasResults: matchingProducts.length > 0,
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
