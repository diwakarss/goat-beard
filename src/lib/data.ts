import statesData from '@/../data/metadata/states.json';
import articlesData from '@/../data/metadata/articles.json';
import erasData from '@/../data/metadata/eras.json';
import precedentsData from '@/../data/metadata/precedents.json';
import governorsData from '@/../data/governors.json';
import incidentsData from '@/../data/incidents.json';

import { 
  StateMetadata, 
  ArticleMetadata, 
  EraMetadata, 
  PrecedentMetadata, 
  Governor, 
  Incident,
  VerificationStatus,
} from '@/types/schema';

// ============================================================================
// Data Cache
// ============================================================================

/**
 * Lazy-loaded cached data collections to avoid repeated type assertions.
 */
const cachedData = {
  states: null as StateMetadata[] | null,
  articles: null as ArticleMetadata[] | null,
  eras: null as EraMetadata[] | null,
  precedents: null as PrecedentMetadata[] | null,
  governors: null as Governor[] | null,
  incidents: null as Incident[] | null,
};

// ============================================================================
// Core Data Loaders
// ============================================================================

/**
 * Returns all states and union territories.
 */
export function getStates(): readonly StateMetadata[] {
  if (!cachedData.states) {
    cachedData.states = statesData as StateMetadata[];
  }
  return cachedData.states;
}

/**
 * Returns all constitutional articles.
 */
export function getArticles(): readonly ArticleMetadata[] {
  if (!cachedData.articles) {
    cachedData.articles = articlesData as ArticleMetadata[];
  }
  return cachedData.articles;
}

/**
 * Returns all historical eras.
 */
export function getEras(): readonly EraMetadata[] {
  if (!cachedData.eras) {
    cachedData.eras = erasData as EraMetadata[];
  }
  return cachedData.eras;
}

/**
 * Returns all constitutional precedents.
 */
export function getPrecedents(): readonly PrecedentMetadata[] {
  if (!cachedData.precedents) {
    cachedData.precedents = precedentsData as PrecedentMetadata[];
  }
  return cachedData.precedents;
}

/**
 * Returns all governors.
 */
export function getGovernors(): readonly Governor[] {
  if (!cachedData.governors) {
    cachedData.governors = governorsData as Governor[];
  }
  return cachedData.governors;
}

/**
 * Returns all incidents.
 */
export function getIncidents(): readonly Incident[] {
  if (!cachedData.incidents) {
    cachedData.incidents = incidentsData as Incident[];
  }
  return cachedData.incidents;
}

// ============================================================================
// Lookup Utilities
// ============================================================================

/**
 * Finds a state by its code.
 */
export function getStateByCode(code: string): StateMetadata | undefined {
  return getStates().find(state => state.code === code);
}

/**
 * Finds an article by its number.
 */
export function getArticleByNumber(number: number): ArticleMetadata | undefined {
  return getArticles().find(article => article.number === number);
}

/**
 * Finds an era by its ID.
 */
export function getEraById(id: string): EraMetadata | undefined {
  return getEras().find(era => era.id === id);
}

/**
 * Finds a precedent by its ID.
 */
export function getPrecedentById(id: string): PrecedentMetadata | undefined {
  return getPrecedents().find(precedent => precedent.id === id);
}

/**
 * Finds a governor by their ID.
 */
export function getGovernorById(id: string): Governor | undefined {
  return getGovernors().find(governor => governor.id === id);
}

/**
 * Finds an incident by its ID.
 */
export function getIncidentById(id: string): Incident | undefined {
  return getIncidents().find(incident => incident.id === id);
}

// ============================================================================
// Filtering Utilities
// ============================================================================

/**
 * Returns states or union territories by type.
 */
export function getStatesByUT(isUT: boolean): readonly StateMetadata[] {
  return getStates().filter(state => state.ut === isUT);
}

/**
 * Returns all incidents occurring in a specific state.
 */
export function getIncidentsByState(stateCode: string): readonly Incident[] {
  return getIncidents().filter(incident => incident.state === stateCode);
}

/**
 * Returns all incidents associated with a specific governor.
 */
export function getIncidentsByGovernor(governorId: string): readonly Incident[] {
  return getIncidents().filter(incident => incident.governor_id === governorId);
}

/**
 * Returns all incidents from a specific historical era.
 */
export function getIncidentsByEra(eraId: string): readonly Incident[] {
  return getIncidents().filter(incident => incident.era === eraId);
}

/**
 * Returns incidents filtered by verification status.
 */
export function getIncidentsByVerificationStatus(
  status: VerificationStatus
): readonly Incident[] {
  return getIncidents().filter(incident => incident.verification_status === status);
}

/**
 * Returns all governors serving in a specific state.
 */
export function getGovernorsByState(stateCode: string): readonly Governor[] {
  return getGovernors().filter(governor => governor.state === stateCode);
}

// ============================================================================
// Aggregation Utilities
// ============================================================================

/**
 * Returns a map of incident counts by state code.
 */
export function getIncidentCountByState(): Map<string, number> {
  const counts = new Map<string, number>();
  getIncidents().forEach(incident => {
    const current = counts.get(incident.state) || 0;
    counts.set(incident.state, current + 1);
  });
  return counts;
}

/**
 * Returns a map of incident counts by governor ID.
 */
export function getIncidentCountByGovernor(): Map<string, number> {
  const counts = new Map<string, number>();
  getIncidents().forEach(incident => {
    const current = counts.get(incident.governor_id) || 0;
    counts.set(incident.governor_id, current + 1);
  });
  return counts;
}

/**
 * Returns a map of average severity scores by state code.
 */
export function getAverageSeverityByState(): Map<string, number> {
  const stateIncidents = new Map<string, Incident[]>();

  getIncidents().forEach(incident => {
    const incidents = stateIncidents.get(incident.state) || [];
    incidents.push(incident);
    stateIncidents.set(incident.state, incidents);
  });

  const averages = new Map<string, number>();
  stateIncidents.forEach((incidents, stateCode) => {
    const avgScore =
      incidents.reduce((sum, inc) => sum + inc.severity_unified, 0) /
      incidents.length;
    averages.set(stateCode, avgScore);
  });

  return averages;
}
