# Governors of India: Incident Schema & Phased Roadmap

## The Problem We're Solving

India's state governors are constitutionally bound to act as neutral heads of state, yet their role in political crises—from withholding assents to dissolving assemblies—often tilts the scales toward center-state friction. This brainstorm captures a data-driven framework to track, visualize, and measure gubernatorial transgressions from 1947 to present, building a "beard scale" that turns anecdotal grievances into defensible evidence.

## Historical Context Layer

To ground the project in reality, we surface historical context for every incident and governor. This isn't just metadata—it shapes how users interpret severity and patterns.

- **Era Markers**: Tag incidents by constitutional period (Pre-Emergency, Emergency 1975–77, Post-Emergency, Coalition Era, etc.) so users understand what "normal" meant at the time
- **Governor Lineage & Tenure**: For each governor, show prior postings, party affiliations, appointment logic, and public perception at the time of the incident
- **Constitutional Milestones**: When did the Constitution amendment change governor powers? (E.g., 44th Amendment curtailing emergency powers; 91st Amendment on no-confidence) Link incidents to these pivots
- **Political Backdrop**: Surface the center-state dynamics of the era—coalition pressures, regional movements, election cycles—so users see transgressions in their political ecosystem, not in a vacuum
- **Incident Mortality**: For historical governors (dead or retired decades ago), flag "resolved" vs. "contested" status, and whether the successor government revisited or vindicated the action

By weaving historical context into the cockpit, a 1975 dissolution doesn't just sit as a data point—users see it as a 1975 crisis under Emergency, understand the governor's standing, and spot how similar incidents played out differently under Coalition rule. This transforms raw severity scores into a navigable evidence trail.

## Core Schema

Every incident lives in this structure:

- **Governor**: Name and tenure period
- **State**: Which state/UT
- **Time Window**: Exact dates (incident onset to resolution)
- **Transgression Type**: Withholding assent, delay tactics, constitutional overreach, failure to counter-sign, etc.
- **Duration**: Days from start to finish
- **Constitutional Lever**: Which article(s) were invoked or violated (e.g., Articles 163, 168, 172, 356)
- **Jurisprudence Link**: Specific Article + SC Precedent (e.g., S.R. Bommai, Nabam Rebia)
- **Source Link**: News archive (Phase 0 MVP; court judgments and RTI expanded in Phase 2+)
- **Verification Status**: Unverified, partial, confirmed
- **Claim ID / Evidence Bundle ID**: Unique identifiers for auditability
- **Source Classification**: Primary vs. Secondary
- **Contradiction Flag**: Tracks conflicting reports across sources
- **Last Verified At / Reviewer ID**: Attribution for score changes and audits
- **Confidence Score**: 0.0–1.0 based on source credibility and corroboration
- **Data Completeness Score**: Confidence bands for cross-era fairness (1950s vs post-2000)
- **Governor Appointing Authority**: Which PM/political party controlled the center during appointment
- **Governor Mobility**: Previous/Next postings to track "roving" patterns of political appointments
- **Legislative Pushback**: Tracking Assembly resolutions or CM protests against the incident
- **Official Response from Raj Bhavan**: Counter-statement or denial (if any) to keep the ledger balanced
- **Heat Multiplier**: Recency + visibility boost for high-intensity flare-ups
- **Historical Context Tags**: Era marker, constitutional milestones, political backdrop
- **Incident Status**: Resolved, Contested, Under Review

## Severity Model

The unified severity score anchors credibility to constitutional precedent, split into two tracks to ensure historical comparability:

**1. Constitutional Severity** = (escalation_level × 0.6) + (duration_impact × 0.4)
- **Escalation Level**: Graded by constitutional impact and court precedent (e.g., "withheld assent 2× → Level 3").
- **Cap Rule**: Unresolved factual disputes cannot exceed Escalation Level 2 until corroborated by at least two independent primary sources.

**2. Public Salience (Heat)** = (media_visibility × 0.5) + (recency_multiplier × 0.5)
- Captures the current "temperature" and public interest without distorting the constitutional record.

**Unified Score = (Constitutional Severity × 0.7) + (Public Salience × 0.3)**

## Phased Roadmap (5 Phases)

**Phase 0: MVP Launch (3-5 days)**
- Define and lock the schema (above)
- Wire up archive-only data collection pipeline (English-language sources: The Hindu, Indian Express, Deccan Chronicle)
- Scrape and curate incidents from 2010–present (high-impact recent window for 3-day MVP)
- Establish source verification rules (credibility tiers for archive-based corroboration)
- **Gate: Entity Resolution + Dedup**: De-duplicate incidents across multiple outlets
- Calibrate severity model on 2010–present data
- Build and launch the timeline-matrix UI with evidence drawers
- *Post-Launch (Phase 2+)*: Backfill historical data (1947–2009), add multilingual support, integrate court judgments

**Phase 1: Severity Calibration** (Weeks 5–7)
- Ingest scraped data; see the raw severity distributions
- Tune the beard scale bands (how many incidents = "stubble"? When does it become a "full beard"?)
- Validate escalation_level scoring against court precedents
- Spot-check a handful of governors to ensure severity math feels right

**Phase 2: Evidence Cockpit** (Weeks 8–11)
- Build the UI: timeline view (grayscale, calm), state matrix (which states + which governors), top-10 flashpoints rail
- Make state/governor rows clickable to drill into incident lists
- Surface the constitutional lever and source link for every incident

## UI & UX Design

### Design Principles

Three core principles anchor the interface:
1. **Minimize cognitive load**: Users shouldn't have to context-switch between overview and detail
2. **Surface evidence trails before judgment**: Show sources, corroboration, and contradictions upfront—let the data speak
3. **Drill down without losing the big picture**: Keep the timeline/state context visible when diving into individual incidents

### The Timeline-Matrix Foundation

The primary view is a horizontal timeline spanning 1947 to present, with state rows as the y-axis. Each cell is a heat-map tile with color reflecting constitutional severity and opacity tied to recency/salience. Users click a cell to expand an incident drawer below—no modal takeover, keeping the historical context always visible.

The timeline auto-segments by constitutional era (color bands underneath: Pre-Emergency, Emergency, Post-Emergency, Coalition, etc.) so users immediately see historical rhythms and understand what "normal" meant at different points in time. A toggle lets researchers choose between "Show only verified incidents" or "Include staged claims"—tuning confidence thresholds on the fly without reloading the page.

### Evidence-First Drill-Down

When a user clicks an incident tile, the drawer shows in this order:

1. **Transgression summary + severity breakdown**: One-line description, with constitutional vs. salience scores clearly separated so scholars can distinguish legal severity from media heat
2. **Evidence chain card**: Claim ID, primary sources listed with credibility tier, corroboration count, last-verified timestamp, and reviewer attribution
3. **Constitutional lever(s)**: Directly linked to Article numbers and relevant Supreme Court precedent (e.g., S.R. Bommai, Nabam Rebia), allowing scholars to trace the legal reasoning
4. **Counter-narrative section**: Official responses from Raj Bhavan, contradictory reports, legislative pushback—not hidden, front and center, so the ledger stays balanced

### Lateral Pattern Detection

Two sidebar rails surface cross-incident patterns:

- **Governor Mobility**: Click a governor's name to see their prior/next postings highlighted on the state map, revealing "roving" appointment patterns
- **Legislative Pushback**: Assembly resolutions, CM protests, formal objections to gubernatorial actions—tracked as first-class data because they're key signals of state-level friction

### Data Completeness Confidence Band

A dashed underline beneath incidents with low-completeness scores flags sparse historical data. This visual cue prevents 1950s claims from visually dominating just because sources are scarce, while remaining subtle enough not to clutter the timeline.

### Accessibility for Three Audiences

The same dataset surfaces through three distinct entry ramps:

- **Journalists**: "Hot Topics" feed (high salience, recent, trending) for daily accountability reporting
- **Constitutional Scholars**: "Precedent Explorer" (filter by articles, judgments, era) for deep legal analysis
- **Policy Researchers**: "State Comparisons" (which states had longest stretches of transgressions?) for systemic pattern analysis

Each entry point uses the same underlying data but presents different default sorts, filters, and highlights, letting users find what matters to them without drowning in irrelevant detail.

**Phase 3: Drill-Down & Citations** (Weeks 12–14)
- Add drawer/modal for each incident: full transgression narrative, official response, source citations, court proceedings
- Embed timeline snippets within the incident view
- Link to external sources (news archives, court judgments, RTI responses)

**Phase 4: QA & Validation** (Weeks 15–16)
- Spot-check incidents per state: do they match public records? Are sources solid?
- Reach out to governance experts and legal scholars for feedback
- Iterate on severity scoring if real-world feedback suggests tweaks

**Phase 5: Open Data & Research API** (Weeks 17+)
- Launch public API for researchers and constitutional scholars
- Exportable datasets (CSV/JSON) with full audit trails
- Integration with legal databases for automated citation updates

## Phase 0 Constraints (MVP Launch)

- **Scope**: 2010–present incidents from English-language news archives only (backfill historical data in Phase 2+)
- **Data Collection Approach**: Scraped from major news archives with verification tiers based on source credibility and timestamp-based corroboration
- **Language**: English-language archives first (regional language sources in Phase 2+)
- **Political Alignment & Appointing Authority**: Tracked where available in archive sources

## Data Collection Strategy

Phase 0 data collection runs in rounds:

1. **Round 1**: Scrape major news archives (The Hindu, Indian Express, Deccan Chronicle), 2010–present (Phase 0 MVP scope)
2. **Iterate**: Refine queries and re-scrape until coverage stabilizes
3. **Phase 2+**: Backfill historical data (1947–2009) and expand to regional language archives

For the 3-5 day MVP launch, we focus on recent incidents (2010–present) with robust English-language archive coverage, prioritizing tight deduplication and severity calibration over broad historical reach. Regional language expansion and deeper historical backfill happen post-launch.
