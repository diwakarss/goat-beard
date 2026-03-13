/**
 * Scraper configuration for news archive sources
 */

export interface SourceConfig {
  id: string;
  name: string;
  baseUrl: string;
  archivePattern: string;
  articleSelector: string;
  contentSelector: string;
  titleSelector: string;
  dateSelector: string;
  maxPagesPerCrawl: number;
  rateLimit: number; // requests per second
}

export const sources: SourceConfig[] = [
  {
    id: 'thehindu',
    name: 'The Hindu',
    baseUrl: 'https://www.thehindu.com',
    archivePattern: '/news/national/*/article*.ece',
    articleSelector: 'a[href*="/article"]',
    contentSelector: 'article .articlebodycontent, .article-body',
    titleSelector: 'h1.title, h1',
    dateSelector: '.publish-time, time[datetime]',
    maxPagesPerCrawl: 100,
    rateLimit: 1,
  },
  {
    id: 'indianexpress',
    name: 'Indian Express',
    baseUrl: 'https://indianexpress.com',
    archivePattern: '/article/*',
    articleSelector: 'a[href*="/article/"]',
    contentSelector: '.full-details, .story_details',
    titleSelector: 'h1',
    dateSelector: '.date, time',
    maxPagesPerCrawl: 100,
    rateLimit: 1,
  },
  {
    id: 'deccanchronicle',
    name: 'Deccan Chronicle',
    baseUrl: 'https://www.deccanchronicle.com',
    archivePattern: '/nation/*',
    articleSelector: 'a[href*="/nation/"]',
    contentSelector: '.story-content, .article-content',
    titleSelector: 'h1',
    dateSelector: '.date-time, time',
    maxPagesPerCrawl: 100,
    rateLimit: 1,
  },
];

export function getSourceById(id: string): SourceConfig | undefined {
  return sources.find((s) => s.id === id);
}

// Search terms for finding gubernatorial incidents
export const searchTerms = [
  'governor bill assent',
  'governor withheld',
  'governor delay bill',
  'raj bhavan bill',
  'governor article 356',
  'governor dissolution assembly',
  'governor overreach',
  'governor constitutional',
  'governor state legislature',
];

// Keywords that indicate a gubernatorial incident
export const incidentKeywords = [
  'governor',
  'raj bhavan',
  'assent',
  'withheld',
  'pending bill',
  'article 163',
  'article 200',
  'article 356',
  'dissolution',
  'prorogation',
];
