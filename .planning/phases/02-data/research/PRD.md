# Product Requirements Document: Phase 2 — Data Aggregation

**Version**: 1.0
**Phase**: 2
**Status**: Draft
**Last Updated**: 2026-03-12

## Executive Summary

Phase 2 adds automated data aggregation to Goat Beard, transforming the manual curation process into a semi-automated pipeline. Using Crawlee for web scraping and LLM-assisted extraction, the system will crawl Indian news archives, extract gubernatorial incident data, and stage it for human review before production merge.

**Target Outcome**: Scale from 12 manually-curated incidents to 100+ semi-automated incidents with maintained data quality.

## Problem Statement

Phase 1 established the schema, severity model, and visualization layer with 12 manually-curated incidents. This approach:

1. Does not scale — manual curation is labor-intensive
2. Misses incidents — no systematic coverage of archives
3. Lacks freshness — no mechanism for ongoing data collection
4. Has single-source bias — limited to curator's knowledge

## User Stories

### Data Curator

**As a** data curator,
**I want to** run automated crawls against news archives,
**So that** I can discover incidents I would have missed manually.

**Acceptance Criteria**:
- Can start a crawl with a single command
- Can pause and resume crawls without data loss
- Can see crawl progress and error logs
- Can review staged incidents before they go live

### System Administrator

**As a** system administrator,
**I want to** add new archive sources without code changes,
**So that** I can expand coverage as I discover new sources.

**Acceptance Criteria**:
- Can add a source via configuration
- Generic parser handles common article structures
- Source-specific handlers can be added for complex archives

### End User (Inherited from Phase 1)

**As an** end user,
**I want to** see more incidents with consistent quality,
**So that** I can trust the platform's comprehensiveness.

**Acceptance Criteria**:
- Incident count increases from 12 to 100+
- All incidents pass schema validation
- Source attribution maintained for all incidents

## Functional Requirements

### FR-1: Crawlee Scraper

The system SHALL implement a Crawlee-based scraper with:

| Requirement | Description |
|-------------|-------------|
| FR-1.1 | Use PlaywrightCrawler for JavaScript-heavy archives |
| FR-1.2 | Support parallel crawling of multiple sources |
| FR-1.3 | Implement persistent request queue (pause/resume) |
| FR-1.4 | Enable proxy rotation for rate limit mitigation |
| FR-1.5 | Store raw HTML in persistent storage for re-extraction |

### FR-2: LLM-Assisted Extraction

The system SHALL extract structured incident data using LLM:

| Requirement | Description |
|-------------|-------------|
| FR-2.1 | Parse article text into Incident schema fields |
| FR-2.2 | Extract: governor name, state, transgression type, dates, bill name |
| FR-2.3 | Extract: constitutional articles mentioned |
| FR-2.4 | Return confidence score for extraction quality |
| FR-2.5 | Handle extraction failures gracefully (flag for manual review) |

**Extraction prompt structure**:
```
Given this news article about a gubernatorial incident in India:
[ARTICLE TEXT]

Extract the following fields in JSON format:
- title: string (short headline for the incident, max 10 words)
- governor_name: string
- state: string (full name)
- transgression_type: one of [withholding_assent, delay, overreach, dissolution, failure_to_countersign, other]
- date_start: YYYY-MM-DD
- date_end: YYYY-MM-DD or null
- bill_name: string or null
- constitutional_articles: number[]
- escalation_level: number (1-4, where 1=procedural delay, 2=extended delay, 3=obstruction, 4=Article 356/dissolution)
- description: string (2-3 sentences)
- extraction_confidence: number (0-1)
```

**Post-extraction enrichment** (performed by validator, FR-5.3):
- `id`: auto-generated UUID
- `governor_id`: resolved via fuzzy matcher (FR-3)
- `severity_constitutional`, `severity_salience`, `severity_unified`: computed using `src/lib/severity.ts` formulas
- `verification_status`: defaults to `unverified`
- `sources`: populated from crawl metadata (URL, outlet, date)
- Audit fields (`claim_id`, `evidence_bundle_id`, etc.): auto-generated with defaults

### FR-3: Governor Name Resolution

The system SHALL resolve governor names to canonical IDs:

| Requirement | Description |
|-------------|-------------|
| FR-3.1 | Fuzzy match extracted names against `governors.json` |
| FR-3.2 | Use Levenshtein distance with 0.85 similarity threshold |
| FR-3.3 | Auto-match above threshold, flag below for review |
| FR-3.4 | Create new governor record if no match found (staged) |

### FR-4: Deduplication

The system SHALL deduplicate incidents from multiple sources:

| Requirement | Description |
|-------------|-------------|
| FR-4.1 | Key on (governor_id, state, transgression_type, date_start ± 7 days) |
| FR-4.2 | Merge sources array for duplicate incidents |
| FR-4.3 | Keep highest-credibility source as primary |
| FR-4.4 | Log dedup decisions for audit |

### FR-5: Schema Validation

The system SHALL validate all output against the Incident schema:

| Requirement | Description |
|-------------|-------------|
| FR-5.1 | Runtime validation against `src/types/schema.ts` |
| FR-5.2 | Reject invalid incidents with error details |
| FR-5.3 | Compute severity scores using `src/lib/severity.ts` formulas (requires escalation_level from extraction) |
| FR-5.4 | Ensure all required fields populated |

### FR-6: Staging Output

The system SHALL output to a staging file for review:

| Requirement | Description |
|-------------|-------------|
| FR-6.1 | Write valid incidents to `data/incidents_staged.json` |
| FR-6.2 | Include extraction_confidence and match_confidence metadata |
| FR-6.3 | Flag low-confidence extractions for priority review |
| FR-6.4 | Support incremental appends (don't overwrite) |

### FR-7: Merge Tooling

The system SHALL provide tools for staging-to-production merge:

| Requirement | Description |
|-------------|-------------|
| FR-7.1 | CLI command to review staged incidents |
| FR-7.2 | Approve/reject/edit individual incidents |
| FR-7.3 | Merge approved incidents to `data/incidents.json` |
| FR-7.4 | Remove merged incidents from staging file |

## Non-Functional Requirements

### NFR-1: Performance

| Requirement | Target |
|-------------|--------|
| Crawl rate | ≤ 1 request/second per domain |
| LLM extraction | < 5 seconds per article |
| Full pipeline (100 articles) | < 30 minutes |

### NFR-2: Reliability

| Requirement | Target |
|-------------|--------|
| Crawl resume | 100% state recovery after crash |
| Extraction success rate | > 80% of articles |
| Schema validation pass rate | 100% of staged incidents |

### NFR-3: Maintainability

| Requirement | Target |
|-------------|--------|
| Add new source | < 1 hour for common structures |
| Update selectors | Isolated to route handler |
| Test coverage | > 80% for core pipeline |

## Technical Specifications

### Tech Stack (Additions to Phase 1)

| Component | Technology |
|-----------|------------|
| Scraper | Crawlee 3.x (PlaywrightCrawler) |
| LLM | Claude API (primary) or OpenAI (fallback) |
| Fuzzy matching | fastest-levenshtein |
| Validation | zod (runtime schema validation) |

### New Dependencies

```json
{
  "dependencies": {
    "crawlee": "^3.8.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "fastest-levenshtein": "^1.0.16",
    "zod": "^3.22.0"
  }
}
```

### Directory Structure

```
scraper/
├── crawler.ts        # PlaywrightCrawler setup
├── routes/
│   ├── thehindu.ts   # The Hindu route handler
│   ├── indianexpress.ts
│   └── generic.ts    # Fallback handler
├── parser.ts         # HTML → text
├── extractor.ts      # LLM extraction
├── matcher.ts        # Fuzzy matching
├── dedup.ts          # Deduplication
├── validator.ts      # Schema validation
├── config.ts         # Source configurations
└── index.ts          # Entry point

scripts/
├── crawl.ts          # Run crawl
├── merge.ts          # Merge staging
└── validate.ts       # Validate staged
```

## Out of Scope (Phase 2)

- Per-state/per-governor static pages (Phase 2 follow-on)
- Counter-narrative section (Phase 2 follow-on)
- Real-time monitoring or alerts
- Pre-2010 historical data
- Non-English sources

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Incidents added | 100+ new | Count in incidents.json |
| Extraction accuracy | > 80% | Manual review sample |
| Dedup effectiveness | < 5% duplicates | Post-merge audit |
| Pipeline uptime | 95% | Crawl completion rate |
| Review throughput | 50 incidents/hour | Time tracking |

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Archive blocks | Medium | High | Proxy rotation, rate limiting |
| LLM accuracy | Medium | Medium | Prompt tuning, human review |
| Cost overrun (LLM) | Low | Low | Batch requests, caching |
| Schema drift | Low | High | Strict validation, no schema changes |

## Milestones

| Milestone | Deliverable |
|-----------|-------------|
| M1 | Crawlee scaffold + The Hindu route |
| M2 | LLM extractor + fuzzy matcher |
| M3 | Additional sources + dedup |
| M4 | Staging review + merge tooling |
| M5 | 100+ incidents merged |

## Appendix

### A. Source Configuration Schema

```typescript
interface SourceConfig {
  id: string;
  name: string;
  baseUrl: string;
  archivePattern: string;  // URL pattern for archive pages
  articleSelector: string; // CSS selector for article links
  contentSelector: string; // CSS selector for article body
  dateSelector: string;    // CSS selector for publish date
  maxPagesPerCrawl: number;
  rateLimit: number;       // requests per second
}
```

### B. Staged Incident Metadata

```typescript
interface StagedIncident extends Incident {
  _meta: {
    extraction_confidence: number;
    match_confidence: number;
    source_url: string;
    crawled_at: string;
    needs_review: boolean;
    review_notes?: string;
  };
}
```

---

*PRD Version 1.0 — 2026-03-12*
