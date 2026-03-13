# Coding Conventions

**Analysis Date:** 2026-03-12

## Naming Patterns

**Files:**
- Components: PascalCase (`DashboardHeader.tsx`, `IndiaMap.tsx`)
- Lib modules: lowercase (`data.ts`, `severity.ts`)
- Types: lowercase (`schema.ts`)
- Tests: `*.test.ts` suffix in `__tests__/` directory

**Functions:**
- camelCase for all functions
- Prefix `get` for data retrieval (`getGovernors`, `getIncidentById`)
- Prefix `calculate` for computations (`calculateSeverity`, `calculateDurationImpact`)
- Prefix `handle` for event handlers (`handleMouseMove`, `handleFilterChange`)

**Variables:**
- camelCase for variables and parameters
- UPPER_SNAKE_CASE for constants (`CONSTITUTIONAL_WEIGHTS`, `DURATION_THRESHOLDS`)

**Types/Interfaces:**
- PascalCase for all types (`Governor`, `Incident`, `SeverityScores`)
- Suffix `Props` for component props (`IndiaMapProps`, `TimelineMatrixProps`)
- Suffix `Metadata` for reference types (`StateMetadata`, `EraMetadata`)

## Code Style

**Formatting:**
- No explicit Prettier config (uses defaults)
- 2-space indentation (TypeScript/JSON)
- Single quotes for strings
- Trailing commas in multiline

**Linting:**
- ESLint with `next/core-web-vitals` preset
- Run: `npm run lint`

## Import Organization

**Order:**
1. React imports (`import React, { useState, useMemo }`)
2. External libraries (`import { ComposableMap } from 'react-simple-maps'`)
3. Local components (`import { DashboardHeader } from '@/components/DashboardHeader'`)
4. Local lib (`import { getGovernors } from '@/lib/data'`)
5. Types (`import type { Governor, Incident } from '@/types/schema'`)

**Path Aliases:**
- `@/*` maps to `./src/*`
- `@/../data/*` for data imports (relative to src)
- Use aliases consistently; avoid relative paths like `../../`

## Component Patterns

**Function Components:**
```typescript
// Named export with explicit typing
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hooks first
  const [state, setState] = useState<StateType>(initial);
  const memoized = useMemo(() => compute(), [deps]);
  const handler = useCallback(() => {}, [deps]);

  // early returns
  if (!data) return <Loading />;

  // render
  return <div>...</div>;
}
```

**Props Interface:**
```typescript
interface ComponentNameProps {
  readonly data: DataType[];  // Use readonly for immutability
  onEvent?: (id: string) => void;  // Optional callbacks
}
```

## Error Handling

**Patterns:**
- Optional chaining for potentially undefined values
- Default values with `||` or `??`
- Type narrowing with `if (!data) return null`
- No try/catch in components (let errors bubble)

```typescript
// Pattern: safe property access
const state = states.find(s => s.code === code);
return state?.name || code;
```

## Logging

**Framework:** Console only (no structured logging)

**Patterns:**
- `console.error()` for fetch failures
- No production logging infrastructure
- Test output uses `console.log()` with checkmarks

## Comments

**When to Comment:**
- JSDoc for exported functions in lib modules
- Inline comments for non-obvious calculations
- Section headers with `// ============` dividers

**JSDoc/TSDoc:**
```typescript
/**
 * Returns all incidents occurring in a specific state.
 */
export function getIncidentsByState(stateCode: string): readonly Incident[] {
```

## Function Design

**Size:** Most functions are 5-20 lines
**Parameters:** Prefer single object parameter for 3+ params
**Return Values:**
- Return `readonly` arrays from data functions
- Return typed objects, not `any`

```typescript
// Pattern: Calculation with explicit interface
export function calculateAllSeverityScores(input: CalculationInput): FullSeverityResult {
  // ...
  return { constitutional, salience, unified, cappedEscalationLevel };
}
```

## Module Design

**Exports:**
- Named exports preferred over default exports
- Export types/interfaces alongside functions
- Components export as named functions

**Barrel Files:**
- Not used - import directly from source files

## React Patterns

**State Management:**
- `useState` for local UI state
- `useMemo` for computed/derived values
- `useCallback` for handlers passed to children

**Event Handlers:**
```typescript
const handleClick = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

**Conditional Rendering:**
```typescript
{condition && <Component />}
{condition ? <A /> : <B />}
```

## CSS/Styling

**Approach:** Tailwind CSS utility classes

**Patterns:**
- Inline className strings for simple styling
- Template literals for conditional classes
- Custom CSS in `globals.css` for complex effects (glass morphism)

```typescript
className={`cursor-pointer transition-colors ${isCritical ? 'animate-pulse' : ''}`}
```

---

*Convention analysis: 2026-03-12*
