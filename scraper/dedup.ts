/**
 * Incident deduplication logic
 */

import type { StagedIncident } from './types';

// Date tolerance for matching (days)
const DATE_TOLERANCE_DAYS = 7;

/**
 * Generate a dedup key for an incident
 */
function getDedupKey(incident: StagedIncident): string {
  return `${incident.governor_id}|${incident.state}|${incident.transgression_type}`;
}

/**
 * Check if two dates are within tolerance
 */
function datesMatch(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffDays = Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= DATE_TOLERANCE_DAYS;
}

/**
 * Merge two incidents, keeping the highest quality data
 */
function mergeIncidents(existing: StagedIncident, incoming: StagedIncident): StagedIncident {
  // Combine sources
  const allSources = [...existing.sources, ...incoming.sources];

  // Deduplicate sources by URL
  const uniqueSources = allSources.filter(
    (source, index, self) => index === self.findIndex((s) => s.url === source.url)
  );

  // Keep the one with higher confidence
  const base =
    existing._meta.extraction_confidence >= incoming._meta.extraction_confidence
      ? existing
      : incoming;

  return {
    ...base,
    sources: uniqueSources,
    _meta: {
      ...base._meta,
      // Average the confidences
      extraction_confidence:
        (existing._meta.extraction_confidence + incoming._meta.extraction_confidence) / 2,
    },
  };
}

/**
 * Deduplicate a list of staged incidents
 */
export function deduplicateIncidents(incidents: StagedIncident[]): StagedIncident[] {
  const dedupMap = new Map<string, StagedIncident[]>();

  // Group by dedup key
  for (const incident of incidents) {
    const key = getDedupKey(incident);
    const existing = dedupMap.get(key) || [];
    dedupMap.set(key, [...existing, incident]);
  }

  const results: StagedIncident[] = [];

  // Process each group
  for (const [_key, group] of dedupMap) {
    if (group.length === 1) {
      results.push(group[0]);
      continue;
    }

    // Find incidents that match by date
    const processed = new Set<number>();

    for (let i = 0; i < group.length; i++) {
      if (processed.has(i)) continue;

      let merged = group[i];
      processed.add(i);

      for (let j = i + 1; j < group.length; j++) {
        if (processed.has(j)) continue;

        if (datesMatch(merged.date_start, group[j].date_start)) {
          merged = mergeIncidents(merged, group[j]);
          processed.add(j);
          console.log(`Merged duplicate: ${merged.title}`);
        }
      }

      results.push(merged);
    }
  }

  return results;
}

/**
 * Check if an incident already exists in a list
 */
export function isDuplicate(
  incident: StagedIncident,
  existingIncidents: StagedIncident[]
): boolean {
  const key = getDedupKey(incident);

  for (const existing of existingIncidents) {
    if (getDedupKey(existing) === key && datesMatch(incident.date_start, existing.date_start)) {
      return true;
    }
  }

  return false;
}
