# UI Specification: Goat Beard MVP

**Version**: 1.0.0
**Phase**: 01-requirements (MVP)
**Status**: Final
**Created**: 2026-03-10
**Stack**: Next.js 14+ (static export), React 18+, Tailwind CSS, TypeScript
**Viewport Targets**: 375px (mobile), 768px (tablet), 1440px (desktop)

---

## 1. Design Principles

1. **Evidence-first** — Data density over decoration. Every pixel earns its place by surfacing incidents, severity scores, or source credibility.
2. **Progressive disclosure** — Timeline-matrix overview first, evidence drawer on demand. No modal takeovers.
3. **Clarity under scrutiny** — Target users (journalists, scholars, researchers) will interrogate data. Severity breakdowns, source tiers, and verification badges must be immediately legible.
4. **Accessible by default** — WCAG 2.1 AA from day 1. Keyboard navigation, screen reader labels, and sufficient contrast are non-negotiable.

---

## 2. Typography

### Font Stack

| Role | Family | Weight | Fallback |
|------|--------|--------|----------|
| Headings | Inter | 600 (semi-bold), 700 (bold) | system-ui, -apple-system, sans-serif |
| Body | Inter | 400 (regular), 500 (medium) | system-ui, -apple-system, sans-serif |
| Data/Scores | JetBrains Mono | 500 (medium) | ui-monospace, monospace |

### Type Scale

| Token | Size (desktop) | Size (mobile) | Line Height | Usage |
|-------|---------------|---------------|-------------|-------|
| `text-hero` | 32px / 2rem | 24px / 1.5rem | 1.2 | Page title |
| `text-h2` | 24px / 1.5rem | 20px / 1.25rem | 1.3 | Section headings |
| `text-h3` | 18px / 1.125rem | 16px / 1rem | 1.4 | Component titles |
| `text-body` | 16px / 1rem | 16px / 1rem | 1.5 | Body copy |
| `text-body-sm` | 14px / 0.875rem | 14px / 0.875rem | 1.5 | Secondary text, labels |
| `text-caption` | 12px / 0.75rem | 12px / 0.75rem | 1.4 | Metadata, timestamps |
| `text-data` | 14px / 0.875rem | 14px / 0.875rem | 1.2 | Severity scores (monospace) |

**Minimum body text**: 16px. No text below 12px anywhere in the UI.

---

## 3. Color System

### Base Palette

| Token | Light Mode | Usage |
|-------|-----------|-------|
| `--bg-primary` | `#FFFFFF` | Page background |
| `--bg-secondary` | `#F8FAFC` | Card backgrounds, filter panel |
| `--bg-tertiary` | `#F1F5F9` | Hover states, subtle emphasis |
| `--text-primary` | `#0F172A` | Headings, primary text |
| `--text-secondary` | `#475569` | Body text, descriptions |
| `--text-muted` | `#94A3B8` | Captions, placeholders |
| `--border-default` | `#E2E8F0` | Card borders, dividers |
| `--border-focus` | `#3B82F6` | Focus rings (2px solid) |

### Severity Heat Scale (Timeline Tiles)

Five-step gradient anchored to unified severity score. Colorblind-safe — tested against deuteranopia, protanopia, and tritanopia simulations.

| Level | Unified Score | Hex | Name | APCA Contrast (on white) |
|-------|--------------|-----|------|--------------------------|
| None | 0 | `#F1F5F9` | Slate 100 | N/A (empty cell) |
| Low | 0.01–0.8 | `#BBF7D0` | Green 200 | Lc 15 (pattern fill for text) |
| Medium | 0.8–1.5 | `#FDE68A` | Amber 200 | Lc 12 |
| High | 1.5–3.0 | `#FDBA74` | Orange 300 | Lc 20 |
| Critical | >3.0 | `#FCA5A5` | Red 300 | Lc 22 |

**Text on severity tiles**: Always `#0F172A` (dark text on light background). No white-on-color text. Achieves 4.5:1+ contrast ratio on all severity levels.

### Beard Level Colors (Governor Cards)

| Level | Name | Hex | Icon Treatment |
|-------|------|-----|----------------|
| 0 | Clean Chin | `#E2E8F0` | Empty circle |
| 1 | Wisp | `#BBF7D0` | 1/4 filled circle |
| 2 | Tuft | `#FDE68A` | 1/2 filled circle |
| 3 | Billy Beard | `#FDBA74` | 3/4 filled circle |
| 4 | Knee-Dragger | `#FCA5A5` | Full filled circle |

### Verification Status

| Status | Badge Color | Border |
|--------|------------|--------|
| Confirmed | `#22C55E` bg, `#14532D` text | `#16A34A` |
| Partial | `#F59E0B` bg, `#78350F` text | `#D97706` |
| Unverified | `#EF4444` bg, `#7F1D1D` text | `#DC2626` |

### Era Bands (Timeline X-axis)

| Era | Period | Band Color (10% opacity overlay) |
|-----|--------|----------------------------------|
| Pre-Emergency | 1947–1975 | `#A78BFA` (Violet 400) |
| Emergency | 1975–1977 | `#F87171` (Red 400) |
| Post-Emergency | 1977–1989 | `#60A5FA` (Blue 400) |
| Coalition | 1989–2014 | `#34D399` (Emerald 400) |
| Post-2014 | 2014–present | `#FBBF24` (Amber 400) |

**Note**: Goat Beard MVP scope is 2010–present, so only Coalition and Post-2014 eras render. Full era bands activate when pre-2010 data is added in later phases.

---

## 4. Layout & Grid

### Page Structure

```
+----------------------------------------------------------+
| HEADER (fixed)                                            |
| Logo + Title | Description                    | Legend    |
+----------------------------------------------------------+
| FILTER PANEL (collapsible)                                |
| [State ▾] [Type ☑] [Status ○] [Severity ━━●] [Year ▾]  |
+----------------------------------------------------------+
| TIMELINE-MATRIX (scrollable)                              |
|     | 2010 | 2011 | ... | 2024 | 2025 | 2026 |         |
| KL  | [██] | [  ] | ... | [██] | [██] | [██] |         |
| TN  | [  ] | [  ] | ... | [██] | [██] | [  ] |         |
| WB  | [  ] | [  ] | ... | [██] | [  ] | [  ] |         |
| ...                                                       |
+----------------------------------------------------------+
| EVIDENCE DRAWER (slides from right on desktop,            |
|                  from bottom on mobile)                    |
| [Incident Detail | Severity | Sources | Articles]         |
+----------------------------------------------------------+
```

### Grid System

| Breakpoint | Grid | Gutter | Margins | Behavior |
|-----------|------|--------|---------|----------|
| Mobile (<768px) | 4-col | 16px | 16px | Single column, stacked |
| Tablet (768–1279px) | 8-col | 24px | 24px | Matrix + side drawer |
| Desktop (1280px+) | 12-col | 24px | 32px | Full matrix + right drawer |

### Content Width

- **Max content width**: 1440px, centered.
- **Timeline-matrix**: Full available width (no max), horizontal scroll on overflow.
- **Evidence drawer**: 400px fixed width (desktop), full width (mobile).
- **Filter panel**: Full content width.

---

## 5. Component Specifications

### 5.1 Header

**Purpose**: Brand identity, project description, and quick access to legend.

| Property | Value |
|----------|-------|
| Height | 64px (desktop), 56px (mobile) |
| Background | `--bg-primary` |
| Border | 1px `--border-default` bottom |
| Position | `sticky`, `top: 0`, `z-index: 50` |

**Contents**:
- Left: Project title "Goat Beard" (`text-hero`) + subtitle "Tracking Gubernatorial Transgressions" (`text-body-sm`, `--text-secondary`)
- Right (desktop): Beard Scale Legend toggle button
- Right (mobile): Hamburger icon for legend + filter access

### 5.2 Filter Panel (`FilterPanel.tsx`)

**Purpose**: Narrow displayed incidents using composable AND filters.

| Property | Value |
|----------|-------|
| Background | `--bg-secondary` |
| Padding | 16px |
| Border radius | 8px |
| Position | Below header, collapsible |

**Filter Controls**:

| Filter | Control Type | Behavior | Default |
|--------|-------------|----------|---------|
| State | Multi-select dropdown | Shows only states with incidents | All selected |
| Transgression type | Checkbox group | 6 types from `TransgressionType` enum | All checked |
| Verification status | Radio group | All / Verified only / Include unverified | All |
| Severity threshold | Range slider | Min 0 – Max 4.0, step 0.1 | 0 (show all) |
| Date range | Dual year picker | 2010 – current year | Full range |

**Filter interactions**:
- Filters compose with AND logic (all must match).
- Active filter count badge on mobile collapse button.
- "Clear all" link resets to defaults.
- Filter changes apply immediately (no "Apply" button). Debounce 200ms on slider.
- URL query params encode active filters for shareable links.

**States**:
- **Collapsed (mobile default)**: Single row showing active filter count badge.
- **Expanded**: Full filter controls visible.
- **No results**: Yellow banner below filters: "No incidents match your filters. Try broadening your criteria."

### 5.3 Timeline-Matrix (`TimelineMatrix.tsx`)

**Purpose**: Primary visualization. Heat-map grid of incidents by state (Y) and year (X).

| Property | Value |
|----------|-------|
| Background | `--bg-primary` |
| Cell size | 48px x 40px (desktop), 36px x 32px (mobile) |
| Gap | 2px |
| Overflow | Horizontal scroll with scroll indicator on mobile |

**Structure**:
- **X-axis (top)**: Year labels (2010–present), with era band color underlays.
- **Y-axis (left, sticky)**: State names (alphabetical, only states with incidents shown). Sticky left column on horizontal scroll.
- **Cells**: `HeatTile` components colored by unified severity.

**State label column**:
- Width: 120px (desktop), 80px (mobile, abbreviated codes: KL, TN, WB).
- Font: `text-body-sm`, `--text-primary`.
- Sticky: `position: sticky; left: 0; z-index: 10`.
- Background: `--bg-primary` (prevents see-through on scroll).

**Year header row**:
- Height: 32px.
- Font: `text-caption`, `--text-muted`.
- Sticky: `position: sticky; top: 64px; z-index: 10` (below header).

**Empty cells**: `--bg-tertiary` fill (slate-100), no border. Communicates "no recorded incident" vs. missing data.

### 5.4 Heat Tile (`HeatTile.tsx`)

**Purpose**: Individual cell in the timeline-matrix. Represents one or more incidents for a state in a given year.

| Property | Value |
|----------|-------|
| Size | Matches cell grid (48x40 desktop, 36x32 mobile) |
| Border radius | 4px |
| Cursor | `pointer` when incidents exist |
| Transition | `background-color 150ms ease, transform 100ms ease` |

**Visual mapping**:
- Background color: Derived from highest unified severity score in that cell.
- If multiple incidents: Small dot indicator (bottom-right, 6px circle, `--text-primary`).
- Incident count overlay: Number centered in cell (`text-data`, visible only on hover or if count > 1).

**States**:

| State | Visual | Trigger |
|-------|--------|---------|
| Empty | `--bg-tertiary` background | No incidents for state+year |
| Default | Severity color fill | Incidents exist |
| Hover | +4% brightness, `transform: scale(1.05)` | Mouse enter |
| Focus | 2px `--border-focus` outline, offset 2px | Keyboard focus |
| Active/Selected | 2px solid `--text-primary` border | Tile is open in drawer |
| Disabled | 50% opacity | Filtered out (if showing context) |

**Interaction**:
- Click/Enter: Opens evidence drawer for this state+year. If multiple incidents, drawer shows all.
- Keyboard: Arrow keys navigate grid (left/right = years, up/down = states). Enter opens drawer. Escape closes drawer.

### 5.5 Era Band (`EraBand.tsx`)

**Purpose**: Visual overlay on the timeline X-axis showing constitutional eras.

| Property | Value |
|----------|-------|
| Height | Full matrix height |
| Opacity | 10% |
| Position | Absolute, behind tiles |
| Border | 1px dashed era color (left edge) |

**Label**: Era name in `text-caption` at top of band, rotated -90deg if narrow.

### 5.6 Evidence Drawer (`EvidenceDrawer.tsx`)

**Purpose**: Drill-down detail panel for selected incidents. Slides in from the right (desktop) or bottom (mobile).

| Property | Desktop | Mobile |
|----------|---------|--------|
| Width/Height | 400px wide, full height | Full width, 70vh max height |
| Position | Fixed right, below header | Fixed bottom |
| Background | `--bg-primary` | `--bg-primary` |
| Shadow | `-4px 0 24px rgba(0,0,0,0.08)` | `0 -4px 24px rgba(0,0,0,0.08)` |
| Z-index | 40 | 40 |
| Animation | Slide from right, 200ms ease-out | Slide from bottom, 200ms ease-out |
| Close | X button (top-right) + Escape key | Drag handle (top center) + X button + Escape |

**Content Sections** (top to bottom):

#### Section 1: Incident Header
- State name + year (`text-h3`)
- Governor name (`text-body`, `--text-secondary`)
- Transgression type badge (pill, colored by type)
- Date range: `date_start` – `date_end` or "Ongoing" (`text-caption`)
- Duration: "{N} days" or "Ongoing" (`text-caption`, `--text-muted`)

#### Section 2: Severity Breakdown
- **Unified score**: Large number display (`text-h2`, monospace, colored by severity level)
- **Beard level badge**: Level name + icon (e.g., "Tuft" with half-filled circle)
- **Breakdown bar**: Horizontal stacked bar showing constitutional (70%) vs. salience (30%) contribution
- **Detail row**: `Constitutional: X.XX` | `Salience: X.XX` (`text-data`)

#### Section 3: Evidence Chain
- **Source count**: "N sources" with tier breakdown
- **Source cards** (list, each card):
  - Outlet name + tier badge ("Primary" green / "Secondary" amber)
  - Article title (linked, `text-body-sm`)
  - Published date (`text-caption`)
  - Credibility score bar (0-1 scale, thin horizontal bar)
- **Corroboration indicator**: "Corroborated by N independent sources"

#### Section 4: Constitutional Levers
- List of referenced articles (Article 163, 356, etc.)
- Each shows: article number, short title, relevance note
- SC precedent links: Case name + year (if applicable)

#### Section 5: Verification Status
- Badge: Confirmed / Partial / Unverified (colored per verification status palette)
- Confidence score: Horizontal bar (0-1) with numeric label
- If unverified: Italic note "Capped at Escalation Level 2 per verification policy"

#### Section 6: Actions
- **Export button**: Copy to clipboard (plain text or markdown)
- Toast notification on copy: "Copied to clipboard" (3s auto-dismiss)

**States**:

| State | Visual | Trigger |
|-------|--------|---------|
| Closed | Hidden (width 0 or off-screen) | Default, Escape pressed |
| Opening | Slide-in animation (200ms) | Tile click |
| Open | Full content visible, scrollable | Active selection |
| Loading | Skeleton loader (pulse animation) | Data fetch (unlikely in static, but guard) |
| Multiple incidents | Tabbed or accordion within drawer | State+year with 2+ incidents |
| Empty (edge case) | "No detail available" message | Data integrity error |

### 5.7 Severity Badge (`SeverityBadge.tsx`)

**Purpose**: Compact severity display used in drawer and governor cards.

| Property | Value |
|----------|-------|
| Layout | Inline-flex, vertical center |
| Score display | Monospace number, colored background pill |
| Beard level | Text label + icon beside score |
| Size | Compact (24px height) for inline use |

### 5.8 Source Card (`SourceCard.tsx`)

**Purpose**: Individual source display within evidence chain.

| Property | Value |
|----------|-------|
| Layout | Card with left tier-color border (4px) |
| Padding | 12px |
| Background | `--bg-secondary` |
| Border radius | 6px |
| Margin bottom | 8px |

**Contents**: Outlet name (bold), tier badge, title (link), date, credibility bar.

### 5.9 Beard Scale Legend (`BeardScaleLegend.tsx`)

**Purpose**: Visual reference for the 5-level beard scale.

| Property | Value |
|----------|-------|
| Layout | Horizontal (desktop), vertical (mobile) |
| Position | Footer area or toggled panel from header |
| Background | `--bg-secondary` |
| Padding | 16px |
| Border radius | 8px |

**Contents**: 5 rows/columns showing:
- Level number (0-4)
- Icon (circle fill progression)
- Name (Clean Chin through Knee-Dragger)
- Criteria text (incident count + unified score range)
- Severity color swatch

### 5.10 Governor Card (`GovernorCard.tsx`)

**Purpose**: Governor profile summary with aggregated beard level.

| Property | Value |
|----------|-------|
| Layout | Card, 280px wide (desktop), full width (mobile) |
| Background | `--bg-primary` |
| Border | 1px `--border-default` |
| Border radius | 8px |
| Padding | 16px |

**Contents**:
- Governor name (`text-h3`)
- State + tenure period (`text-body-sm`, `--text-secondary`)
- Beard level badge (icon + label, colored)
- Incident count (`text-data`)
- Highest severity incident summary (one-liner)
- Appointing authority (`text-caption`, `--text-muted`)

### 5.11 Export Button (`ExportButton.tsx`)

**Purpose**: Copy incident details to clipboard.

| Property | Value |
|----------|-------|
| Type | Dropdown button (two formats) |
| Variants | "Copy as Text", "Copy as Markdown" |
| Icon | Clipboard icon (left) |
| Size | 36px height, auto width |

**Formats**:
- **Plain text**: `[State] [Date] — [Transgression Type]\nSeverity: [Score] ([Level Name])\nSources: [URL1], [URL2]`
- **Markdown**: `## [State]: [Transgression Type]\n**Date**: [range]\n**Severity**: [Score] ([Level])\n**Sources**:\n- [Outlet]: [Title](URL)`

**Feedback**: Toast notification (bottom-center, 3s auto-dismiss) confirming copy.

---

## 6. Interaction Model

### 6.1 Primary Flow

```
Land on page
  → See timeline-matrix (all incidents, default filters)
  → Scan heat tiles for severity hotspots
  → Click tile (or press Enter on focused tile)
    → Evidence drawer slides open
    → Read severity breakdown, sources, constitutional levers
    → Optionally copy evidence (Export button)
    → Close drawer (X, Escape, or click different tile)
  → Apply filters to narrow view
  → Repeat
```

### 6.2 Keyboard Navigation

| Key | Context | Action |
|-----|---------|--------|
| `Tab` | Page | Move between major landmarks (header, filters, matrix, drawer) |
| `Arrow Left/Right` | Matrix focused | Move between years |
| `Arrow Up/Down` | Matrix focused | Move between states |
| `Enter` | Tile focused | Open evidence drawer |
| `Escape` | Drawer open | Close drawer, return focus to triggering tile |
| `Tab` | Inside drawer | Move between interactive elements (source links, export button) |
| `Space` | Filter checkbox | Toggle filter option |
| `Home/End` | Matrix row | Jump to first/last year |

### 6.3 Touch Interactions (Mobile)

| Gesture | Context | Action |
|---------|---------|--------|
| Tap | Heat tile | Open evidence drawer (bottom sheet) |
| Swipe left/right | Matrix | Horizontal scroll through years |
| Swipe down | Drawer (from drag handle) | Close drawer |
| Tap | Filter collapse button | Toggle filter panel |
| Pinch | Matrix | No zoom (prevent accidental zoom, use scroll) |

---

## 7. Responsive Behavior

### 7.1 Breakpoint Behavior

| Component | Mobile (<768px) | Tablet (768–1279px) | Desktop (1280px+) |
|-----------|-----------------|---------------------|-------------------|
| Header | Compact, hamburger menu | Full with legend toggle | Full with inline legend |
| Filter panel | Collapsed by default, expandable | Expanded, single row | Expanded, single row |
| Timeline-matrix | Horizontal scroll, abbreviated state codes | Full matrix, scroll if needed | Full matrix |
| Heat tiles | 36x32px | 40x36px | 48x40px |
| State labels | 2-letter codes (KL, TN) | Full names | Full names |
| Evidence drawer | Bottom sheet (70vh) | Right panel (360px) | Right panel (400px) |
| Beard legend | Vertical list in menu | Horizontal footer | Horizontal footer or sidebar |
| Governor card | Full width, stacked | 280px, grid | 280px, grid |

### 7.2 Matrix Scroll Behavior

- **Mobile**: Horizontal scroll with inertia. Fade indicator on right edge when more content exists. State column remains sticky.
- **Tablet/Desktop**: Horizontal scroll only if matrix exceeds viewport. State column sticky. Year header sticky.

### 7.3 Evidence Drawer Responsive

- **Desktop (1280px+)**: Right panel, 400px. Matrix width reduced by 400px when open. No overlay.
- **Tablet (768–1279px)**: Right panel, 360px. Overlays matrix with semi-transparent backdrop.
- **Mobile (<768px)**: Bottom sheet, max 70vh. Drag handle at top (12px wide, 4px tall, rounded, `--border-default`). Swipe down to dismiss.

---

## 8. Component States Matrix

### 8.1 Page-Level States

| State | Condition | Visual |
|-------|-----------|--------|
| **Loading** | Initial page load | Skeleton screen: grey pulse bars for header, filter row, and 8x5 grid of pulse tiles |
| **Loaded (default)** | Data available | Full matrix with severity colors |
| **Empty (no data)** | `incidents.json` is empty | Centered illustration + "No incidents recorded yet" + description text |
| **Filtered empty** | Filters exclude all results | Yellow banner: "No incidents match your filters" + "Clear filters" button |
| **Error** | JSON parse failure (edge case in static) | Red banner: "Unable to load incident data. Please refresh." |

### 8.2 Heat Tile States

| State | Visual | Trigger |
|-------|--------|---------|
| Empty | `#F1F5F9`, no interaction | No incidents |
| Low severity | `#BBF7D0` fill | Unified 0.01–0.8 |
| Medium severity | `#FDE68A` fill | Unified 0.8–1.5 |
| High severity | `#FDBA74` fill | Unified 1.5–3.0 |
| Critical severity | `#FCA5A5` fill | Unified >3.0 |
| Hover | +brightness, slight scale | Mouse enter |
| Focus | Blue outline ring | Keyboard focus |
| Selected | Solid dark border | Tile open in drawer |
| Multi-incident | Bottom-right dot + count | 2+ incidents in cell |

### 8.3 Evidence Drawer States

| State | Visual |
|-------|--------|
| Closed | Off-screen (no DOM impact on layout) |
| Opening | 200ms slide-in animation |
| Open (single incident) | Full content scrollable |
| Open (multiple incidents) | Tabs or accordion for each incident |
| Closing | 200ms slide-out animation |

### 8.4 Filter States

| Control | Default | Active | Disabled |
|---------|---------|--------|----------|
| State dropdown | "All states" | Selected state names (comma-separated, max 3 + "+N more") | N/A |
| Type checkboxes | All checked | Unchecked items have strikethrough label | N/A |
| Status radio | "All" selected | Selected option highlighted | N/A |
| Severity slider | Min position (0) | Thumb at selected value, filled track | N/A |
| Date range | Full range | Selected range highlighted | N/A |
| Clear all | Hidden | Visible when any filter is non-default | N/A |

---

## 9. Accessibility Specification

### 9.1 WCAG 2.1 AA Requirements

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| **1.1.1 Non-text Content** | All informational images have alt text | Severity tiles: `aria-label="[State], [Year]: Severity [score], [Beard level]"` |
| **1.3.1 Info & Relationships** | Structure conveyed semantically | Matrix uses `role="grid"`, rows use `role="row"`, cells use `role="gridcell"` |
| **1.4.1 Use of Color** | Color not sole indicator | Severity tiles include score text overlay on hover; legend provides text labels |
| **1.4.3 Contrast** | 4.5:1 minimum for text | Dark text on all severity colors (tested). Monospace scores on muted backgrounds. |
| **1.4.11 Non-text Contrast** | 3:1 for UI components | Focus ring: `#3B82F6` on white (4.7:1). Severity tile borders meet 3:1. |
| **2.1.1 Keyboard** | All functionality via keyboard | Arrow key grid navigation, Enter to open, Escape to close, Tab between landmarks |
| **2.4.3 Focus Order** | Logical focus order | Header → Filters → Matrix (grid navigation) → Drawer (when open) |
| **2.4.7 Focus Visible** | Visible focus indicator | 2px blue outline with 2px offset on all interactive elements |
| **4.1.2 Name, Role, Value** | ARIA roles and labels | Grid roles on matrix; drawer is `role="dialog"` with `aria-label` |

### 9.2 ARIA Annotations

```html
<!-- Timeline Matrix -->
<div role="grid" aria-label="Incident timeline matrix by state and year">
  <div role="row" aria-label="Year headers">
    <div role="columnheader">2010</div>
    ...
  </div>
  <div role="row" aria-label="Kerala incidents">
    <div role="rowheader">Kerala</div>
    <div role="gridcell"
         aria-label="Kerala, 2023: 3 incidents, Severity 2.4, Tuft level"
         tabindex="0">
    </div>
  </div>
</div>

<!-- Evidence Drawer -->
<aside role="dialog"
       aria-label="Incident details for Kerala, 2023"
       aria-modal="false">
  <!-- Non-modal: user can still interact with matrix behind it on desktop -->
</aside>

<!-- Severity Badge -->
<span role="img" aria-label="Severity score 2.4 out of 4, Tuft beard level">
  2.4
</span>

<!-- Verification Badge -->
<span role="status" aria-label="Verification status: Confirmed">
  Confirmed
</span>
```

### 9.3 Screen Reader Announcements

| Event | Announcement |
|-------|-------------|
| Tile focused | "[State], [Year]: [count] incident(s), Severity [score], [Beard level]" |
| Drawer opened | "Evidence drawer opened for [State], [Year]" |
| Drawer closed | "Evidence drawer closed" |
| Filter applied | "[N] incidents shown" (live region update) |
| Export copied | "Incident details copied to clipboard" |
| No results | "No incidents match current filters" |

### 9.4 Reduced Motion

When `prefers-reduced-motion: reduce`:
- Drawer open/close: instant (no slide animation)
- Tile hover: no scale transform
- Skeleton loading: no pulse animation (static grey)
- Scroll: no smooth-scroll behavior

---

## 10. Edge States & Error Handling

### 10.1 Data Edge Cases

| Scenario | Behavior |
|----------|----------|
| 0 incidents in data | Empty state illustration: "No incidents recorded yet. Data collection is in progress." |
| 1 incident only | Matrix renders with single filled tile. Legend and filters still visible. |
| State with 50+ incidents in one year | Tile shows count number. Drawer uses paginated list or virtual scroll. |
| Ongoing incident (no `date_end`) | Duration shows "Ongoing" in orange text. Sort treats as highest duration. |
| Missing governor reference | Drawer shows "Governor data unavailable" in `--text-muted`. Does not crash. |
| Negative or zero severity | Clamp to 0. Tile renders as "Low" severity color. |
| Severity > 4.0 | Clamp display to 4.0 for color mapping. Show actual number in drawer. |
| Unverified + escalation > 2 | Render as-is but show warning: "Exceeds verification policy cap" in orange. |

### 10.2 Interaction Edge Cases

| Scenario | Behavior |
|----------|----------|
| Click tile while drawer is open for different tile | Drawer content replaces (no close+reopen animation). Focus moves to new content. |
| Rapid filter changes | Debounce 200ms. Show last-applied filter state. |
| Horizontal scroll on mobile + sticky column | State column stays fixed. Tiles scroll beneath header and state column. |
| Clipboard API unavailable | Fallback: Select text in a temporary textarea. Show "Select All + Copy manually" message. |
| Very long governor name | Truncate with ellipsis at container width. Full name in `title` attribute and ARIA label. |
| Very long transgression description | Clamp to 3 lines in tile tooltip. Full text in drawer. |
| Browser doesn't support smooth scroll | No-op. Fallback to instant scroll (progressive enhancement). |

### 10.3 Performance Edge Cases

| Scenario | Mitigation |
|----------|-----------|
| 500+ incidents | Memoize filtered lists with `useMemo`. Tile rendering is lightweight (no heavy children). |
| All 36 states visible | Matrix renders all rows. No virtualization needed at this scale. |
| Evidence drawer with 10+ sources | Scrollable section within drawer. Sources lazy-render if > 5 (show first 5 + "Show N more"). |

---

## 11. Transgression Type Visual Encoding

| Type | Badge Color | Short Label |
|------|------------|-------------|
| `withholding_assent` | `#7C3AED` (Violet 600) bg, white text | Assent Withheld |
| `delay` | `#D97706` (Amber 600) bg, white text | Delayed |
| `overreach` | `#DC2626` (Red 600) bg, white text | Overreach |
| `dissolution` | `#B91C1C` (Red 700) bg, white text | Dissolution |
| `failure_to_countersign` | `#9333EA` (Purple 600) bg, white text | No Countersign |
| `other` | `#64748B` (Slate 500) bg, white text | Other |

---

## 12. Spacing & Sizing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Inline gaps, icon padding |
| `--space-sm` | 8px | Between related elements |
| `--space-md` | 16px | Section padding, card padding (mobile) |
| `--space-lg` | 24px | Section gaps, card padding (desktop) |
| `--space-xl` | 32px | Page margins (desktop) |
| `--space-2xl` | 48px | Between major page sections |
| `--radius-sm` | 4px | Tiles, small badges |
| `--radius-md` | 6px | Cards, source cards |
| `--radius-lg` | 8px | Panels, filter bar, legend |
| `--radius-full` | 9999px | Pills, badges, circular icons |

---

## 13. Animation & Transition Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Hover states, button press |
| `--duration-normal` | 200ms | Drawer open/close, filter expand |
| `--duration-slow` | 300ms | Page transitions (future) |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Drawer slide, scale up |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Color transitions |

All animations respect `prefers-reduced-motion: reduce` (see Section 9.4).

---

## 14. Component Dependency Graph

```
page.tsx (Main Page Assembly)
├── Header
│   └── BeardScaleLegend (toggle)
├── FilterPanel
│   ├── StateMultiSelect
│   ├── TypeCheckboxGroup
│   ├── StatusRadioGroup
│   ├── SeveritySlider
│   └── DateRangePicker
├── TimelineMatrix
│   ├── EraBand (background layers)
│   └── HeatTile (grid cells)
│       └── [click] → opens EvidenceDrawer
├── EvidenceDrawer
│   ├── SeverityBadge
│   ├── SourceCard (list)
│   ├── ConstitutionalLeverList
│   ├── VerificationBadge
│   └── ExportButton
└── GovernorCard (future: governor detail page)
```

---

## 15. Data → UI Mapping

| Data Field | UI Location | Display Format |
|------------|-------------|----------------|
| `incident.severity_unified` | HeatTile background color | Color mapped to 5-step scale |
| `incident.severity_unified` | SeverityBadge number | `X.XX` monospace |
| `incident.severity_constitutional` | Drawer breakdown bar | `X.XX` + proportional bar (70%) |
| `incident.severity_salience` | Drawer breakdown bar | `X.XX` + proportional bar (30%) |
| `incident.transgression_type` | Drawer header badge | Colored pill with short label |
| `incident.verification_status` | Drawer verification section | Colored badge (green/amber/red) |
| `incident.confidence_score` | Drawer verification section | Horizontal bar (0-1) |
| `incident.escalation_level` | Drawer severity section | Numeric level in context |
| `incident.sources[]` | Drawer evidence chain | List of SourceCard components |
| `incident.constitutional_articles[]` | Drawer lever section | Article number + title |
| `incident.sc_precedents[]` | Drawer lever section | Case name + year |
| `incident.date_start` / `date_end` | Drawer header, tile year mapping | Date range or "Ongoing" |
| `incident.duration_days` | Drawer header | "{N} days" or "Ongoing" |
| `governor.name` | Drawer header, GovernorCard | Text |
| `governor.state` + tenure | GovernorCard | "State (YYYY–YYYY)" |
| Beard level (calculated) | SeverityBadge, GovernorCard, Legend | Icon + name + color |

---

## 16. URL State & Deep Linking

Filters are encoded in URL query parameters for shareability:

```
/?states=KL,TN&types=withholding_assent,delay&status=confirmed&severity=1.5&from=2020&to=2024
```

| Parameter | Format | Default |
|-----------|--------|---------|
| `states` | Comma-separated state codes | (all) |
| `types` | Comma-separated transgression types | (all) |
| `status` | `all`, `confirmed`, `include_unverified` | `all` |
| `severity` | Float, minimum threshold | `0` |
| `from` | Year (YYYY) | `2010` |
| `to` | Year (YYYY) | Current year |
| `incident` | Incident ID (opens drawer) | (none) |

---

## 17. Validation Checklist

- [ ] All 11 components specified with dimensions, colors, and states
- [ ] Keyboard navigation path covers all interactive elements
- [ ] ARIA roles defined for matrix, drawer, and badges
- [ ] Color contrast ratios meet WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- [ ] Mobile layout (375px) accounts for all components
- [ ] Edge states documented for empty data, filtering, and errors
- [ ] Severity color scale is colorblind-safe
- [ ] Reduced motion preferences respected
- [ ] Typography scale defined with mobile/desktop variants
- [ ] Spacing tokens defined and consistent
- [ ] Deep linking via URL parameters specified
- [ ] Export formats (plain text + markdown) specified
