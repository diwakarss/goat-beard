#!/usr/bin/env npx tsx
/**
 * Import archive crawl results into incidents.json
 *
 * Usage:
 *   npx tsx scripts/import-archive-sources.ts --list       List available results
 *   npx tsx scripts/import-archive-sources.ts --import     Import all results
 *   npx tsx scripts/import-archive-sources.ts --import-one inc-014
 */

import * as fs from 'fs';
import * as path from 'path';

const INCIDENTS_FILE = './data/incidents.json';
const ARCHIVE_RESULTS_DIR = './data/archive-results';

interface ArchiveResult {
  incidentId: string;
  source: string;
  url: string;
  title: string;
  content: string;
  dateFound: string;
  relevanceScore: number;
}

interface Source {
  url: string;
  outlet: string;
  date_published?: string;
  tier: 'primary' | 'secondary' | 'archive';
  credibility_score: number;
}

interface Incident {
  id: string;
  sources: Source[];
  verification_status: string;
  [key: string]: unknown;
}

function loadIncidents(): Incident[] {
  return JSON.parse(fs.readFileSync(INCIDENTS_FILE, 'utf-8'));
}

function saveIncidents(incidents: Incident[]): void {
  fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(incidents, null, 2));
}

function loadArchiveResults(incidentId: string): ArchiveResult[] {
  const filepath = path.join(ARCHIVE_RESULTS_DIR, `${incidentId}.json`);
  if (!fs.existsSync(filepath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function listAvailableResults(): string[] {
  if (!fs.existsSync(ARCHIVE_RESULTS_DIR)) {
    return [];
  }
  return fs.readdirSync(ARCHIVE_RESULTS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function convertToSource(result: ArchiveResult): Source {
  // Determine outlet from URL
  let outlet = 'Archive';
  if (result.source === 'scobserver') {
    outlet = 'Supreme Court Observer';
  } else if (result.url.includes('thehindu.com')) {
    outlet = 'The Hindu (Archive)';
  } else if (result.url.includes('indianexpress.com')) {
    outlet = 'Indian Express (Archive)';
  } else if (result.url.includes('timesofindia')) {
    outlet = 'Times of India (Archive)';
  } else if (result.url.includes('web.archive.org')) {
    outlet = 'Wayback Machine';
  }

  // Credibility based on source type
  const credibility = result.source === 'scobserver' ? 0.95 :
    result.source === 'wayback' ? 0.85 : 0.75;

  return {
    url: result.url,
    outlet,
    tier: result.source === 'scobserver' ? 'primary' : 'archive',
    credibility_score: credibility * result.relevanceScore,
  };
}

function importSourcesForIncident(
  incident: Incident,
  results: ArchiveResult[]
): { added: number; updated: boolean } {
  const existingUrls = new Set(incident.sources.map(s => s.url));
  let added = 0;

  for (const result of results) {
    if (!existingUrls.has(result.url)) {
      const source = convertToSource(result);
      incident.sources.push(source);
      existingUrls.add(result.url);
      added++;
    }
  }

  // Update verification status if we added sources
  if (added > 0 && incident.verification_status === 'needs_verification') {
    incident.verification_status = 'partially_verified';
    return { added, updated: true };
  }

  return { added, updated: false };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Import Archive Sources

Usage:
  npx tsx scripts/import-archive-sources.ts --list         List available results
  npx tsx scripts/import-archive-sources.ts --import       Import all results
  npx tsx scripts/import-archive-sources.ts --import-one <incident-id>
`);
    return;
  }

  if (args[0] === '--list') {
    const available = listAvailableResults();
    if (available.length === 0) {
      console.log('\nNo archive results found. Run crawl-archives.ts first.');
      return;
    }
    console.log(`\nAvailable archive results (${available.length}):\n`);
    for (const id of available) {
      const results = loadArchiveResults(id);
      console.log(`  ${id}: ${results.length} sources found`);
    }
    return;
  }

  const incidents = loadIncidents();
  let totalAdded = 0;
  let totalUpdated = 0;

  if (args[0] === '--import-one' && args[1]) {
    const incidentId = args[1];
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) {
      console.error(`Incident not found: ${incidentId}`);
      process.exit(1);
    }

    const results = loadArchiveResults(incidentId);
    if (results.length === 0) {
      console.log(`No archive results for ${incidentId}`);
      return;
    }

    const { added, updated } = importSourcesForIncident(incident, results);
    console.log(`\n${incidentId}: Added ${added} sources`);

    if (added > 0) {
      saveIncidents(incidents);
      console.log('Saved changes to incidents.json');
    }
    return;
  }

  if (args[0] === '--import') {
    const available = listAvailableResults();
    console.log(`\nImporting from ${available.length} result files...\n`);

    for (const incidentId of available) {
      const incident = incidents.find(i => i.id === incidentId);
      if (!incident) {
        console.log(`  ${incidentId}: Incident not found, skipping`);
        continue;
      }

      const results = loadArchiveResults(incidentId);
      const { added, updated } = importSourcesForIncident(incident, results);

      if (added > 0) {
        console.log(`  ${incidentId}: +${added} sources${updated ? ' (status updated)' : ''}`);
        totalAdded += added;
        if (updated) totalUpdated++;
      } else {
        console.log(`  ${incidentId}: No new sources`);
      }
    }

    if (totalAdded > 0) {
      saveIncidents(incidents);
      console.log(`\nTotal: ${totalAdded} sources added, ${totalUpdated} incidents updated`);
      console.log('Saved to incidents.json');
    }
    return;
  }

  console.log('Unknown command. Run with --help for usage.');
}

main().catch(console.error);
