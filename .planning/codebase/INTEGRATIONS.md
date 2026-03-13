# External Integrations

**Analysis Date:** 2026-03-12

## APIs & External Services

**Map Data:**
- TopoJSON India map loaded from `/public/data/india.json`
  - Fetched at runtime via `fetch('/data/india.json')` in `src/components/IndiaMap.tsx`
  - Contains state boundaries with `st_code` and `st_nm` properties

**Fonts (CDN):**
- Google Fonts
  - Nunito (weights: 400, 500, 600, 700)
  - JetBrains Mono (weights: 400, 500)
  - Loaded in `src/app/globals.css`

## Data Storage

**Databases:**
- None - JSON file-based storage

**Data Files:**
- `data/governors.json` - Governor records (7+ entries)
- `data/incidents.json` - Incident records (12+ entries)
- `data/metadata/states.json` - 36 Indian states/UTs
- `data/metadata/articles.json` - Constitutional articles (5 entries)
- `data/metadata/eras.json` - Historical eras (5 entries)
- `data/metadata/precedents.json` - SC precedents (3 entries)

**File Storage:**
- Local filesystem only
- Static assets in `public/`

**Caching:**
- In-memory module-level cache in `src/lib/data.ts`
- No external caching service

## Authentication & Identity

**Auth Provider:**
- None - Public static site

## Monitoring & Observability

**Error Tracking:**
- None configured

**Logs:**
- Browser console only

## CI/CD & Deployment

**Hosting:**
- Target: AWS S3 + CloudFront (static hosting)
- Currently: Local development only

**CI Pipeline:**
- Planned: GitHub Actions
- Current: Not configured

**Build Output:**
- `out/` directory (static export)

## Environment Configuration

**Required env vars:**
- None - All configuration is static

**Secrets location:**
- Not applicable (no secrets required)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Future Integrations (Phase 2)

**Planned:**
- Crawlee scraper for news archive data
  - The Hindu
  - Indian Express
  - Deccan Chronicle

**Data Sources Referenced in Content:**
- `data_sources: "The Hindu, Indian Express, Deccan Chronicle"` (shown in `DashboardFooter`)

---

*Integration audit: 2026-03-12*
