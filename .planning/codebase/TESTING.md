# Testing Patterns

**Analysis Date:** 2026-03-12

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest built-in (`expect`, `toBe`, `toBeCloseTo`, etc.)

**Additional:**
- Testing Library React 16.3.2 (available but not heavily used)
- jest-dom 6.9.1 for DOM matchers

**Run Commands:**
```bash
npm run test              # Run all tests once
npm run test:watch        # Watch mode
```

## Test File Organization

**Location:**
- Co-located in `__tests__` subdirectory
- Pattern: `src/lib/__tests__/*.test.ts`

**Naming:**
- `*.test.ts` suffix
- Match source file name: `severity.ts` -> `severity.test.ts`

**Structure:**
```
src/lib/
├── data.ts
├── severity.ts
└── __tests__/
    ├── data.test.ts
    └── severity.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../module';

describe('functionToTest', () => {
  it('should handle normal case', () => {
    expect(functionToTest(input)).toBe(expected);
  });

  it('should handle edge case', () => {
    expect(functionToTest(edgeInput)).toBe(edgeExpected);
  });
});
```

**Nested describes for grouping:**
```typescript
describe('severity calculator', () => {
  describe('normalizeEscalationLevel', () => {
    it('should normalize level 1 to 0.25', () => {
      expect(normalizeEscalationLevel(1)).toBe(0.25);
    });
  });

  describe('calculateDurationImpact', () => {
    it('should return 0 for zero duration', () => {
      expect(calculateDurationImpact(0)).toBe(0);
    });
  });
});
```

**Patterns:**
- Each test tests one behavior
- Clear test names describe expected outcome
- Use `toBeCloseTo` for floating-point comparisons

## Mocking

**Framework:** Vitest built-in

**Patterns:**
```typescript
// Not heavily used in current codebase
// JSON data imported directly (no mocking needed for data tests)
```

**What to Mock:**
- External API calls (when added)
- Date/time (use fixed reference dates in severity tests)

**What NOT to Mock:**
- Pure calculation functions
- Data loaders that import JSON

## Fixtures and Factories

**Test Data:**
```typescript
// Factory functions for creating test sources
const createPrimarySource = (credibility: number = 0.8) => ({
  tier: 'primary' as SourceTier,
  credibility_score: credibility,
});

const createSecondarySource = (credibility: number = 0.8) => ({
  tier: 'secondary' as SourceTier,
  credibility_score: credibility,
});
```

**Location:**
- Inline in test files (no separate fixtures directory)
- Factory functions defined at top of test file

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
npx vitest run --coverage  # If coverage plugin added
```

## Test Types

**Unit Tests:**
- Primary focus
- Test individual functions in isolation
- Located in `src/lib/__tests__/`

**Integration Tests:**
- Data loader tests validate JSON parsing
- Test interactions between data and calculation functions

**E2E Tests:**
- Not configured
- Would use Playwright or Cypress if added

## Common Patterns

**Async Testing:**
```typescript
// Not used - all current tests are synchronous
// If needed:
it('should load async data', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

**Error Testing:**
```typescript
it('should throw error for negative duration', () => {
  expect(() => calculateDurationImpact(-1)).toThrow('Duration cannot be negative');
});

it('should throw error for invalid date', () => {
  expect(() => calculateRecencyMultiplier('invalid-date')).toThrow('Invalid incident date');
});
```

**Floating-Point Comparisons:**
```typescript
// Use toBeCloseTo for floating-point values
expect(calculateMediaVisibility(sources)).toBeCloseTo(0.85, 2);
expect(calculateRecencyMultiplier(oneYearAgo, today)).toBeCloseTo(0.5, 2);
```

**Range/Bounds Testing:**
```typescript
it('should return value in valid range', () => {
  const result = calculateSomething();
  expect(result).toBeGreaterThan(0);
  expect(result).toBeLessThanOrEqual(1);
});
```

## Test Categories in Severity Tests

**Helper Functions Tests:**
- `normalizeEscalationLevel`
- `calculateDurationImpact`
- `calculateMediaVisibility`
- `calculateRecencyMultiplier`
- `applyEscalationCap`

**Main Calculation Tests:**
- `calculateConstitutionalSeverity`
- `calculatePublicSalience`
- `calculateUnifiedScore`
- `calculateAllSeverityScores`

**Constants Verification:**
- Weight constants sum to 1.0
- Threshold values are correct

**Real-World Scenarios:**
- High-severity recent confirmed incident
- Minor old unverified incident
- Medium severity partial incident

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

*Testing analysis: 2026-03-12*
