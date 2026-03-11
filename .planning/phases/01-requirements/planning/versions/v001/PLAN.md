# Phase 1 Plan: Requirements & MVP Foundation

**Version**: v001
**Phase**: 01-requirements
**Status**: Draft
**Created**: 2026-03-10
**Inputs**: RESEARCH-BRIEF.md, RESEARCH.md, ARCHITECTURE.md, PRD.md, RESEARCH-CHECK.md

## Overview

This plan implements the Goat Beard MVP — a static-first evidence platform tracking gubernatorial transgressions in India (2010–present). The phase delivers: locked JSON schema + TypeScript types, severity calculation module, seed data (50+ manually curated incidents per PRD target), timeline-matrix UI, and static deployment pipeline.

**Scope Note — Data Pipeline**: The scraper/data pipeline (Crawlee, entity resolution, deduplication) described in ARCHITECTURE.md is intentionally deferred to Phase 2. Phase 1 uses manual curation to ensure data quality and schema correctness before automating ingestion. The schema and type definitions in Wave 1 are designed to be pipeline-compatible.

**Scope Note — Page Structure**: Phase 1 delivers a single-page application with all data visible on one page. Per-state and per-governor static pages (PRD Build Process step 2) are deferred to Phase 2 once the data volume and routing patterns are validated.

**Scope Note — UI Artifact Alignment**: PLAN.md is the canonical source of truth for feature requirements. UI-SPEC.md and UI-PLAYGROUND.html are derivative artifacts and must be updated during execution to reflect PLAN.md requirements. Known alignment gaps that must be resolved during implementation:
1. **Filter surface** (F1): UI-SPEC.md and UI-PLAYGROUND.html omit Governor and Constitutional era filters that are required by Task 3.3. Executor must add these filters to both UI artifacts.
2. **Official Response section** (F2): UI-SPEC.md evidence drawer and UI-PLAYGROUND.html omit the Official Response section specified in Task 3.2. Executor must add the collapsed Official Response section to UI-SPEC.md (as a new Section between Verification Status and Actions) and to UI-PLAYGROUND.html.
3. **Severity domain** (F3): UI-SPEC.md defines a "Critical" bucket at >3.0 and slider max 4.0, but the unified severity formula (Task 2.1) produces a maximum of ~2.26. The canonical severity domain is [0.42, 2.26]. Executor must update UI-SPEC.md heat scale thresholds, slider range, and UI-PLAYGROUND.html mock data generation to align with this domain (see Task 3.3 severity slider and Task 3.1 heat tile mapping).

**Decision**: JSON data organized as separate files (`governors.json`, `incidents.json`, `metadata/states.json`, `metadata/articles.json`, `metadata/eras.json`, `metadata/precedents.json`) — matches PRD data files spec and keeps concerns separated.

## Waves

Work is organized into 4 dependency-ordered waves. Each wave can be executed independently once its prerequisites are met.

---

### Wave 1: Project Scaffold & Schema Lock (Day 1)

**Goal**: Bootable Next.js project with locked TypeScript types and JSON schema.

#### Task 1.1: Initialize Next.js Project

- **Action**: Create Next.js 14+ project with static export configuration
- **Files to create**:
  - `package.json` — Next.js 14+, React 18+, Tailwind CSS, TypeScript
  - `next.config.js` — `output: 'export'`, `images: { unoptimized: true }`
  - `tsconfig.json` — strict mode
  - `tailwind.config.ts` — custom colors for beard scale levels
  - `postcss.config.js`
  - `src/app/layout.tsx` — root layout with metadata
  - `src/app/page.tsx` — landing page shell
  - `src/app/globals.css` — Tailwind directives
  - `.gitignore` — node_modules, .next, out
- **Acceptance**: `npm run build` produces `out/` directory with valid HTML
- **Rollback**: Delete project root, re-init

#### Task 1.2: Define TypeScript Types

- **Action**: Create TypeScript interfaces matching FR-1 incident schema
- **File**: `src/types/schema.ts`
- **Types to define**:
  ```
  TransgressionType (enum): withholding_assent | delay | overreach | dissolution | failure_to_countersign | other
  VerificationStatus (enum): unverified | partial | confirmed
  EscalationLevel (1 | 2 | 3 | 4)
  BeardLevel (0 | 1 | 2 | 3 | 4)
  BeardName: 'Clean Chin' | 'Wisp' | 'Tuft' | 'Billy Beard' | 'Knee-Dragger'
  SourceTier: 'primary' | 'secondary'
  Era: 'pre_emergency' | 'emergency' | 'post_emergency' | 'coalition' | 'post_2014'

  Source { url, outlet, date_published, tier, credibility_score }
  Governor { id, name, state, tenure_start, tenure_end, appointing_authority, prior_postings, next_postings }
  Incident { id, governor_id, state, date_start, date_end, transgression_type, duration_days, constitutional_articles, sc_precedents, escalation_level, sources, verification_status, confidence_score, severity_constitutional, severity_salience, severity_unified, era, raj_bhavan_response?, legislative_pushback? }
  StateMetadata { code, name, ut }
  ArticleMetadata { number, title, description }
  EraMetadata { id, name, period, characteristics }
  PrecedentMetadata { id, case_name, year, summary }
  ```
- **Acceptance**: `tsc --noEmit` passes with zero errors
- **Rollback**: Revert `src/types/schema.ts`

#### Task 1.3: Create JSON Schema Files with Seed Structure

- **Action**: Create empty-but-valid JSON data files
- **Files to create**:
  - `data/governors.json` — empty array `[]`
  - `data/incidents.json` — empty array `[]`
  - `data/metadata/states.json` — 28 states + 8 UTs (code, name, ut flag)
  - `data/metadata/articles.json` — Articles 163, 168, 172, 200, 356 (number, title, description)
  - `data/metadata/eras.json` — 5 eras from PRD Appendix C
  - `data/metadata/precedents.json` — S.R. Bommai, Nabam Rebia, Rameshwar Prasad
- **Acceptance**: All JSON files valid (`JSON.parse` succeeds), metadata files populated
- **Rollback**: Delete `data/` directory

#### Task 1.4: Data Loading Utilities

- **Action**: Create build-time data loaders that read JSON files
- **File**: `src/lib/data.ts`
- **Functions**:
  - `getGovernors(): Governor[]`
  - `getIncidents(): Incident[]`
  - `getStates(): StateMetadata[]`
  - `getArticles(): ArticleMetadata[]`
  - `getEras(): EraMetadata[]`
  - `getPrecedents(): PrecedentMetadata[]`
  - `getIncidentsByState(stateCode: string): Incident[]`
  - `getIncidentsByGovernor(governorId: string): Incident[]`
- **Acceptance**: Unit test importing each function and reading seed data
- **Rollback**: Revert `src/lib/data.ts`

---

### Wave 2: Severity Model & Seed Data (Day 2)

**Goal**: Working severity calculator with unit tests, 30+ manually curated incidents (50+ by phase end).

**Prerequisites**: Wave 1 complete (types defined, data files exist).

#### Task 2.1: Severity Calculator Module

- **Action**: Implement dual-track severity calculation per FR-2
- **File**: `src/lib/severity.ts`
- **Functions**:
  - `calculateConstitutionalSeverity(escalation: EscalationLevel, durationDays: number): number`
    - Formula: `(escalation_level × 0.6) + (duration_impact × 0.4)`
    - `duration_impact`: 0-1 scale (0 days = 0, 365+ days = 1.0)
    - Range: [0.6, 2.8] (level 1 + 0 days = 0.6; level 4 + 365 days = 2.8)
  - `calculatePublicSalience(mediaVisibility: number, incidentDate: Date): number`
    - Formula: `(media_visibility × 0.5) + (recency_multiplier × 0.5)`
    - `recency_multiplier`: decays from 1.0 (today) to 0.0 (5+ years old)
    - Range: [0.0, 1.0]
  - `calculateUnifiedScore(constitutional: number, salience: number): number`
    - Formula: `(constitutional × 0.7) + (salience × 0.3)`
    - Range: [0.42, 2.26] (derived from constitutional [0.6, 2.8] × 0.7 + salience [0.0, 1.0] × 0.3)
    - **Note**: Maximum achievable unified score is ~2.26, so beard scale thresholds are calibrated accordingly (see `getBeardLevel` below). Level 4 (Knee-Dragger) is triggered primarily by incident count (8+) rather than unified score alone, since unified > 3.0 is unreachable through the formula.
  - `getBeardLevel(incidentCount: number, unifiedScore: number): { level: BeardLevel, name: BeardName }`
    - Per FR-2a scale table (both incident count AND unified score determine level):
      - Level 0 (Clean Chin): 0 incidents
      - Level 1 (Wisp): 1-2 incidents AND unified < 0.8
      - Level 2 (Tuft): 3-4 incidents AND unified 0.8-1.5
      - Level 3 (Billy Beard): 5-7 incidents AND unified 1.5-3.0
      - Level 4 (Knee-Dragger): 8+ incidents OR unified > 3.0
    - **Note**: UI-PLAYGROUND.html uses a simplified severity-only mapping for preview purposes. The production implementation MUST use both dimensions per FR-2a.
  - `validateEscalationCap(escalation: EscalationLevel, verificationStatus: VerificationStatus, sourceCount: number): boolean`
    - Enforces: unverified cannot exceed level 2; level 3+ requires 2+ primary sources
- **Acceptance**: All unit tests pass (see Verification Plan)
- **Rollback**: Revert `src/lib/severity.ts`

#### Task 2.2: Severity Calculator Tests

- **Action**: Comprehensive unit tests for severity module
- **File**: `src/lib/__tests__/severity.test.ts`
- **Test cases**:
  - Constitutional severity: level 1 + 0 days → 0.6, level 4 + 365 days → 2.8
  - Public salience: high visibility + today → near 1.0, low visibility + 5yr ago → near 0.0
  - Unified: (1.0 × 0.7) + (1.0 × 0.3) = 1.0
  - Beard scale: 0 incidents → Clean Chin, 3 incidents + unified 1.0 → Tuft, 8+ → Knee-Dragger
  - Escalation cap: unverified + level 3 → invalid, verified + level 3 + 2 sources → valid
  - Edge cases: negative days, 0 visibility, boundary values (0.8, 1.5, 3.0)
- **Acceptance**: `npm test` passes all severity tests
- **Rollback**: Revert test file

#### Task 2.3: Manually Curate Seed Incidents

- **Action**: Research and create 50+ real incidents from 2010–present (per PRD Success Metrics target)
- **File**: `data/incidents.json`, `data/governors.json`
- **Milestone**: Minimum 30 incidents for Wave 2 gate (enables meaningful UI testing). Remaining 20+ curated in Wave 4 polish phase before deployment.
- **Incidents to cover** (minimum):
  - Kerala: Arif Mohammad Khan (bill withholding, 2020-2024) — multiple incidents
  - Tamil Nadu: RN Ravi (assembly address refusal, 2023-2024)
  - Punjab: Banwarilal Purohit (assent delays, 2022)
  - West Bengal: Jagdeep Dhankhar/CV Ananda Bose (frequent confrontations)
  - Maharashtra: Bhagat Singh Koshyari (government formation crisis, 2019)
  - Telangana: Tamilisai Soundararajan (bill delays)
  - Rajasthan: Kalraj Mishra (assembly session dispute, 2020)
  - Delhi (NCT): Various (center-state disputes)
- **Each incident requires**: All FR-1 mandatory fields populated, severity scores calculated using Task 2.1 module
- **Governors file**: Profile for each governor referenced in incidents
- **Acceptance**: 30+ incidents in JSON by Wave 2 gate, all pass schema validation, severity scores calculated. 50+ total incidents by phase completion (AC-3).
- **Rollback**: Revert data files to empty arrays

---

### Wave 3: Timeline-Matrix UI (Day 3)

**Goal**: Working timeline-matrix with heat tiles, evidence drawer, and filters.

**Prerequisites**: Wave 2 complete (data + severity available).

#### Task 3.1: Timeline-Matrix Component

- **Action**: Build the primary visualization per FR-3
- **Files**:
  - `src/components/TimelineMatrix.tsx` — main component
  - `src/components/HeatTile.tsx` — individual cell with severity coloring
  - `src/components/EraBand.tsx` — era color bands on x-axis
- **Behavior**:
  - X-axis: years 2010–present, auto-segmented by era bands
  - Y-axis: states (alphabetically, showing only states with incidents)
  - Cells: colored by unified severity (green → yellow → orange → red gradient), using recalibrated thresholds aligned to the canonical [0.42, 2.26] domain: Low 0.42–0.8, Medium 0.8–1.2, High 1.2–1.8, Critical >1.8. UI-SPEC.md heat scale table must be updated to match these thresholds.
  - Click: opens evidence drawer (no modal)
  - Responsive: horizontal scroll on mobile, full matrix on desktop
- **Acceptance**: Renders with seed data, tiles clickable, responsive on 375px and 1440px widths
- **Rollback**: Delete component files

#### Task 3.2: Evidence Drawer Component

- **Action**: Build drill-down drawer per FR-4
- **Files**:
  - `src/components/EvidenceDrawer.tsx` — slide-out panel
  - `src/components/SeverityBadge.tsx` — severity score display with beard level
  - `src/components/SourceCard.tsx` — individual source with credibility tier
- **Sections** (in order per BRAINSTORM.md):
  1. Transgression summary + severity breakdown (constitutional vs. salience)
  2. Evidence chain (sources, credibility tiers, corroboration count)
  3. Constitutional levers (article links)
  4. Verification status badge
- **Counter-narrative handling**: Full counter-narrative section deferred to Phase 2 per RESEARCH-BRIEF.md decision. However, if `raj_bhavan_response` or `legislative_pushback` fields are present in incident data, the drawer SHALL render them as a simple collapsed "Official Response" text section below the verification badge. No editorial framing — raw text only. If fields are absent/null, the section is omitted entirely. **UI artifact alignment required**: Add this section to UI-SPEC.md as "Section 5.5: Official Response" (between Section 5 Verification Status and Section 6 Actions) and add a corresponding collapsed panel in UI-PLAYGROUND.html evidence drawer.
- **Acceptance**: Drawer opens/closes on tile click, all sections render with data
- **Rollback**: Delete component files

#### Task 3.3: Filter Panel

- **Action**: Implement filtering per FR-5
- **File**: `src/components/FilterPanel.tsx`
- **Filters** (Phase 1 scope — all FR-5 required filters):
  - State (multi-select dropdown)
  - Governor (searchable select, populated from `governors.json`)
  - Constitutional era (select, populated from `metadata/eras.json`)
  - Transgression type (checkboxes)
  - Verification status (radio: all / verified only / include unverified)
  - Severity threshold (range slider, min 0 – max 2.3, step 0.1 — aligned to canonical [0.42, 2.26] domain)
  - Date range (year picker: 2010–present)
- **Deferred to later phases**: Constitutional article filter (requires article-to-incident cross-referencing UI beyond simple select)
- **UI artifact alignment required**: UI-SPEC.md filter table and URL params must add `governor` (comma-separated governor IDs) and `era` (comma-separated era IDs) parameters. UI-PLAYGROUND.html must render Governor and Era filter controls. Severity slider max must be updated from 4.0 to 2.3 in both UI-SPEC.md and UI-PLAYGROUND.html.
- **Acceptance**: Each filter correctly reduces displayed incidents, filters compose (AND logic)
- **Rollback**: Revert filter component and related state

#### Task 3.4: Beard Scale Legend & Governor Card

- **Action**: Visual legend for beard scale + governor summary card
- **Files**:
  - `src/components/BeardScaleLegend.tsx` — shows all 5 levels with descriptions
  - `src/components/GovernorCard.tsx` — governor profile with aggregated beard level
- **Acceptance**: Legend renders all 5 levels, governor card shows correct beard level from aggregated incidents
- **Rollback**: Delete component files

#### Task 3.5: Main Page Assembly

- **Action**: Wire all components into the main page
- **File**: `src/app/page.tsx`
- **Layout**:
  - Header: project title, description
  - Filter panel (collapsible on mobile)
  - Timeline-matrix (main content area)
  - Evidence drawer (slides from right or bottom)
  - Beard scale legend (footer or sidebar)
- **Acceptance**: Full page renders with all components, interactions work end-to-end
- **Rollback**: Revert page.tsx

---

### Wave 4: Data Export, Polish & Deployment (Day 4-5)

**Goal**: Copy-to-clipboard export, accessibility, build pipeline, deployment.

**Prerequisites**: Wave 3 complete (UI working).

#### Task 4.1: Data Export (Copy)

- **Action**: Implement copy-to-clipboard per FR-6
- **File**: `src/components/ExportButton.tsx`
- **Formats**:
  - Plain text summary (incident title, state, date, severity, source URLs)
  - Markdown with citations (formatted for academic use)
- **Acceptance**: Both formats copy correctly, toast notification confirms copy
- **Rollback**: Delete export component

#### Task 4.2: Accessibility Audit

- **Action**: Ensure WCAG 2.1 AA compliance per NFR-2
- **Checks**:
  - Keyboard navigation through timeline (arrow keys to move, Enter to open drawer)
  - Screen reader labels for severity scores and beard levels
  - Color contrast ratios meet AA standards (4.5:1 text, 3:1 large text)
  - Focus indicators visible on all interactive elements
  - ARIA labels on heat tiles (`aria-label="Kerala, 2023: Severity 2.4, Tuft level"`)
- **File changes**: Updates to existing components as needed
- **Acceptance**: Lighthouse accessibility score 90+, keyboard-only navigation works
- **Rollback**: Revert individual component changes

#### Task 4.3: Performance Optimization

- **Action**: Meet NFR-1 performance targets
- **Checks**:
  - Initial page load < 3s on simulated 3G (Lighthouse)
  - Timeline interaction < 100ms (no heavy re-renders)
  - Filter application < 500ms
- **Optimizations**:
  - Memoize filtered incident lists (`useMemo`)
  - Lazy load evidence drawer content
  - Minimize bundle size (tree-shake unused Tailwind classes)
- **Acceptance**: Lighthouse performance score 90+, all NFR-1 targets met
- **Rollback**: Revert optimizations if they introduce bugs

#### Task 4.4: GitHub Actions CI/CD Pipeline

- **Action**: Set up build and deploy pipeline
- **Files**:
  - `.github/workflows/deploy.yml` — build → export → deploy to S3
  - `.github/workflows/ci.yml` — lint, type-check, test on PR
- **Pipeline steps** (deploy.yml):
  1. `npm ci`
  2. `npm run lint`
  3. `npm run type-check` (tsc --noEmit)
  4. `npm test`
  5. `npm run build` (static export)
  6. `aws s3 sync out/ s3://<bucket-name>`
  7. CloudFront invalidation
- **Acceptance**: CI runs on push, deploy succeeds to staging
- **Rollback**: Delete workflow files

#### Task 4.5: Static Deployment Configuration

- **Action**: Configure S3 bucket and CloudFront distribution
- **Files**:
  - `infrastructure/s3-bucket-policy.json` — public read, restricted write
  - `infrastructure/cloudfront-config.json` — HTTPS, caching headers, error pages
- **Note**: Actual AWS resource creation is manual/IaC; these are config templates
- **Acceptance**: Config files valid, documented in README
- **Rollback**: Delete infrastructure configs

---

## Verification Plan

### Unit Tests

| Module | Test File | Key Assertions |
|--------|-----------|---------------|
| Severity calculator | `src/lib/__tests__/severity.test.ts` | Formula correctness, cap enforcement, beard scale mapping |
| Data loaders | `src/lib/__tests__/data.test.ts` | JSON parsing, filtering, empty state handling |

### Integration Tests

| Scenario | Test Method | Expected Result |
|----------|-------------|-----------------|
| Seed data loads in UI | Manual: `npm run dev`, open localhost | Timeline renders with 50+ incidents |
| Filter reduces results | Manual: apply state filter | Only filtered state incidents visible |
| Evidence drawer opens | Manual: click heat tile | Drawer slides open with correct data |
| Export copies markdown | Manual: click export button | Clipboard contains formatted markdown |

### Build Validation

| Check | Command | Pass Criteria |
|-------|---------|--------------|
| TypeScript | `tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 errors |
| Tests | `npm test` | All pass |
| Build | `npm run build` | `out/` directory generated |
| Lighthouse | Chrome DevTools audit | Performance 90+, Accessibility 90+, Mobile 90+ |

### UI Artifact Alignment Validation

| Check | Pass Criteria |
|-------|--------------|
| Filter surface | UI-SPEC.md filter table lists all 7 PLAN.md filters (State, Governor, Era, Type, Verification, Severity, Date) |
| URL params | UI-SPEC.md URL params table includes `governor` and `era` parameters |
| Severity domain | UI-SPEC.md heat scale thresholds use [0.42, 2.26] range; slider max ≤ 2.3; no "Critical > 3.0" bucket |
| Official Response | UI-SPEC.md evidence drawer includes Official Response section; UI-PLAYGROUND.html renders it |
| Playground filters | UI-PLAYGROUND.html renders Governor and Era filter controls |
| Playground severity | UI-PLAYGROUND.html mock data generates severities within [0.42, 2.26] range |

### Schema Validation

- All incidents in `data/incidents.json` match TypeScript `Incident` type
- All governor IDs in incidents exist in `data/governors.json`
- All state codes in incidents exist in `data/metadata/states.json`
- All constitutional articles in incidents exist in `data/metadata/articles.json`

---

## Rollback Strategy

Each wave is independently revertable:

| Wave | Rollback Action |
|------|----------------|
| Wave 1 | `git revert` scaffold commit; delete project files |
| Wave 2 | Reset `data/` files to empty arrays; delete severity module |
| Wave 3 | Delete `src/components/` directory; revert page.tsx |
| Wave 4 | Delete `.github/workflows/` and `infrastructure/` |

Full rollback: `git reset --hard` to pre-phase-1 commit (preserves `.planning/`).

---

## Acceptance Criteria (Phase Complete)

- [ ] **AC-1**: TypeScript types compile with zero errors (`tsc --noEmit`)
- [ ] **AC-2**: Severity calculator passes all unit tests (formula, caps, beard scale)
- [ ] **AC-3**: 50+ real incidents in `data/incidents.json` with calculated severity scores (per PRD Success Metrics)
- [ ] **AC-4**: Timeline-matrix renders incidents as heat tiles with correct colors
- [ ] **AC-5**: Evidence drawer shows full incident detail on tile click
- [ ] **AC-6**: Filters reduce displayed incidents correctly (state, governor, era, type, verification, severity, date)
- [ ] **AC-7**: Copy-to-clipboard exports plain text and markdown formats
- [ ] **AC-8**: Static build produces `out/` directory (`npm run build` succeeds)
- [ ] **AC-9**: Lighthouse scores: Performance 90+, Accessibility 90+, Mobile Usability 90+
- [ ] **AC-10**: All JSON data files valid and cross-referenced (governor IDs, state codes)

---

## Dependencies & Risk Mitigations

| Dependency | Risk | Mitigation |
|-----------|------|-----------|
| Seed data quality | Manual curation may miss incidents | Start with well-documented cases (Kerala, Tamil Nadu); expand iteratively |
| Timeline-matrix complexity | Non-trivial interactive component | Use simple grid layout first; enhance with animations later |
| News source availability | Archive URLs may change | Store source snapshots in data; URL is reference, not dependency |
| AWS credentials for deploy | Need IAM setup | Deploy step is optional for MVP; local build validates functionality |

---

## Open Decisions (Resolved in This Plan)

| Decision | Resolution | Rationale |
|----------|-----------|-----------|
| JSON file organization | Separate files per PRD spec | Keeps concerns separated, easier to maintain |
| Counter-narrative in MVP | Deferred to Phase 2 | Per RESEARCH-BRIEF.md checkpoint 3 decision |
| Mobile responsiveness | Responsive from day 1 | Tailwind makes this low-effort; per checkpoint 3 |
| Test framework | Vitest (default) | Faster execution than Jest; fallback to Jest only if Next.js integration issues arise |

---

## Status

- **Draft owner**: NalaN (planner agent)
- **Ready for review**: yes
- **Review requested from**: JD (plan-check)
