# Product Requirements Document: Goat Beard

**Version**: 1.0
**Phase**: 0 (MVP)
**Status**: Draft
**Last Updated**: 2026-03-10

## Executive Summary

Goat Beard is a data-driven evidence platform that tracks gubernatorial transgressions in India from 2010 to present. It transforms anecdotal grievances about governors overstepping constitutional bounds into defensible, scored evidence with full source attribution. The "beard scale" metaphor maps incident accumulation to severity: clean-shaven (no incidents) through stubble to full beard (severe transgression pattern).

**Target Users**: Journalists, constitutional scholars, policy researchers
**Core Value**: Evidence-first accountability tracking with constitutional severity scoring

## Problem Statement

India's state governors are constitutionally bound to act as neutral heads of state, yet their role in political crises—withholding assents, dissolving assemblies, delaying decisions—often tilts center-state dynamics. Currently:

1. No centralized tracker exists for gubernatorial transgressions
2. Severity assessments are subjective and politically charged
3. Historical patterns are difficult to surface across states and eras
4. Source credibility and corroboration are not systematically tracked

## User Stories

### Journalist (Daily Accountability)

**As a** journalist covering state politics,
**I want to** quickly find recent high-severity gubernatorial incidents,
**So that** I can report on accountability with credible, sourced evidence.

**Acceptance Criteria**:
- Can filter incidents by recency (last 30/90/365 days)
- Can see severity score breakdown (constitutional vs. media heat)
- Can access source links directly from incident view
- Can see corroboration count for each claim

### Constitutional Scholar (Legal Analysis)

**As a** constitutional scholar,
**I want to** trace incidents to specific articles and Supreme Court precedents,
**So that** I can analyze patterns of constitutional interpretation.

**Acceptance Criteria**:
- Can filter by constitutional article (163, 168, 172, 356, etc.)
- Can see linked SC cases (S.R. Bommai, Nabam Rebia, etc.)
- Can view incidents grouped by constitutional lever
- Can export citation data for academic use

### Policy Researcher (Systemic Patterns)

**As a** policy researcher,
**I want to** compare transgression patterns across states and eras,
**So that** I can identify systemic issues in gubernatorial appointments.

**Acceptance Criteria**:
- Can view state-by-state comparison matrix
- Can filter by constitutional era (Pre-Emergency, Coalition, etc.)
- Can see governor mobility patterns (prior/next postings)
- Can identify states with longest transgression streaks

## Functional Requirements

### FR-1: Incident Schema

The system SHALL store incidents with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique incident identifier |
| governor_id | string | Yes | Reference to governor record |
| state | string | Yes | State/UT code |
| date_start | date | Yes | Incident onset date |
| date_end | date | No | Resolution date (null if ongoing) |
| transgression_type | enum | Yes | Category (withholding_assent, delay, overreach, etc.) |
| duration_days | number | No | Calculated from dates |
| constitutional_articles | array | Yes | Articles invoked/violated |
| sc_precedents | array | No | Relevant Supreme Court cases |
| escalation_level | number | Yes | 1-4 scale |
| sources | array | Yes | Source records with credibility tier |
| verification_status | enum | Yes | unverified, partial, confirmed |
| confidence_score | number | Yes | 0.0-1.0 |
| severity_constitutional | number | Yes | Calculated score |
| severity_salience | number | Yes | Calculated score |
| severity_unified | number | Yes | Calculated score |
| era | string | Yes | Constitutional era tag |
| raj_bhavan_response | string | No | Official counter-statement |
| legislative_pushback | array | No | Assembly resolutions, CM protests |

### FR-2: Severity Calculation

The system SHALL calculate severity using dual-track scoring:

```
Constitutional Severity = (escalation_level × 0.6) + (duration_impact × 0.4)
Public Salience = (media_visibility × 0.5) + (recency_multiplier × 0.5)
Unified Score = (Constitutional Severity × 0.7) + (Public Salience × 0.3)
```

**Constraints**:
- Unverified incidents (verification_status = unverified) SHALL NOT exceed escalation_level 2
- escalation_level 3+ requires 2+ independent primary sources

### FR-2a: Goat Beard Scale

The system SHALL classify governors using goat beard terminology based on incident accumulation:

| Level | Name | Criteria | Visual Treatment |
|-------|------|----------|------------------|
| 0 | Clean Chin | 0 incidents | No marker |
| 1 | Wisp | 1-2 incidents, unified < 0.8 | Faint shade |
| 2 | Tuft | 3-4 incidents, unified 0.8-1.5 | Light shade |
| 3 | Billy Beard | 5-7 incidents, unified 1.5-3.0 | Medium shade |
| 4 | Knee-Dragger | 8+ incidents OR unified > 3.0 | Dark shade |

Scale based on actual billy goat facial hair progression, not human "goatee" styles.

### FR-3: Timeline-Matrix View

The system SHALL display a timeline-matrix with:
- X-axis: Time (2010–present, auto-segmented by era)
- Y-axis: States (28 states + 8 UTs)
- Cells: Heat-map tiles colored by unified severity
- Click action: Expand evidence drawer (no modal takeover)

### FR-4: Evidence Drawer

When a user clicks an incident tile, the system SHALL display:
1. Transgression summary with severity breakdown
2. Evidence chain (sources, credibility tiers, corroboration count)
3. Constitutional levers with article links
4. Counter-narrative section (Raj Bhavan response, contradictions)

### FR-5: Filtering

The system SHALL support filtering by:
- State (single or multiple)
- Governor (by name or ID)
- Constitutional era
- Transgression type
- Verification status
- Severity threshold
- Date range

### FR-6: Data Export (Phase 0 Scope)

The system SHALL allow copying incident details as:
- Plain text summary
- Markdown with citations

(Full CSV/JSON export deferred to Phase 5)

## Non-Functional Requirements

### NFR-1: Performance

- Initial page load: < 3 seconds on 3G
- Timeline interaction: < 100ms response
- Filter application: < 500ms

### NFR-2: Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigable timeline
- Screen reader support for severity scores

### NFR-3: Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

### NFR-4: Hosting

- Static files served from AWS S3
- CloudFront CDN for global distribution
- No server-side runtime required

## Technical Specifications

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14+ (static export) |
| Styling | Tailwind CSS |
| Data | JSON files committed to repo |
| Scraper | Crawlee (TypeScript) |
| Hosting | AWS S3 + CloudFront |
| CI/CD | GitHub Actions |

### Data Files

```
data/
├── governors.json       # Governor profiles
├── incidents.json       # All incident records
└── metadata/
    ├── states.json      # State codes and names
    ├── articles.json    # Constitutional articles
    ├── eras.json        # Era definitions
    └── precedents.json  # SC case summaries
```

### Build Process

1. Read JSON data at build time
2. Generate static pages for each state and governor
3. Bundle timeline-matrix as client component
4. Export to `out/` directory
5. Deploy to S3 via GitHub Actions

## Out of Scope (Phase 0)

- Pre-2010 historical data
- Regional language sources
- Court judgment full-text integration
- RTI response tracking
- Public API
- User accounts / personalization
- Real-time data updates

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Incidents ingested | 50+ | Count in incidents.json |
| Source verification rate | 80%+ | verified / total |
| Page load time | < 3s | Lighthouse audit |
| Mobile usability | 90+ | Lighthouse score |
| Evidence drawer completeness | 100% | All incidents have sources |

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scraping blocked | Medium | High | Manual curation fallback |
| Timeline too aggressive | Medium | High | Cut polish, prioritize data |
| Severity miscalibration | Medium | Medium | Spot-check with experts |
| Data quality issues | Medium | Medium | Verification workflow |

## Milestones

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| M1: Schema Lock | Day 1 | JSON schema + TypeScript types |
| M2: Seed Data | Day 2 | 20+ manually curated incidents |
| M3: Timeline UI | Day 3 | Working timeline-matrix with mock data |
| M4: Integration | Day 4 | UI reading from real JSON |
| M5: Deploy | Day 5 | Live on S3 + CloudFront |

## Appendix

### A. Constitutional Articles Reference

- **Article 163**: Council of Ministers to aid Governor
- **Article 168**: Constitution of State Legislatures
- **Article 172**: Duration of State Legislatures
- **Article 356**: President's Rule provisions

### B. Key Supreme Court Precedents

- **S.R. Bommai v. Union of India (1994)**: Limits on Article 356
- **Nabam Rebia v. Deputy Speaker (2016)**: Governor's discretion limits
- **Rameshwar Prasad v. Union of India (2006)**: Assembly dissolution review

### C. Era Definitions

| Era | Period | Characteristics |
|-----|--------|-----------------|
| Pre-Emergency | 1947-1975 | Congress dominance, early federalism |
| Emergency | 1975-1977 | Centralized control, suspended rights |
| Post-Emergency | 1977-1989 | Restored democracy, regional parties rise |
| Coalition | 1989-2014 | Multi-party governments, hung assemblies |
| Post-2014 | 2014-present | Single-party majority, renewed center-state tension |
