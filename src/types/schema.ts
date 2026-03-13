/**
 * ISO 8601 formatted date string (YYYY-MM-DD).
 */
export type ISO8601Date = string;

/**
 * 2-letter ISO 3166-2:IN code for Indian states and UTs.
 */
export type StateCode = 
  | 'AN' | 'AP' | 'AR' | 'AS' | 'BR' | 'CH' | 'CG' | 'DN' | 'DL' | 'GA' | 'GJ' 
  | 'HR' | 'HP' | 'JK' | 'JH' | 'KA' | 'KL' | 'LA' | 'LD' | 'MP' | 'MH' | 'MN' 
  | 'ML' | 'MZ' | 'NL' | 'OR' | 'PY' | 'PB' | 'RJ' | 'SK' | 'TN' | 'TS' | 'TR' 
  | 'UP' | 'UK' | 'WB';

/**
 * Types of transgressions committed by governors.
 * Includes both constitutional violations and criminal/misconduct incidents.
 */
export type TransgressionType =
  // Constitutional transgressions
  | 'withholding_assent'
  | 'delay'
  | 'overreach'
  | 'dissolution'
  | 'failure_to_countersign'
  // Criminal/misconduct categories
  | 'corruption'           // Bribery, kickbacks, abuse of office for financial gain
  | 'sexual_misconduct'    // Harassment, assault allegations
  | 'criminal_charges'     // CBI/ED cases, chargesheeted
  | 'abuse_of_power'       // Partisan actions, controversial appointments, irregular conduct
  | 'other';

/**
 * Category of the incident - constitutional violation vs criminal/misconduct.
 */
export type IncidentCategory = 'constitutional' | 'criminal' | 'misconduct';

/**
 * Status of criminal case if applicable.
 */
export type CaseStatus =
  | 'alleged'
  | 'under_investigation'
  | 'chargesheeted'
  | 'convicted'
  | 'acquitted'
  | 'withdrawn';

/**
 * Status of data verification for an incident.
 */
export type VerificationStatus = 'unverified' | 'partial' | 'confirmed';

/**
 * Status of an incident in terms of its lifecycle.
 */
export type IncidentStatus = 'resolved' | 'contested' | 'under_review';

/**
 * Escalation level of a constitutional crisis (1-4).
 */
export type EscalationLevel = 1 | 2 | 3 | 4;

/**
 * Severity level of governor's beard (0-4), used as a metaphor for transgression density.
 */
export type BeardLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Names for beard levels.
 */
export type BeardName = 'Clean Chin' | 'Wisp' | 'Tuft' | 'Billy Beard' | 'Knee-Dragger';

/**
 * Tier of the information source.
 */
export type SourceTier = 'primary' | 'secondary';

/**
 * Historical era of the incident.
 */
export type Era = 'pre_emergency' | 'emergency' | 'post_emergency' | 'coalition' | 'post_2014';

/**
 * Represents a source of information for an incident.
 */
export interface Source {
  readonly url: string;
  readonly outlet: string;
  readonly date_published: ISO8601Date;
  readonly tier: SourceTier;
  readonly credibility_score: number;
}

/**
 * Represents a Governor of an Indian State.
 */
export interface Governor {
  readonly id: string;
  readonly name: string;
  readonly state: StateCode | string;
  readonly tenure_start: ISO8601Date;
  readonly tenure_end: ISO8601Date | null;
  /**
   * The Prime Minister or political party controlling the center at the time of appointment.
   */
  readonly appointing_authority: string;
  /**
   * Political party the governor was affiliated with prior to appointment.
   */
  readonly party_affiliation?: string;
  /**
   * List of prior postings to track "roving" appointment patterns.
   */
  readonly prior_postings: readonly string[];
  /**
   * List of subsequent postings.
   */
  readonly next_postings: readonly string[];
}

/**
 * Represents a constitutional incident involving a Governor.
 */
export interface Incident {
  readonly id: string;
  readonly governor_id: string;
  readonly state: StateCode | string;
  readonly date_start: ISO8601Date;
  readonly date_end: ISO8601Date | null;
  readonly transgression_type: TransgressionType;
  readonly duration_days: number;

  /**
   * Category of incident: constitutional violation or criminal/misconduct.
   */
  readonly category: IncidentCategory;

  // Incident narrative
  /**
   * Short title describing the incident (e.g., "NEET Exemption Bill Withheld")
   */
  readonly title: string;
  /**
   * Detailed description of what happened, context, and why it matters.
   */
  readonly description: string;
  /**
   * Name of the bill or legislation involved, if applicable.
   */
  readonly bill_name?: string;

  // Legal references - constitutional OR criminal
  /**
   * Constitutional articles violated (optional for criminal/misconduct incidents).
   */
  readonly constitutional_articles?: readonly number[];
  /**
   * IPC/BNS sections or other criminal law references.
   */
  readonly criminal_sections?: readonly string[];
  /**
   * Court case number or FIR reference.
   */
  readonly case_number?: string;
  /**
   * Investigating agency (CBI, ED, State Police, etc.).
   */
  readonly investigating_agency?: string;
  /**
   * Status of criminal case if applicable.
   */
  readonly case_status?: CaseStatus;
  /**
   * Whether Article 361 immunity was claimed or is relevant.
   */
  readonly immunity_claimed?: boolean;
  /**
   * Whether the governor resigned due to this incident.
   */
  readonly resigned_over_incident?: boolean;

  readonly sc_precedents: readonly string[];
  readonly escalation_level: EscalationLevel;
  readonly sources: readonly Source[];
  readonly verification_status: VerificationStatus;
  readonly incident_status: IncidentStatus;
  
  // Audit & Data Quality
  /**
   * Unique identifier for auditability and tracking claims.
   */
  readonly claim_id: string;
  /**
   * Identifier for the collection of evidence supporting this claim.
   */
  readonly evidence_bundle_id: string;
  /**
   * Calculated score (0.0–1.0) based on source credibility and corroboration.
   */
  readonly confidence_score: number;
  /**
   * Confidence band for cross-era fairness (e.g., 1950s vs post-2000).
   */
  readonly data_completeness_score: number;
  /**
   * Timestamp of the most recent verification of the incident data.
   */
  readonly last_verified_at: ISO8601Date | null;
  /**
   * Identifier for the person who last verified this incident record.
   */
  readonly reviewer_id: string | null;
  /**
   * Flag indicating conflicting reports across different sources.
   */
  readonly contradiction_flag: boolean;

  // Severity Scores
  /**
   * (escalation_level × 0.6) + (duration_impact × 0.4)
   */
  readonly severity_constitutional: number;
  /**
   * (media_visibility × 0.5) + (recency_multiplier × 0.5)
   */
  readonly severity_salience: number;
  /**
   * (Constitutional Severity × 0.7) + (Public Salience × 0.3)
   */
  readonly severity_unified: number;
  /**
   * Impact of the incident duration on its severity score.
   */
  readonly duration_impact: number;
  /**
   * Visibility in media and public interest.
   */
  readonly media_visibility: number;
  /**
   * Multiplier applied for more recent incidents.
   */
  readonly recency_multiplier: number;
  /**
   * Boost for high-intensity, high-visibility flare-ups.
   */
  readonly heat_multiplier: number;
  
  readonly era: Era;
  readonly raj_bhavan_response?: string;
  readonly legislative_pushback?: string;
}

// --- Metadata Interfaces ---

/**
 * Metadata for an Indian State or Union Territory.
 */
export interface StateMetadata {
  readonly code: StateCode;
  readonly name: string;
  readonly ut: boolean;
}

/**
 * Metadata for a Constitution of India article.
 */
export interface ArticleMetadata {
  readonly number: number;
  readonly title: string;
  readonly description: string;
}

/**
 * Metadata for a historical era.
 */
export interface EraMetadata {
  readonly id: Era;
  readonly name: string;
  readonly period: string;
  readonly characteristics: string;
}

/**
 * Metadata for a Supreme Court precedent.
 */
export interface PrecedentMetadata {
  readonly id: string;
  readonly case_name: string;
  readonly year: number;
  readonly summary: string;
}

/**
 * Metadata collection for all constitutional and historical entities.
 */
export interface Metadata {
  readonly articles: readonly ArticleMetadata[];
  readonly eras: readonly EraMetadata[];
  readonly precedents: readonly PrecedentMetadata[];
  readonly states: readonly StateMetadata[];
}

/**
 * Represents the root data structure of the project.
 */
export interface Database {
  readonly governors: readonly Governor[];
  readonly incidents: readonly Incident[];
  readonly metadata: Metadata;
}
