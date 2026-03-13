/**
 * Schema validator with severity computation
 * Transforms raw extractions into valid Incident records
 */

import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import type { Incident, Source, EscalationLevel, TransgressionType, Era, VerificationStatus } from '../src/types/schema';
import type { ExtractedIncident, StagedIncident, MatchResult } from './types';
import { matchGovernor, matchStateCode } from './matcher';
import {
  calculateAllSeverityScores,
  calculateDurationImpact,
  calculateMediaVisibility,
  calculateRecencyMultiplier,
} from '../src/lib/severity';

// Zod schema for validation
const TransgressionTypeSchema = z.enum([
  'withholding_assent',
  'delay',
  'overreach',
  'dissolution',
  'failure_to_countersign',
  'other',
]);

const EscalationLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

/**
 * Determine era based on date
 */
function determineEra(dateStr: string): Era {
  const year = parseInt(dateStr.split('-')[0], 10);
  if (year < 1975) return 'pre_emergency';
  if (year < 1977) return 'emergency';
  if (year < 1989) return 'post_emergency';
  if (year < 2014) return 'coalition';
  return 'post_2014';
}

/**
 * Calculate duration in days between two dates
 */
function calculateDurationDays(startDate: string, endDate: string | null): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Validate and transform raw extraction into a staged incident
 */
export function validateAndEnrich(extracted: ExtractedIncident): StagedIncident | null {
  const { raw, meta } = extracted;

  try {
    // Validate transgression type
    const transgressionResult = TransgressionTypeSchema.safeParse(raw.transgression_type);
    if (!transgressionResult.success) {
      console.warn(`Invalid transgression type: ${raw.transgression_type}`);
      return null;
    }
    const transgressionType = transgressionResult.data as TransgressionType;

    // Validate escalation level
    const escalationResult = EscalationLevelSchema.safeParse(raw.escalation_level);
    const escalationLevel: EscalationLevel = escalationResult.success
      ? (escalationResult.data as EscalationLevel)
      : 2;

    // Match governor
    const governorMatch: MatchResult = matchGovernor(raw.governor_name);

    // Match state code
    const stateCode = matchStateCode(raw.state) || raw.state;

    // Calculate duration
    const durationDays = calculateDurationDays(raw.date_start, raw.date_end);

    // Build source record
    const source: Source = {
      url: meta.source_url,
      outlet: meta.outlet,
      date_published: meta.article_date || raw.date_start,
      tier: 'secondary', // Default to secondary until verified
      credibility_score: 0.7,
    };

    // Calculate severity scores
    const severityResult = calculateAllSeverityScores({
      escalationLevel,
      durationDays,
      sources: [source],
      incidentDate: raw.date_start,
      verificationStatus: 'unverified',
    });

    // Calculate component scores for schema
    const durationImpact = calculateDurationImpact(durationDays);
    const mediaVisibility = calculateMediaVisibility([source]);
    const recencyMultiplier = calculateRecencyMultiplier(raw.date_start);

    // Generate IDs
    const incidentId = `inc_${uuidv4().slice(0, 8)}`;
    const claimId = `claim_${uuidv4().slice(0, 8)}`;
    const evidenceBundleId = `evb_${uuidv4().slice(0, 8)}`;

    // Build the incident
    const incident: Incident = {
      id: incidentId,
      governor_id: governorMatch.governor_id || `staged_${raw.governor_name.toLowerCase().replace(/\s+/g, '_')}`,
      state: stateCode,
      date_start: raw.date_start,
      date_end: raw.date_end,
      transgression_type: transgressionType,
      duration_days: durationDays,
      title: raw.title,
      description: raw.description,
      bill_name: raw.bill_name || undefined,
      constitutional_articles: raw.constitutional_articles,
      sc_precedents: [],
      escalation_level: escalationLevel,
      sources: [source],
      verification_status: 'unverified' as VerificationStatus,
      incident_status: 'under_review',
      claim_id: claimId,
      evidence_bundle_id: evidenceBundleId,
      confidence_score: raw.extraction_confidence,
      data_completeness_score: 0.6, // Default for extracted data
      last_verified_at: null,
      reviewer_id: null,
      contradiction_flag: false,
      severity_constitutional: severityResult.constitutional,
      severity_salience: severityResult.salience,
      severity_unified: severityResult.unified,
      duration_impact: durationImpact,
      media_visibility: mediaVisibility,
      recency_multiplier: recencyMultiplier,
      heat_multiplier: 1.0,
      era: determineEra(raw.date_start),
    };

    // Wrap as staged incident with metadata
    const staged: StagedIncident = {
      ...incident,
      _meta: {
        extraction_confidence: raw.extraction_confidence,
        match_confidence: governorMatch.confidence,
        source_url: meta.source_url,
        crawled_at: meta.crawled_at,
        needs_review: governorMatch.needs_review || raw.extraction_confidence < 0.7,
        governor_name_raw: raw.governor_name,
      },
    };

    return staged;
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

/**
 * Validate a batch of extractions
 */
export function validateBatch(extractions: ExtractedIncident[]): StagedIncident[] {
  const results: StagedIncident[] = [];

  for (const extraction of extractions) {
    const staged = validateAndEnrich(extraction);
    if (staged) {
      results.push(staged);
    }
  }

  return results;
}
