#!/usr/bin/env npx tsx
/**
 * HQ-based extraction script
 *
 * This script processes crawled articles through Claude Code (your subscription)
 * instead of the API. Run this after crawling to extract incidents.
 *
 * Usage:
 *   npx tsx scripts/extract-hq.ts --list              # List pending extraction files
 *   npx tsx scripts/extract-hq.ts --process <file>    # Process a specific file
 *   npx tsx scripts/extract-hq.ts --import <file>     # Import completed extractions
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  loadManualExtractionResults,
  parseExtractionResponse,
  createExtractedIncident,
} from '../scraper/extractor';
import { validateAndEnrich } from '../scraper/validator';
import { appendToStaging } from '../scraper/staging';
import type { ParsedArticle } from '../scraper/types';

const QUEUE_DIR = './data/extraction-queue';

interface ExtractionItem {
  id: string;
  article: ParsedArticle;
  prompt: string;
  status: 'pending' | 'complete' | 'skipped';
  response?: string;
}

function listPendingFiles() {
  if (!fs.existsSync(QUEUE_DIR)) {
    console.log('No extraction queue directory found.');
    return;
  }

  const files = fs.readdirSync(QUEUE_DIR).filter((f) => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('No pending extraction files.');
    return;
  }

  console.log('\nPending extraction files:\n');

  for (const file of files) {
    const filepath = path.join(QUEUE_DIR, file);
    const data: ExtractionItem[] = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const pending = data.filter((i) => i.status === 'pending').length;
    const complete = data.filter((i) => i.status === 'complete').length;

    console.log(`  ${file}`);
    console.log(`    Total: ${data.length} | Pending: ${pending} | Complete: ${complete}\n`);
  }
}

function showArticle(item: ExtractionItem) {
  console.log(`
================================================================================
Article ID: ${item.id}
================================================================================
Title: ${item.article.title}
URL: ${item.article.url}
Date: ${item.article.date || 'Unknown'}
Outlet: ${item.article.outlet}

Content (first 1000 chars):
${item.article.content.slice(0, 1000)}...

================================================================================
EXTRACTION PROMPT (copy this for Claude Code processing):
================================================================================
${item.prompt}
================================================================================
`);
}

async function processFile(filename: string) {
  const filepath = path.join(QUEUE_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    process.exit(1);
  }

  const data: ExtractionItem[] = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  const pending = data.filter((i) => i.status === 'pending');

  if (pending.length === 0) {
    console.log('No pending articles in this file.');
    return;
  }

  console.log(`\nProcessing ${pending.length} pending article(s)...\n`);
  console.log('For each article, copy the prompt to Claude Code and paste the JSON response.\n');
  console.log('Enter "skip" to skip an article, "quit" to save and exit.\n');

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  for (const item of pending) {
    showArticle(item);

    const response = await question('Paste JSON response (or "skip"/"quit"): ');

    if (response.toLowerCase() === 'quit') {
      console.log('Saving progress and exiting...');
      break;
    }

    if (response.toLowerCase() === 'skip') {
      item.status = 'skipped';
      console.log('Skipped.\n');
      continue;
    }

    // Try to parse the response
    try {
      JSON.parse(response);
      item.response = response;
      item.status = 'complete';
      console.log('Saved extraction.\n');
    } catch {
      console.log('Invalid JSON. Try again or type "skip".');
    }
  }

  rl.close();

  // Save updated file
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`\nSaved to: ${filepath}`);

  const complete = data.filter((i) => i.status === 'complete').length;
  console.log(`Complete: ${complete}/${data.length}`);
}

function importFile(filename: string) {
  const filepath = path.join(QUEUE_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`File not found: ${filepath}`);
    process.exit(1);
  }

  console.log(`Importing extractions from: ${filepath}`);

  const data: ExtractionItem[] = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  const complete = data.filter((i) => i.status === 'complete' && i.response);

  console.log(`Found ${complete.length} complete extraction(s)`);

  let imported = 0;
  const staged = [];

  for (const item of complete) {
    const raw = parseExtractionResponse(item.response!, item.article);
    if (!raw) {
      console.log(`  Skipped (no incident): ${item.article.title}`);
      continue;
    }

    const extracted = createExtractedIncident(
      raw,
      item.article,
      item.article.outlet.toLowerCase().replace(/\s+/g, '')
    );

    const validated = validateAndEnrich(extracted);
    if (validated) {
      staged.push(validated);
      imported++;
      console.log(`  Imported: ${validated.title}`);
    }
  }

  if (staged.length > 0) {
    const added = appendToStaging(staged);
    console.log(`\nAdded ${added} new incident(s) to staging`);
  }

  console.log(`\nImport complete: ${imported} incident(s) processed`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: npx tsx scripts/extract-hq.ts [command]

Commands:
  --list              List pending extraction files
  --process <file>    Interactive extraction for a file
  --import <file>     Import completed extractions to staging

Workflow:
  1. Run crawl: npm run crawl thehindu
  2. List files: npx tsx scripts/extract-hq.ts --list
  3. Process:    npx tsx scripts/extract-hq.ts --process thehindu-2026-03-12.json
  4. Import:     npx tsx scripts/extract-hq.ts --import thehindu-2026-03-12.json
  5. Review:     npm run merge -- --list
`);
    return;
  }

  switch (args[0]) {
    case '--list':
      listPendingFiles();
      break;
    case '--process':
      if (!args[1]) {
        console.error('Please provide a filename');
        process.exit(1);
      }
      await processFile(args[1]);
      break;
    case '--import':
      if (!args[1]) {
        console.error('Please provide a filename');
        process.exit(1);
      }
      importFile(args[1]);
      break;
    default:
      console.error(`Unknown command: ${args[0]}`);
      process.exit(1);
  }
}

main();
