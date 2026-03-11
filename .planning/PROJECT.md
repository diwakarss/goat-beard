# Goat Beard

**Evidence-first accountability tracking for gubernatorial transgressions in India**

## Overview

Goat Beard is a data-driven platform that tracks gubernatorial transgressions in India from 2010 to present. It transforms anecdotal grievances about governors overstepping constitutional bounds into defensible, scored evidence with full source attribution.

The "beard scale" metaphor maps incident accumulation to severity:
- **Clean Chin** (0): No recorded incidents
- **Wisp** (1): 1-2 minor incidents
- **Tuft** (2): 3-4 incidents, moderate severity
- **Billy Beard** (3): 5-7 incidents, high severity
- **Knee-Dragger** (4): 8+ incidents or extreme severity

## Target Users

| Persona | Use Case |
|---------|----------|
| **Journalists** | Daily accountability reporting with credible, sourced evidence |
| **Constitutional Scholars** | Legal analysis linking incidents to articles and SC precedents |
| **Policy Researchers** | Systemic pattern analysis across states and eras |

## Core Features (MVP)

1. **Timeline-Matrix Visualization** — Heat-map grid of incidents by state (Y) and year (X)
2. **Evidence Drawer** — Drill-down detail with severity breakdown, sources, and constitutional levers
3. **Dual-Track Severity Model** — 70% constitutional weight + 30% public salience
4. **Source Attribution** — Credibility tiers (primary/secondary), verification status, corroboration tracking
5. **Composable Filters** — State, governor, era, transgression type, verification status, severity, date range
6. **Export** — Copy-to-clipboard in plain text and markdown formats

## Tech Stack

- **Frontend**: Next.js 14+ (static export), React 18+, TypeScript, Tailwind CSS
- **Data**: JSON files (governors.json, incidents.json, metadata/)
- **Deployment**: S3 + CloudFront (static hosting)
- **Build**: GitHub Actions CI/CD

## Data Scope

- **Temporal**: 2010–present (Coalition and Post-2014 eras)
- **Geographic**: 28 states + 8 UTs
- **Incidents**: 50+ manually curated incidents for MVP
- **Sources**: The Hindu, Indian Express, Deccan Chronicle archives

## Key Decisions

| Decision | Resolution | Rationale |
|----------|------------|-----------|
| Data organization | Separate JSON files per entity | Keeps concerns separated, easier to maintain |
| Counter-narrative | Deferred to Phase 2 | Focus on evidence presentation first |
| Mobile responsiveness | Responsive from day 1 | Tailwind makes this low-effort |
| Scraper/automation | Deferred to Phase 2 | Manual curation ensures schema correctness |

## Success Metrics

- 50+ verified incidents in seed dataset
- Lighthouse scores: Performance 90+, Accessibility 90+, Mobile 90+
- All severity calculations match formula specs
- Full keyboard navigation and screen reader support

## Links

- [PRD](./phases/01-requirements/research/PRD.md)
- [Architecture](./phases/01-requirements/research/ARCHITECTURE.md)
- [Phase 1 Plan](./phases/01-requirements/planning/versions/v001/PLAN.md)
- [UI Spec](./phases/01-requirements/planning/versions/v001/ui/UI-SPEC.md)
