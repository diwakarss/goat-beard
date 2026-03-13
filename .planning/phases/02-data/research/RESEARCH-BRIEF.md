# Research Brief

## Goal

Build an automated data aggregation pipeline using Crawlee to scrape gubernatorial incident data from Indian news archives (The Hindu, Indian Express, Deccan Chronicle), transforming unstructured articles into structured `Incident` records matching the Phase 1 schema.

## In Scope

- Crawlee-based scraper architecture (Node.js/TypeScript to match existing stack)
- Archive URL discovery and navigation for 2010-present coverage
- Article content extraction (title, date, body text, source URL)
- LLM-assisted entity extraction: governor names, state codes, bill names, dates
- Fuzzy matching for governor name normalization
- Deduplication logic for incident matching
- Staging output (`data/incidents_staged.json`) for manual review before merge
- Open source list — any news archive with governor incident data (parallel crawling)
- Error handling and resumable crawl state

## Out of Scope (Non-Goals)

- Per-state/per-governor static page generation (Phase 2 follow-on)
- Counter-narrative section and Raj Bhavan response integration (Phase 2 follow-on)
- Full NLP/LLM-based incident classification (manual review step retained)
- Real-time monitoring or notification systems
- Custom proxy infrastructure (use Crawlee defaults)
- Historical data pre-2010 (backlog item)

## Constraints

| Constraint | Type | Evidence |
|------------|------|----------|
| Must match existing Incident schema | Hard | `src/types/schema.ts` locked in Phase 1 |
| TypeScript + Node.js stack | Hard | PROJECT.md tech stack decision |
| No API keys for target archives | Soft | No official APIs found; community scrapers exist |
| Manual verification step required | Hard | ROADMAP.md: "Manual curation validates schema correctness" |
| Static JSON output format | Hard | Phase 1 architecture: JSON files, no database |
| Public interest exception for scraping | Note | Accountability journalism; not commercial extraction |

## Success Criteria

- [ ] Crawlee scraper successfully fetches articles from at least 2 of 3 target archives
- [ ] Extracted data maps to `Incident` interface fields with >80% field coverage
- [ ] Deduplication identifies matching incidents across sources
- [ ] Output appends to existing `data/incidents.json` without schema violations
- [ ] Crawl can be paused/resumed without data loss
- [ ] Rate limiting keeps requests under 1 req/second per domain
- [ ] Documentation covers adding new archive sources

## Prior Art (from Phase 1 Research)

| Decision | Recommended Approach | Source |
|----------|---------------------|--------|
| Crawler type | PlaywrightCrawler | Phase 1 RESEARCH.md: proposed for JS-heavy pages |
| Tech stack | Crawlee (TypeScript) | Phase 1 PRD.md tech stack table |
| Proxy rotation | Enabled | Phase 1 RESEARCH.md: proposed mitigation |

*Note: These are Phase 1 recommendations, not hard constraints. Phase 2 may adjust based on actual requirements.*

## Decisions (Checkpoint 1)

| Decision | Resolution | Rationale |
|----------|------------|-----------|
| Entity extraction | LLM assist | Pass article text to LLM for structured extraction; more accurate for varied formats |
| Output flow | Staging file | Write to `data/incidents_staged.json`; manual review before merge to main file |
| Governor name normalization | Fuzzy matching | Levenshtein/similarity scoring handles name variants without hardcoded map |
| Archive sources | Open + parallel | Not restricted to Hindu/IE/DC; any source with governor incident data; crawl in parallel |
