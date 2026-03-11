# UI Specification: Goat Beard MVP — Modern Light Dashboard

**Version**: 3.0.0
**Phase**: 01-requirements (MVP)
**Status**: Draft
**Created**: 2026-03-11
**Stack**: Next.js 14+ (static export), React 18+, Tailwind CSS, TypeScript
**Viewport Targets**: 375px (mobile), 768px (tablet), 1440px (desktop)
**Style Reference**: Modern financial dashboard — light mode, soft cards, gradients, sidebar navigation

---

## 1. Design Principles

1. **Evidence-first** — Data density over decoration. Every pixel earns its place by surfacing incidents, severity scores, or source credibility.

2. **Dashboard-first** — Card-based layout with clear visual hierarchy. Group related data into distinct card containers. Use whitespace to separate concerns.

3. **Soft aesthetics** — Light backgrounds, rounded corners (16px), subtle shadows, and gradient accents create depth without harshness. The interface feels approachable while handling serious civic data.

4. **Progressive disclosure** — Overview dashboard first, detailed evidence on demand. Clicking cards reveals depth without modal takeovers.

5. **Clarity under scrutiny** — Target users (journalists, scholars, researchers) will interrogate data. Severity breakdowns, source tiers, and verification badges must be immediately legible.

6. **Accessible by default** — WCAG 2.1 AA from day 1. Keyboard navigation, screen reader labels, and sufficient contrast are non-negotiable.

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
| `text-hero` | 32px / 2rem | 24px / 1.5rem | 1.2 | Page title, big metrics |
| `text-h2` | 24px / 1.5rem | 20px / 1.25rem | 1.3 | Card headings |
| `text-h3` | 18px / 1.125rem | 16px / 1rem | 1.4 | Section titles |
| `text-body` | 16px / 1rem | 16px / 1rem | 1.5 | Body copy |
| `text-body-sm` | 14px / 0.875rem | 14px / 0.875rem | 1.5 | Secondary text, labels |
| `text-caption` | 12px / 0.75rem | 12px / 0.75rem | 1.4 | Metadata, timestamps |
| `text-data` | 14px / 0.875rem | 14px / 0.875rem | 1.2 | Severity scores (monospace) |

**Minimum body text**: 16px. No text below 12px anywhere in the UI.

---

## 3. Color System

### Base Palette (Light Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | `linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)` | Page background |
| `--bg-card` | `#FFFFFF` | Card backgrounds |
| `--bg-sidebar` | `#FFFFFF` | Sidebar background |
| `--bg-sidebar-hover` | `#F8FAFC` | Sidebar item hover |
| `--bg-tertiary` | `#F1F5F9` | Subtle emphasis, empty states |
| `--text-primary` | `#0F172A` | Headings, primary text |
| `--text-secondary` | `#475569` | Body text, descriptions |
| `--text-muted` | `#94A3B8` | Captions, placeholders |
| `--border-default` | `#E2E8F0` | Card borders, dividers |
| `--border-focus` | `#3B82F6` | Focus rings (2px solid) |

### Shadow System

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 2px 8px rgba(0, 0, 0, 0.06)` | Default card shadow |
| `--shadow-card-hover` | `0 4px 16px rgba(0, 0, 0, 0.1)` | Card hover state |
| `--shadow-sidebar` | `2px 0 8px rgba(0, 0, 0, 0.04)` | Sidebar right edge |
| `--shadow-dropdown` | `0 4px 12px rgba(0, 0, 0, 0.12)` | Dropdowns, popovers |

### Gradient Accents

| Token | Value | Usage |
|-------|-------|-------|
| `--gradient-primary` | `linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)` | Primary actions, feature cards |
| `--gradient-teal` | `linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)` | Success, verified badges |
| `--gradient-coral` | `linear-gradient(135deg, #F97316 0%, #EF4444 100%)` | Critical severity |
| `--gradient-amber` | `linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)` | Medium severity, pending |
| `--gradient-card-purple` | `linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)` | Feature highlight cards |
| `--gradient-card-teal` | `linear-gradient(135deg, #5EEAD4 0%, #14B8A6 100%)` | State/info cards |

### Category Colors (Icons & Badges)

| Token | Hex | Icon BG (10% opacity) | Usage |
|-------|-----|----------------------|-------|
| `--category-purple` | `#8B5CF6` | `#EDE9FE` | Assent issues |
| `--category-teal` | `#14B8A6` | `#CCFBF1` | Verified, confirmed |
| `--category-amber` | `#F59E0B` | `#FEF3C7` | Delays, pending |
| `--category-coral` | `#F97316` | `#FFEDD5` | Overreach, critical |
| `--category-blue` | `#3B82F6` | `#DBEAFE` | Information |
| `--category-rose` | `#F43F5E` | `#FFE4E6` | Dissolution |
| `--category-slate` | `#64748B` | `#F1F5F9` | Other |

### Severity Heat Scale

| Level | Score Range | Hex | Light BG | Name |
|-------|-------------|-----|----------|------|
| None | 0 | `#F1F5F9` | — | Empty |
| Low | 0.01–0.8 | `#22C55E` | `#DCFCE7` | Green |
| Medium | 0.8–1.5 | `#F59E0B` | `#FEF3C7` | Amber |
| High | 1.5–3.0 | `#F97316` | `#FFEDD5` | Orange |
| Critical | >3.0 | `#EF4444` | `#FEE2E2` | Red |

### Verification Status

| Status | Icon Color | Badge BG | Text Color |
|--------|-----------|----------|------------|
| Confirmed | `#22C55E` | `#DCFCE7` | `#14532D` |
| Partial | `#F59E0B` | `#FEF3C7` | `#78350F` |
| Unverified | `#EF4444` | `#FEE2E2` | `#7F1D1D` |

---

## 4. Layout & Grid

### Page Structure

```
+------------------------------------------------------------------+
| SIDEBAR    | HEADER BAR                                          |
| (72px      |  Logo | Goat Beard        Search | [Bell] [Legend]  |
| collapsed, +------------------------------------------------------+
| 240px      | FILTER TABS                                         |
| expanded)  |  [All] [By State] [By Type] [Timeline]              |
|            +------------------------------------------------------+
| [Home]     | DASHBOARD GRID                                      |
| [States]   | +------------------+ +------------------+            |
| [Incidents]| | Cards Carousel   | | Income/Overview  |            |
| [Governors]| | [Purple Card]    | | Donut Chart      |            |
| [Sources]  | | [Teal Card]      | | $15,300 Total    |            |
|            | +------------------+ +------------------+            |
| [Settings] | +------------------+ +-----------------------------+ |
|            | | Deals/Trends     | | Incident Overview           | |
|            | | Line Chart       | | [Progress bars per type]    | |
|            | +------------------+ +-----------------------------+ |
|            +------------------------------------------------------+
|            | TRANSACTIONS / INCIDENT LIST                         |
|            | [Sortable table with severity pills]                 |
+------------------------------------------------------------------+
```

### Grid System

| Breakpoint | Sidebar | Content Grid | Gutter | Margins |
|-----------|---------|--------------|--------|---------|
| Mobile (<768px) | Hidden (hamburger) | 4-col | 16px | 16px |
| Tablet (768–1279px) | Collapsed (72px) | 8-col | 24px | 24px |
| Desktop (1280px+) | Expanded (240px) | 12-col | 24px | 32px |

### Content Width

- **Max content width**: 1440px, centered
- **Sidebar**: 72px collapsed, 240px expanded
- **Card grid**: Auto-fit columns (min 280px)
- **Detail panel**: 420px fixed (desktop), full width (mobile)

---

## 5. Component Specifications

### 5.1 Sidebar Navigation (`Sidebar.tsx`)

**Purpose**: Primary navigation with icon-based items.

| Property | Collapsed | Expanded |
|----------|-----------|----------|
| Width | 72px | 240px |
| Background | `--bg-card` | `--bg-card` |
| Border | 1px `--border-default` right | Same |
| Shadow | `--shadow-sidebar` | Same |
| Position | `fixed`, `left: 0`, `z-index: 50` | Same |

**Structure**:
```
+----------------+
| [Logo 40x40]   |
+----------------+
| [Home]    Home |
| [Map]   States |
| [Alert] Incid. |
| [Users] Govs.  |
| [File] Sources |
+----------------+
|                |
| [Gear] Setting |
+----------------+
```

**Nav Item States**:

| State | Visual |
|-------|--------|
| Default | Icon `--text-muted`, no background |
| Hover | `--bg-sidebar-hover`, icon `--text-secondary` |
| Active | Left 3px `--category-purple` border, `--bg-tertiary` bg, icon `--category-purple` |
| Focused | 2px `--border-focus` ring |

**Collapse Toggle**: Chevron button at bottom, rotates on state change.

### 5.2 Header Bar (`Header.tsx`)

**Purpose**: Top bar with breadcrumb, search, and actions.

| Property | Value |
|----------|-------|
| Height | 64px |
| Background | `--bg-card` |
| Border | 1px `--border-default` bottom |
| Position | `sticky`, `top: 0`, `z-index: 40` |
| Margin-left | Sidebar width |

**Contents**:
- **Left**: Hamburger (mobile) + Page title (`text-h2`)
- **Center**: Search input (rounded-full, 320px max, icon left)
- **Right**: Notification bell, Grid icon, User avatar, Legend toggle

### 5.3 Filter Tabs (`FilterTabs.tsx`)

**Purpose**: View mode switching.

| Property | Value |
|----------|-------|
| Container | `--bg-card`, `--shadow-card`, rounded-xl |
| Padding | 8px 16px |
| Tab gap | 8px |

**Tab States**:

| State | Visual |
|-------|--------|
| Default | `--text-muted`, transparent bg |
| Hover | `--text-secondary`, `--bg-tertiary` |
| Active | `--text-primary`, coral/orange underline 2px OR `--gradient-primary` bg with white text |
| Focused | 2px `--border-focus` ring |

**Tabs**: Day | Week | Month | Year (or: All | By State | By Type | By Year)

### 5.4 Dashboard Card (`DashboardCard.tsx`)

**Purpose**: Base container for all dashboard content.

| Property | Value |
|----------|-------|
| Background | `--bg-card` |
| Border radius | 16px (`rounded-2xl`) |
| Shadow | `--shadow-card` |
| Padding | 24px |
| Transition | `box-shadow 200ms, transform 150ms` |

**Hover** (interactive cards):
- Shadow → `--shadow-card-hover`
- Transform → `translateY(-2px)`

**Card Header Pattern**:
```
+------------------------------------------+
| Card Title                    [See All →] |
| optional subtitle                         |
+------------------------------------------+
```

### 5.5 Feature Card with Gradient (`FeatureCard.tsx`)

**Purpose**: Highlighted metrics or feature cards (like credit cards in reference).

| Property | Value |
|----------|-------|
| Background | `--gradient-primary` or `--gradient-card-teal` |
| Border radius | 16px |
| Padding | 24px |
| Text | White |
| Shadow | `0 8px 24px rgba(139, 92, 246, 0.3)` |

**Variants**:
- **Purple gradient**: Primary metrics, main feature
- **Teal gradient**: Secondary feature, state highlights

**Structure** (card-style):
```
+-----------------------------------+
| •••• •••• •••• 3456              |
|                          [Visa]   |
| [Chip Icon]                       |
|                                   |
| Balance           Expire: 06/21   |
| $567.26                 [Visa]    |
+-----------------------------------+
```

For Goat Beard context, adapt to:
```
+-----------------------------------+
| Kerala Incidents                  |
|                        [Map Icon] |
| [State Shield]                    |
|                                   |
| Total Incidents    Avg Severity   |
| 12                 2.4            |
+-----------------------------------+
```

### 5.6 Card Carousel (`CardCarousel.tsx`)

**Purpose**: Horizontal scrollable feature cards.

| Property | Value |
|----------|-------|
| Container | Overflow-x auto, snap-x |
| Card width | 280px |
| Gap | 16px |
| Navigation | Left/right arrows, pagination dots |

**Controls**:
- Arrow buttons (40px circle, `--bg-card`, shadow)
- Pagination: `1 / 3` text or dot indicators

### 5.7 Donut Chart Card (`DonutChart.tsx`)

**Purpose**: Proportional breakdown of incidents by type or severity.

| Property | Value |
|----------|-------|
| Container | Extends `DashboardCard` |
| Chart diameter | 180px (desktop), 140px (mobile) |
| Stroke width | 24px |
| Center content | Total + label |

**Structure**:
```
+-----------------------------------+
| Income / Severity                 |
|   [Day] [Week] [Month] [Year]     |
+-----------------------------------+
|                                   |
|        ╭─────────────╮            |
|       ╱   ■ Business  ╲   Total   |
|      │    ■ Rent       │ $15,300  |
|      │    ■ Deposit    │  $6,000  |
|       ╲   ■ Audit     ╱           |
|        ╰─────────────╯            |
|                                   |
+-----------------------------------+
```

**Legend**: Right side or below, colored squares + labels + values.

**Segments**: Clockwise from top, colored by category.

### 5.8 Line/Area Chart (`TrendChart.tsx`)

**Purpose**: Incident trends over time.

| Property | Value |
|----------|-------|
| Container | Extends `DashboardCard` |
| Line color | `--category-teal` or `--category-purple` |
| Fill | Gradient fade to transparent |
| Grid | Dotted horizontal lines, `--border-default` |

**Structure**:
```
+-----------------------------------+
| Deals / Incidents    [Monthly ▾]  |
|   ○ Closed deals                  |
+-----------------------------------+
|         200 ┊                     |
|             ┊        ●───●        |
|         150 ┊       /    \  148   |
|             ┊──────●      ●       |
|         100 ┊     /               |
|             ┊    ●                |
|          50 ┊                     |
|             ┊────────────────────▶|
|            1 Jan   8 Jan   16 Jan |
+-----------------------------------+
```

**Interaction**:
- Hover: Tooltip with exact value + date
- Marker: Circle on hover point

### 5.9 Payment Issues / Category Bars (`CategoryBars.tsx`)

**Purpose**: Compact bar chart for category breakdown.

| Property | Value |
|----------|-------|
| Container | Extends `DashboardCard` |
| Bar height | 48px |
| Bar gap | 8px |
| Colors | Category colors |

**Structure**:
```
+-----------------------------------+
| Payment Issues / By Type          |
+-----------------------------------+
|                              10   |
|              5                    |
|     1                   3         |
|   [██]    [████]    [███]  [████] |
| Business  Audit   Deposit   Rent  |
+-----------------------------------+
```

### 5.10 Income Overview / Progress List (`ProgressList.tsx`)

**Purpose**: List items with progress bars.

| Property | Value |
|----------|-------|
| Container | Extends `DashboardCard` |
| Item height | 64px |
| Progress height | 4px |

**Structure**:
```
+-----------------------------------+
| Income Overview          [See All]|
+-----------------------------------+
| [💼]  Business           8,000 $  |
|       ████████████░░░░░░  50%     |
|------------------------------------
| [🏠]  Rent               2,500 $  |
|       █████░░░░░░░░░░░░░  25%     |
|------------------------------------
| [💰]  Deposit            3,000 $  |
|       ██████░░░░░░░░░░░░  30%     |
+-----------------------------------+
```

**Icons**: Colored circles (40px) with white icon inside, using category gradients.

### 5.11 Transactions / Incident List (`IncidentList.tsx`)

**Purpose**: Tabular list of incidents with trend indicators.

| Property | Value |
|----------|-------|
| Container | Extends `DashboardCard` |
| Row height | 48px |
| Columns | Name, Count, Amount/Severity, Trend |

**Structure**:
```
+-----------------------------------+
| Transactions / Recent Incidents   |
+-----------------------------------+
| Travel        760     2,540 ▲     |
| Presentation  650     2,304 ▼     |
| Business      612     2,140 ▲     |
| Finance       598     1,976 ▲     |
| Travel        513     1,903 ▼     |
| Startup       498     1,320 ▼     |
+-----------------------------------+
```

**Trend Arrows**:
- Up (▲): `--category-coral` (red) — more incidents is bad
- Down (▼): `--category-teal` (green) — fewer incidents is good

### 5.12 Histogram / Stacked Bars (`Histogram.tsx`)

**Purpose**: Horizontal stacked bars with labels.

| Property | Value |
|----------|-------|
| Container | Extends `DashboardCard` |
| Bar style | Rounded ends, gradient fills |
| Stack direction | Horizontal |

**Structure**:
```
+-----------------------------------+
| Histogram / Severity Distribution |
+-----------------------------------+
|   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ VTB |
|   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Verus   |
|   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ STALK       |
|   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ Marlin          |
|   ▓▓▓▓▓▓▓▓▓▓ Caption             |
|   ▓▓▓▓▓▓ PH8                     |
+-----------------------------------+
```

### 5.13 Severity Pill (`SeverityPill.tsx`)

**Purpose**: Compact severity indicator.

| Property | Value |
|----------|-------|
| Height | 28px |
| Padding | 6px 12px |
| Border radius | 14px (rounded-full) |
| Font | `text-data`, monospace |

**Structure**: `[2.4 High]`

**Colors**:
- Background: Light severity color (e.g., `#FEE2E2` for critical)
- Text: Dark severity color (e.g., `#7F1D1D` for critical)

### 5.14 Type Badge (`TypeBadge.tsx`)

**Purpose**: Transgression type indicator.

| Property | Value |
|----------|-------|
| Layout | Icon circle (32px) + text label |
| Icon | 16px white on gradient circle |
| Label | Category-colored text |

**Structure**: `[🟣] Assent Withheld`

### 5.15 Evidence Drawer (`EvidenceDrawer.tsx`)

**Purpose**: Detail panel for selected incident.

| Property | Desktop | Mobile |
|----------|---------|--------|
| Width/Height | 420px wide | Full width, 80vh max |
| Position | Fixed right | Fixed bottom |
| Background | `--bg-card` |
| Shadow | `--shadow-dropdown` |
| Border radius | 16px left (desktop) | 16px top (mobile) |
| Animation | Slide right, 200ms | Slide up, 200ms |

**Sections** (cards within drawer):

1. **Header Card**: State, year, governor, type badge, dates
2. **Severity Card**: Unified score pill, breakdown bar (70/30)
3. **Evidence Card**: Source list, credibility bars
4. **Constitutional Card**: Article badges, precedent links
5. **Verification Card**: Status badge, confidence bar
6. **Actions**: Export button (copy to clipboard)

### 5.16 State Summary Card (`StateSummaryCard.tsx`)

**Purpose**: State-level incident summary.

| Property | Value |
|----------|-------|
| Layout | Icon (state abbrev in circle) + stats |
| Size | Flex within grid |

**Structure**:
```
+-----------------------------------+
| [KL]  Kerala              [12] ▲2 |
|       Avg severity: 2.1           |
|       [████████░░░░] High: 4      |
+-----------------------------------+
```

### 5.17 Governor Card (`GovernorCard.tsx`)

**Purpose**: Governor profile with beard level.

| Property | Value |
|----------|-------|
| Width | 320px |
| Top accent | 4px gradient bar (beard level color) |

**Structure**:
```
+-----------------------------------+
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ <- gradient accent
| A. M. Khan                        |
| Kerala | 2019–present             |
| [🐐] Knee-Dragger    12 incidents |
| Highest: 3.2 (Assent withheld)    |
+-----------------------------------+
```

---

## 6. Interaction Model

### 6.1 Primary Flow

```
Land on dashboard
  → See overview cards (feature cards, donut chart)
  → Scan state summary cards
  → Click incident row OR state card
    → Evidence drawer slides open
    → Review severity, sources, constitutional articles
    → Copy evidence (Export button)
    → Close (X, Escape, click outside)
  → Use tabs to switch views
  → Repeat
```

### 6.2 Keyboard Navigation

| Key | Context | Action |
|-----|---------|--------|
| `Tab` | Page | Cycle through landmarks |
| `Arrow Up/Down` | Sidebar | Navigate nav items |
| `Arrow Up/Down` | List | Navigate rows |
| `Enter` | Focused item | Open drawer |
| `Escape` | Drawer open | Close drawer |

### 6.3 Touch Interactions

| Gesture | Context | Action |
|---------|---------|--------|
| Tap | Card/Row | Open drawer |
| Swipe left | Carousel | Next card |
| Swipe down | Drawer | Close drawer |
| Tap | Hamburger | Open sidebar overlay |

---

## 7. Responsive Behavior

### 7.1 Breakpoint Behavior

| Component | Mobile (<768px) | Tablet (768–1279px) | Desktop (1280px+) |
|-----------|-----------------|---------------------|-------------------|
| Sidebar | Hidden (hamburger) | Collapsed (72px) | Expanded (240px) |
| Header | Compact | Full | Full |
| Card grid | 1 column | 2 columns | 3-4 columns |
| Carousel | Full width scroll | Visible cards | All visible |
| Drawer | Bottom sheet 80vh | Right panel 380px | Right panel 420px |
| Charts | Stacked below | Side by side | Side by side |

### 7.2 Mobile Specific

- Sidebar: Overlay drawer from left
- Carousel: Full swipe navigation
- Charts: Larger touch targets
- Drawer: Drag handle at top, swipe to dismiss

---

## 8. Component States

### 8.1 Card States

| State | Visual |
|-------|--------|
| Default | `--shadow-card`, white bg |
| Hover | `--shadow-card-hover`, lift -2px |
| Focused | 2px `--border-focus` ring |
| Loading | Skeleton pulse |
| Empty | Muted illustration + text |

### 8.2 List Row States

| State | Visual |
|-------|--------|
| Default | White bg, bottom border |
| Hover | `--bg-tertiary` bg |
| Selected | Left 3px purple border |
| Focused | 2px `--border-focus` ring |

### 8.3 Drawer States

| State | Visual |
|-------|--------|
| Closed | Off-screen |
| Opening | Slide-in 200ms |
| Open | Full content, scrollable |
| Closing | Slide-out 200ms |

---

## 9. Accessibility

### 9.1 WCAG 2.1 AA Requirements

- **1.4.3 Contrast**: 4.5:1 minimum for all text
- **1.4.11 Non-text Contrast**: 3:1 for UI components
- **2.1.1 Keyboard**: Full keyboard navigation
- **2.4.7 Focus Visible**: 2px blue ring on all interactive elements
- **4.1.2 ARIA**: Roles and labels for all components

### 9.2 ARIA Patterns

```html
<!-- Sidebar -->
<nav role="navigation" aria-label="Main navigation">
  <ul role="list">
    <li><a aria-current="page">Dashboard</a></li>
  </ul>
</nav>

<!-- Incident List -->
<table role="grid" aria-label="Recent incidents">
  <tr role="row" tabindex="0">
    <td>Kerala, 2024: Assent withheld</td>
  </tr>
</table>

<!-- Drawer -->
<aside role="dialog" aria-label="Incident details" aria-modal="false">
</aside>

<!-- Donut Chart -->
<figure role="img" aria-label="Severity distribution: 45% High, 30% Medium, 25% Low">
</figure>
```

### 9.3 Reduced Motion

When `prefers-reduced-motion: reduce`:
- Disable transforms (no hover lift)
- Drawer: instant show/hide
- Charts: no animation on load
- Skeleton: static gray (no pulse)

---

## 10. Spacing & Sizing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Icon gaps |
| `--space-sm` | 8px | Related elements |
| `--space-md` | 16px | Card padding (mobile) |
| `--space-lg` | 24px | Card padding (desktop), card gaps |
| `--space-xl` | 32px | Page margins |
| `--space-2xl` | 48px | Section breaks |
| `--radius-sm` | 4px | Small badges |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Medium elements |
| `--radius-xl` | 16px | Cards |
| `--radius-full` | 9999px | Pills, avatars |

---

## 11. Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Hover states |
| `--duration-normal` | 200ms | Drawer, cards |
| `--duration-slow` | 300ms | Page transitions |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Slide, scale |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Color transitions |

All animations respect `prefers-reduced-motion`.

---

## 12. Component Dependency Graph

```
page.tsx
├── Sidebar
│   └── NavItem[]
├── Header
│   ├── SearchInput
│   └── LegendToggle
├── FilterTabs
├── Dashboard Grid
│   ├── CardCarousel
│   │   └── FeatureCard[]
│   ├── DonutChart
│   ├── TrendChart
│   ├── CategoryBars
│   ├── ProgressList
│   │   └── ProgressItem[]
│   ├── IncidentList
│   │   └── IncidentRow[]
│   │       ├── TypeBadge
│   │       └── SeverityPill
│   └── Histogram
├── EvidenceDrawer
│   ├── DashboardCard[]
│   ├── SeverityPill
│   ├── ProgressBar
│   └── ExportButton
├── StateSummaryCard[]
└── GovernorCard[]
```

---

## 13. URL State

```
/?view=states&states=KL,TN&severity=1.5&from=2020&incident=abc123
```

| Parameter | Format |
|-----------|--------|
| `view` | `all`, `states`, `types`, `timeline` |
| `states` | Comma-separated codes |
| `types` | Comma-separated types |
| `severity` | Float threshold |
| `from`/`to` | Year (YYYY) |
| `incident` | ID (opens drawer) |

---

## 14. Validation Checklist

- [ ] All components have dimensions, colors, states
- [ ] Sidebar navigation specified
- [ ] Card-based layout with gradients documented
- [ ] Shadow system defined
- [ ] Chart components (donut, line, bars) specified
- [ ] Progress bars and lists documented
- [ ] Keyboard navigation complete
- [ ] ARIA roles defined
- [ ] Contrast ratios meet WCAG AA
- [ ] Breakpoints documented
- [ ] Reduced motion supported
- [ ] Deep linking preserved
