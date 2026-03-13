# Technology Stack

**Analysis Date:** 2026-03-12

## Languages

**Primary:**
- TypeScript 5.6.0 - All source code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- JavaScript - Configuration files (`next.config.js`, `postcss.config.js`)
- JSON - Data storage (`data/**/*.json`)
- CSS - Styling with Tailwind (`src/app/globals.css`)

## Runtime

**Environment:**
- Node.js (version managed via project, no `.nvmrc` detected)

**Package Manager:**
- npm (inferred from `package-lock.json`)
- Lockfile: present

## Frameworks

**Core:**
- Next.js 14.2.0 - React framework with App Router
- React 18.3.0 - UI library
- Tailwind CSS 3.4.0 - Utility-first CSS

**Testing:**
- Vitest 4.0.18 - Test runner
- Testing Library React 16.3.2 - Component testing
- jsdom 28.1.0 - DOM environment for tests

**Build/Dev:**
- TypeScript 5.6.0 - Type checking
- PostCSS 8.4.47 - CSS processing
- Autoprefixer 10.4.20 - CSS vendor prefixes

## Key Dependencies

**Critical:**
- `react-simple-maps` 3.0.0 - India map visualization in `src/components/IndiaMap.tsx`
- `topojson-client` 3.1.0 - TopoJSON to GeoJSON conversion for map rendering

**Dev Types:**
- `@types/react-simple-maps` 3.0.6
- `@types/topojson-client` 3.1.5
- `@types/geojson` 7946.0.16

## Configuration

**TypeScript (`tsconfig.json`):**
- Target: ES2020
- Module: ESNext with bundler resolution
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`

**Next.js (`next.config.js`):**
- Static export enabled for production (`output: 'export'`)
- Images unoptimized (required for static export)

**Tailwind (`tailwind.config.ts`):**
- Custom colors: `severity.*`, `beard.*`, `surface`, `muted`, `border`, `accent`
- Custom fonts: Nunito (sans), JetBrains Mono (mono)

**ESLint (`.eslintrc.json`):**
- Extends `next/core-web-vitals`

## Platform Requirements

**Development:**
- Node.js with npm
- Run: `npm run dev`
- Type check: `npm run type-check`
- Test: `npm run test`

**Production:**
- Static export to `out/` directory
- Target: S3 + CloudFront (static hosting)
- Build: `npm run build`

## Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "type-check": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

---

*Stack analysis: 2026-03-12*
