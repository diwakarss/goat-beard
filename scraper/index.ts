/**
 * Scraper entry point
 */

export { createCrawler, runCrawl, processArticles, runFullPipeline } from './crawler';
export { parseArticle, isRelevantArticle, cleanContent } from './parser';
export {
  extractIncident,
  extractBatch,
  buildExtractionPrompt,
  parseExtractionResponse,
  createExtractedIncident,
  saveForManualExtraction,
  loadManualExtractionResults,
  EXTRACTION_PROMPT,
} from './extractor';
export { matchGovernor, matchStateCode, clearGovernorsCache } from './matcher';
export { validateAndEnrich, validateBatch } from './validator';
export { deduplicateIncidents, isDuplicate } from './dedup';
export {
  loadStagedIncidents,
  saveStagedIncidents,
  appendToStaging,
  loadProductionIncidents,
  saveProductionIncidents,
  getStagingSummary,
} from './staging';
export { sources, getSourceById, searchTerms, incidentKeywords } from './config';

export type {
  SourceConfig,
} from './config';

export type {
  RawExtraction,
  CrawlMetadata,
  ExtractedIncident,
  StagedIncident,
  MatchResult,
  ParsedArticle,
  ProcessingResult,
} from './types';
