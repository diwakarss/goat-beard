# Research Brief

## Goal
- Build a data-driven evidence platform ("Goat Beard") tracking gubernatorial transgressions in India from 2010–present, with a severity scoring system anchored to constitutional precedent.

## In Scope
- Incident schema design (governor, state, transgression type, constitutional lever, severity scores)
- Archive-based data collection pipeline (The Hindu, Indian Express, Deccan Chronicle)
- Entity resolution and deduplication across sources
- Dual-track severity model (Constitutional Severity + Public Salience)
- Timeline-matrix UI with evidence drawers
- Source verification tiers and confidence scoring
- Historical context tagging (era markers, political backdrop)

## Out of Scope (Non-Goals)
- Pre-2010 historical backfill (Phase 2+)
- Regional language sources (Phase 2+)
- Court judgment integration beyond SC precedent citations (Phase 2+)
- RTI response integration (Phase 2+)
- Public API / exportable datasets (Phase 5)
- Multi-language UI

## Constraints
- **Timeline**: 3-5 day MVP launch window
- **Data Sources**: English-language news archives only (Phase 0)
- **Verification**: Unresolved factual disputes capped at Escalation Level 2 until corroborated by 2+ independent primary sources
- **Tech Stack**: Next.js + JSON data files (static export)
- **Deployment**: AWS S3 + CloudFront (static site)
- **Data Collection**: Web scraping via Crawlee (TypeScript) or Scrapling (Python)

## Success Criteria
- Schema locked and documented
- Data pipeline ingesting incidents from 3 major archives
- Deduplication logic operational
- Severity model calibrated on 2010–present data
- Timeline-matrix UI rendering incidents with drill-down evidence drawers
- Source verification rules documented and enforced

## Decided
- **Tech stack**: Next.js + JSON data files (static export) — confirmed by JD
- **Scraping strategy**: Crawlee (TypeScript, 22k stars) or Scrapling (Python, 28k stars) — both have anti-detection, proxy rotation, browser automation
- **Deployment**: AWS S3 + CloudFront static site — confirmed by JD

## Open Decisions
- **JSON data structure** (Owner: NalaN) — Single file vs. per-state vs. per-governor organization

## Decided (Checkpoint 3)
- **Scraping library**: Crawlee (TypeScript) — matches Next.js stack
- **Severity scale**: Goat beard-based (actual animal, not human goatee):
  - Level 0: Clean Chin (0 incidents)
  - Level 1: Wisp (1-2 incidents, unified < 0.8)
  - Level 2: Tuft (3-4 incidents, unified 0.8-1.5)
  - Level 3: Billy Beard (5-7 incidents, unified 1.5-3.0)
  - Level 4: Knee-Dragger (8+ incidents OR unified > 3.0)
- **Counter-narrative**: Defer to Phase 2
- **Mobile**: Responsive from day 1 (Tailwind)
