# Codebase Concerns

**Analysis Date:** 2026-03-12

## Tech Debt

**Large Page Component:**
- Issue: `src/app/page.tsx` is 596 lines with mixed concerns
- Files: `src/app/page.tsx`
- Impact: Hard to maintain, difficult to test UI logic separately
- Fix approach: Extract helper functions to `src/lib/`, split into smaller components, create custom hooks for state management

**Inline Helper Functions:**
- Issue: `page.tsx` contains ~10 helper functions (`severityToBeardLevel`, `formatDate`, etc.) that should be in lib
- Files: `src/app/page.tsx` (lines 33-107)
- Impact: Functions not reusable, not unit testable
- Fix approach: Move to `src/lib/formatters.ts` or `src/lib/transforms.ts`

**Duplicated Severity-to-BeardLevel Logic:**
- Issue: Severity-to-beard conversion logic exists in both `page.tsx` and `severity.ts`
- Files: `src/app/page.tsx`, `src/lib/severity.ts`
- Impact: Risk of divergence, maintenance burden
- Fix approach: Use single implementation from `severity.ts`

**Legacy Code Files:**
- Issue: `data.legacy.ts` and `severity.legacy.ts` exist alongside main files
- Files: `src/lib/data.legacy.ts`, `src/lib/severity.legacy.ts`
- Impact: Confusion about which to use
- Fix approach: Review, migrate any needed functionality, delete legacy files

## Known Bugs

**None identified via TODO/FIXME scanning.**

## Security Considerations

**No Secrets:**
- Risk: Low - no API keys, no auth, public static site
- Current mitigation: N/A
- Recommendations: When adding scrapers, keep API keys in environment variables, not code

**Data Attribution:**
- Risk: Source URLs may become stale
- Files: `data/incidents.json` (source URLs in each incident)
- Current mitigation: URLs are references, data is stored locally
- Recommendations: Consider archiving source snapshots

## Performance Bottlenecks

**Map Loading:**
- Problem: India TopoJSON fetched at runtime
- Files: `src/components/IndiaMap.tsx`
- Cause: `fetch('/data/india.json')` on mount
- Improvement path: Pre-load during build or use static import

**Page-Level Data Transforms:**
- Problem: All data transformations happen in `page.tsx` on every render
- Files: `src/app/page.tsx` (lines 246-469)
- Cause: Heavy use of `useMemo` with large dependency arrays
- Improvement path: Move to data layer, compute at load time where possible

## Fragile Areas

**State Code Mapping:**
- Files: `src/components/IndiaMap.tsx` (lines 33-70)
- Why fragile: Hardcoded `stateCodeMap` must match TopoJSON `st_code` values
- Safe modification: Verify against TopoJSON before changing
- Test coverage: None

**Severity Thresholds:**
- Files: `src/app/page.tsx` (severity to category mappings)
- Why fragile: Magic numbers in multiple places (0.6, 1.0, 1.3, 1.6)
- Safe modification: Centralize in `severity.ts` constants
- Test coverage: Severity calculations tested, but UI threshold usage not tested

## Scaling Limits

**JSON Data Size:**
- Current capacity: 12 incidents, 7 governors
- Limit: Hundreds would be fine; thousands may slow initial load
- Scaling path: Paginate or lazy-load incident data

**Component Re-renders:**
- Current capacity: Dashboard handles current data well
- Limit: Large incident sets with complex filters
- Scaling path: Virtualization (react-window) for tables, debounced filters

## Dependencies at Risk

**react-simple-maps:**
- Risk: Niche library, may have slower updates
- Impact: Map rendering would break
- Migration plan: Could switch to D3 directly or Leaflet

**No Major Risks:**
- Core deps (React, Next.js, Tailwind) are well-maintained
- TypeScript, Vitest are actively developed

## Missing Critical Features

**Error Boundaries:**
- Problem: No React error boundaries configured
- Blocks: Graceful error handling in production
- Files: `src/app/layout.tsx` (should wrap children)

**Loading States:**
- Problem: No skeleton loaders for data
- Impact: Flash of empty content on slow connections
- Blocks: Polished UX

**Accessibility Audit:**
- Problem: Phase 1 acceptance criteria mentions a11y audit but not verified
- Blocks: Lighthouse Accessibility 90+ goal

## Test Coverage Gaps

**Components Not Tested:**
- What's not tested: All 25 components in `src/components/`
- Files: `src/components/*.tsx`
- Risk: UI regressions undetected
- Priority: Medium - visual testing via Storybook could help

**Data Transforms in page.tsx:**
- What's not tested: `transformedGovernors`, `billsInLimbo`, `stateData`, etc.
- Files: `src/app/page.tsx` (lines 246-469)
- Risk: Transform bugs affect dashboard display
- Priority: High - extract and test these functions

**Filter Logic:**
- What's not tested: Filter combinations in `tableIncidents`
- Files: `src/app/page.tsx` (lines 398-448)
- Risk: Filter bugs hide or show wrong incidents
- Priority: Medium

## Phase 2 Preparation Concerns

**Scraper Integration Point:**
- Problem: No clear data ingestion interface
- Files: `data/*.json`
- Risk: Scraper output format may not match schema
- Recommendation: Define validation pipeline before building scraper

**Schema Stability:**
- Problem: Phase 2 may require schema changes
- Files: `src/types/schema.ts`
- Risk: Breaking changes to existing data
- Recommendation: Version the schema, add migration scripts if needed

---

*Concerns audit: 2026-03-12*
