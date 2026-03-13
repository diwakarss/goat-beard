/**
 * Crawlee PlaywrightCrawler for news archive scraping
 */

import { PlaywrightCrawler, Dataset, Configuration, ProxyConfiguration } from 'crawlee';
import type { PlaywrightCrawlingContext } from 'crawlee';
import type { SourceConfig } from './config';
import type { ParsedArticle, StagedIncident, ExtractedIncident } from './types';
import { parseArticle, isRelevantArticle, cleanContent } from './parser';
import { extractIncident } from './extractor';
import { validateAndEnrich } from './validator';
import { appendToStaging } from './staging';

interface CrawlerOptions {
  source: SourceConfig;
  maxRequests?: number;
  headless?: boolean;
  proxyUrls?: string[];
}

/**
 * Create and configure a PlaywrightCrawler for a specific source
 */
export async function createCrawler(options: CrawlerOptions) {
  const { source, maxRequests = 50, headless = true, proxyUrls } = options;

  // Configure storage
  Configuration.getGlobalConfig().set('persistStorage', true);

  // Create proxy configuration if provided
  const proxyConfiguration = proxyUrls?.length
    ? new ProxyConfiguration({ proxyUrls })
    : undefined;

  const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: maxRequests,
    maxConcurrency: 3,
    requestHandlerTimeoutSecs: 60,
    navigationTimeoutSecs: 30,
    headless,
    proxyConfiguration,

    // Rate limiting
    maxRequestsPerMinute: source.rateLimit * 60,

    // Request handler
    async requestHandler(context: PlaywrightCrawlingContext) {
      const { page, request, enqueueLinks, log } = context;
      const url = request.url;

      log.info(`Processing: ${url}`);

      // Check if this is an article page
      const isArticle = url.includes('/article') || url.includes('.ece');

      if (isArticle) {
        // Parse article content
        const article = await parseArticle(page, source);

        if (article && isRelevantArticle(article.content, article.title)) {
          log.info(`Found relevant article: ${article.title}`);

          // Clean content for extraction
          article.content = cleanContent(article.content);

          // Store for batch processing
          await Dataset.pushData({
            type: 'article',
            ...article,
            sourceId: source.id,
          });
        }
      } else {
        // This is a listing page, enqueue article links
        await enqueueLinks({
          selector: source.articleSelector,
          strategy: 'same-domain',
        });
      }
    },

    // Failure handler
    async failedRequestHandler({ request, log }) {
      log.error(`Request failed: ${request.url}`);
    },
  });

  return crawler;
}

/**
 * Run a crawl for a specific source
 */
export async function runCrawl(
  source: SourceConfig,
  startUrls: string[],
  options?: Partial<CrawlerOptions>
): Promise<void> {
  console.log(`Starting crawl for ${source.name}...`);

  const crawler = await createCrawler({
    source,
    ...options,
  });

  await crawler.run(startUrls);

  console.log(`Crawl complete for ${source.name}`);
}

/**
 * Process crawled articles through extraction pipeline
 */
export async function processArticles(sourceId: string): Promise<StagedIncident[]> {
  console.log('Processing crawled articles...');

  // Load crawled articles from dataset
  const dataset = await Dataset.open();
  const { items } = await dataset.getData();

  const articles = items.filter(
    (item) => item.type === 'article' && item.sourceId === sourceId
  ) as (ParsedArticle & { sourceId: string })[];

  console.log(`Found ${articles.length} relevant articles`);

  // Extract incidents using LLM
  const extractions: ExtractedIncident[] = [];
  for (const article of articles) {
    const extraction = await extractIncident(article, sourceId);
    if (extraction) {
      extractions.push(extraction);
    }
  }

  console.log(`Extracted ${extractions.length} potential incidents`);

  // Validate and enrich
  const staged: StagedIncident[] = [];
  for (const extraction of extractions) {
    const validated = validateAndEnrich(extraction);
    if (validated) {
      staged.push(validated);
    }
  }

  console.log(`Validated ${staged.length} incidents`);

  // Save to staging
  const added = appendToStaging(staged);
  console.log(`Added ${added} new incidents to staging`);

  return staged;
}

/**
 * Full pipeline: crawl + extract + validate + stage
 */
export async function runFullPipeline(
  source: SourceConfig,
  startUrls: string[],
  options?: Partial<CrawlerOptions>
): Promise<StagedIncident[]> {
  // Run crawl
  await runCrawl(source, startUrls, options);

  // Process articles
  return processArticles(source.id);
}
