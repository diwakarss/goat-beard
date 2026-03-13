/**
 * LLM-assisted extraction of incident data from articles
 *
 * Supports two modes:
 * 1. HQ/Manual mode: saves articles for Claude Code to process inline
 * 2. API mode: uses Anthropic SDK (requires ANTHROPIC_API_KEY)
 */

import type { RawExtraction, ParsedArticle, CrawlMetadata, ExtractedIncident } from './types';
import * as fs from 'fs';
import * as path from 'path';

export const EXTRACTION_PROMPT = `You are extracting structured data about gubernatorial incidents in India from news articles.

Given this news article, extract the following fields in JSON format. If a field cannot be determined from the article, use null.

Fields to extract:
- title: string (short headline for the incident, max 10 words)
- governor_name: string (full name of the governor involved)
- state: string (full state name, not abbreviation)
- transgression_type: one of ["withholding_assent", "delay", "overreach", "dissolution", "failure_to_countersign", "other"]
- date_start: string (YYYY-MM-DD format, when the incident began)
- date_end: string or null (YYYY-MM-DD format, when resolved, or null if ongoing)
- bill_name: string or null (name of the bill if applicable)
- constitutional_articles: number[] (article numbers mentioned, e.g., [163, 200])
- escalation_level: number (1-4 where:
    1 = procedural delay (< 30 days)
    2 = extended delay or soft refusal (30-90 days)
    3 = active obstruction or constitutional overreach
    4 = Article 356 invocation or assembly dissolution)
- description: string (2-3 sentences summarizing the incident)
- extraction_confidence: number (0-1, your confidence in the extraction accuracy)

IMPORTANT:
- Only extract if this is clearly about a gubernatorial incident (governor withholding assent, delaying bills, overstepping bounds, etc.)
- If the article is not about a gubernatorial incident, return {"not_incident": true}
- Use exact names and dates from the article
- For escalation_level, default to 2 if unclear

Respond with ONLY valid JSON, no explanation.`;

/**
 * Build extraction prompt for an article
 */
export function buildExtractionPrompt(article: ParsedArticle): string {
  const articleText = `Title: ${article.title}\n\nContent:\n${article.content}`;
  return `${EXTRACTION_PROMPT}\n\n---\n\n${articleText}`;
}

/**
 * Parse LLM response into RawExtraction
 */
export function parseExtractionResponse(
  response: string,
  article: ParsedArticle
): RawExtraction | null {
  try {
    const parsed = JSON.parse(response);

    // Check if it's not an incident
    if (parsed.not_incident) {
      return null;
    }

    // Validate required fields
    if (!parsed.governor_name || !parsed.state || !parsed.transgression_type) {
      console.warn(`Incomplete extraction for: ${article.url}`);
      return null;
    }

    return {
      title: parsed.title || article.title.slice(0, 100),
      governor_name: parsed.governor_name,
      state: parsed.state,
      transgression_type: parsed.transgression_type,
      date_start: parsed.date_start || article.date || new Date().toISOString().split('T')[0],
      date_end: parsed.date_end || null,
      bill_name: parsed.bill_name || null,
      constitutional_articles: parsed.constitutional_articles || [],
      escalation_level: parsed.escalation_level || 2,
      description: parsed.description || '',
      extraction_confidence: parsed.extraction_confidence || 0.5,
    };
  } catch (error) {
    console.error(`Failed to parse extraction response:`, error);
    return null;
  }
}

/**
 * Create ExtractedIncident from raw extraction and article
 */
export function createExtractedIncident(
  raw: RawExtraction,
  article: ParsedArticle,
  sourceId: string
): ExtractedIncident {
  const meta: CrawlMetadata = {
    source_url: article.url,
    source_id: sourceId,
    outlet: article.outlet,
    crawled_at: new Date().toISOString(),
    article_date: article.date,
    article_title: article.title,
  };

  return { raw, meta };
}

/**
 * Save articles for manual/HQ extraction
 * Creates a batch file that can be processed by Claude Code
 */
export function saveForManualExtraction(
  articles: ParsedArticle[],
  sourceId: string,
  outputDir: string = './data/extraction-queue'
): string {
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${sourceId}-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  const batch = articles.map((article, index) => ({
    id: `${sourceId}-${timestamp}-${index}`,
    article,
    prompt: buildExtractionPrompt(article),
    status: 'pending',
  }));

  fs.writeFileSync(filepath, JSON.stringify(batch, null, 2));
  console.log(`Saved ${articles.length} articles for extraction to: ${filepath}`);

  return filepath;
}

/**
 * Load extraction results from manual processing
 */
export function loadManualExtractionResults(filepath: string): ExtractedIncident[] {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  const results: ExtractedIncident[] = [];

  for (const item of data) {
    if (item.status === 'complete' && item.response) {
      const raw = parseExtractionResponse(item.response, item.article);
      if (raw) {
        results.push(createExtractedIncident(raw, item.article, item.article.sourceId || 'manual'));
      }
    }
  }

  return results;
}

/**
 * Extract incident data from a parsed article using Claude API
 * Falls back to manual mode if no API key
 */
export async function extractIncident(
  article: ParsedArticle,
  sourceId: string
): Promise<ExtractedIncident | null> {
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('No ANTHROPIC_API_KEY - use saveForManualExtraction() for HQ processing');
    return null;
  }

  try {
    // Dynamic import to avoid loading SDK when not needed
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: buildExtractionPrompt(article),
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const raw = parseExtractionResponse(text, article);

    if (!raw) {
      return null;
    }

    return createExtractedIncident(raw, article, sourceId);
  } catch (error) {
    console.error(`Extraction failed for: ${article.url}`, error);
    return null;
  }
}

/**
 * Batch extract incidents from multiple articles
 */
export async function extractBatch(
  articles: ParsedArticle[],
  sourceId: string,
  concurrency: number = 3
): Promise<ExtractedIncident[]> {
  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('No API key - saving for manual extraction');
    saveForManualExtraction(articles, sourceId);
    return [];
  }

  const results: ExtractedIncident[] = [];

  // Process in batches to respect rate limits
  for (let i = 0; i < articles.length; i += concurrency) {
    const batch = articles.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((article) => extractIncident(article, sourceId))
    );

    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }

    // Small delay between batches
    if (i + concurrency < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
