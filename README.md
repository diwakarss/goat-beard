# Goat Beard

**Gubernatorial Transgression Tracker for India (1951-present)**

> *A goat's beard is as worthless as a state's governor.*

A data-driven evidence platform that tracks, visualizes, and measures Indian gubernatorial transgressions from 1951 to present. Turns anecdotal grievances into defensible evidence through constitutional severity scoring and source verification.

**Live**: [goatbeards.jdlabs.top](https://goatbeards.jdlabs.top)

## What it does

- Tracks 50+ incidents across 33+ governors with documented constitutional violations
- Scores governors on a "Beard Scale" (Clean Chin to Knee-Dragger) based on transgression severity
- Visualizes patterns by state, era, constitutional article, and transgression type
- Maps incidents to specific constitutional articles (163, 168, 172, 356) and Supreme Court precedents (S.R. Bommai, Nabam Rebia)
- Provides source-linked evidence with verification status and confidence scores

## Tech stack

- **Frontend**: Next.js 16, React 18, Tailwind CSS, react-simple-maps
- **Data**: Static JSON datasets built from crawled and AI-extracted sources
- **Scraping**: Crawlee + Playwright for source collection
- **Extraction**: Anthropic Claude SDK for structured data extraction
- **Infrastructure**: AWS S3 + CloudFront via Terraform
- **Testing**: Vitest + React Testing Library

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build (static export) |
| `npm test` | Run tests |
| `npm run crawl` | Crawl source URLs |
| `npm run collect` | Collect page content |
| `npm run extract` | AI-extract structured data |
| `npm run merge` | Merge extracted data into dataset |

## Project structure

```
src/
  app/          Next.js app router (single-page dashboard)
  components/   ~25 React components (maps, charts, cards, tables)
  lib/          Data loading, severity scoring, validation
  types/        TypeScript schema definitions
data/           Static JSON datasets (governors, incidents, metadata)
scraper/        Crawlee/Playwright source scrapers
scripts/        Data processing pipelines
infrastructure/ Terraform (AWS S3/CloudFront) + deploy script
```

## License

Private
