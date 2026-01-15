/**
 * Phonetic Search Utility
 * Implements Soundex algorithm for matching words that sound alike
 * Examples: "phone" & "fone" → both encode to "P500"
 */

/**
 * Soundex encoding table for consonant mapping
 */
const SOUNDEX_MAP: Record<string, string> = {
  b: '1', f: '1', p: '1', v: '1',
  c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
  d: '3', t: '3',
  l: '4',
  m: '5', n: '5',
  r: '6',
};

/**
 * Generates a Soundex code for a given word
 * Soundex is a phonetic algorithm that encodes words based on pronunciation
 * 
 * @param word - The word to encode
 * @returns A 4-character Soundex code (e.g., "P500" for "phone")
 */
export function soundex(word: string): string {
  if (!word || word.length === 0) return '';
  
  const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.length === 0) return '';
  
  // Keep first letter capitalized
  const firstLetter = normalized[0].toUpperCase();
  
  // Encode remaining characters
  let code = firstLetter;
  let prevCode = SOUNDEX_MAP[normalized[0]] || '';
  
  for (let i = 1; i < normalized.length && code.length < 4; i++) {
    const char = normalized[i];
    const charCode = SOUNDEX_MAP[char];
    
    // Skip vowels and h, w (they don't get codes)
    // Also skip consecutive same codes
    if (charCode && charCode !== prevCode) {
      code += charCode;
      prevCode = charCode;
    } else if (!charCode) {
      // Reset prevCode for vowels/h/w to allow encoding after them
      prevCode = '';
    }
  }
  
  // Pad with zeros to make 4 characters
  return code.padEnd(4, '0');
}

/**
 * Compares two words phonetically using Soundex
 * 
 * @param input - First word (potentially misspelled)
 * @param target - Target word to match against
 * @returns True if the words sound similar
 */
export function phoneticMatch(input: string, target: string): boolean {
  if (!input || !target) return false;
  
  const inputCode = soundex(input);
  const targetCode = soundex(target);
  
  if (!inputCode || !targetCode) return false;
  
  // Exact Soundex match
  return inputCode === targetCode;
}

/**
 * Calculates phonetic similarity score between two words
 * Returns higher scores for closer phonetic matches
 * 
 * @param input - User's input word
 * @param target - Target word to compare
 * @returns Score from 0 to 7 (0 = no match, 7 = phonetic match)
 */
export function getPhoneticScore(input: string, target: string): number {
  if (!input || !target) return 0;
  
  const inputCode = soundex(input);
  const targetCode = soundex(target);
  
  if (!inputCode || !targetCode) return 0;
  
  // Exact phonetic match
  if (inputCode === targetCode) return 7;
  
  // Partial phonetic match (first 3 characters match)
  if (inputCode.substring(0, 3) === targetCode.substring(0, 3)) return 5;
  
  // First 2 characters match
  if (inputCode.substring(0, 2) === targetCode.substring(0, 2)) return 3;
  
  return 0;
}

/**
 * Gets the best phonetic score for input against multiple keywords
 * 
 * @param input - User's input word
 * @param keywords - Array of keywords to check against
 * @returns Best phonetic score found
 */
export function getBestPhoneticScore(input: string, keywords: string[]): number {
  if (!keywords || keywords.length === 0) return 0;
  
  let bestScore = 0;
  
  for (const keyword of keywords) {
    const score = getPhoneticScore(input, keyword);
    if (score > bestScore) {
      bestScore = score;
    }
    // Early exit on perfect match
    if (bestScore === 7) break;
  }
  
  return bestScore;
}
