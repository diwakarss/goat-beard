#!/usr/bin/env npx tsx
/**
 * CLI script to run a crawl
 *
 * Usage:
 *   npx tsx scripts/crawl.ts thehindu
 *   npx tsx scripts/crawl.ts thehindu --max-requests 20
 *   npx tsx scripts/crawl.ts thehindu --url "https://www.thehindu.com/news/national/"
 */

import { runFullPipeline, getSourceById, sources } from '../scraper';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: npx tsx scripts/crawl.ts <source-id> [options]

Available sources:
${sources.map((s) => `  - ${s.id}: ${s.name}`).join('\n')}

Options:
  --url <url>          Start URL (defaults to source base URL)
  --max-requests <n>   Maximum requests (default: 50)
  --headful            Run browser in visible mode
  --help               Show this help

Examples:
  npx tsx scripts/crawl.ts thehindu
  npx tsx scripts/crawl.ts thehindu --url "https://www.thehindu.com/news/national/?page=1"
  npx tsx scripts/crawl.ts indianexpress --max-requests 20
`);
    process.exit(0);
  }

  const sourceId = args[0];
  const source = getSourceById(sourceId);

  if (!source) {
    console.error(`Unknown source: ${sourceId}`);
    console.error(`Available: ${sources.map((s) => s.id).join(', ')}`);
    process.exit(1);
  }

  // Parse options
  let startUrl = `${source.baseUrl}/news/national/`;
  let maxRequests = 50;
  let headless = true;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      startUrl = args[++i];
    } else if (args[i] === '--max-requests' && args[i + 1]) {
      maxRequests = parseInt(args[++i], 10);
    } else if (args[i] === '--headful') {
      headless = false;
    }
  }

  console.log(`
===================================
Goat Beard Scraper
===================================
Source: ${source.name}
Start URL: ${startUrl}
Max Requests: ${maxRequests}
Headless: ${headless}
===================================
`);

  try {
    const results = await runFullPipeline(source, [startUrl], {
      maxRequests,
      headless,
    });

    console.log(`
===================================
Crawl Complete
===================================
Incidents found: ${results.length}
Needs review: ${results.filter((r) => r._meta.needs_review).length}
Ready to merge: ${results.filter((r) => !r._meta.needs_review).length}
===================================
`);
  } catch (error) {
    console.error('Crawl failed:', error);
    process.exit(1);
  }
}

main();
