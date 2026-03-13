/**
 * Staging file management
 */

import * as fs from 'fs';
import * as path from 'path';
import type { StagedIncident } from './types';
import type { Incident } from '../src/types/schema';
import { isDuplicate } from './dedup';

const STAGING_FILE = path.join(process.cwd(), 'data', 'incidents_staged.json');
const PRODUCTION_FILE = path.join(process.cwd(), 'data', 'incidents.json');

/**
 * Load staged incidents from file
 */
export function loadStagedIncidents(): StagedIncident[] {
  if (!fs.existsSync(STAGING_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(STAGING_FILE, 'utf-8');
    return JSON.parse(data) as StagedIncident[];
  } catch {
    return [];
  }
}

/**
 * Save staged incidents to file
 */
export function saveStagedIncidents(incidents: StagedIncident[]): void {
  const data = JSON.stringify(incidents, null, 2);
  fs.writeFileSync(STAGING_FILE, data, 'utf-8');
  console.log(`Saved ${incidents.length} incidents to staging`);
}

/**
 * Append new incidents to staging file
 * Skips duplicates
 */
export function appendToStaging(newIncidents: StagedIncident[]): number {
  const existing = loadStagedIncidents();

  let added = 0;
  for (const incident of newIncidents) {
    if (!isDuplicate(incident, existing)) {
      existing.push(incident);
      added++;
    }
  }

  if (added > 0) {
    saveStagedIncidents(existing);
  }

  return added;
}

/**
 * Load production incidents
 */
export function loadProductionIncidents(): Incident[] {
  if (!fs.existsSync(PRODUCTION_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(PRODUCTION_FILE, 'utf-8');
    return JSON.parse(data) as Incident[];
  } catch {
    return [];
  }
}

/**
 * Save production incidents
 */
export function saveProductionIncidents(incidents: Incident[]): void {
  const data = JSON.stringify(incidents, null, 2);
  fs.writeFileSync(PRODUCTION_FILE, data, 'utf-8');
  console.log(`Saved ${incidents.length} incidents to production`);
}

/**
 * Get staging summary
 */
export function getStagingSummary(): {
  total: number;
  needsReview: number;
  readyToMerge: number;
  bySource: Record<string, number>;
} {
  const staged = loadStagedIncidents();

  const needsReview = staged.filter((i) => i._meta.needs_review).length;
  const readyToMerge = staged.length - needsReview;

  const bySource: Record<string, number> = {};
  for (const incident of staged) {
    const source = incident._meta.source_url.includes('thehindu')
      ? 'The Hindu'
      : incident._meta.source_url.includes('indianexpress')
        ? 'Indian Express'
        : 'Other';
    bySource[source] = (bySource[source] || 0) + 1;
  }

  return {
    total: staged.length,
    needsReview,
    readyToMerge,
    bySource,
  };
}
