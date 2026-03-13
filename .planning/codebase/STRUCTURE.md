# Codebase Structure

**Analysis Date:** 2026-03-12

## Directory Layout

```
goat-beard/
├── .planning/              # Project planning docs
│   ├── codebase/           # These analysis docs
│   └── phases/             # Phase-specific planning
├── data/                   # JSON data files
│   ├── metadata/           # Reference data
│   │   ├── articles.json
│   │   ├── eras.json
│   │   ├── precedents.json
│   │   └── states.json
│   ├── governors.json
│   └── incidents.json
├── public/                 # Static assets
│   ├── data/               # Runtime-loaded assets
│   │   └── india.json      # TopoJSON map
│   ├── logo.png
│   ├── beard-icon.png
│   └── *.png               # Beard level icons
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx        # Main dashboard
│   ├── components/         # React components
│   ├── lib/                # Business logic
│   │   ├── __tests__/      # Unit tests
│   │   ├── data.ts
│   │   └── severity.ts
│   └── types/              # TypeScript definitions
│       └── schema.ts
├── out/                    # Static build output
├── .eslintrc.json
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

## Directory Purposes

**`data/`:**
- Purpose: Source of truth for all domain data
- Contains: JSON files with governors, incidents, metadata
- Key files: `incidents.json`, `governors.json`
- Note: Imported at build time, not fetched at runtime

**`data/metadata/`:**
- Purpose: Reference/lookup data
- Contains: States, constitutional articles, eras, precedents
- Key files: `states.json` (36 entries)

**`src/app/`:**
- Purpose: Next.js App Router pages
- Contains: Layout, main page, global CSS
- Key files: `page.tsx` (596 lines - main dashboard)

**`src/components/`:**
- Purpose: Reusable React components
- Contains: 25 TSX components
- Key files:
  - `DashboardHeader.tsx` - Header with KPIs and timeline slider
  - `IndiaMap.tsx` - State heat map
  - `TimelineMatrix.tsx` - Era-grouped incident grid
  - `*Detail.tsx` - Modal components for entities

**`src/lib/`:**
- Purpose: Business logic and data access
- Contains: Data loaders, severity calculations
- Key files: `data.ts`, `severity.ts`

**`src/lib/__tests__/`:**
- Purpose: Unit tests for lib modules
- Contains: Vitest test files
- Key files: `severity.test.ts` (608 lines), `data.test.ts`

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: Schema interfaces
- Key files: `schema.ts` (254 lines)

**`public/`:**
- Purpose: Static assets served at root
- Contains: Images, runtime-loaded data
- Key files: `logo.png`, `data/india.json`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Main dashboard page
- `src/app/layout.tsx`: Root layout wrapper

**Configuration:**
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.ts`: Tailwind theme customization
- `next.config.js`: Next.js settings
- `vitest.config.ts`: Test configuration

**Core Logic:**
- `src/lib/data.ts`: Data loading and queries
- `src/lib/severity.ts`: Severity calculation formulas
- `src/types/schema.ts`: Domain type definitions

**Testing:**
- `src/lib/__tests__/severity.test.ts`: Severity calculator tests
- `src/lib/__tests__/data.test.ts`: Data loader tests

## Naming Conventions

**Files:**
- Components: PascalCase (`DashboardHeader.tsx`, `IndiaMap.tsx`)
- Lib modules: kebab-case or lowercase (`data.ts`, `severity.ts`)
- Tests: `*.test.ts` suffix
- JSON data: kebab-case (`incidents.json`, `states.json`)

**Directories:**
- Lowercase with hyphens for compound names
- `__tests__` for test directories (double underscore)

## Where to Add New Code

**New Feature Component:**
- Primary code: `src/components/NewComponent.tsx`
- Export: Direct usage from `src/app/page.tsx`

**New Data Type:**
- Schema: Add to `src/types/schema.ts`
- Loader: Add function to `src/lib/data.ts`
- JSON: Add to `data/` or `data/metadata/`

**New Business Logic:**
- Module: Add to `src/lib/` (e.g., `src/lib/newlogic.ts`)
- Tests: Add `src/lib/__tests__/newlogic.test.ts`

**New Page (if needed):**
- Page: `src/app/newpage/page.tsx`
- Note: Static export requires all routes be known at build time

**Utilities:**
- Shared helpers: `src/lib/` in new or existing module

**Phase 2 Scraper:**
- Suggested: `scripts/scraper/` or separate package
- Will need to output to `data/` directory

## Special Directories

**`out/`:**
- Purpose: Static build output
- Generated: Yes (by `npm run build`)
- Committed: No (should be in `.gitignore`)

**`.next/`:**
- Purpose: Next.js build cache
- Generated: Yes
- Committed: No

**`node_modules/`:**
- Purpose: Dependencies
- Generated: Yes (by `npm install`)
- Committed: No

---

*Structure analysis: 2026-03-12*
