# UI Specification v2: Goat Beard Dashboard

**Version**: 2.0.0
**Phase**: 01-requirements (MVP)
**Status**: Draft
**Style Reference**: NYT Upshot Interactive
**Created**: 2026-03-10

---

## Design Philosophy

> "A goat's beard is as worthless as a state's governor." — Aringar Anna

This dashboard tells a story, not just displays data. Every element serves the narrative: **summary → diagnosis → root cause**. Users grasp the problem in 3 seconds, explore in 30, and understand the full picture in 3 minutes.

### Core Principles

1. **Effortless understanding** — No cognitive load. The layout answers questions before they're asked.
2. **Minimal but intentional color** — Color signals anomaly, risk, or change. Never decoration.
3. **Instant interaction** — Filtering, drilling, cross-highlighting must feel instantaneous (<100ms).
4. **Every element is a filter** — Click anything to narrow focus. The dashboard responds as one organism.

---

## Typography

### Font Stack (News Editorial)

| Role | Family | Weight | Fallback |
|------|--------|--------|----------|
| Quote/Headlines | Newsreader | 500, 600, 700 | Georgia, serif |
| Body/Data | Inter | 400, 500, 600 | system-ui, sans-serif |
| Numbers/Scores | JetBrains Mono | 500 | ui-monospace, monospace |

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-quote` | 28px / 1.75rem | 1.3 | Anna quote |
| `text-h1` | 24px / 1.5rem | 1.2 | Section titles |
| `text-h2` | 18px / 1.125rem | 1.3 | Card titles |
| `text-body` | 16px / 1rem | 1.5 | Body text |
| `text-sm` | 14px / 0.875rem | 1.5 | Labels, secondary |
| `text-caption` | 12px / 0.75rem | 1.4 | Metadata |
| `text-kpi` | 36px / 2.25rem | 1.1 | Big numbers (mono) |

---

## Color System

### Dark Mode Default (Primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#0A0A0B` | Page background |
| `--bg-elevated` | `#141416` | Cards, panels |
| `--bg-hover` | `#1C1C1F` | Hover states |
| `--text-primary` | `#FAFAFA` | Headings, KPIs |
| `--text-secondary` | `#A1A1AA` | Body text |
| `--text-muted` | `#71717A` | Captions |
| `--border` | `#27272A` | Dividers |
| `--accent` | `#F59E0B` | Amber — primary accent |
| `--accent-hover` | `#D97706` | Amber hover |

### Severity Scale (Intentional Color)

| Level | Hex | Name | Meaning |
|-------|-----|------|---------|
| Low | `#22C55E` | Green 500 | Minor issue |
| Medium | `#EAB308` | Yellow 500 | Attention needed |
| High | `#F97316` | Orange 500 | Significant concern |
| Critical | `#EF4444` | Red 500 | Severe transgression |

### Beard Level Colors (Governor Cards)

| Level | Name | Hex | Visual |
|-------|------|-----|--------|
| 0 | Clean Chin | `#3F3F46` | No beard overlay |
| 1 | Wisp | `#22C55E` | Tiny chin tuft |
| 2 | Tuft | `#EAB308` | Short visible beard |
| 3 | Billy Beard | `#F97316` | Full mid-length beard |
| 4 | Knee-Dragger | `#EF4444` | Long flowing beard |

---

## Layout Structure

### Page Flow (1440px Desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│                         HERO SECTION                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │     "A goat's beard is as worthless as a state's        │   │
│  │              governor." — Aringar Anna                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ◀────────────────── TIMELINE SLIDER ──────────────────▶ │   │
│  │  2010                                              2026   │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                       KPI RIBBON (Sticky)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   127    │  │    34    │  │    18    │  │   243    │       │
│  │Incidents │  │Governors │  │ States   │  │Avg Days  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │    GOVERNOR LEADERBOARD     │  │     BILLS IN LIMBO      │  │
│  │                             │  │                         │  │
│  │  1. 🐐 A.M. Khan   Kerala   │  │  Kerala Univ. Bill      │  │
│  │     [======BEARD======]     │  │  ████████░░  847 days   │  │
│  │     12 incidents | 3.2      │  │                         │  │
│  │                             │  │  TN Education Bill      │  │
│  │  2. 🐐 R.N. Ravi   TN      │  │  ██████░░░░  423 days   │  │
│  │     [====BEARD====]         │  │                         │  │
│  │     8 incidents | 2.1       │  │  ...                    │  │
│  │                             │  │                         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐  │
│  │   TRANSGRESSION BREAKDOWN   │  │      STATE HEAT MAP     │  │
│  │                             │  │                         │  │
│  │      ┌─────────────┐        │  │     [INDIA MAP with     │  │
│  │     ╱             ╲        │  │      states colored     │  │
│  │    │  Withholding  │        │  │      by severity]       │  │
│  │    │    45%        │        │  │                         │  │
│  │     ╲   Delay 25% ╱        │  │                         │  │
│  │      └─────────────┘        │  │                         │  │
│  │                             │  │                         │  │
│  └─────────────────────────────┘  └─────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      INCIDENT TIMELINE                          │
│  ◀ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ▶    │
│    │ Mar 24 │ │ Feb 24 │ │ Jan 24 │ │ Dec 23 │ │ Nov 23 │      │
│    │ Kerala │ │ T.Nadu │ │ Punjab │ │ W.Beng │ │ Kerala │      │
│    │ Bill   │ │ Addr.  │ │ Assent │ │ Crisis │ │ Delay  │      │
│    └────────┘ └────────┘ └────────┘ └────────┘ └────────┘      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CONSTITUTIONAL ARTICLE BREAKDOWN            │   │
│  │                                                          │   │
│  │  Art. 200 ████████████████████████████████████  42      │   │
│  │  Art. 356 ██████████████████████                 28      │   │
│  │  Art. 163 ████████████                           15      │   │
│  │  Art. 168 ██████                                  8      │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section Specifications

### 1. Hero Section

**Purpose**: Anchor the narrative. Set the political tone in 3 seconds.

**Quote Display**:
- Font: Newsreader, 28px, weight 500
- Color: `--text-primary` (#FAFAFA)
- Alignment: Center
- Attribution: "— Aringar Anna" in `--text-muted`, 14px
- Subtle text-shadow for depth: `0 2px 20px rgba(245, 158, 11, 0.15)`

**Timeline Slider**:
- Full width with 48px padding
- Dual handles for date range (from/to)
- Era bands as background segments (subtle 5% opacity):
  - Coalition Era (2010-2014): `#60A5FA` (blue)
  - Post-2014 (2014-present): `#F97316` (orange)
- Current selection highlighted with `--accent` (#F59E0B)
- Real-time update: as user drags, ALL dashboard elements animate
- Interaction: `cursor: grab` on handles, `cursor: grabbing` when dragging

**Behavior**:
- On slider change, debounce 50ms, then update all charts simultaneously
- Use CSS transitions (200ms ease-out) for smooth data updates

---

### 2. KPI Ribbon (Sticky)

**Purpose**: Always-visible summary. Answers "how bad is it?" instantly.

**Layout**: 4 cards, equal width, horizontal on desktop, 2x2 grid on mobile

| KPI | Format | Click Action |
|-----|--------|--------------|
| Total Incidents | `127` | Opens incident list modal |
| Governors Tracked | `34` | Opens governor leaderboard |
| States Affected | `18` | Highlights map, scrolls to map |
| Avg Days Delayed | `243` | Opens bills in limbo |

**Visual**:
- Numbers: JetBrains Mono, 36px, `--text-primary`
- Labels: Inter, 12px, `--text-muted`, uppercase, letter-spacing 0.05em
- Background: `--bg-elevated` with subtle border
- Hover: Slight scale (1.02) + border glow (`--accent` at 20% opacity)
- Click: All KPIs are clickable (`cursor: pointer`)

**Sticky Behavior**:
- Becomes sticky after scrolling past hero
- Reduced height when sticky (48px vs 80px)
- Backdrop blur: `backdrop-filter: blur(12px)`

---

### 3. Governor Leaderboard

**Purpose**: Name and shame. Who are the worst offenders?

**Layout**: Ranked list, top 10 by default, expandable

**Governor Card**:
```
┌─────────────────────────────────────────────────────┐
│  [PHOTO]  1. Arif Mohammad Khan                     │
│  (with     Kerala | 2019–present                    │
│  beard     ═══════════════════════  Knee-Dragger   │
│  overlay)  12 incidents | Unified: 3.2              │
└─────────────────────────────────────────────────────┘
```

**Goat Beard Overlay**:
- Photo: 64x64px circular, grayscale filter
- Beard: SVG overlay positioned at chin, scaled by severity
  - Clean Chin: No overlay
  - Wisp: 8px beard height
  - Tuft: 16px beard height
  - Billy Beard: 32px beard height
  - Knee-Dragger: 48px beard height, extends beyond card bottom
- Beard color matches severity level color
- Subtle animation: beard "grows" on card entry (300ms ease-out)

**Progress Bar**:
- Visual representation of unified score (0–2.26 range)
- Color: gradient from green → amber → red based on position
- Background: `--bg-hover`

**Interaction**:
- Hover: Card lifts (translateY -2px), shadow intensifies
- Click: Opens governor detail drawer with full incident list

---

### 4. Bills in Limbo

**Purpose**: The waiting room. Bills languishing without assent.

**Layout**: Table with horizontal scroll on mobile

| Column | Width | Content |
|--------|-------|---------|
| Rank | 40px | # number |
| Bill Name | flex | Truncated with tooltip |
| State | 80px | State code badge |
| Governor | 120px | Name, clickable |
| Days Waiting | 100px | Number + progress bar |
| Status | 80px | Badge (Pending/Returned) |

**Progress Bar (Days)**:
- 0-90 days: Green
- 91-180 days: Yellow
- 181-365 days: Orange
- 365+ days: Red, pulsing animation

**Sorting**: Click column headers to sort
**Default**: Sorted by days descending (worst first)

**Interaction**:
- Row hover: Full row highlight
- Row click: Opens bill detail drawer with timeline

---

### 5. Transgression Breakdown

**Purpose**: Pattern recognition. What types of transgressions dominate?

**Chart Type**: Donut chart (not pie — modern, space for center stat)

**Center Stat**: Total incidents count, large number

**Segments** (example):
- Withholding Assent: 45% — Amber
- Delay Tactics: 25% — Orange
- Constitutional Overreach: 15% — Red
- Assembly Issues: 10% — Yellow
- Other: 5% — Gray

**Interaction**:
- Hover segment: Tooltip with count + percentage
- Click segment: **Filters entire dashboard** to that transgression type
- Active filter shown as segment "popped out" from donut
- Clear filter: Click center or "Clear" button

**Animation**:
- On scroll-into-view: Segments animate in sequentially (stagger 50ms)
- Respect `prefers-reduced-motion`

---

### 6. India State Heat Map

**Purpose**: Geographic context. Where are the problem states?

**Map Type**: SVG map of India with state boundaries

**Coloring**:
- No incidents: `--bg-hover` (#1C1C1F)
- Low severity: Green 500 at 40% opacity
- Medium severity: Yellow 500 at 60% opacity
- High severity: Orange 500 at 80% opacity
- Critical severity: Red 500 at 100%

**Interaction**:
- Hover state:
  - State brightens
  - Tooltip: State name, incident count, top governor
- Click state:
  - **Filters entire dashboard** to that state
  - State gets accent border
  - Other states dim to 30% opacity

**Animation**:
- States with recent incidents (last 30 days): Subtle pulse animation
- On data update: Smooth color transitions (300ms)

---

### 7. Incident Timeline Stream

**Purpose**: Temporal narrative. What happened and when?

**Layout**: Horizontal scrolling cards

**Card Structure**:
```
┌─────────────────────┐
│ Mar 2024            │
│ ─────────────────── │
│ Kerala              │
│ Bill Withholding    │
│                     │
│ [Governor Photo]    │
│ A.M. Khan           │
│                     │
│ ●●●○ High           │
└─────────────────────┘
```

**Card Dimensions**: 200px wide, 240px tall
**Gap**: 16px between cards
**Scroll**: Smooth horizontal scroll, grab-to-scroll on desktop

**Severity Indicator**: 4 dots, filled based on severity level
**Date Badge**: Accent background when within last 30 days

**Interaction**:
- Hover: Card scales 1.03, shadow lifts
- Click: Opens full incident evidence drawer

**Navigation**:
- Arrow buttons on sides for step navigation
- Keyboard: Left/Right arrows when focused

---

### 8. Constitutional Article Breakdown

**Purpose**: Legal pattern. Which articles are most frequently violated?

**Chart Type**: Horizontal bar chart

**Layout**:
```
Article 200 (Assent)     ████████████████████████████  42
Article 356 (Pres Rule)  ██████████████████            28
Article 163 (Council)    ████████████                  15
Article 168 (Legislature)██████                         8
```

**Bar Colors**: All bars use `--accent` (#F59E0B) for consistency
**Background**: `--bg-hover`
**Value Labels**: Right-aligned, JetBrains Mono

**Interaction**:
- Hover bar: Tooltip with article title + description
- Click bar: **Filters dashboard** to incidents citing that article
- Active filter: Bar highlighted with glow

---

## Evidence Drawer (Drill-Down)

**Trigger**: Click any incident card, timeline item, or leaderboard entry

**Type**: Slide-in drawer from right (480px width on desktop, full-screen on mobile)

**Sections** (in order):

### Header
- Incident headline
- Date badge
- State + Governor (both clickable to filter)
- Close button (X) + keyboard ESC

### Severity Breakdown
```
┌────────────────────────────────────────────┐
│  Unified Score: 2.14          Billy Beard  │
│  ═══════════════════════════○              │
│                                            │
│  Constitutional: 1.8    Salience: 0.9      │
│  ████████████████░░░    ███████████░░░░    │
└────────────────────────────────────────────┘
```

### Evidence Chain
- Source cards with credibility badges
- Corroboration count
- Last verified date

### Constitutional Levers
- Article badges (clickable to filter)
- SC precedent links (external)

### Official Response (if present)
- Collapsed by default
- "View Raj Bhavan response" toggle
- Raw text, no editorial framing

### Actions
- Copy as text
- Copy as markdown
- Share link (generates URL with incident ID)

---

## Cross-Filtering Behavior

**Every clickable element is a filter.** When a filter is active:

1. **Visual indication**: Filtered element gets accent border/glow
2. **Other charts update**: Instant (<100ms) with smooth transitions
3. **KPI ribbon updates**: Numbers reflect filtered subset
4. **Active filters badge**: Shows in sticky header, click to clear
5. **URL updates**: Filter state in query params for sharing

**Filter combinations**: AND logic (multiple filters narrow results)

**Clear filters**:
- Click active filter again to toggle off
- "Clear all" button in sticky header when filters active

---

## Animation Guidelines

| Element | Trigger | Duration | Easing |
|---------|---------|----------|--------|
| Chart data | Filter change | 200ms | ease-out |
| Card hover | Mouse enter | 150ms | ease |
| Drawer open | Click | 250ms | ease-out |
| Number count | Data load | 400ms | ease-out |
| Donut segments | Scroll into view | 300ms | ease-out (staggered) |
| Map state | Hover | 150ms | ease |

**Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`
- Disable transforms
- Use opacity-only transitions
- Skip count-up animations (show final value)

---

## Responsive Breakpoints

| Breakpoint | Layout Changes |
|------------|----------------|
| 1440px+ | Full layout as specified |
| 1024px | 2-column grid for cards |
| 768px | Single column, collapsible sections |
| 375px | Mobile-first, vertical scroll, bottom drawer |

### Mobile Specific
- KPI ribbon: 2x2 grid
- Leaderboard: Horizontal scroll cards
- Map: Full width, pinch-to-zoom
- Timeline: Vertical list instead of horizontal scroll
- Drawer: Full screen from bottom

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Filter response | < 100ms |
| Chart animation | 60fps |
| Lighthouse Performance | 90+ |

**Optimizations**:
- Virtualize long lists (>50 items)
- Lazy load map SVG
- Memoize filter calculations
- Use CSS transforms only (no layout triggers)
- Skeleton screens during data load

---

## Accessibility Checklist

- [ ] Color contrast 4.5:1 minimum (all text)
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigation for all features
- [ ] Screen reader labels for charts
- [ ] Data tables as alternatives to charts
- [ ] Reduced motion support
- [ ] Touch targets 44x44px minimum

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (SVG only)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover transitions 150-200ms
- [ ] All numbers use monospace font
- [ ] Filters update URL params
- [ ] Mobile tested at 375px
- [ ] Dark mode is default
- [ ] Newsreader font loads for quote
