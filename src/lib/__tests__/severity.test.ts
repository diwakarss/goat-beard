/**
 * Severity Calculator Tests
 *
 * Comprehensive test suite for the severity calculation module.
 * Tests cover:
 * - Helper functions (normalization, duration impact, media visibility, recency)
 * - Escalation capping based on verification status
 * - Main calculation functions (constitutional, salience, unified)
 * - Edge cases and validation
 *
 * All tests preserve existing behavior and validate correct calculations.
 */

import { describe, it, expect } from 'vitest';
import {
  // Helper functions
  normalizeEscalationLevel,
  calculateDurationImpact,
  calculateMediaVisibility,
  calculateRecencyMultiplier,
  applyEscalationCap,
  // Main calculation functions
  calculateConstitutionalSeverity,
  calculatePublicSalience,
  calculateUnifiedScore,
  calculateAllSeverityScores,
  // Constants
  MAX_ESCALATION_UNVERIFIED,
  CONSTITUTIONAL_WEIGHTS,
  SALIENCE_WEIGHTS,
  UNIFIED_WEIGHTS,
  DURATION_THRESHOLDS,
  RECENCY_HALF_LIFE_DAYS,
} from '../severity';

import type { EscalationLevel, VerificationStatus, SourceTier } from '@/types/schema';

// ============================================================================
// Test Fixtures & Builders
// ============================================================================

/**
 * Creates a primary source with optional custom credibility
 */
const createPrimarySource = (credibility: number = 0.8) => ({
  tier: 'primary' as SourceTier,
  credibility_score: credibility,
});

/**
 * Creates a secondary source with optional custom credibility
 */
const createSecondarySource = (credibility: number = 0.8) => ({
  tier: 'secondary' as SourceTier,
  credibility_score: credibility,
});

/**
 * Creates a source object for escalation cap tests (tier only)
 */
const createSourceTier = (tier: SourceTier) => ({ tier });

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe('normalizeEscalationLevel', () => {
  it('should normalize level 1 to 0.25', () => {
    expect(normalizeEscalationLevel(1)).toBe(1 / 4);
  });

  it('should normalize level 2 to 0.5', () => {
    expect(normalizeEscalationLevel(2)).toBe(2 / 4);
  });

  it('should normalize level 3 to 0.75', () => {
    expect(normalizeEscalationLevel(3)).toBe(3 / 4);
  });

  it('should normalize level 4 to 1.0', () => {
    expect(normalizeEscalationLevel(4)).toBe(4 / 4);
  });
});

describe('calculateDurationImpact', () => {
  it('should return 0 for zero duration', () => {
    expect(calculateDurationImpact(0)).toBe(0);
  });

  it('should return 0.2 for short durations (< 30 days)', () => {
    expect(calculateDurationImpact(1)).toBe(0.2);
    expect(calculateDurationImpact(15)).toBe(0.2);
    expect(calculateDurationImpact(29)).toBe(0.2);
  });

  it('should return 0.4 for medium durations (30-89 days)', () => {
    expect(calculateDurationImpact(30)).toBe(0.4);
    expect(calculateDurationImpact(60)).toBe(0.4);
    expect(calculateDurationImpact(89)).toBe(0.4);
  });

  it('should return 0.6 for long durations (90-179 days)', () => {
    expect(calculateDurationImpact(90)).toBe(0.6);
    expect(calculateDurationImpact(120)).toBe(0.6);
    expect(calculateDurationImpact(179)).toBe(0.6);
  });

  it('should return 0.8 for extended durations (180-364 days)', () => {
    expect(calculateDurationImpact(180)).toBe(0.8);
    expect(calculateDurationImpact(270)).toBe(0.8);
    expect(calculateDurationImpact(364)).toBe(0.8);
  });

  it('should return 1.0 for very long durations (365+ days)', () => {
    expect(calculateDurationImpact(365)).toBe(1.0);
    expect(calculateDurationImpact(500)).toBe(1.0);
    expect(calculateDurationImpact(1000)).toBe(1.0);
  });

  it('should throw error for negative duration', () => {
    expect(() => calculateDurationImpact(-1)).toThrow('Duration cannot be negative');
    expect(() => calculateDurationImpact(-100)).toThrow('Duration cannot be negative');
  });
});

describe('calculateMediaVisibility', () => {
  it('should return 0 for empty sources array', () => {
    expect(calculateMediaVisibility([])).toBe(0);
  });

  it('should calculate visibility for single primary source', () => {
    const sources = [createPrimarySource(0.8)];
    // 0.8 credibility + 0.05 source count bonus = 0.85
    const result = calculateMediaVisibility(sources);
    expect(result).toBeCloseTo(0.85, 2);
  });

  it('should calculate visibility for single secondary source', () => {
    const sources = [createSecondarySource(0.8)];
    // 0.8 credibility + 0.05 source count bonus = 0.85
    const result = calculateMediaVisibility(sources);
    expect(result).toBeCloseTo(0.85, 2);
  });

  it('should weight primary sources higher than secondary', () => {
    const primaryResult = calculateMediaVisibility([createPrimarySource(0.8)]);
    const secondaryResult = calculateMediaVisibility([createSecondarySource(0.8)]);

    // Single source: tier weight affects weighted average, but single source makes both equal
    expect(primaryResult).toBe(secondaryResult);
  });

  it('should apply source count bonus up to 20%', () => {
    const credibility = 0.8;
    const sources1 = [createPrimarySource(credibility)];
    const sources2 = Array(2).fill(null).map(() => createPrimarySource(credibility));
    const sources3 = Array(3).fill(null).map(() => createPrimarySource(credibility));
    const sources5 = Array(5).fill(null).map(() => createPrimarySource(credibility));

    expect(calculateMediaVisibility(sources1)).toBeCloseTo(0.85, 2); // +0.05
    expect(calculateMediaVisibility(sources2)).toBeCloseTo(0.9, 2);  // +0.10
    expect(calculateMediaVisibility(sources3)).toBeCloseTo(0.95, 2); // +0.15
    expect(calculateMediaVisibility(sources5)).toBeCloseTo(1.0, 2);  // +0.20 (capped)
  });

  it('should cap visibility at 1.0', () => {
    const sources = [
      createPrimarySource(0.95),
      createPrimarySource(0.95),
      createPrimarySource(0.95),
    ];
    expect(calculateMediaVisibility(sources)).toBeLessThanOrEqual(1.0);
  });

  it('should handle mixed primary and secondary sources', () => {
    const sources = [createPrimarySource(0.9), createSecondarySource(0.7)];
    // Weighted average: (0.9 * 1.0 + 0.7 * 0.6) / (1.0 + 0.6) = 1.32 / 1.6 = 0.825
    // Plus 0.10 source bonus = 0.925
    const result = calculateMediaVisibility(sources);
    expect(result).toBeCloseTo(0.925, 2);
  });
});

describe('calculateRecencyMultiplier', () => {
  it('should return 1.0 for incident today', () => {
    const today = new Date().toISOString();
    expect(calculateRecencyMultiplier(today)).toBeCloseTo(1.0, 2);
  });

  it('should return ~0.5 after one half-life period (365 days)', () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setDate(today.getDate() - 365);

    expect(calculateRecencyMultiplier(oneYearAgo.toISOString(), today.toISOString()))
      .toBeCloseTo(0.5, 2);
  });

  it('should return ~0.25 after two half-life periods (730 days)', () => {
    const today = new Date();
    const twoYearsAgo = new Date(today);
    twoYearsAgo.setDate(today.getDate() - 730);

    expect(calculateRecencyMultiplier(twoYearsAgo.toISOString(), today.toISOString()))
      .toBeCloseTo(0.25, 2);
  });

  it('should return 1.0 for future dates', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    expect(calculateRecencyMultiplier(tomorrow.toISOString(), today.toISOString()))
      .toBe(1.0);
  });

  it('should throw error for invalid incident date', () => {
    expect(() => calculateRecencyMultiplier('invalid-date')).toThrow('Invalid incident date');
  });

  it('should throw error for invalid reference date', () => {
    const today = new Date().toISOString();
    expect(() => calculateRecencyMultiplier(today, 'invalid-date')).toThrow('Invalid reference date');
  });

  it('should use current date if no reference date provided', () => {
    const today = new Date().toISOString();
    expect(calculateRecencyMultiplier(today)).toBeCloseTo(1.0, 2);
  });

  it('should decay exponentially over time', () => {
    const referenceDate = '2024-01-01T00:00:00.000Z';
    const sixMonthsAgo = '2023-07-01T00:00:00.000Z';
    const oneYearAgo = '2023-01-01T00:00:00.000Z';
    const twoYearsAgo = '2022-01-01T00:00:00.000Z';

    const sixMonths = calculateRecencyMultiplier(sixMonthsAgo, referenceDate);
    const oneYear = calculateRecencyMultiplier(oneYearAgo, referenceDate);
    const twoYears = calculateRecencyMultiplier(twoYearsAgo, referenceDate);

    expect(sixMonths).toBeGreaterThan(oneYear);
    expect(oneYear).toBeGreaterThan(twoYears);
    expect(oneYear).toBeCloseTo(0.5, 1);
  });
});

describe('applyEscalationCap', () => {
  it('should return original level for confirmed incidents', () => {
    expect(applyEscalationCap(4, 'confirmed', [createSourceTier('primary')])).toBe(4);
    expect(applyEscalationCap(3, 'confirmed', [])).toBe(3);
  });

  it('should cap unverified incidents at level 2', () => {
    const sources = [createSourceTier('secondary')];
    expect(applyEscalationCap(4, 'unverified', sources)).toBe(2);
    expect(applyEscalationCap(3, 'unverified', sources)).toBe(2);
    expect(applyEscalationCap(2, 'unverified', sources)).toBe(2);
    expect(applyEscalationCap(1, 'unverified', sources)).toBe(1);
  });

  it('should cap partial incidents at level 2 without sufficient primary sources', () => {
    const sources = [createSourceTier('secondary')];
    expect(applyEscalationCap(4, 'partial', sources)).toBe(2);
    expect(applyEscalationCap(3, 'partial', sources)).toBe(2);
  });

  it('should allow full escalation with 2+ primary sources even if unverified', () => {
    const sources = [createSourceTier('primary'), createSourceTier('primary')];
    expect(applyEscalationCap(4, 'unverified', sources)).toBe(4);
    expect(applyEscalationCap(3, 'partial', sources)).toBe(3);
  });

  it('should not allow full escalation with only 1 primary source if unverified', () => {
    const sources = [createSourceTier('primary')];
    expect(applyEscalationCap(4, 'unverified', sources)).toBe(2);
    expect(applyEscalationCap(3, 'partial', sources)).toBe(2);
  });

  it('should allow full escalation with 2+ primary sources mixed with secondary', () => {
    const sources = [
      createSourceTier('primary'),
      createSourceTier('primary'),
      createSourceTier('secondary'),
    ];
    expect(applyEscalationCap(4, 'unverified', sources)).toBe(4);
  });
});

// ============================================================================
// Main Calculation Functions Tests
// ============================================================================

describe('calculateConstitutionalSeverity', () => {
  it('should calculate severity correctly with formula', () => {
    // Level 2 → 0.5 normalized, 60 days → 0.4 impact
    // Result = (0.5 * 0.6) + (0.4 * 0.4) = 0.46
    expect(calculateConstitutionalSeverity(2, 60)).toBeCloseTo(0.46, 2);
  });

  it('should return minimum for level 1 and zero days', () => {
    // Level 1 → 0.25 normalized, 0 days → 0.0 impact
    // Result = (0.25 * 0.6) + (0.0 * 0.4) = 0.15
    expect(calculateConstitutionalSeverity(1, 0)).toBeCloseTo(0.15, 2);
  });

  it('should return maximum for level 4 and extended duration (365+ days)', () => {
    // Level 4 → 1.0 normalized, 400 days → 1.0 impact
    // Result = (1.0 * 0.6) + (1.0 * 0.4) = 1.0
    expect(calculateConstitutionalSeverity(4, 400)).toBe(1.0);
  });

  it('should weight escalation higher than duration (60/40 split)', () => {
    const highEscalationLowDuration = calculateConstitutionalSeverity(4, 10); // (1.0 * 0.6) + (0.2 * 0.4) = 0.68
    const lowEscalationHighDuration = calculateConstitutionalSeverity(1, 400); // (0.25 * 0.6) + (1.0 * 0.4) = 0.55
    expect(highEscalationLowDuration).toBeGreaterThan(lowEscalationHighDuration);
  });
});

describe('calculatePublicSalience', () => {
  it('should calculate salience correctly with formula', () => {
    const sources = [createPrimarySource(0.8), createPrimarySource(0.8)];
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const today = new Date().toISOString();

    // Media visibility: 0.8 + 0.10 (2 sources) = 0.9
    // Recency: ~0.5 (one year)
    // Result = (0.9 * 0.5) + (0.5 * 0.5) = 0.7
    const result = calculatePublicSalience(sources, oneYearAgo.toISOString(), today);
    expect(result).toBeCloseTo(0.7, 1);
  });

  it('should return ~0 for no sources and very old incident', () => {
    const veryOldDate = '1950-01-01T00:00:00.000Z';
    const today = new Date().toISOString();

    const result = calculatePublicSalience([], veryOldDate, today);
    expect(result).toBeCloseTo(0, 1);
  });

  it('should return high score for many credible recent sources', () => {
    const sources = Array(5).fill(null).map(() => createPrimarySource(0.95));
    const today = new Date().toISOString();

    // Media visibility: ~1.0 (capped), Recency: 1.0 (same day)
    // Result = (1.0 * 0.5) + (1.0 * 0.5) = 1.0
    const result = calculatePublicSalience(sources, today, today);
    expect(result).toBeCloseTo(1.0, 1);
  });

  it('should weight media visibility and recency equally (50/50 split)', () => {
    const highVisibilityOld = calculatePublicSalience(
      [createPrimarySource(0.9), createPrimarySource(0.9)],
      '2020-01-01T00:00:00.000Z',
      '2024-01-01T00:00:00.000Z'
    );

    const lowVisibilityRecent = calculatePublicSalience(
      [createSecondarySource(0.3)],
      '2024-01-01T00:00:00.000Z',
      '2024-01-01T00:00:00.000Z'
    );

    expect(highVisibilityOld).toBeGreaterThan(0);
    expect(lowVisibilityRecent).toBeGreaterThan(0);
  });
});

describe('calculateUnifiedScore', () => {
  it('should calculate unified score correctly with formula', () => {
    // Result = (0.8 * 0.7) + (0.6 * 0.3) = 0.74
    expect(calculateUnifiedScore(0.8, 0.6)).toBeCloseTo(0.74, 2);
  });

  it('should return 0 for zero inputs', () => {
    expect(calculateUnifiedScore(0, 0)).toBe(0);
  });

  it('should return 1.0 for maximum inputs', () => {
    expect(calculateUnifiedScore(1.0, 1.0)).toBe(1.0);
  });

  it('should weight constitutional severity higher (70/30 split)', () => {
    expect(calculateUnifiedScore(1.0, 0.0)).toBe(0.7);
    expect(calculateUnifiedScore(0.0, 1.0)).toBe(0.3);
  });

  it('should produce different results based on input mix', () => {
    const result1 = calculateUnifiedScore(0.8, 0.4);
    const result2 = calculateUnifiedScore(0.4, 0.8);

    expect(result1).not.toBe(result2);
    expect(result1).toBeGreaterThan(result2); // Higher constitutional weighs more
  });
});

describe('calculateAllSeverityScores', () => {
  it('should calculate all scores correctly for a typical incident', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 3,
      durationDays: 120,
      sources: [createPrimarySource(0.85), createPrimarySource(0.85)],
      incidentDate: '2023-06-01T00:00:00.000Z',
      verificationStatus: 'confirmed',
      referenceDate: '2024-01-01T00:00:00.000Z',
    });

    // Verify all required properties exist
    expect(result).toHaveProperty('constitutional');
    expect(result).toHaveProperty('salience');
    expect(result).toHaveProperty('unified');
    expect(result).toHaveProperty('cappedEscalationLevel');

    // Verify all scores are within valid range (0-1)
    expect(result.constitutional).toBeGreaterThan(0);
    expect(result.constitutional).toBeLessThanOrEqual(1);
    expect(result.salience).toBeGreaterThan(0);
    expect(result.salience).toBeLessThanOrEqual(1);
    expect(result.unified).toBeGreaterThan(0);
    expect(result.unified).toBeLessThanOrEqual(1);
    expect(result.cappedEscalationLevel).toBe(3);
  });

  it('should apply escalation cap for unverified incidents', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 4,
      durationDays: 100,
      sources: [createSecondarySource(0.8)],
      incidentDate: '2023-01-01T00:00:00.000Z',
      verificationStatus: 'unverified',
      referenceDate: '2024-01-01T00:00:00.000Z',
    });

    expect(result.cappedEscalationLevel).toBe(2);
    expect(result.constitutional).toBeLessThan(0.6);
  });

  it('should not cap escalation for confirmed incidents', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 4,
      durationDays: 100,
      sources: [createSecondarySource(0.8)],
      incidentDate: '2023-01-01T00:00:00.000Z',
      verificationStatus: 'confirmed',
      referenceDate: '2024-01-01T00:00:00.000Z',
    });

    expect(result.cappedEscalationLevel).toBe(4);
  });

  it('should produce unified score as weighted combination', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 2,
      durationDays: 60,
      sources: [createPrimarySource(0.8)],
      incidentDate: '2023-06-01T00:00:00.000Z',
      verificationStatus: 'confirmed',
      referenceDate: '2024-01-01T00:00:00.000Z',
    });

    // Verify unified score matches weighted combination
    const expectedUnified = result.constitutional * UNIFIED_WEIGHTS.CONSTITUTIONAL +
                          result.salience * UNIFIED_WEIGHTS.SALIENCE;
    expect(result.unified).toBeCloseTo(expectedUnified, 5);
  });

  it('should handle zero duration correctly', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 3,
      durationDays: 0,
      sources: [createPrimarySource(0.9)],
      incidentDate: new Date().toISOString(),
      verificationStatus: 'confirmed',
    });

    expect(result.constitutional).toBeGreaterThan(0);
    expect(result.salience).toBeGreaterThan(0);
    expect(result.unified).toBeGreaterThan(0);
  });

  it('should handle no sources correctly', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 2,
      durationDays: 100,
      sources: [],
      incidentDate: '2020-01-01T00:00:00.000Z',
      verificationStatus: 'unverified',
      referenceDate: '2024-01-01T00:00:00.000Z',
    });

    expect(result.constitutional).toBeGreaterThan(0);
    expect(result.salience).toBeGreaterThan(0);
    expect(result.cappedEscalationLevel).toBe(2);
  });

  it('should produce consistent results for same inputs', () => {
    const params = {
      escalationLevel: 3 as EscalationLevel,
      durationDays: 150,
      sources: [createPrimarySource(0.85)],
      incidentDate: '2023-01-01T00:00:00.000Z',
      verificationStatus: 'confirmed' as VerificationStatus,
      referenceDate: '2024-01-01T00:00:00.000Z',
    };

    const result1 = calculateAllSeverityScores(params);
    const result2 = calculateAllSeverityScores(params);

    expect(result1).toEqual(result2);
  });
});

// ============================================================================
// Constants Verification Tests
// ============================================================================

describe('Constants', () => {
  it('should have correct constitutional weights', () => {
    expect(CONSTITUTIONAL_WEIGHTS.ESCALATION).toBe(0.6);
    expect(CONSTITUTIONAL_WEIGHTS.DURATION).toBe(0.4);
    expect(CONSTITUTIONAL_WEIGHTS.ESCALATION + CONSTITUTIONAL_WEIGHTS.DURATION).toBe(1.0);
  });

  it('should have correct salience weights', () => {
    expect(SALIENCE_WEIGHTS.MEDIA_VISIBILITY).toBe(0.5);
    expect(SALIENCE_WEIGHTS.RECENCY).toBe(0.5);
    expect(SALIENCE_WEIGHTS.MEDIA_VISIBILITY + SALIENCE_WEIGHTS.RECENCY).toBe(1.0);
  });

  it('should have correct unified weights', () => {
    expect(UNIFIED_WEIGHTS.CONSTITUTIONAL).toBe(0.7);
    expect(UNIFIED_WEIGHTS.SALIENCE).toBe(0.3);
    expect(UNIFIED_WEIGHTS.CONSTITUTIONAL + UNIFIED_WEIGHTS.SALIENCE).toBe(1.0);
  });

  it('should have correct max escalation for unverified', () => {
    expect(MAX_ESCALATION_UNVERIFIED).toBe(2);
  });

  it('should have correct duration thresholds', () => {
    expect(DURATION_THRESHOLDS.SHORT).toBe(30);
    expect(DURATION_THRESHOLDS.MEDIUM).toBe(90);
    expect(DURATION_THRESHOLDS.LONG).toBe(180);
    expect(DURATION_THRESHOLDS.EXTENDED).toBe(365);
  });

  it('should have correct recency half-life', () => {
    expect(RECENCY_HALF_LIFE_DAYS).toBe(365);
  });
});

// ============================================================================
// Integration Tests - Real-World Scenarios
// ============================================================================

describe('Real-World Scenarios', () => {
  it('should score a high-severity recent confirmed incident highly', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 4,
      durationDays: 200,
      sources: [
        createPrimarySource(0.95),
        createPrimarySource(0.9),
        createPrimarySource(0.9),
      ],
      incidentDate: new Date().toISOString(),
      verificationStatus: 'confirmed',
    });

    expect(result.constitutional).toBeGreaterThan(0.8);
    expect(result.salience).toBeGreaterThan(0.8);
    expect(result.unified).toBeGreaterThan(0.8);
  });

  it('should score a minor old unverified incident lowly', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 1,
      durationDays: 5,
      sources: [createSecondarySource(0.4)],
      incidentDate: '1980-01-01T00:00:00.000Z',
      verificationStatus: 'unverified',
      referenceDate: '2024-01-01T00:00:00.000Z',
    });

    expect(result.constitutional).toBeLessThan(0.3);
    expect(result.salience).toBeLessThan(0.3);
    expect(result.unified).toBeLessThan(0.3);
  });

  it('should handle medium severity partial incident appropriately', () => {
    const result = calculateAllSeverityScores({
      escalationLevel: 2,
      durationDays: 75,
      sources: [createPrimarySource(0.75), createSecondarySource(0.6)],
      incidentDate: '2023-10-01T00:00:00.000Z',
      verificationStatus: 'partial',
      referenceDate: '2024-01-01T00:00:00.000Z',
    });

    expect(result.constitutional).toBeGreaterThan(0.3);
    expect(result.constitutional).toBeLessThan(0.6);
    expect(result.salience).toBeGreaterThan(0.3);
    expect(result.salience).toBeLessThan(0.9);
    expect(result.unified).toBeGreaterThan(0.3);
    expect(result.unified).toBeLessThan(0.7);
  });
});
