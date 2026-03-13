/**
 * Types for the scraper pipeline
 */

import type { Incident, Source } from '../src/types/schema';

/** Raw extracted data from LLM before enrichment */
export interface RawExtraction {
  title: string;
  governor_name: string;
  state: string;
  transgression_type: string;
  date_start: string;
  date_end: string | null;
  bill_name: string | null;
  constitutional_articles: number[];
  escalation_level: number;
  description: string;
  extraction_confidence: number;
}

/** Crawl metadata attached to each extraction */
export interface CrawlMetadata {
  source_url: string;
  source_id: string;
  outlet: string;
  crawled_at: string;
  article_date: string | null;
  article_title: string;
}

/** Combined extraction with metadata */
export interface ExtractedIncident {
  raw: RawExtraction;
  meta: CrawlMetadata;
}

/** Staged incident with review metadata */
export interface StagedIncident extends Incident {
  _meta: {
    extraction_confidence: number;
    match_confidence: number;
    source_url: string;
    crawled_at: string;
    needs_review: boolean;
    review_notes?: string;
    governor_name_raw: string;
  };
}

/** Result of fuzzy matching a governor name */
export interface MatchResult {
  governor_id: string | null;
  confidence: number;
  matched_name: string | null;
  needs_review: boolean;
}

/** Article data extracted from HTML */
export interface ParsedArticle {
  url: string;
  title: string;
  content: string;
  date: string | null;
  outlet: string;
}

/** Pipeline processing result */
export interface ProcessingResult {
  success: boolean;
  incident?: StagedIncident;
  error?: string;
  skipped_reason?: string;
}
