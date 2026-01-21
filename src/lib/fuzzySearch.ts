/**
 * Fuzzy Search Utility
 * Provides typo-tolerant matching using multiple algorithms:
 * - Levenshtein distance with keyboard proximity weighting
 * - N-gram (trigram) similarity
 */

/**
 * QWERTY keyboard adjacency map for proximity-weighted distance
 */
const KEYBOARD_ADJACENT: Record<string, Set<string>> = {
  q: new Set(['w', 'a']),
  w: new Set(['q', 'e', 'a', 's']),
  e: new Set(['w', 'r', 's', 'd']),
  r: new Set(['e', 't', 'd', 'f']),
  t: new Set(['r', 'y', 'f', 'g']),
  y: new Set(['t', 'u', 'g', 'h']),
  u: new Set(['y', 'i', 'h', 'j']),
  i: new Set(['u', 'o', 'j', 'k']),
  o: new Set(['i', 'p', 'k', 'l']),
  p: new Set(['o', 'l']),
  a: new Set(['q', 'w', 's', 'z']),
  s: new Set(['w', 'e', 'a', 'd', 'z', 'x']),
  d: new Set(['e', 'r', 's', 'f', 'x', 'c']),
  f: new Set(['r', 't', 'd', 'g', 'c', 'v']),
  g: new Set(['t', 'y', 'f', 'h', 'v', 'b']),
  h: new Set(['y', 'u', 'g', 'j', 'b', 'n']),
  j: new Set(['u', 'i', 'h', 'k', 'n', 'm']),
  k: new Set(['i', 'o', 'j', 'l', 'm']),
  l: new Set(['o', 'p', 'k']),
  z: new Set(['a', 's', 'x']),
  x: new Set(['s', 'd', 'z', 'c']),
  c: new Set(['d', 'f', 'x', 'v']),
  v: new Set(['f', 'g', 'c', 'b']),
  b: new Set(['g', 'h', 'v', 'n']),
  n: new Set(['h', 'j', 'b', 'm']),
  m: new Set(['j', 'k', 'n']),
};

/**
 * Checks if two characters are adjacent on QWERTY keyboard
 */
function areKeysAdjacent(char1: string, char2: string): boolean {
  const adjacentKeys = KEYBOARD_ADJACENT[char1.toLowerCase()];
  return adjacentKeys ? adjacentKeys.has(char2.toLowerCase()) : false;
}

/**
 * Calculates keyboard-weighted Levenshtein distance
 * Adjacent key substitutions cost 0.5 instead of 1.0
 * 
 * @param a - First string
 * @param b - Second string
 * @returns The weighted edit distance
 */
export function weightedLevenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  if (aLower.length === 0) return bLower.length;
  if (bLower.length === 0) return aLower.length;
  if (aLower === bLower) return 0;
  
  const aLen = aLower.length;
  const bLen = bLower.length;
  
  let prevRow = new Array(bLen + 1);
  let currRow = new Array(bLen + 1);
  
  for (let j = 0; j <= bLen; j++) {
    prevRow[j] = j;
  }
  
  for (let i = 1; i <= aLen; i++) {
    currRow[0] = i;
    
    for (let j = 1; j <= bLen; j++) {
      const charA = aLower[i - 1];
      const charB = bLower[j - 1];
      
      let cost: number;
      if (charA === charB) {
        cost = 0;
      } else if (areKeysAdjacent(charA, charB)) {
        cost = 0.5; // Reduced cost for adjacent keys
      } else {
        cost = 1;
      }
      
      currRow[j] = Math.min(
        prevRow[j] + 1,        // deletion
        currRow[j - 1] + 1,    // insertion
        prevRow[j - 1] + cost  // substitution
      );
    }
    
    [prevRow, currRow] = [currRow, prevRow];
  }
  
  return prevRow[bLen];
}

/**
 * Standard Levenshtein distance (kept for compatibility)
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  if (aLower.length === 0) return bLower.length;
  if (bLower.length === 0) return aLower.length;
  if (aLower === bLower) return 0;
  
  const aLen = aLower.length;
  const bLen = bLower.length;
  
  let prevRow = new Array(bLen + 1);
  let currRow = new Array(bLen + 1);
  
  for (let j = 0; j <= bLen; j++) {
    prevRow[j] = j;
  }
  
  for (let i = 1; i <= aLen; i++) {
    currRow[0] = i;
    
    for (let j = 1; j <= bLen; j++) {
      const cost = aLower[i - 1] === bLower[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,
        currRow[j - 1] + 1,
        prevRow[j - 1] + cost
      );
    }
    
    [prevRow, currRow] = [currRow, prevRow];
  }
  
  return prevRow[bLen];
}

// ============= N-gram (Trigram) Similarity =============

/**
 * Generates n-grams from a word with padding
 * 
 * @param word - Word to generate n-grams from
 * @param n - Size of each gram (default: 3 for trigrams)
 * @returns Set of n-grams
 */
export function getNgrams(word: string, n: number = 3): Set<string> {
  const normalized = word.toLowerCase().trim();
  if (normalized.length === 0) return new Set();
  
  // Pad the word for edge matching
  const padded = `_${normalized}_`;
  const ngrams = new Set<string>();
  
  for (let i = 0; i <= padded.length - n; i++) {
    ngrams.add(padded.substring(i, i + n));
  }
  
  return ngrams;
}

/**
 * Calculates n-gram (trigram) similarity between two strings
 * Uses Jaccard coefficient: |A ∩ B| / |A ∪ B|
 * 
 * @param a - First string
 * @param b - Second string
 * @returns Similarity score from 0.0 to 1.0
 */
export function ngramSimilarity(a: string, b: string): number {
  const ngramsA = getNgrams(a);
  const ngramsB = getNgrams(b);
  
  if (ngramsA.size === 0 || ngramsB.size === 0) return 0;
  
  // Calculate intersection
  let intersection = 0;
  for (const ngram of ngramsA) {
    if (ngramsB.has(ngram)) {
      intersection++;
    }
  }
  
  // Calculate union
  const union = ngramsA.size + ngramsB.size - intersection;
  
  return union > 0 ? intersection / union : 0;
}

/**
 * Gets n-gram similarity score (0-7 scale)
 * 
 * @param input - User's input
 * @param target - Target to compare
 * @returns Score from 0 to 7
 */
export function getNgramScore(input: string, target: string): number {
  const similarity = ngramSimilarity(input, target);
  
  // Tightened thresholds to prevent false positives
  if (similarity >= 0.7) return 7;
  if (similarity >= 0.5) return 6;
  if (similarity >= 0.4) return 5;
  // Removed 0.3 and 0.2 thresholds - too permissive
  
  return 0;
}

// ============= Core Functions =============

/**
 * Determines the maximum allowed edit distance based on word length
 */
export function getMaxDistance(wordLength: number): number {
  if (wordLength <= 2) return 0;
  if (wordLength <= 4) return 1;
  if (wordLength <= 7) return 2;
  return 3;
}

/**
 * Checks if two strings are similar (supports fuzzy and n-gram matching)
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
  
  // Substring match
  if (targetLower.includes(inputLower) || inputLower.includes(targetLower)) {
    return true;
  }
  
  // N-gram similarity check with length-based threshold
  // Shorter words need higher similarity to avoid false positives like "bread" matching "besan"
  const minNgramThreshold = inputLower.length <= 4 ? 0.55 : 
                             inputLower.length <= 6 ? 0.45 : 0.4;
  if (ngramSimilarity(inputLower, targetLower) >= minNgramThreshold) {
    return true;
  }
  
  // Weighted Levenshtein check
  const distance = weightedLevenshteinDistance(inputLower, targetLower);
  const maxDistance = customMaxDistance ?? getMaxDistance(Math.min(inputLower.length, targetLower.length));
  
  return distance <= maxDistance;
}

/**
 * Calculates comprehensive similarity score using multiple algorithms
 * Higher score = more similar (0 = no match, 10 = exact match)
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
  
  // N-gram similarity score
  const ngramScore = getNgramScore(inputLower, targetLower);
  if (ngramScore >= 5) return ngramScore;
  
  // Weighted Levenshtein-based score
  const distance = weightedLevenshteinDistance(inputLower, targetLower);
  const maxLen = Math.max(inputLower.length, targetLower.length);
  
  if (maxLen === 0) return 0;
  
  const normalizedSimilarity = 1 - (distance / maxLen);
  const levScore = Math.max(0, Math.round(normalizedSimilarity * 6));
  
  // Return best score from n-gram or levenshtein
  return Math.max(ngramScore, levScore);
}

/**
 * Finds the best matching keyword from an array
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
    
    // Early exit on perfect match
    if (bestMatch?.score === 10) break;
  }
  
  return bestMatch;
}

/**
 * Checks if any keyword in the array matches the input using fuzzy matching
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
