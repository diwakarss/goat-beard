#!/usr/bin/env npx tsx
/**
 * Article collection script
 *
 * Crawls news archives and saves relevant articles for HQ extraction.
 * Single-pass: crawl → filter → save for extraction.
 *
 * Usage:
 *   npx tsx scripts/collect.ts thehindu
 *   npx tsx scripts/collect.ts thehindu --url "https://..."
 *   npx tsx scripts/collect.ts thehindu --search "governor bill assent"
 *   npx tsx scripts/collect.ts --urls urls.txt
 */

import { PlaywrightCrawler, Dataset, Configuration } from 'crawlee';
import * as fs from 'fs';
import * as path from 'path';
import { sources, getSourceById, incidentKeywords } from '../scraper/config';
import { buildExtractionPrompt } from '../scraper/extractor';
import type { ParsedArticle } from '../scraper/types';

const QUEUE_DIR = './data/extraction-queue';

interface CollectedArticle {
  id: string;
  article: ParsedArticle;
  prompt: string;
  status: 'pending' | 'complete' | 'skipped';
  response?: string;
}

function isRelevantContent(text: string): boolean {
  const lower = text.toLowerCase();
  const hasGovernor = lower.includes('governor') || lower.includes('raj bhavan');
  if (!hasGovernor) return false;

  const keywordCount = incidentKeywords.filter((kw) =>
    lower.includes(kw.toLowerCase())
  ).length;

  return keywordCount >= 2;
}

async function collectArticles(
  startUrls: string[],
  sourceId: string,
  maxRequests: number
): Promise<ParsedArticle[]> {
  const source = getSourceById(sourceId);
  if (!source) {
    throw new Error(`Unknown source: ${sourceId}`);
  }

  Configuration.getGlobalConfig().set('persistStorage', false);

  const articles: ParsedArticle[] = [];

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: maxRequests,
    maxConcurrency: 3,
    requestHandlerTimeoutSecs: 60,
    navigationTimeoutSecs: 30,
    headless: true,
    maxRequestsPerMinute: 60,

    async requestHandler({ page, request, enqueueLinks, log }) {
      const url = request.url;
      log.info(`Visiting: ${url}`);

      // Broader article detection - URLs with numeric IDs or common news path patterns
      const isArticle = url.includes('/article') ||
        url.includes('.ece') ||
        url.includes('/story/') ||
        /\/\d{5,}/.test(url) ||  // URLs with 5+ digit numeric IDs
        url.includes('/india/') ||
        url.includes('/national/') ||
        url.includes('/politics/');

      if (isArticle) {
        try {
          // Extract content
          const title = await page.$eval('h1', (el) => el.textContent?.trim() || '').catch(() => '');
          // Wait for content to render (JS-heavy sites)
          await page.waitForTimeout(2000);

          // Extract all paragraph text - most reliable across sites
          const content = await page.evaluate(() => {
            // Remove noise elements
            document.querySelectorAll('script, style, nav, header, footer, aside, .ad, .advertisement, .social-share').forEach(el => el.remove());

            // Collect all paragraphs from likely content areas
            const contentAreas = document.querySelectorAll('article, main, [role="main"], .article, .post, .story, .content');
            const allParagraphs: string[] = [];

            contentAreas.forEach(area => {
              area.querySelectorAll('p').forEach(p => {
                const text = p.textContent?.trim();
                if (text && text.length > 30 && !text.startsWith('/*')) {  // Skip CSS
                  allParagraphs.push(text);
                }
              });
            });

            // Dedupe and join
            const unique = [...new Set(allParagraphs)];
            return unique.join('\n\n');
          });

          const combinedText = `${title} ${content}`;
          const isRelevant = isRelevantContent(combinedText);
          log.info(`Title: "${title.slice(0, 60)}..." | Content length: ${content.length} | Relevant: ${isRelevant}`);

          if (title && content.length > 200 && isRelevant) {
            log.info(`Found relevant: ${title.slice(0, 50)}...`);

            // Extract date
            const date = await page.$eval(
              'time[datetime], .publish-time, .date',
              (el) => el.getAttribute('datetime') || el.textContent?.trim() || ''
            ).catch(() => null);

            articles.push({
              url,
              title,
              content: content.slice(0, 8000), // Limit for LLM
              date: date ? normalizeDate(date) : null,
              outlet: source.name,
            });
          }
        } catch (error) {
          log.error(`Failed to parse: ${url}`);
        }
      } else {
        // Listing page - enqueue article links
        await enqueueLinks({
          selector: 'a[href*="/article"], a[href*=".ece"], a[href*="/story/"]',
          strategy: 'same-domain',
        });
      }
    },
  });

  await crawler.run(startUrls);
  return articles;
}

function normalizeDate(input: string): string | null {
  const isoMatch = input.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return isoMatch[0];

  const months: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12',
  };

  const lower = input.toLowerCase();
  for (const [month, num] of Object.entries(months)) {
    if (lower.includes(month)) {
      const dayMatch = lower.match(/(\d{1,2})/);
      const yearMatch = lower.match(/(\d{4})/);
      if (dayMatch && yearMatch) {
        return `${yearMatch[1]}-${num}-${dayMatch[1].padStart(2, '0')}`;
      }
    }
  }

  return null;
}

function saveForExtraction(articles: ParsedArticle[], sourceId: string): string {
  if (!fs.existsSync(QUEUE_DIR)) {
    fs.mkdirSync(QUEUE_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${sourceId}-${timestamp}.json`;
  const filepath = path.join(QUEUE_DIR, filename);

  const batch: CollectedArticle[] = articles.map((article, index) => ({
    id: `${sourceId}-${timestamp}-${index}`,
    article,
    prompt: buildExtractionPrompt(article),
    status: 'pending',
  }));

  fs.writeFileSync(filepath, JSON.stringify(batch, null, 2));
  return filepath;
}

async function collectFromUrlFile(filepath: string, maxRequests: number): Promise<ParsedArticle[]> {
  const content = fs.readFileSync(filepath, 'utf-8');
  const urls = content.split('\n').filter((line) => line.trim() && line.startsWith('http'));

  console.log(`Found ${urls.length} URLs in file`);

  // Detect source from first URL
  let sourceId = 'generic';
  for (const source of sources) {
    if (urls[0]?.includes(source.baseUrl.replace('https://', ''))) {
      sourceId = source.id;
      break;
    }
  }

  return collectArticles(urls, sourceId, Math.min(urls.length, maxRequests));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: npx tsx scripts/collect.ts <source-id> [options]
       npx tsx scripts/collect.ts --urls <file>

Collects relevant articles from news archives for HQ extraction.

Sources:
${sources.map((s) => `  - ${s.id}: ${s.name}`).join('\n')}

Options:
  --url <url>          Start URL (can specify multiple)
  --search <query>     Search query to append
  --max-requests <n>   Maximum pages to visit (default: 30)
  --urls <file>        File with URLs, one per line

Examples:
  npx tsx scripts/collect.ts thehindu
  npx tsx scripts/collect.ts thehindu --search "governor bill Kerala"
  npx tsx scripts/collect.ts --urls governor-articles.txt

After collection, run:
  npx tsx scripts/extract-hq.ts --list
`);
    return;
  }

  let sourceId = 'generic';
  let startUrls: string[] = [];
  let maxRequests = 30;
  let urlFile: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) {
      startUrls.push(args[++i]);
    } else if (arg === '--search' && args[i + 1]) {
      const source = getSourceById(sourceId);
      if (source) {
        const query = encodeURIComponent(args[++i]);
        startUrls.push(`${source.baseUrl}/search/?q=${query}`);
      }
    } else if (arg === '--max-requests' && args[i + 1]) {
      maxRequests = parseInt(args[++i], 10);
    } else if (arg === '--urls' && args[i + 1]) {
      urlFile = args[++i];
    } else if (!arg.startsWith('--') && !sourceId) {
      sourceId = arg;
    } else if (!arg.startsWith('--')) {
      sourceId = arg;
    }
  }

  let articles: ParsedArticle[];

  if (urlFile) {
    console.log(`Reading URLs from: ${urlFile}`);
    articles = await collectFromUrlFile(urlFile, maxRequests);
  } else {
    const source = getSourceById(sourceId);
    if (!source) {
      console.error(`Unknown source: ${sourceId}`);
      process.exit(1);
    }

    if (startUrls.length === 0) {
      startUrls.push(`${source.baseUrl}/news/national/`);
    }

    console.log(`
===================================
Article Collection
===================================
Source: ${source.name}
Start URLs: ${startUrls.length}
Max Requests: ${maxRequests}
===================================
`);

    articles = await collectArticles(startUrls, sourceId, maxRequests);
  }

  if (articles.length === 0) {
    console.log('\nNo relevant articles found.');
    return;
  }

  const filepath = saveForExtraction(articles, sourceId);

  console.log(`
===================================
Collection Complete
===================================
Articles found: ${articles.length}
Saved to: ${filepath}

Next steps:
  1. npx tsx scripts/extract-hq.ts --process ${path.basename(filepath)}
  2. For each article, paste the JSON response
  3. npx tsx scripts/extract-hq.ts --import ${path.basename(filepath)}
  4. npm run merge -- --list
===================================
`);
}

main().catch(console.error);
