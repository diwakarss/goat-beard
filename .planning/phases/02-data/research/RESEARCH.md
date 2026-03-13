# Research: Phase 2 — Data Aggregation

**Project Mode**: Existing
**Work Mode**: Feature
**Phase Scope**: Automated news archive scraping with Crawlee, LLM-assisted extraction, and incident staging pipeline

## Context

Building on Phase 1's MVP (timeline-matrix UI, severity scoring, 12 seed incidents), Phase 2 adds automated data aggregation to scale incident collection from manual curation to semi-automated pipeline.

The goal is to crawl Indian news archives, extract gubernatorial transgression data using LLM-assisted parsing, and output schema-compliant incidents to a staging file for human review before production merge.

## Existing State

### Codebase Overview

| Component | Status | Location |
|-----------|--------|----------|
| Schema | Locked | `src/types/schema.ts` (254 lines, 25+ fields on Incident) |
| Data layer | Stable | `src/lib/data.ts` — JSON loaders, aggregation helpers |
| Severity model | Tested | `src/lib/severity.ts` — dual-track scoring, beard levels |
| Current incidents | 12 | `data/incidents.json` |
| Governors | 7 | `data/governors.json` |

### Architecture Scan

**Status**: PASS (no violations)
- Files analyzed: 57
- Circular dependencies: 0
- DDD violations: 0

### Key Concerns (from Mapper)

1. **No data ingestion interface** — scraper must output to JSON files directly
2. **Schema stability** — Phase 2 should not require schema changes
3. **page.tsx complexity** — 596 lines, but not blocking for scraper work

## Existing Debt

No architecture violations detected.

Phase 1 tech debt (not blocking Phase 2):
- Large page component (`src/app/page.tsx`)
- Inline helper functions that should be in lib
- Legacy files (`data.legacy.ts`, `severity.legacy.ts`) to clean up

## Proposed Approach

### Pipeline Architecture

```
Sources (parallel) → PlaywrightCrawler → LLM Extractor → Fuzzy Matcher → Dedup → Validator → Staging → Review → Merge
```

### Component Breakdown

| Component | Purpose | Tech |
|-----------|---------|------|
| PlaywrightCrawler | Headless browser for JS archives | Crawlee |
| LLM Extractor | Article → structured Incident fields | Claude/GPT API |
| Fuzzy Matcher | Governor name → canonical ID | Levenshtein |
| Deduplicator | Merge same incident from multiple sources | Custom logic |
| Validator | Ensure schema compliance | TypeScript + runtime checks |
| Staging | Buffer for human review | `incidents_staged.json` |
| Merge script | Approved → production | CLI tool |

### File Structure

```
scraper/
├── crawler.ts        # Crawlee PlaywrightCrawler config
├── routes/           # Per-source route handlers
│   ├── thehindu.ts
│   ├── indianexpress.ts
│   └── generic.ts    # Fallback for new sources
├── parser.ts         # HTML → clean text extraction
├── extractor.ts      # LLM prompt + response parsing
├── matcher.ts        # Fuzzy governor name resolution
├── dedup.ts          # Incident deduplication logic
├── validator.ts      # Schema validation
└── index.ts          # Main entry point

scripts/
├── merge-incidents.ts    # Stage → production merge
├── add-source.ts         # Add new archive source
└── validate-staged.ts    # Pre-merge validation
```

## Constraint Classification

| Constraint | Type (Hard/Soft) | Evidence | Impact if Violated |
|------------|------------------|----------|--------------------|
| Incident schema match | Hard | `src/types/schema.ts` locked | Build failures, data corruption |
| TypeScript + Node.js | Hard | PROJECT.md tech stack | Incompatible with existing build |
| Manual review step | Hard | ROADMAP.md decision | Risk of bad data in production |
| Static JSON output | Hard | No database infrastructure | Would require architecture change |
| LLM API availability | Soft | External dependency | Fall back to manual extraction |
| Proxy availability | Soft | Rate limit mitigation | Slower crawls, potential blocks |

## Grounding Ledger

| Claim | Source | Date Checked | Confidence |
|-------|--------|--------------|------------|
| Crawlee supports PlaywrightCrawler | [GitHub apify/crawlee](https://github.com/apify/crawlee) | 2026-03-12 | HIGH |
| Crawlee has persistent queue | [Crawlee docs](https://crawlee.dev/js) | 2026-03-12 | HIGH |
| Crawlee has proxy rotation | GitHub README | 2026-03-12 | HIGH |
| The Hindu archive scrapable | Community scrapers exist (GitHub) | 2026-03-12 | MEDIUM |
| Indian Express has archive | Manual verification needed | 2026-03-12 | MEDIUM |
| Levenshtein suitable for name matching | Standard NLP practice | 2026-03-12 | HIGH |
| LLM can extract structured data from articles | Common use case | 2026-03-12 | HIGH |

## Risks and Pitfalls

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Archive blocks scraper | Medium | High | Proxy rotation, respectful rate limiting |
| LLM extraction inaccurate | Medium | Medium | Prompt tuning, human review catches errors |
| Fuzzy match false positives | Low | Medium | 0.85 threshold, flag low-confidence matches |
| Schema changes needed | Low | High | Validate against existing schema before starting |
| Archive structure changes | Medium | Medium | Modular route handlers, easy to update selectors |
| LLM API costs | Low | Low | Batch requests, cache responses |

## Open Questions

1. **LLM provider**: Claude vs GPT for extraction? (Cost, accuracy, rate limits)
2. **Batch size**: How many articles per crawl session?
3. **Review UI**: CLI-only or build simple web UI for staging review?
4. **Source discovery**: How to find new sources beyond initial three?

## Confidence Assessment

| Aspect | Confidence | Notes |
|--------|------------|-------|
| Crawlee integration | HIGH | Well-documented, TypeScript native |
| LLM extraction | MEDIUM-HIGH | Common pattern, needs prompt tuning |
| Fuzzy matching | HIGH | Standard approach, adjustable threshold |
| Deduplication | MEDIUM | Key design may need iteration |
| Schema compliance | HIGH | TypeScript enforces at compile time |
| Timeline | MEDIUM | Depends on archive complexity |

**Overall research confidence**: MEDIUM-HIGH

Core tech stack (Crawlee, LLM APIs) is well-understood. Primary unknowns are archive-specific selectors and LLM prompt effectiveness, both addressable through iteration.

## Recommendation

Proceed to planning with these priorities:

1. **Wave 1**: Crawlee scaffold + single source (The Hindu)
2. **Wave 2**: LLM extractor + fuzzy matcher
3. **Wave 3**: Additional sources + dedup
4. **Wave 4**: Staging review + merge tooling

This sequence validates the pipeline end-to-end with one source before scaling to parallel crawls.
