/**
 * HTML parser for extracting article content
 */

import type { Page } from 'playwright';
import type { ParsedArticle } from './types';
import type { SourceConfig } from './config';
import { incidentKeywords } from './config';

/**
 * Extract article content from a page using source-specific selectors
 */
export async function parseArticle(
  page: Page,
  source: SourceConfig
): Promise<ParsedArticle | null> {
  const url = page.url();

  try {
    // Extract title
    const title = await page
      .$eval(source.titleSelector, (el) => el.textContent?.trim() || '')
      .catch(() => '');

    if (!title) {
      return null;
    }

    // Extract content
    const content = await page
      .$eval(source.contentSelector, (el) => el.textContent?.trim() || '')
      .catch(() => '');

    if (!content || content.length < 100) {
      return null;
    }

    // Extract date
    const date = await extractDate(page, source.dateSelector);

    return {
      url,
      title,
      content,
      date,
      outlet: source.name,
    };
  } catch (error) {
    console.error(`Failed to parse article: ${url}`, error);
    return null;
  }
}

/**
 * Extract and normalize date from various formats
 */
async function extractDate(
  page: Page,
  selector: string
): Promise<string | null> {
  try {
    // Try datetime attribute first
    const datetime = await page
      .$eval(selector, (el) => el.getAttribute('datetime'))
      .catch(() => null);

    if (datetime) {
      return normalizeDate(datetime);
    }

    // Fall back to text content
    const text = await page
      .$eval(selector, (el) => el.textContent?.trim() || '')
      .catch(() => '');

    if (text) {
      return normalizeDate(text);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Normalize various date formats to ISO 8601 (YYYY-MM-DD)
 */
function normalizeDate(input: string): string | null {
  // Try ISO format first
  const isoMatch = input.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return isoMatch[0];
  }

  // Try common Indian formats: "January 15, 2024" or "15 January 2024"
  const months: Record<string, string> = {
    january: '01',
    february: '02',
    march: '03',
    april: '04',
    may: '05',
    june: '06',
    july: '07',
    august: '08',
    september: '09',
    october: '10',
    november: '11',
    december: '12',
  };

  const cleanInput = input.toLowerCase();
  for (const [month, num] of Object.entries(months)) {
    if (cleanInput.includes(month)) {
      const dayMatch = cleanInput.match(/(\d{1,2})/);
      const yearMatch = cleanInput.match(/(\d{4})/);
      if (dayMatch && yearMatch) {
        const day = dayMatch[1].padStart(2, '0');
        return `${yearMatch[1]}-${num}-${day}`;
      }
    }
  }

  // Try DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = input.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    // Assume DD/MM/YYYY for Indian sources
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    return `${slashMatch[3]}-${month}-${day}`;
  }

  return null;
}

/**
 * Check if article content is likely about a gubernatorial incident
 */
export function isRelevantArticle(content: string, title: string): boolean {
  const text = `${title} ${content}`.toLowerCase();

  // Must mention governor or raj bhavan
  const hasGovernor = text.includes('governor') || text.includes('raj bhavan');
  if (!hasGovernor) {
    return false;
  }

  // Check for incident-related keywords
  const keywordCount = incidentKeywords.filter((kw) =>
    text.includes(kw.toLowerCase())
  ).length;

  // Require at least 2 keywords for relevance
  return keywordCount >= 2;
}

/**
 * Clean article content for LLM processing
 */
export function cleanContent(content: string): string {
  return (
    content
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove common noise
      .replace(/Share this article/gi, '')
      .replace(/Read more:/gi, '')
      .replace(/Also read:/gi, '')
      .replace(/Advertisement/gi, '')
      .replace(/ADVERTISEMENT/gi, '')
      .trim()
      // Truncate to reasonable length for LLM
      .slice(0, 8000)
  );
}
