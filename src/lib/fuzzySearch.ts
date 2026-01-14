/**
 * Fuzzy Search Utility
 * Provides typo-tolerant matching using Levenshtein distance algorithm
 */

/**
 * Calculates the Levenshtein distance between two strings
 * This represents the minimum number of single-character edits needed
 * to transform one string into the other
 * 
 * @param a - First string
 * @param b - Second string
 * @returns The edit distance between the two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  // Early exit for empty strings
  if (aLower.length === 0) return bLower.length;
  if (bLower.length === 0) return aLower.length;
  
  // Early exit for exact match
  if (aLower === bLower) return 0;
  
  const aLen = aLower.length;
  const bLen = bLower.length;
  
  // Create matrix using two rows for memory efficiency
  let prevRow = new Array(bLen + 1);
  let currRow = new Array(bLen + 1);
  
  // Initialize first row
  for (let j = 0; j <= bLen; j++) {
    prevRow[j] = j;
  }
  
  // Fill in the rest of the matrix
  for (let i = 1; i <= aLen; i++) {
    currRow[0] = i;
    
    for (let j = 1; j <= bLen; j++) {
      const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,      // deletion
        currRow[j - 1] + 1,  // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    
    // Swap rows
    [prevRow, currRow] = [currRow, prevRow];
  }
  
  return prevRow[bLen];
}

/**
 * Determines the maximum allowed edit distance based on word length
 * Shorter words are more sensitive to typos, so we allow fewer edits
 * 
 * @param wordLength - Length of the word being compared
 * @returns Maximum allowed edit distance
 */
export function getMaxDistance(wordLength: number): number {
  if (wordLength <= 2) return 0;  // Very short words: exact match only
  if (wordLength <= 4) return 1;  // Short words: 1 typo allowed
  if (wordLength <= 7) return 2;  // Medium words: 2 typos allowed
  return 3;                        // Long words: 3 typos allowed
}

/**
 * Checks if two strings are similar within an acceptable tolerance
 * Uses adaptive distance based on word length
 * 
 * @param input - The user's input (potentially with typos)
 * @param target - The target string to match against
 * @param customMaxDistance - Optional custom maximum distance
 * @returns True if the strings are similar enough
 */
export function isSimilar(
  input: string, 
  target: string, 
  customMaxDistance?: number
): boolean {
  const inputLower = input.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Exact match
  if (inputLower === targetLower) return true;
  
  // Substring match (input is part of target or vice versa)
  if (targetLower.includes(inputLower) || inputLower.includes(targetLower)) {
    return true;
  }
  
  // Calculate distance
  const distance = levenshteinDistance(inputLower, targetLower);
  const maxDistance = customMaxDistance ?? getMaxDistance(Math.min(inputLower.length, targetLower.length));
  
  return distance <= maxDistance;
}

/**
 * Calculates a similarity score between two strings
 * Higher score means more similar (0 = no match, 10 = exact match)
 * 
 * @param input - The user's input
 * @param target - The target string
 * @returns Similarity score from 0 to 10
 */
export function getSimilarityScore(input: string, target: string): number {
  const inputLower = input.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Exact match
  if (inputLower === targetLower) return 10;
  
  // Starts with (very good match)
  if (targetLower.startsWith(inputLower)) return 9;
  
  // Contains as substring
  if (targetLower.includes(inputLower)) return 8;
  
  // Input contains target
  if (inputLower.includes(targetLower)) return 7;
  
  // Fuzzy match based on distance
  const distance = levenshteinDistance(inputLower, targetLower);
  const maxLen = Math.max(inputLower.length, targetLower.length);
  
  if (maxLen === 0) return 0;
  
  // Calculate normalized score (0-6 range for fuzzy matches)
  const normalizedSimilarity = 1 - (distance / maxLen);
  return Math.max(0, Math.round(normalizedSimilarity * 6));
}

/**
 * Finds the best matching keyword from an array
 * Returns the keyword with highest similarity score
 * 
 * @param input - User's input
 * @param keywords - Array of keywords to search through
 * @returns Best matching keyword and its score, or null if no match
 */
export function findBestMatch(
  input: string, 
  keywords: string[]
): { keyword: string; score: number } | null {
  if (!keywords || keywords.length === 0) return null;
  
  let bestMatch: { keyword: string; score: number } | null = null;
  
  for (const keyword of keywords) {
    const score = getSimilarityScore(input, keyword);
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { keyword, score };
    }
  }
  
  return bestMatch;
}

/**
 * Checks if any keyword in the array matches the input
 * Using fuzzy matching
 * 
 * @param input - User's input
 * @param keywords - Array of keywords to search
 * @returns True if any keyword matches
 */
export function hasMatchingKeyword(input: string, keywords: string[] | null): boolean {
  if (!keywords || keywords.length === 0) return false;
  
  const inputLower = input.toLowerCase().trim();
  
  for (const keyword of keywords) {
    if (isSimilar(inputLower, keyword)) {
      return true;
    }
  }
  
  return false;
}
