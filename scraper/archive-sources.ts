/**
 * Archive source configurations for historical data collection
 *
 * Supports:
 * - Wayback Machine (web.archive.org)
 * - SCObserver (Supreme Court cases)
 * - Google News Archive (news.google.com/newspapers)
 * - PRS Legislative Research
 */

export interface ArchiveSource {
  id: string;
  name: string;
  type: 'wayback' | 'scobserver' | 'prs' | 'google_news' | 'direct';
  baseUrl: string;
  apiUrl?: string;
  contentSelector: string;
  dateSelector: string;
  rateLimit: number; // requests per minute
}

export const archiveSources: ArchiveSource[] = [
  {
    id: 'wayback',
    name: 'Wayback Machine',
    type: 'wayback',
    baseUrl: 'https://web.archive.org',
    apiUrl: 'https://archive.org/wayback/available',
    contentSelector: '#maincontent, .article-content, article',
    dateSelector: 'time, .date, .publish-time',
    rateLimit: 15, // Be respectful to archive.org
  },
  {
    id: 'scobserver',
    name: 'Supreme Court Observer',
    type: 'scobserver',
    baseUrl: 'https://www.scobserver.in',
    contentSelector: '.entry-content, .case-content, article',
    dateSelector: 'time, .date',
    rateLimit: 30,
  },
  {
    id: 'prs',
    name: 'PRS Legislative Research',
    type: 'prs',
    baseUrl: 'https://prsindia.org',
    contentSelector: '.content, article, .main-content',
    dateSelector: '.date, time',
    rateLimit: 30,
  },
  {
    id: 'google_news_archive',
    name: 'Google News Archive',
    type: 'google_news',
    baseUrl: 'https://news.google.com/newspapers',
    contentSelector: '.article-text',
    dateSelector: '.date',
    rateLimit: 10,
  },
];

// Keywords to search in archives for each era
export const archiveSearchTerms: Record<string, string[]> = {
  pre_1975: [
    'President rule Punjab 1951',
    'Kerala communist government dismissal 1959',
    'EMS Namboodiripad dismissal',
    'Article 356 1950s 1960s',
    'governor assembly dissolution India',
  ],
  emergency: [
    'Emergency 1975 state governments dismissed',
    'Tamil Nadu DMK dismissal 1976',
    'Article 356 Emergency India',
    'Indira Gandhi state governments',
  ],
  post_emergency: [
    'Janata Party state governments dismissed 1977',
    'Congress governments dismissed 1980',
    'Article 356 abuse 1980s',
  ],
  pre_1991: [
    'SR Bommai Karnataka dismissal 1989',
    'Punjab governors rule 1987',
    'Kashmir governors rule 1990',
    'Jagmohan governor Kashmir',
    'Article 356 1980s India',
  ],
  post_1991: [
    'Babri Masjid BJP governments dismissed',
    'Bihar Rabri Devi governor 1999',
    'Article 356 post Bommai judgment',
  ],
  post_2000: [
    'Karnataka governor coalition 2007 2008',
    'Jharkhand President rule 2005',
    'governor state legislature conflict',
  ],
  post_2014: [
    'Arunachal Pradesh governor 2016',
    'Uttarakhand President rule 2016',
    'Karnataka governor BJP 2018',
    'Maharashtra governor 2019',
    'Tamil Nadu governor RN Ravi',
    'Kerala governor Arif Mohammad Khan',
    'Punjab governor bills',
    'West Bengal governor Jagdeep Dhankhar',
  ],
};

// Map historical incidents to search queries for finding primary sources
export interface IncidentSearchQuery {
  incidentId: string;
  queries: string[];
  dateRange: { start: string; end: string };
  targetSources: string[]; // source IDs
}

export function generateSearchQueries(
  incidentId: string,
  title: string,
  dateStart: string,
  dateEnd: string | null,
  state: string,
  governorName?: string
): IncidentSearchQuery {
  const queries: string[] = [];
  const year = dateStart.split('-')[0];

  // Base query from title
  queries.push(title);

  // State-specific queries
  const stateNames: Record<string, string> = {
    PB: 'Punjab',
    KL: 'Kerala',
    TN: 'Tamil Nadu',
    KA: 'Karnataka',
    MH: 'Maharashtra',
    WB: 'West Bengal',
    JK: 'Jammu Kashmir',
    UK: 'Uttarakhand',
    AR: 'Arunachal Pradesh',
    RJ: 'Rajasthan',
    BR: 'Bihar',
    UP: 'Uttar Pradesh',
    MP: 'Madhya Pradesh',
    TS: 'Telangana',
    AP: 'Andhra Pradesh',
  };

  const stateName = stateNames[state] || state;

  queries.push(`${stateName} governor ${year}`);
  queries.push(`${stateName} President rule ${year}`);
  queries.push(`Article 356 ${stateName} ${year}`);

  if (governorName) {
    queries.push(`Governor ${governorName} ${stateName}`);
  }

  // Determine target sources based on era
  const targetSources: string[] = ['scobserver']; // Always include SC Observer for legal context

  const yearNum = parseInt(year, 10);
  if (yearNum < 2000) {
    targetSources.push('wayback'); // Historical news via Wayback
    targetSources.push('google_news_archive'); // Old newspapers
  } else {
    targetSources.push('wayback'); // Can still use Wayback for 2000s
  }

  targetSources.push('prs'); // PRS has legislative context

  return {
    incidentId,
    queries,
    dateRange: {
      start: dateStart,
      end: dateEnd || new Date().toISOString().split('T')[0],
    },
    targetSources,
  };
}
