/**
 * Product Search Utility
 * Extracts searchable keywords from natural language messages
 */

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as',
  'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
  'against', 'between', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now',
  // Order-specific stop words
  'want', 'need', 'give', 'get', 'order', 'like', 'please', 'would',
  'could', 'send', 'bring', 'deliver', 'add', 'put', 'take', 'buy',
  'purchase', 'today', 'tomorrow', 'now', 'asap', 'quickly', 'fast',
  'also', 'plus', 'maybe', 'think', 'looking', 'show', 'find',
]);

/**
 * Extracts product keywords from a natural language message
 * @param message - User's message (e.g., "I want eggs and bread")
 * @returns Array of searchable keywords (e.g., ["eggs", "bread"])
 */
export function extractProductKeywords(message: string): string[] {
  if (!message || typeof message !== 'string') {
    return [];
  }

  // Normalize the message
  const normalized = message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();

  // Split into words and filter
  const words = normalized.split(' ');
  
  const keywords = words.filter((word) => {
    // Skip short words (less than 2 characters)
    if (word.length < 2) return false;
    
    // Skip stop words
    if (STOP_WORDS.has(word)) return false;
    
    // Skip pure numbers (but keep numbers with text like "2kg")
    if (/^\d+$/.test(word)) return false;
    
    return true;
  });

  // Remove duplicates while preserving order
  return [...new Set(keywords)];
}

/**
 * Checks if a message appears to be a product request
 * @param message - User's message
 * @returns True if the message seems to be asking for products
 */
export function isProductRequest(message: string): boolean {
  const keywords = extractProductKeywords(message);
  return keywords.length > 0;
}

/**
 * Builds a Supabase OR filter string for product name search
 * @param keywords - Array of keywords to search for
 * @returns Filter string for Supabase .or() method
 * @deprecated Use fuzzy search instead for better matching
 */
export function buildProductSearchFilter(keywords: string[]): string {
  if (!keywords.length) return '';
  
  return keywords
    .map((keyword) => `name.ilike.%${keyword}%`)
    .join(',');
}
