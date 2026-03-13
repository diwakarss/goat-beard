/**
 * Fuzzy matching for governor name resolution
 */

import { distance } from 'fastest-levenshtein';
import type { Governor } from '../src/types/schema';
import type { MatchResult } from './types';
import * as fs from 'fs';
import * as path from 'path';

// Similarity threshold for auto-matching
const MATCH_THRESHOLD = 0.85;

// Cache for governors data
let governorsCache: Governor[] | null = null;

/**
 * Load governors from data file
 */
function loadGovernors(): Governor[] {
  if (governorsCache) {
    return governorsCache;
  }

  const dataPath = path.join(process.cwd(), 'data', 'governors.json');
  const data = fs.readFileSync(dataPath, 'utf-8');
  governorsCache = JSON.parse(data) as Governor[];
  return governorsCache;
}

/**
 * Clear the governors cache (useful for testing)
 */
export function clearGovernorsCache(): void {
  governorsCache = null;
}

/**
 * Calculate similarity between two strings (0-1)
 */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - distance(a, b) / maxLen;
}

/**
 * Normalize a name for comparison
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,]/g, '')
    .replace(/^(shri|smt|dr|justice|hon'ble|honourable)\s+/i, '')
    .trim();
}

/**
 * Match an extracted governor name to a canonical governor ID
 */
export function matchGovernor(extractedName: string): MatchResult {
  const governors = loadGovernors();
  const normalizedInput = normalizeName(extractedName);

  let bestMatch: { governor: Governor; score: number } | null = null;

  for (const governor of governors) {
    const normalizedName = normalizeName(governor.name);
    const score = similarity(normalizedInput, normalizedName);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { governor, score };
    }
  }

  if (!bestMatch) {
    return {
      governor_id: null,
      confidence: 0,
      matched_name: null,
      needs_review: true,
    };
  }

  const isAutoMatch = bestMatch.score >= MATCH_THRESHOLD;

  return {
    governor_id: isAutoMatch ? bestMatch.governor.id : null,
    confidence: bestMatch.score,
    matched_name: bestMatch.governor.name,
    needs_review: !isAutoMatch,
  };
}

/**
 * Match a state name to its code
 */
export function matchStateCode(stateName: string): string | null {
  const stateMap: Record<string, string> = {
    'andhra pradesh': 'AP',
    'arunachal pradesh': 'AR',
    assam: 'AS',
    bihar: 'BR',
    chhattisgarh: 'CG',
    goa: 'GA',
    gujarat: 'GJ',
    haryana: 'HR',
    'himachal pradesh': 'HP',
    jharkhand: 'JH',
    karnataka: 'KA',
    kerala: 'KL',
    'madhya pradesh': 'MP',
    maharashtra: 'MH',
    manipur: 'MN',
    meghalaya: 'ML',
    mizoram: 'MZ',
    nagaland: 'NL',
    odisha: 'OR',
    orissa: 'OR',
    punjab: 'PB',
    rajasthan: 'RJ',
    sikkim: 'SK',
    'tamil nadu': 'TN',
    telangana: 'TS',
    tripura: 'TR',
    'uttar pradesh': 'UP',
    uttarakhand: 'UK',
    'west bengal': 'WB',
    // Union Territories
    'andaman and nicobar': 'AN',
    chandigarh: 'CH',
    'dadra and nagar haveli': 'DN',
    'daman and diu': 'DN',
    delhi: 'DL',
    'jammu and kashmir': 'JK',
    ladakh: 'LA',
    lakshadweep: 'LD',
    puducherry: 'PY',
    pondicherry: 'PY',
  };

  const normalized = stateName.toLowerCase().trim();
  return stateMap[normalized] || null;
}

/**
 * Create a new governor record for staging
 */
export function createStagedGovernor(
  name: string,
  state: string,
  dateStart: string
): Partial<Governor> {
  const stateCode = matchStateCode(state);

  return {
    id: `staged_${Date.now()}`,
    name,
    state: stateCode || state,
    tenure_start: dateStart,
    tenure_end: null,
    appointing_authority: 'Unknown',
    prior_postings: [],
    next_postings: [],
  };
}
