# Claude Review (round-001)

## Verdict
NEEDS_WORK

## Summary

The PLAN.md is well-structured with clear wave decomposition, acceptance criteria, and rollback strategies. The UI-SPEC.md is exceptionally detailed and production-quality. The UI-PLAYGROUND.html faithfully renders the spec. However, several blocking gaps exist between the plan and its upstream requirements (PRD, RESEARCH-BRIEF, ARCHITECTURE), and the plan contains internal contradictions and omissions that would cause rework during execution.

---

## Blocking Findings

### B1: PRD FR-4 counter-narrative section omitted without phase boundary clarity
**Severity**: Blocking
**Artifact**: PLAN.md (Task 3.2)

The plan says "Counter-narrative section deferred to Phase 2 per RESEARCH-BRIEF.md decision" -- this is correct per RESEARCH-BRIEF checkpoint 3. However, the PRD FR-4 lists counter-narrative as item 4 in the evidence drawer spec ("Counter-narrative section: Raj Bhavan response, contradictions"). The plan does not add any placeholder, guard, or explicit schema accommodation for the `raj_bhavan_response` and `legislative_pushback` fields in the drawer UI.

Since these fields ARE in the FR-1 schema (Task 1.2 includes them), seed data may populate them. The drawer needs to either:
- Render them when present (minimal effort), or
- Explicitly suppress them with a design note

**Required Change**: Add a note in Task 3.2 specifying behavior when `raj_bhavan_response` / `legislative_pushback` data exists in incidents. Either render as a simple text section or explicitly suppress with a TODO marker.

### B2: Beard scale calculation uses severity only -- PRD requires incident count AND severity
**Severity**: Blocking
**Artifact**: PLAN.md (Task 2.1) + UI-PLAYGROUND.html (beardLevel function)

The PRD FR-2a defines beard levels using **both** incident count AND unified score:
- Level 1: 1-2 incidents AND unified < 0.8
- Level 2: 3-4 incidents AND unified 0.8-1.5
- Level 3: 5-7 incidents AND unified 1.5-3.0
- Level 4: 8+ incidents OR unified > 3.0

The plan's `getBeardLevel` function signature correctly takes `(incidentCount, unifiedScore)` -- good. But the UI-PLAYGROUND.html `beardLevel()` function maps solely on severity score, ignoring incident count entirely. This means the playground preview is misleading -- it shows beard levels that won't match the actual implementation.

**Required Change**: Update `UI-PLAYGROUND.html` `beardLevel()` to incorporate incident count, or add a visible note in the playground that beard levels are simplified for preview purposes.

### B3: PRD specifies 50+ incidents as success metric; plan targets only 20+
**Severity**: Blocking
**Artifact**: PLAN.md (Task 2.3, AC-3)

PRD Success Metrics table: "Incidents ingested: 50+". Plan Task 2.3 says "20+ real incidents" and AC-3 says "20+ incidents in `data/incidents.json`". This is a 60% shortfall from the PRD's own success criteria.

While 20+ is reasonable for an MVP seed, the plan should either:
- Explicitly acknowledge the delta and set 50+ as a stretch goal or post-launch target
- Adjust the PRD metric down with documented rationale

**Required Change**: Reconcile the incident count target between PLAN.md and PRD.md. Either raise the plan target or document the deviation with timeline justification.

### B4: PRD FR-5 filtering requirements partially dropped without justification
**Severity**: Blocking
**Artifact**: PLAN.md (Task 3.3)

PRD FR-5 requires filtering by: State, Governor, Constitutional era, Transgression type, Verification status, Severity threshold, Date range.

Plan Task 3.3 implements 5 of 7: State, Transgression type, Verification status, Severity threshold, Date range. It defers "Governor search, era filter, constitutional article filter" to later phases.

However, the PRD marks ALL FR-5 filters as Phase 0 scope (no deferral notation). The plan drops 3 filters without PRD amendment. Governor filter is a core user story (journalist persona). Era filter is core to the policy researcher persona.

**Required Change**: Either:
1. Add Governor and Era filters to Task 3.3 (they are straightforward selects), or
2. Add explicit rationale for deferral and mark PRD FR-5 as partially fulfilled with phase annotation

### B5: No scraper/data pipeline tasks in the plan
**Severity**: Blocking
**Artifact**: PLAN.md (entire plan)

The PRD, RESEARCH-BRIEF, and ARCHITECTURE all describe a data collection pipeline (Crawlee scraper, entity resolution, deduplication). The plan relies entirely on manual curation (Task 2.3: "Manually Curate Seed Incidents").

This is potentially acceptable for MVP, but the plan never acknowledges the omission or explains why the entire scraping pipeline -- a key architectural component -- is absent. The ARCHITECTURE.md shows scraping as the first step in the data flow.

**Required Change**: Add a section to PLAN.md explicitly scoping out the scraper pipeline for Phase 1 with rationale (e.g., "Manual curation for MVP quality; scraper pipeline deferred to Phase 2"). This prevents executor confusion about whether scraping was forgotten or intentionally deferred.

---

## Non-Blocking Findings

### N1: Article 200 missing from schema metadata
**Severity**: Minor
**Artifact**: PLAN.md (Task 1.3)

Task 1.3 lists Articles 163, 168, 172, 356 for `metadata/articles.json`. But `withholding_assent` -- the most common transgression type -- is governed by **Article 200** (Assent to Bills). The UI-PLAYGROUND.html evidence drawer even references "Article 200" in the constitutional levers section. The PRD Appendix A doesn't list Article 200 either, but it's constitutionally the most relevant.

**Recommended**: Add Article 200 to the metadata seed list.

### N2: `precedents.json` omitted from ARCHITECTURE.md schema diagram
**Severity**: Minor
**Artifact**: PLAN.md (Task 1.3) vs. ARCHITECTURE.md

PLAN.md correctly includes `metadata/precedents.json` per PRD spec. ARCHITECTURE.md lists only `states.json`, `articles.json`, `eras.json` under metadata -- missing `precedents.json`. Minor inconsistency between artifacts.

**Recommended**: Flag for ARCHITECTURE.md update in resolution.

### N3: Test framework decision left open at scaffold time
**Severity**: Minor
**Artifact**: PLAN.md (Open Decisions table)

"Test framework: Vitest or Jest (decide at scaffold)". This is fine for flexibility, but the executor may waste time deliberating. Given the Next.js 14+ choice and Vitest's faster execution, a recommendation would reduce decision latency.

**Recommended**: Default to Vitest with fallback to Jest if Next.js integration issues arise.

### N4: Build process omits static page generation per PRD
**Severity**: Minor
**Artifact**: PLAN.md (entire plan)

PRD Build Process step 2: "Generate static pages for each state and governor." The plan only creates a single page (`src/app/page.tsx`). No per-state or per-governor routes are planned. This is likely acceptable for MVP (all data visible on one page), but contradicts the PRD.

**Recommended**: Acknowledge single-page scope in plan. Per-state/governor pages can be Phase 2.

### N5: UI-PLAYGROUND.html uses random data instead of realistic sample incidents
**Severity**: Minor
**Artifact**: UI-PLAYGROUND.html

The playground generates incidents using seeded random data. Governor names are synthetic ("Gov. Kerala (2023)"). While this is fine for layout preview, it undermines the playground's value for stakeholder review -- users can't assess whether real incidents look correct.

**Recommended**: Replace 3-4 sample incidents with realistic data matching Task 2.3 seed incidents (e.g., Arif Mohammad Khan / Kerala bill withholding).

### N6: Mobile breakpoint mismatch between UI-SPEC and playground
**Severity**: Minor
**Artifact**: UI-SPEC.md (Section 7.1) vs. UI-PLAYGROUND.html

UI-SPEC defines tablet breakpoint as 768-1279px and desktop as 1280px+. The playground only shows two frames: desktop (1080px, labeled "1440px viewport scaled") and mobile (375px). There is no tablet preview, yet the spec has distinct tablet behavior (360px drawer, 40x36px tiles, full names for states). Stakeholders can't validate tablet layout.

**Recommended**: Add a tablet frame (768px) to the playground, or note its absence.

### N7: Severity formula boundary condition -- max unified score appears ~2.26, making "Critical" (>3.0) unreachable
**Severity**: Medium (borderline blocking)
**Artifact**: PLAN.md (Task 2.1)

Constitutional Severity = `(escalation_level x 0.6) + (duration_impact x 0.4)`. With escalation_level = 4 and duration_impact = 1.0: `(4 x 0.6) + (1.0 x 0.4) = 2.8`. Unified Score = `(2.8 x 0.7) + (1.0 x 0.3) = 2.26`. The maximum possible unified score is ~2.26, making the "Critical" severity level (> 3.0) and "Knee-Dragger" beard level (unified > 3.0) unreachable through the formula alone.

The test case in Task 2.2 claims "level 4 + 365 days -> 4.0" which is mathematically incorrect (result is 2.8 for constitutional severity component).

This needs clarification: either the formulas need adjustment to allow scores > 3.0, or the beard scale thresholds need recalibration to the actual formula range.

**Recommended**: Verify formula ranges and adjust either thresholds or weights so all beard levels are achievable.

---

## Required Changes (Summary)

| ID | Action | Priority |
|----|--------|----------|
| B1 | Add counter-narrative field handling to Task 3.2 evidence drawer spec | High |
| B2 | Fix playground beard level calculation or add simplification note | High |
| B3 | Reconcile 20+ vs 50+ incident count target | High |
| B4 | Address dropped FR-5 filters (Governor, Era) or justify deferral | High |
| B5 | Explicitly scope out scraper pipeline with rationale | High |
| N7 | Verify severity formula range -- max unified score appears ~2.26, making "Critical" (>3.0) unreachable | Medium |
| N1 | Add Article 200 to metadata seed list | Low |
| N4 | Acknowledge single-page scope vs PRD multi-page build process | Low |

---

## What Works Well

1. **Wave decomposition** is clean with correct dependency ordering
2. **Acceptance criteria** are specific and testable (AC-1 through AC-10)
3. **Rollback strategy** is practical and wave-independent
4. **UI-SPEC.md** is production-grade -- accessibility, edge states, responsive behavior, and ARIA annotations are thorough
5. **UI-PLAYGROUND.html** faithfully implements the spec's visual design system (colors, spacing, component hierarchy)
6. **Type system design** correctly captures all FR-1 fields including optional counter-narrative fields
7. **Evidence drawer sections** match FR-4 ordering (minus deferred counter-narrative)
