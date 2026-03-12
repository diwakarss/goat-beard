import { EscalationLevel, VerificationStatus, SourceTier } from '@/types/schema';

// ============================================================================
// Constants & Weights
// ============================================================================

export const CONSTITUTIONAL_WEIGHTS = {
  ESCALATION: 0.6,
  DURATION: 0.4,
} as const;

export const SALIENCE_WEIGHTS = {
  MEDIA_VISIBILITY: 0.5,
  RECENCY: 0.5,
} as const;

export const UNIFIED_WEIGHTS = {
  CONSTITUTIONAL: 0.7,
  SALIENCE: 0.3,
} as const;

export const DURATION_THRESHOLDS = {
  SHORT: 30,
  MEDIUM: 90,
  LONG: 180,
  EXTENDED: 365,
} as const;

export const RECENCY_HALF_LIFE_DAYS = 365;
export const MAX_ESCALATION_UNVERIFIED = 2;

export type BeardCategory = 
  | 'Clean Chin'
  | 'Wisp'
  | 'Tuft'
  | 'Billy Beard'
  | 'Knee-Dragger';

export const SEVERITY_COLORS: Record<BeardCategory, string> = {
  'Clean Chin': 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  'Wisp': 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300',
  'Tuft': 'bg-orange-300 text-orange-900 hover:bg-orange-400',
  'Billy Beard': 'bg-red-400 text-white hover:bg-red-500',
  'Knee-Dragger': 'bg-red-700 text-white hover:bg-red-800',
};

// ============================================================================
// Types
// ============================================================================

export interface SeverityInput {
  /** @deprecated use calculateAllSeverityScores instead for new data */
  escalation_level: number;
  duration_impact: number;
  media_visibility: number;
  recency_multiplier: number;
}

export interface SeverityScores {
  constitutional: number;
  salience: number;
  unified: number;
}

export interface CalculationInput {
  escalationLevel: EscalationLevel;
  durationDays: number;
  sources: readonly { tier: SourceTier; credibility_score?: number }[];
  incidentDate: string;
  verificationStatus: VerificationStatus;
  referenceDate?: string;
}

export interface FullSeverityResult extends SeverityScores {
  cappedEscalationLevel: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes escalation level (1-4) to a 0.0-1.0 scale.
 */
export function normalizeEscalationLevel(level: EscalationLevel | number): number {
  return Math.min(Math.max(level / 4, 0), 1);
}

/**
 * Calculates duration impact on a 0.0-1.0 scale.
 */
export function calculateDurationImpact(days: number): number {
  if (days < 0) throw new Error('Duration cannot be negative');
  if (days === 0) return 0;
  if (days < DURATION_THRESHOLDS.SHORT) return 0.2;
  if (days < DURATION_THRESHOLDS.MEDIUM) return 0.4;
  if (days < DURATION_THRESHOLDS.LONG) return 0.6;
  if (days < DURATION_THRESHOLDS.EXTENDED) return 0.8;
  return 1.0;
}

/**
 * Calculates media visibility score based on source credibility and quantity.
 */
export function calculateMediaVisibility(sources: readonly { tier: SourceTier; credibility_score?: number }[]): number {
  if (sources.length === 0) return 0;

  const weights = { primary: 1.0, secondary: 0.6 };
  
  let totalWeightedCredibility = 0;
  let totalWeight = 0;

  sources.forEach(source => {
    const weight = weights[source.tier] || 0.6;
    const credibility = source.credibility_score ?? 0.8;
    totalWeightedCredibility += credibility * weight;
    totalWeight += weight;
  });

  const weightedAverage = totalWeightedCredibility / totalWeight;
  const countBonus = Math.min(sources.length * 0.05, 0.20);
  
  return Math.min(weightedAverage + countBonus, 1.0);
}

/**
 * Calculates recency multiplier using exponential decay.
 */
export function calculateRecencyMultiplier(incidentDate: string, referenceDate?: string): number {
  const incident = new Date(incidentDate);
  const reference = referenceDate ? new Date(referenceDate) : new Date();

  if (isNaN(incident.getTime())) throw new Error('Invalid incident date');
  if (isNaN(reference.getTime())) throw new Error('Invalid reference date');

  const ageInDays = (reference.getTime() - incident.getTime()) / (1000 * 60 * 60 * 24);
  
  if (ageInDays <= 0) return 1.0;

  // Exponential decay: N = N0 * e^(-λt)
  // λ = ln(2) / half-life
  const lambda = Math.LN2 / RECENCY_HALF_LIFE_DAYS;
  return Math.exp(-lambda * ageInDays);
}

/**
 * Applies escalation level capping based on verification status and evidence.
 */
export function applyEscalationCap(
  level: EscalationLevel, 
  status: VerificationStatus, 
  sources: readonly { tier: SourceTier }[]
): number {
  if (status === 'confirmed') return level;
  
  const primarySourceCount = sources.filter(s => s.tier === 'primary').length;
  if (primarySourceCount >= 2) return level;

  return Math.min(level, MAX_ESCALATION_UNVERIFIED);
}

// ============================================================================
// Main Calculation Functions
// ============================================================================

export function calculateConstitutionalSeverity(level: EscalationLevel | number, durationDays: number): number {
  const normalizedLevel = normalizeEscalationLevel(level);
  const durationImpact = calculateDurationImpact(durationDays);
  
  return (normalizedLevel * CONSTITUTIONAL_WEIGHTS.ESCALATION) + 
         (durationImpact * CONSTITUTIONAL_WEIGHTS.DURATION);
}

export function calculatePublicSalience(
  sources: readonly { tier: SourceTier; credibility_score?: number }[], 
  incidentDate: string, 
  referenceDate?: string
): number {
  const visibility = calculateMediaVisibility(sources);
  const recency = calculateRecencyMultiplier(incidentDate, referenceDate);
  
  return (visibility * SALIENCE_WEIGHTS.MEDIA_VISIBILITY) + 
         (recency * SALIENCE_WEIGHTS.RECENCY);
}

export function calculateUnifiedScore(constitutional: number, salience: number): number {
  return (constitutional * UNIFIED_WEIGHTS.CONSTITUTIONAL) + 
         (salience * UNIFIED_WEIGHTS.SALIENCE);
}

export function calculateAllSeverityScores(input: CalculationInput): FullSeverityResult {
  const cappedLevel = applyEscalationCap(input.escalationLevel, input.verificationStatus, input.sources);
  
  const constitutional = calculateConstitutionalSeverity(cappedLevel, input.durationDays);
  const salience = calculatePublicSalience(input.sources, input.incidentDate, input.referenceDate);
  const unified = calculateUnifiedScore(constitutional, salience);

  return {
    constitutional,
    salience,
    unified,
    cappedEscalationLevel: cappedLevel,
  };
}

/**
 * Backward-compatible simplified severity calculator.
 */
export function calculateSeverity(input: SeverityInput): SeverityScores {
  const constitutional = (input.escalation_level * CONSTITUTIONAL_WEIGHTS.ESCALATION) + 
                        (input.duration_impact * CONSTITUTIONAL_WEIGHTS.DURATION);
  const salience = (input.media_visibility * SALIENCE_WEIGHTS.MEDIA_VISIBILITY) + 
                   (input.recency_multiplier * SALIENCE_WEIGHTS.RECENCY);
  const unified = (constitutional * UNIFIED_WEIGHTS.CONSTITUTIONAL) + 
                  (salience * UNIFIED_WEIGHTS.SALIENCE);

  return {
    constitutional: Number(constitutional.toFixed(2)),
    salience: Number(salience.toFixed(2)),
    unified: Number(unified.toFixed(2)),
  };
}

/**
 * Maps a numerical unified severity score to a BeardCategory.
 * 
 * Mapping:
 * - 0.0 - 2.0: Clean Chin
 * - 2.1 - 4.0: Wisp
 * - 4.1 - 6.0: Tuft
 * - 6.1 - 8.0: Billy Beard
 * - 8.1 - 10.0: Knee-Dragger
 */
export function getBeardCategory(score: number): BeardCategory {
  if (score <= 2.0) return 'Clean Chin';
  if (score <= 4.0) return 'Wisp';
  if (score <= 6.0) return 'Tuft';
  if (score <= 8.0) return 'Billy Beard';
  return 'Knee-Dragger';
}
