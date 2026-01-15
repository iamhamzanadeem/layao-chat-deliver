import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { extractProductKeywords, isProductRequest } from '@/lib/productSearch';
import { 
  getSimilarityScore, 
  hasMatchingKeyword, 
  getNgramScore, 
  weightedLevenshteinDistance 
} from '@/lib/fuzzySearch';
import { getPhoneticScore, getBestPhoneticScore } from '@/lib/phoneticSearch';

type Product = Tables<'products'>;

interface ScoredProduct extends Product {
  relevanceScore: number;
}

interface SearchResult {
  products: Product[];
  keywords: string[];
  hasResults: boolean;
}

interface CacheEntry {
  result: SearchResult;
  timestamp: number;
}

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;

/**
 * Scoring thresholds for early exit optimization
 */
const SCORE_THRESHOLD = {
  EXCELLENT: 9, // Skip expensive algorithms if we find excellent match
  GOOD: 7,      // Good enough to include in results
  MINIMUM: 3,   // Minimum score to be considered a match
};

/**
 * Calculates comprehensive relevance score for a product
 * Uses multi-algorithm fusion: exact match > substring > phonetic > n-gram > fuzzy
 */
function calculateProductScore(product: Product, keywords: string[]): number {
  let totalScore = 0;
  const productName = product.name.toLowerCase();
  const productWords = productName.split(/\s+/);
  const searchKeywords = product.search_keywords as string[] | null;

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    let bestKeywordScore = 0;
    
    // === Check product name ===
    
    // 1. Exact name match (highest priority)
    if (productName === keywordLower) {
      bestKeywordScore = 10;
    }
    // 2. Name starts with keyword
    else if (productName.startsWith(keywordLower)) {
      bestKeywordScore = Math.max(bestKeywordScore, 9);
    }
    // 3. Name contains keyword
    else if (productName.includes(keywordLower)) {
      bestKeywordScore = Math.max(bestKeywordScore, 8);
    }
    // 4. Any word in name matches
    else {
      for (const word of productWords) {
        if (word === keywordLower) {
          bestKeywordScore = Math.max(bestKeywordScore, 10);
          break;
        }
        if (word.startsWith(keywordLower)) {
          bestKeywordScore = Math.max(bestKeywordScore, 9);
        }
      }
    }
    
    // Early exit if we found excellent match
    if (bestKeywordScore >= SCORE_THRESHOLD.EXCELLENT) {
      totalScore += bestKeywordScore;
      continue;
    }
    
    // === Advanced matching (only if no strong match found) ===
    
    // 5. Phonetic matching on product name words
    for (const word of productWords) {
      const phoneticScore = getPhoneticScore(keywordLower, word);
      bestKeywordScore = Math.max(bestKeywordScore, phoneticScore);
    }
    
    // 6. N-gram similarity on product name
    const ngramScore = getNgramScore(keywordLower, productName);
    bestKeywordScore = Math.max(bestKeywordScore, ngramScore);
    
    // 7. Weighted Levenshtein on product name words
    for (const word of productWords) {
      if (word.length < 2) continue;
      
      const distance = weightedLevenshteinDistance(keywordLower, word);
      const maxLen = Math.max(keywordLower.length, word.length);
      const normalizedScore = Math.max(0, Math.round((1 - distance / maxLen) * 6));
      
      if (normalizedScore >= SCORE_THRESHOLD.MINIMUM) {
        bestKeywordScore = Math.max(bestKeywordScore, normalizedScore);
      }
    }
    
    // === Check search_keywords array ===
    if (searchKeywords && searchKeywords.length > 0) {
      // Exact keyword match
      if (searchKeywords.some(sk => sk.toLowerCase() === keywordLower)) {
        bestKeywordScore = Math.max(bestKeywordScore, 8);
      }
      // Fuzzy keyword match
      else if (hasMatchingKeyword(keywordLower, searchKeywords)) {
        bestKeywordScore = Math.max(bestKeywordScore, 6);
      }
      // Phonetic match in keywords
      else {
        const phoneticKeywordScore = getBestPhoneticScore(keywordLower, searchKeywords);
        bestKeywordScore = Math.max(bestKeywordScore, phoneticKeywordScore);
      }
    }
    
    totalScore += bestKeywordScore;
  }

  return totalScore;
}

/**
 * Hook for searching products based on natural language messages
 * Features:
 * - Multi-algorithm fuzzy matching (Levenshtein, N-gram, Phonetic)
 * - Keyboard proximity weighting for typos
 * - Result caching for performance
 */
export const useProductSearch = () => {
  // Cache for recent search results
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  /**
   * Generates cache key from keywords
   */
  const getCacheKey = useCallback((keywords: string[]): string => {
    return keywords.slice().sort().join('|').toLowerCase();
  }, []);

  /**
   * Cleans expired cache entries
   */
  const cleanCache = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
    
    // Enforce max size by removing oldest entries
    if (cache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toDelete = entries.slice(0, cache.size - MAX_CACHE_SIZE);
      toDelete.forEach(([key]) => cache.delete(key));
    }
  }, []);

  /**
   * Search products by keywords extracted from natural language message
   * Uses multi-algorithm matching for maximum typo tolerance
   */
  const searchByMessage = useCallback(async (message: string): Promise<SearchResult> => {
    const keywords = extractProductKeywords(message);
    
    if (keywords.length === 0) {
      return { products: [], keywords: [], hasResults: false };
    }

    // Check cache first
    const cacheKey = getCacheKey(keywords);
    const cached = cacheRef.current.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    }

    // Clean old cache entries periodically
    cleanCache();

    // Fetch all available products for client-side scoring
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

    // Score each product using multi-algorithm matching
    const scoredProducts: ScoredProduct[] = allProducts.map(product => ({
      ...product,
      relevanceScore: calculateProductScore(product, keywords),
    }));

    // Filter and sort by relevance
    const matchingProducts = scoredProducts
      .filter(p => p.relevanceScore >= SCORE_THRESHOLD.MINIMUM)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 12) // Limit to top 12 results
      .map(({ relevanceScore, ...product }) => product);

    const result: SearchResult = {
      products: matchingProducts,
      keywords,
      hasResults: matchingProducts.length > 0,
    };

    // Cache the result
    cacheRef.current.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });

    return result;
  }, [getCacheKey, cleanCache]);

  /**
   * Check if a message appears to be a product request
   */
  const checkIsProductRequest = useCallback((message: string): boolean => {
    return isProductRequest(message);
  }, []);

  /**
   * Clears the search cache (useful for testing or after inventory updates)
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    searchByMessage,
    isProductRequest: checkIsProductRequest,
    clearCache,
  };
};
