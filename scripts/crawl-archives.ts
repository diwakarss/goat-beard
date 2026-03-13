#!/usr/bin/env npx tsx
/**
 * Archive crawler for historical gubernatorial incident sources
 *
 * Usage:
 *   npx tsx scripts/crawl-archives.ts --incident inc-014   # Crawl for specific incident
 *   npx tsx scripts/crawl-archives.ts --era pre_1975       # Crawl all incidents from era
 *   npx tsx scripts/crawl-archives.ts --wayback <url>      # Get Wayback snapshots for URL
 *   npx tsx scripts/crawl-archives.ts --scobserver         # Crawl SC Observer cases
 *   npx tsx scripts/crawl-archives.ts --list-needs-sources # List incidents needing sources
 */

import { PlaywrightCrawler, Configuration } from 'crawlee';
import * as fs from 'fs';
import * as path from 'path';
import {
  archiveSources,
  archiveSearchTerms,
  generateSearchQueries,
  type IncidentSearchQuery,
} from '../scraper/archive-sources';

const INCIDENTS_FILE = './data/incidents.json';
const ARCHIVE_QUEUE_DIR = './data/archive-queue';
const ARCHIVE_RESULTS_DIR = './data/archive-results';

interface Incident {
  id: string;
  title: string;
  date_start: string;
  date_end: string | null;
  state: string;
  governor_id?: string;
  sources: Array<{ url: string; outlet: string }>;
  era?: string;
  verification_status: string;
}

interface WaybackSnapshot {
  url: string;
  timestamp: string;
  archiveUrl: string;
}

interface ArchiveResult {
  incidentId: string;
  source: string;
  url: string;
  title: string;
  content: string;
  dateFound: string;
  relevanceScore: number;
}

// Ensure directories exist
function ensureDirs(): void {
  [ARCHIVE_QUEUE_DIR, ARCHIVE_RESULTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Load incidents
function loadIncidents(): Incident[] {
  return JSON.parse(fs.readFileSync(INCIDENTS_FILE, 'utf-8'));
}

// Find incidents needing sources
function findIncidentsNeedingSources(incidents: Incident[]): Incident[] {
  return incidents.filter(inc =>
    inc.sources.length === 0 ||
    inc.verification_status === 'needs_verification'
  );
}

// Wayback Machine API - check if URL has archived snapshots
async function getWaybackSnapshots(url: string): Promise<WaybackSnapshot[]> {
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&limit=10`;

  try {
    const response = await fetch(cdxUrl);
    const data = await response.json();

    if (!Array.isArray(data) || data.length < 2) {
      return [];
    }

    // First row is headers: ["urlkey","timestamp","original","mimetype","statuscode","digest","length"]
    const headers = data[0];
    const timestampIdx = headers.indexOf('timestamp');
    const originalIdx = headers.indexOf('original');

    return data.slice(1).map(row => ({
      url: row[originalIdx],
      timestamp: row[timestampIdx],
      archiveUrl: `https://web.archive.org/web/${row[timestampIdx]}/${row[originalIdx]}`,
    }));
  } catch (error) {
    console.error(`Wayback API error for ${url}:`, error);
    return [];
  }
}

// Build search paths for news archives based on query terms
function buildSearchPaths(query: string, state: string): string[] {
  const paths: string[] = [];

  // State name mappings
  const stateNames: Record<string, string[]> = {
    PB: ['punjab'],
    KL: ['kerala'],
    TN: ['tamil-nadu', 'tamilnadu'],
    KA: ['karnataka'],
    MH: ['maharashtra'],
    WB: ['west-bengal', 'westbengal'],
    JK: ['jammu-kashmir', 'kashmir'],
    UK: ['uttarakhand'],
    AR: ['arunachal-pradesh', 'arunachal'],
    RJ: ['rajasthan'],
    BR: ['bihar'],
    UP: ['uttar-pradesh'],
    MP: ['madhya-pradesh'],
    TS: ['telangana'],
    AP: ['andhra-pradesh'],
    MULTI: ['national', 'india'],
  };

  const stateKeywords = stateNames[state] || ['india'];

  // Common news archive paths
  for (const stateKw of stateKeywords) {
    paths.push(`/news/national/${stateKw}/`);
    paths.push(`/news/states/${stateKw}/`);
    paths.push(`/india/${stateKw}/`);
    paths.push(`/article/india/${stateKw}/`);
  }

  // Generic political paths
  paths.push('/news/national/');
  paths.push('/news/politics/');
  paths.push('/india/political-pulse/');

  return paths;
}

// Search Wayback Machine CDX with proper matchType
async function searchWaybackForQuery(
  domain: string,
  query: string,
  dateStart: string,
  dateEnd: string,
  state: string = 'MULTI'
): Promise<WaybackSnapshot[]> {
  // Expand date range: 1 month before to 1 month after
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd || dateStart);
  startDate.setMonth(startDate.getMonth() - 1);
  endDate.setMonth(endDate.getMonth() + 1);

  const fromTs = startDate.toISOString().split('T')[0].replace(/-/g, '');
  const toTs = endDate.toISOString().split('T')[0].replace(/-/g, '');

  const allSnapshots: WaybackSnapshot[] = [];
  const seenUrls = new Set<string>();
  const searchPaths = buildSearchPaths(query, state);

  // Search each path with prefix matchType
  for (const searchPath of searchPaths.slice(0, 3)) { // Limit to 3 paths per domain
    const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${domain}${searchPath}&matchType=prefix&output=json&limit=30&from=${fromTs}&to=${toTs}&filter=statuscode:200&filter=mimetype:text/html&collapse=urlkey`;

    // Debug log
    if (process.env.DEBUG) {
      console.log(`      CDX: ${domain}${searchPath} (${fromTs}-${toTs})...`);
    }

    try {
      const response = await fetch(cdxUrl);

      // Check for non-JSON response (error pages)
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json') && !contentType?.includes('text/plain')) {
        continue; // Skip HTML error responses
      }

      const text = await response.text();
      if (!text.trim().startsWith('[')) {
        continue; // Not a JSON array
      }

      const data = JSON.parse(text);

      if (!Array.isArray(data) || data.length < 2) {
        continue; // Try next path
      }

      const headers = data[0];
      const timestampIdx = headers.indexOf('timestamp');
      const originalIdx = headers.indexOf('original');

      for (const row of data.slice(1)) {
        const originalUrl = row[originalIdx];
        // Filter for article-like URLs and dedupe
        if (!seenUrls.has(originalUrl) && isLikelyArticleUrl(originalUrl)) {
          seenUrls.add(originalUrl);
          allSnapshots.push({
            url: originalUrl,
            timestamp: row[timestampIdx],
            archiveUrl: `https://web.archive.org/web/${row[timestampIdx]}/${originalUrl}`,
          });
        }
      }

      // Rate limit between requests
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`Wayback search error for ${searchPath}:`, error);
    }
  }

  return allSnapshots;
}

// Check if URL looks like a news article
function isLikelyArticleUrl(url: string): boolean {
  // Must have some path depth and look like an article
  const patterns = [
    /article\d+\.ece/i,  // The Hindu: article12345.ece
    /\.ece$/i,          // Other .ece URLs
    /\/\d{4}\/\d{2}\/\d{2}\//,  // Date in URL
    /\/story\//i,
    /\/news\/.*\/[a-z0-9-]+-\d+/i,  // news/category/slug-id
    /-\d{6,}$/,  // Ends with 6+ digit article ID
    /\/article\/.*\d+/i,  // article/path/with/id
  ];

  // Exclude listing pages and utility URLs
  const excludePatterns = [
    /\/page\/\d+/,
    /\/tag\//,
    /\/category\//,
    /\/author\//,
    /\/search\//,
    /\/amp\/?$/i,  // AMP versions (we want full pages)
    /utm_/i,  // URLs with tracking params
    /rss/i,  // RSS feed URLs
  ];

  const hasArticlePattern = patterns.some(p => p.test(url));
  const isExcluded = excludePatterns.some(p => p.test(url));

  return hasArticlePattern && !isExcluded;
}

// Crawl SCObserver for case information
async function crawlSCObserver(query: string): Promise<ArchiveResult[]> {
  const results: ArchiveResult[] = [];
  const searchUrl = `https://www.scobserver.in/?s=${encodeURIComponent(query)}`;

  Configuration.getGlobalConfig().set('persistStorage', false);

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 10,
    maxConcurrency: 2,
    requestHandlerTimeoutSecs: 30,
    navigationTimeoutSecs: 20,
    headless: true,

    async requestHandler({ page, request, log }) {
      const url = request.url;
      log.info(`SCObserver: ${url}`);

      // If search results page
      if (url.includes('?s=')) {
        const links = await page.$$eval('article a[href*="scobserver.in"]', els =>
          els.map(a => (a as HTMLAnchorElement).href).slice(0, 5)
        );
        log.info(`Found ${links.length} case links`);
        // Would enqueue these for processing
      } else {
        // Case page - extract content
        const title = await page.$eval('h1', el => el.textContent?.trim() || '').catch(() => '');
        const content = await page.$eval('.entry-content, article', el => el.textContent?.trim() || '').catch(() => '');

        if (title && content.length > 100) {
          results.push({
            incidentId: '', // Will be matched later
            source: 'scobserver',
            url,
            title,
            content: content.slice(0, 5000),
            dateFound: new Date().toISOString(),
            relevanceScore: 0.8,
          });
        }
      }
    },
  });

  await crawler.run([searchUrl]);
  return results;
}

// Crawl archived page for content using direct Playwright
async function crawlArchivedPage(archiveUrl: string): Promise<{ title: string; content: string } | null> {
  // Dynamic import to avoid bundling issues
  const { chromium } = await import('playwright');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(archiveUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for Wayback content to load
    await page.waitForTimeout(2000);

    const title = await page.$eval('h1, .article-title, .headline, .title', el =>
      el.textContent?.trim() || ''
    ).catch(() => '');

    const content = await page.evaluate(() => {
      // Remove Wayback Machine toolbar elements
      document.querySelectorAll('#wm-ipp-base, #wm-ipp, .wb-autocomplete-suggestions, script, style, nav, footer').forEach(el => el.remove());

      // Get article content
      const contentSelectors = [
        '.articlebodycontent',
        '.article-content',
        '.story-content',
        'article',
        '.content',
        'main',
      ];

      for (const selector of contentSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent && el.textContent.trim().length > 200) {
          return el.textContent.trim();
        }
      }

      // Fallback to all paragraphs
      const paragraphs = Array.from(document.querySelectorAll('p'))
        .map(p => p.textContent?.trim())
        .filter(t => t && t.length > 30);

      return paragraphs.join('\n\n');
    });

    await browser.close();

    if (title || content.length > 100) {
      return { title, content: content.slice(0, 8000) };
    }
    return null;
  } catch (error) {
    console.error(`Failed to crawl ${archiveUrl}:`, (error as Error).message);
    if (browser) await browser.close();
    return null;
  }
}

// Main archive crawl for an incident
async function crawlForIncident(incident: Incident): Promise<ArchiveResult[]> {
  const results: ArchiveResult[] = [];
  const searchQuery = generateSearchQueries(
    incident.id,
    incident.title,
    incident.date_start,
    incident.date_end,
    incident.state
  );

  console.log(`\nCrawling archives for: ${incident.id} - ${incident.title}`);
  console.log(`Queries: ${searchQuery.queries.slice(0, 3).join(', ')}`);

  // Search SCObserver (always available)
  console.log('  Searching SCObserver...');
  for (const query of searchQuery.queries.slice(0, 2)) {
    const scResults = await crawlSCObserver(query);
    scResults.forEach(r => {
      r.incidentId = incident.id;
      results.push(r);
    });
    await new Promise(r => setTimeout(r, 2000)); // Rate limit
  }

  // Search Wayback for major news domains
  const newsDomains = [
    'thehindu.com',
    'indianexpress.com',
    'timesofindia.indiatimes.com',
    'hindustantimes.com',
  ];

  console.log('  Searching Wayback Machine...');
  for (const domain of newsDomains) {
    // Pass state for path-based searching, use first query for context
    const snapshots = await searchWaybackForQuery(
      domain,
      searchQuery.queries[0],
      searchQuery.dateRange.start,
      searchQuery.dateRange.end,
      incident.state
    );

    console.log(`    ${domain}: ${snapshots.length} article snapshots found`);

    // Crawl top 3 relevant snapshots per domain
    const toCrawl = snapshots.slice(0, 3);
    console.log(`      Crawling ${toCrawl.length} pages...`);

    for (const snapshot of toCrawl) {
      console.log(`        -> ${snapshot.url.slice(0, 60)}...`);
      const content = await crawlArchivedPage(snapshot.archiveUrl);

      if (!content) {
        console.log(`        [No content extracted]`);
        continue;
      }

      // Check if content is relevant (contains governor-related keywords)
      const isRelevant = /governor|raj bhavan|article 356|president.?s rule|assent|dissolution|bjp.*form|yeddyurappa|vajubhai/i.test(
        content.title + ' ' + content.content
      );

      console.log(`        Title: "${content.title.slice(0, 40)}..." | Relevant: ${isRelevant}`);

      if (isRelevant) {
        results.push({
          incidentId: incident.id,
          source: 'wayback',
          url: snapshot.archiveUrl,
          title: content.title,
          content: content.content,
          dateFound: new Date().toISOString(),
          relevanceScore: 0.8,
        });
        console.log(`      ✓ Found relevant: ${content.title.slice(0, 50)}...`);
      }

      await new Promise(r => setTimeout(r, 2000)); // Respect archive.org
    }
  }

  return results;
}

// Save results
function saveResults(incidentId: string, results: ArchiveResult[]): void {
  const filepath = path.join(ARCHIVE_RESULTS_DIR, `${incidentId}.json`);
  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
  console.log(`  Saved ${results.length} results to ${filepath}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Archive Crawler for Historical Gubernatorial Incidents

Usage:
  npx tsx scripts/crawl-archives.ts --list-needs-sources   List incidents needing sources
  npx tsx scripts/crawl-archives.ts --incident <id>        Crawl for specific incident
  npx tsx scripts/crawl-archives.ts --era <era>            Crawl all incidents from era
  npx tsx scripts/crawl-archives.ts --wayback <url>        Get Wayback snapshots for URL
  npx tsx scripts/crawl-archives.ts --scobserver <query>   Search SC Observer

Eras: pre_1975, emergency, post_emergency, pre_1991, post_1991, post_2000, post_2014
`);
    return;
  }

  ensureDirs();
  const incidents = loadIncidents();

  if (args[0] === '--list-needs-sources') {
    const needingSources = findIncidentsNeedingSources(incidents);
    console.log(`\nIncidents needing primary sources: ${needingSources.length}\n`);
    needingSources.forEach(inc => {
      console.log(`[${inc.id}] ${inc.date_start} | ${inc.state} | ${inc.title.slice(0, 50)}...`);
    });
    return;
  }

  if (args[0] === '--wayback' && args[1]) {
    const url = args[1];
    console.log(`\nSearching Wayback Machine for: ${url}\n`);
    const snapshots = await getWaybackSnapshots(url);
    if (snapshots.length === 0) {
      console.log('No snapshots found.');
    } else {
      console.log(`Found ${snapshots.length} snapshots:\n`);
      snapshots.forEach(s => {
        console.log(`  ${s.timestamp} - ${s.archiveUrl}`);
      });
    }
    return;
  }

  if (args[0] === '--scobserver' && args[1]) {
    const query = args.slice(1).join(' ');
    console.log(`\nSearching SC Observer for: ${query}\n`);
    const results = await crawlSCObserver(query);
    console.log(`Found ${results.length} results`);
    results.forEach(r => {
      console.log(`  - ${r.title.slice(0, 60)}...`);
    });
    return;
  }

  if (args[0] === '--incident' && args[1]) {
    const incidentId = args[1];
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) {
      console.error(`Incident not found: ${incidentId}`);
      process.exit(1);
    }
    const results = await crawlForIncident(incident);
    saveResults(incidentId, results);
    return;
  }

  if (args[0] === '--era' && args[1]) {
    const era = args[1];
    const eraIncidents = incidents.filter(i => i.era === era && i.sources.length === 0);
    console.log(`\nCrawling ${eraIncidents.length} incidents from era: ${era}\n`);

    for (const incident of eraIncidents) {
      const results = await crawlForIncident(incident);
      saveResults(incident.id, results);
      // Rate limit between incidents
      await new Promise(r => setTimeout(r, 5000));
    }
    return;
  }

  console.log('Unknown command. Run with --help for usage.');
}

main().catch(console.error);
