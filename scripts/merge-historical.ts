#!/usr/bin/env npx tsx
/**
 * Merge historical incidents into main incidents.json
 *
 * Usage:
 *   npx tsx scripts/merge-historical.ts --preview     # Show what would be added
 *   npx tsx scripts/merge-historical.ts --merge       # Actually merge
 *   npx tsx scripts/merge-historical.ts --stats       # Show statistics by era
 */

import * as fs from 'fs';
import * as path from 'path';

const INCIDENTS_FILE = './data/incidents.json';
const HISTORICAL_FILE = './data/historical-incidents-seed.json';

interface Incident {
  id: string;
  state: string;
  date_start: string;
  date_end: string | null;
  transgression_type: string;
  title: string;
  escalation_level: number;
  era?: string;
  [key: string]: unknown;
}

function loadJSON<T>(filepath: string): T {
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

function saveJSON(filepath: string, data: unknown): void {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function getEra(dateStart: string): string {
  const year = parseInt(dateStart.split('-')[0], 10);
  if (year < 1975) return 'pre_1975';
  if (year >= 1975 && year <= 1977) return 'emergency';
  if (year > 1977 && year < 1991) return 'pre_1991';
  if (year >= 1991 && year < 2000) return 'post_1991';
  if (year >= 2000 && year < 2014) return 'post_2000';
  return 'post_2014';
}

function calculateSeverityScores(incident: Incident): Partial<Incident> {
  // Constitutional weight based on articles involved
  const constitutionalWeight = incident.transgression_type === 'dissolution' ? 2.0 :
    incident.transgression_type === 'overreach' ? 1.5 :
    incident.transgression_type === 'withholding_assent' ? 1.2 :
    incident.transgression_type === 'delay' ? 0.8 : 1.0;

  // Duration impact (normalized to 0-1)
  const durationDays = incident.duration_days as number || 30;
  const durationImpact = Math.min(1, durationDays / 365);

  // Media visibility (historical = lower, recent = higher)
  const year = parseInt(incident.date_start.split('-')[0], 10);
  const mediaVisibility = year < 1991 ? 0.3 : year < 2000 ? 0.5 : year < 2014 ? 0.7 : 0.9;

  // Calculate unified score
  const severityConstitutional = constitutionalWeight * (incident.escalation_level / 4);
  const severitySalience = mediaVisibility * 0.5 + durationImpact * 0.5;
  const severityUnified = (severityConstitutional * 0.6 + severitySalience * 0.4);

  return {
    severity_constitutional: parseFloat(severityConstitutional.toFixed(2)),
    severity_salience: parseFloat(severitySalience.toFixed(2)),
    severity_unified: parseFloat(severityUnified.toFixed(2)),
    duration_impact: parseFloat(durationImpact.toFixed(2)),
    media_visibility: parseFloat(mediaVisibility.toFixed(2)),
    era: incident.era || getEra(incident.date_start),
  };
}

function enrichIncident(incident: Incident): Incident {
  const scores = calculateSeverityScores(incident);
  return {
    ...incident,
    ...scores,
    // Add missing required fields with defaults
    bill_name: incident.bill_name || null,
    sc_precedents: incident.sc_precedents || [],
    claim_id: incident.claim_id || `claim-${incident.id}`,
    evidence_bundle_id: incident.evidence_bundle_id || `bundle-${incident.id}`,
    last_verified_at: incident.last_verified_at || new Date().toISOString().split('T')[0],
    reviewer_id: incident.reviewer_id || 'historical-import',
    contradiction_flag: incident.contradiction_flag || false,
    recency_multiplier: incident.recency_multiplier || 1.0,
    heat_multiplier: incident.heat_multiplier || 1.0,
  };
}

function showStats(incidents: Incident[]): void {
  const byEra: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byState: Record<string, number> = {};

  for (const inc of incidents) {
    const era = inc.era || getEra(inc.date_start);
    byEra[era] = (byEra[era] || 0) + 1;
    byType[inc.transgression_type] = (byType[inc.transgression_type] || 0) + 1;
    byState[inc.state] = (byState[inc.state] || 0) + 1;
  }

  console.log('\n=== Incident Statistics ===\n');

  console.log('By Era:');
  Object.entries(byEra).sort((a, b) => a[0].localeCompare(b[0])).forEach(([era, count]) => {
    console.log(`  ${era}: ${count}`);
  });

  console.log('\nBy Type:');
  Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log('\nBy State (top 10):');
  Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([state, count]) => {
    console.log(`  ${state}: ${count}`);
  });

  console.log(`\nTotal: ${incidents.length} incidents`);
}

function main(): void {
  const args = process.argv.slice(2);
  const mode = args[0] || '--preview';

  if (!fs.existsSync(HISTORICAL_FILE)) {
    console.error(`Historical incidents file not found: ${HISTORICAL_FILE}`);
    process.exit(1);
  }

  const historical: Incident[] = loadJSON(HISTORICAL_FILE);
  const existing: Incident[] = fs.existsSync(INCIDENTS_FILE) ? loadJSON(INCIDENTS_FILE) : [];

  console.log(`Existing incidents: ${existing.length}`);
  console.log(`Historical incidents to add: ${historical.length}`);

  // Find new incidents (not already in existing)
  const existingIds = new Set(existing.map(i => i.id));
  const newIncidents = historical.filter(h => !existingIds.has(h.id));

  console.log(`New incidents (not duplicates): ${newIncidents.length}`);

  if (mode === '--stats') {
    showStats([...existing, ...newIncidents]);
    return;
  }

  if (mode === '--preview') {
    console.log('\n=== Preview: New incidents to add ===\n');
    newIncidents.forEach(inc => {
      console.log(`[${inc.id}] ${inc.date_start} | ${inc.state} | ${inc.title.slice(0, 50)}...`);
    });
    console.log('\nRun with --merge to add these incidents.');
    console.log('Run with --stats to see statistics.');
    return;
  }

  if (mode === '--merge') {
    // Enrich and merge
    const enrichedNew = newIncidents.map(enrichIncident);
    const merged = [...existing, ...enrichedNew];

    // Sort by date
    merged.sort((a, b) => a.date_start.localeCompare(b.date_start));

    // Backup existing
    if (fs.existsSync(INCIDENTS_FILE)) {
      const backupPath = INCIDENTS_FILE.replace('.json', `-backup-${Date.now()}.json`);
      fs.copyFileSync(INCIDENTS_FILE, backupPath);
      console.log(`Backed up to: ${backupPath}`);
    }

    saveJSON(INCIDENTS_FILE, merged);
    console.log(`\nMerged! Total incidents now: ${merged.length}`);

    showStats(merged);
    return;
  }

  console.log('Unknown mode. Use --preview, --merge, or --stats');
}

main();
