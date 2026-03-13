# Goat Beard Roadmap

**Project Timeline**: MVP in 4-5 days, full platform evolves over subsequent phases

---

## Phase 1: Requirements & MVP Foundation (Current)

**Status**: Planning Complete | **Duration**: 4-5 days

### Waves

| Wave | Goal | Key Deliverables |
|------|------|------------------|
| **Wave 1** | Project Scaffold & Schema Lock | Next.js project, TypeScript types, JSON schema, data loaders |
| **Wave 2** | Severity Model & Seed Data | Severity calculator with tests, 30+ curated incidents (50+ by phase end) |
| **Wave 3** | Timeline-Matrix UI | Heat tiles, evidence drawer, filters, beard scale legend |
| **Wave 4** | Export, Polish & Deployment | Copy-to-clipboard, accessibility audit, CI/CD pipeline, S3 deployment |

### Acceptance Criteria

- [ ] TypeScript types compile with zero errors
- [ ] Severity calculator passes all unit tests
- [ ] 50+ real incidents in data/incidents.json
- [ ] Timeline-matrix renders with heat tiles
- [ ] Evidence drawer shows full incident detail
- [ ] Filters work correctly (state, governor, era, type, verification, severity, date)
- [ ] Copy-to-clipboard exports plain text and markdown
- [ ] Static build produces out/ directory
- [ ] Lighthouse scores: Performance 90+, Accessibility 90+

---

## Phase 2: Data Pipeline & Automation (Planned)

**Status**: Not Started | **Duration**: TBD

### Goals

1. **Crawlee Scraper** — Automated archive scraping from The Hindu, Indian Express, Deccan Chronicle
2. **Entity Resolution** — Governor name normalization, state code mapping
3. **Deduplication** — Incident matching and merging
4. **Per-State/Governor Pages** — Static page generation for individual entities
5. **Counter-Narrative Section** — Full editorial balance with Raj Bhavan responses

### Dependencies

- Phase 1 schema must be stable before automation
- Manual curation validates schema correctness

---

## Phase 3: Advanced Features (Future)

**Status**: Backlog | **Duration**: TBD

### Potential Features

- **API Layer** — REST/GraphQL for third-party integrations
- **Search** — Full-text search across incidents
- **Notifications** — Alerts for new incidents in tracked states
- **Embedding** — Widgets for news sites
- **Historical Data** — Pre-2010 incidents (full era coverage)
- **Comparative Analytics** — Cross-state dashboards

---

## Phase 4: Scale & Community (Future)

**Status**: Backlog | **Duration**: TBD

### Potential Features

- **Crowd-sourced submissions** — User-submitted incidents with verification workflow
- **Regional language support** — Hindi, Tamil, Bengali interfaces
- **Open data exports** — CSV/JSON bulk downloads
- **Academic partnerships** — Research collaborations

---

## Risk Register

| Risk | Mitigation |
|------|-----------|
| Seed data quality | Start with well-documented cases (Kerala, Tamil Nadu); expand iteratively |
| News source availability | Store source snapshots in data; URL is reference, not dependency |
| AWS credentials for deploy | Deploy step optional for MVP; local build validates functionality |
| Timeline-matrix complexity | Simple grid layout first; animations later |

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-10 | JSON file organization (separate files) | Keeps concerns separated, matches PRD spec |
| 2026-03-10 | Counter-narrative deferred to Phase 2 | Focus on evidence presentation first |
| 2026-03-10 | Mobile responsive from day 1 | Tailwind makes this low-effort |
| 2026-03-10 | Manual curation for Phase 1 | Validates schema before automation |
| 2026-03-10 | Vitest for testing | Faster than Jest; Next.js compatible |

<!-- NALAN_VERIFY_LOG_START -->
## Verification Log

- 2026-03-12 — 01-requirements — OK (run `20260312T175950Z`)
  - Next action: Phase verification complete. Proceed to next phase planning or execution.
<!-- NALAN_VERIFY_LOG_END -->
