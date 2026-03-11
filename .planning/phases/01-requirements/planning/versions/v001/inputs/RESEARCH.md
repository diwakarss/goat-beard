# Research: Phase 1 — Requirements

**Project Mode**: Greenfield
**Work Mode**: Feature
**Phase Scope**: Define schema, severity model, data pipeline, and UI foundation for MVP

## Context

Building "Goat Beard" — a data-driven evidence platform tracking gubernatorial transgressions in India. The MVP covers 2010–present incidents from English-language news archives, with a dual-track severity scoring system anchored to constitutional precedent.

The name "beard scale" maps incident accumulation to facial hair metaphors: clean-shaven (no incidents) → stubble → full beard (severe pattern of transgressions).

## Baseline Assumptions (Greenfield)

Since this is a new project, we establish these baseline assumptions:

1. **No existing codebase** — Starting fresh with Next.js
2. **No legacy data** — All incidents scraped from archives
3. **No existing users** — Can design UI without migration concerns
4. **No API consumers** — Static-first, no backward compatibility needed

## Existing Debt

No architecture violations detected (greenfield project).

## Proposed Approach

### Phase 0 MVP Components

1. **Schema Definition** — Lock the 25+ field incident schema from BRAINSTORM.md
2. **Scraper Pipeline** — Crawlee-based crawler targeting 3 archives
3. **Entity Resolution** — Deduplication across sources using fuzzy matching on date + state + governor
4. **Severity Calculator** — TypeScript module implementing dual-track scoring
5. **JSON Data Layer** — Committed to repo, read at build time
6. **Timeline-Matrix UI** — Heat-map tiles with evidence drawers
7. **Static Deployment** — S3 + CloudFront via GitHub Actions

### Data Collection Strategy

| Archive | URL Pattern | Expected Challenge |
|---------|-------------|-------------------|
| The Hindu | thehindu.com/news/national/* | May require browser rendering |
| Indian Express | indianexpress.com/section/india-news/* | Rate limiting likely |
| Deccan Chronicle | deccanchronicle.com/nation/* | Older archive structure |

**Scraping approach**:
- Use Crawlee with Playwright for JS-heavy pages
- Proxy rotation for rate limit mitigation
- Extract: headline, date, body text, governor mentions, state mentions
- NLP pass to extract structured incident fields

### Severity Model Implementation

```typescript
interface SeverityScore {
  constitutional: number;  // 0-1
  salience: number;        // 0-1
  unified: number;         // 0-1
}

// Constitutional Severity = (escalation × 0.6) + (duration_impact × 0.4)
// Public Salience = (media_visibility × 0.5) + (recency × 0.5)
// Unified = (Constitutional × 0.7) + (Salience × 0.3)
```

**Escalation levels**:
- Level 1: Procedural delay (< 30 days)
- Level 2: Extended delay or soft refusal (30-90 days)
- Level 3: Active obstruction or constitutional overreach
- Level 4: Article 356 invocation or assembly dissolution

**Cap rule**: Unverified claims cannot exceed Level 2.

### Goat Beard Severity Scale (Confirmed)

Based on actual billy goat facial hair progression:

| Level | Name | Description | Criteria |
|-------|------|-------------|----------|
| 0 | **Clean Chin** | No visible beard (like Nubian goats) | 0 incidents |
| 1 | **Wisp** | Small tuft, barely visible | 1-2 incidents, unified < 0.8 |
| 2 | **Tuft** | Short chin beard, clearly visible | 3-4 incidents, unified 0.8-1.5 |
| 3 | **Billy Beard** | Full hanging beard, mid-length | 5-7 incidents, unified 1.5-3.0 |
| 4 | **Knee-Dragger** | Long beard hanging to knees (prize bucks) | 8+ incidents OR unified > 3.0 |

## Constraint Classification

| Constraint | Type | Evidence | Impact if Violated |
|-----------|------|----------|-------------------|
| 3-5 day MVP window | Hard | JD decision | Project scope must shrink |
| English archives only (Phase 0) | Hard | BRAINSTORM.md | Regional incidents may be missed |
| 2010–present scope | Hard | BRAINSTORM.md | No historical context pre-2010 |
| Static export only | Hard | JD decision | No server-side features |
| JSON committed to repo | Hard | JD decision (Checkpoint 2) | Scraper cannot run at build time |
| Escalation cap for unverified | Soft | BRAINSTORM.md | Could relax with strong single source |
| 2+ sources for Level 3+ | Soft | BRAINSTORM.md | Could relax for court-documented cases |

## Grounding Ledger

| Claim | Source | Date Checked | Confidence |
|-------|--------|--------------|------------|
| Crawlee has anti-detection features | GitHub README | 2026-03-10 | HIGH |
| Scrapling has 28k stars | GitHub | 2026-03-10 | HIGH |
| S.R. Bommai case is key precedent | BRAINSTORM.md (legal context) | 2026-03-10 | HIGH |
| Article 356 governs President's Rule | Indian Constitution | 2026-03-10 | HIGH |
| Severity formula weights (0.7/0.3) | BRAINSTORM.md | 2026-03-10 | HIGH |
| News archives have anti-bot protection | Common knowledge | 2026-03-10 | MEDIUM |

## Risks and Pitfalls

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| News archives block scraper | Medium | High | Proxy rotation, stealth mode, manual fallback |
| Incident deduplication fails | Medium | Medium | Fuzzy matching + manual review queue |
| Severity calibration feels wrong | Medium | Medium | Spot-check with known cases, iterate |
| 3-day timeline too aggressive | Medium | High | Cut UI polish, focus on data + basic timeline |
| Constitutional article mapping errors | Low | High | Cross-reference with legal databases |
| Archive paywalls | Medium | Medium | Focus on free archives, note coverage gaps |

## Open Questions

1. **Beard scale thresholds**: What incident counts map to stubble/goatee/full beard per governor?
2. **Historical context depth**: How much era context to surface in MVP vs. defer?
3. **Counter-narrative handling**: Include Raj Bhavan responses in MVP or Phase 2?
4. **Mobile responsiveness**: Priority for MVP or post-launch?
5. **Search/filter scope**: Full-text search in MVP or just era/state/governor filters?

## Confidence Assessment

| Aspect | Confidence | Notes |
|--------|------------|-------|
| Schema design | HIGH | Well-defined in BRAINSTORM.md |
| Severity model | HIGH | Formula locked, needs calibration |
| Scraping feasibility | MEDIUM | Depends on archive defenses |
| 3-day timeline | MEDIUM | Aggressive but achievable with focus |
| UI complexity | MEDIUM | Timeline-matrix is non-trivial |
| Data quality | MEDIUM | Depends on deduplication accuracy |

**Overall research confidence**: MEDIUM-HIGH

The schema and severity model are well-defined. Primary risks are scraping blockers and timeline pressure. Recommend starting with manual data curation for 10-20 incidents to validate UI while scraper is developed in parallel.

## Recommendation

Proceed to planning with parallel workstreams:
1. **Schema + Data**: Lock JSON schema, manually curate seed incidents
2. **Scraper**: Build Crawlee pipeline, test against archives
3. **UI**: Timeline-matrix component with mock data
4. **Severity**: Calculator module with unit tests

This de-risks the scraper dependency — UI can launch with manually curated data if scraping proves difficult.
