# Architecture

**Analysis Date:** 2026-03-12

## Pattern Overview

**Overall:** Static Site with Client-Side Rendering

**Key Characteristics:**
- Next.js App Router with static export
- Single-page dashboard (`src/app/page.tsx`)
- JSON files as data source
- Client-side state management via React hooks
- No server-side API routes

## Layers

**Presentation Layer:**
- Purpose: UI components and user interactions
- Location: `src/components/`
- Contains: React components (25 total)
- Depends on: Data layer, types
- Used by: Page (`src/app/page.tsx`)

**Data Layer:**
- Purpose: Data loading and aggregation
- Location: `src/lib/data.ts`
- Contains: Loader functions, lookup utilities, aggregation helpers
- Depends on: JSON files, types
- Used by: Page, components

**Business Logic Layer:**
- Purpose: Severity calculations and scoring
- Location: `src/lib/severity.ts`
- Contains: Severity formulas, beard categorization
- Depends on: Types
- Used by: Data layer (pre-computed), UI helpers

**Type Definitions:**
- Purpose: Schema for all entities
- Location: `src/types/schema.ts`
- Contains: Governor, Incident, Metadata interfaces
- Depends on: Nothing
- Used by: All layers

## Data Flow

**Initial Load:**

1. Page component mounts (`'use client'`)
2. `getGovernors()`, `getIncidents()` called from `src/lib/data.ts`
3. JSON files imported at build time via TypeScript imports
4. Data cached in module-level variables
5. Transformed to component props via `useMemo` hooks

**User Interaction:**

1. User interacts (filter, click state/governor/incident)
2. State updated via `useState` hooks
3. `useMemo` recomputes derived data
4. Components re-render with new props
5. Modals open/close via boolean state flags

**State Management:**
- React `useState` for local UI state
- `useMemo` for derived/filtered data
- `useCallback` for memoized handlers
- No external state library (Redux, Zustand)

## Key Abstractions

**Incident:**
- Purpose: Central data entity representing a transgression
- Examples: `data/incidents.json`, `src/types/schema.ts`
- Pattern: Immutable readonly interface with computed severity scores

**Governor:**
- Purpose: Entity linked to incidents via `governor_id`
- Examples: `data/governors.json`
- Pattern: Simple record with tenure and affiliation data

**Severity Scoring:**
- Purpose: Dual-track scoring system
- Formula: `unified = (constitutional * 0.7) + (salience * 0.3)`
- Location: `src/lib/severity.ts`

**Beard Level:**
- Purpose: 0-4 scale mapping severity to visual metaphor
- Levels: Clean Chin, Wisp, Tuft, Billy Beard, Knee-Dragger
- Location: `src/lib/severity.ts`, `src/types/schema.ts`

## Entry Points

**Application Entry:**
- Location: `src/app/page.tsx`
- Triggers: Browser navigation
- Responsibilities: Data loading, state management, component orchestration

**Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All routes
- Responsibilities: HTML shell, metadata, global styles

## Error Handling

**Strategy:** Fail silently with fallbacks

**Patterns:**
- Optional chaining for missing data
- Default values in transforms
- Map loading shows "Loading map..." placeholder
- No error boundaries configured

## Cross-Cutting Concerns

**Logging:** Console only (no structured logging)
**Validation:** Schema types enforce structure at compile time
**Authentication:** Not applicable (public site)
**Accessibility:** Tailwind classes, ARIA labels in TimelineMatrix

---

*Architecture analysis: 2026-03-12*
