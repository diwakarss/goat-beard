#!/usr/bin/env npx tsx
/**
 * CLI script to review and merge staged incidents
 *
 * Usage:
 *   npx tsx scripts/merge.ts --status          # Show staging summary
 *   npx tsx scripts/merge.ts --list            # List staged incidents
 *   npx tsx scripts/merge.ts --merge-ready     # Merge incidents that don't need review
 *   npx tsx scripts/merge.ts --merge-all       # Merge all staged incidents
 *   npx tsx scripts/merge.ts --approve <id>    # Mark specific incident as approved
 *   npx tsx scripts/merge.ts --reject <id>     # Remove specific incident from staging
 */

import {
  loadStagedIncidents,
  saveStagedIncidents,
  loadProductionIncidents,
  saveProductionIncidents,
  getStagingSummary,
} from '../scraper';
import type { StagedIncident } from '../scraper';
import type { Incident } from '../src/types/schema';

function showStatus() {
  const summary = getStagingSummary();

  console.log(`
===================================
Staging Status
===================================
Total staged: ${summary.total}
Needs review: ${summary.needsReview}
Ready to merge: ${summary.readyToMerge}

By source:
${Object.entries(summary.bySource)
  .map(([source, count]) => `  - ${source}: ${count}`)
  .join('\n')}
===================================
`);
}

function listStaged(filterNeedsReview?: boolean) {
  const staged = loadStagedIncidents();

  const filtered = filterNeedsReview !== undefined
    ? staged.filter((i) => i._meta.needs_review === filterNeedsReview)
    : staged;

  console.log(`\n${filtered.length} incident(s):\n`);

  for (const incident of filtered) {
    console.log(`
[${incident.id}] ${incident.title}
  State: ${incident.state} | Governor: ${incident._meta.governor_name_raw}
  Type: ${incident.transgression_type} | Escalation: ${incident.escalation_level}
  Date: ${incident.date_start}
  Confidence: ${(incident._meta.extraction_confidence * 100).toFixed(0)}%
  Needs Review: ${incident._meta.needs_review ? 'YES' : 'no'}
  Source: ${incident._meta.source_url}
`);
  }
}

function stripMeta(staged: StagedIncident): Incident {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _meta, ...incident } = staged;
  return incident as Incident;
}

function mergeIncidents(onlyReady: boolean) {
  const staged = loadStagedIncidents();
  const production = loadProductionIncidents();

  const toMerge = onlyReady
    ? staged.filter((i) => !i._meta.needs_review)
    : staged;

  if (toMerge.length === 0) {
    console.log('No incidents to merge.');
    return;
  }

  console.log(`Merging ${toMerge.length} incident(s)...`);

  // Convert to production format
  const newIncidents = toMerge.map(stripMeta);

  // Append to production
  const updated = [...production, ...newIncidents];
  saveProductionIncidents(updated);

  // Remove merged from staging
  const remaining = staged.filter(
    (s) => !toMerge.some((m) => m.id === s.id)
  );
  saveStagedIncidents(remaining);

  console.log(`
Merged ${toMerge.length} incidents.
Production now has ${updated.length} incidents.
Staging has ${remaining.length} remaining.
`);
}

function approveIncident(id: string) {
  const staged = loadStagedIncidents();
  const incident = staged.find((i) => i.id === id);

  if (!incident) {
    console.error(`Incident not found: ${id}`);
    return;
  }

  incident._meta.needs_review = false;
  saveStagedIncidents(staged);
  console.log(`Approved: ${incident.title}`);
}

function rejectIncident(id: string) {
  const staged = loadStagedIncidents();
  const remaining = staged.filter((i) => i.id !== id);

  if (remaining.length === staged.length) {
    console.error(`Incident not found: ${id}`);
    return;
  }

  saveStagedIncidents(remaining);
  console.log(`Rejected and removed: ${id}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: npx tsx scripts/merge.ts [command]

Commands:
  --status           Show staging summary
  --list             List all staged incidents
  --list-review      List incidents needing review
  --list-ready       List incidents ready to merge
  --merge-ready      Merge only incidents that don't need review
  --merge-all        Merge all staged incidents
  --approve <id>     Mark an incident as approved (no longer needs review)
  --reject <id>      Remove an incident from staging

Examples:
  npx tsx scripts/merge.ts --status
  npx tsx scripts/merge.ts --list
  npx tsx scripts/merge.ts --merge-ready
  npx tsx scripts/merge.ts --approve inc_abc12345
`);
    return;
  }

  switch (args[0]) {
    case '--status':
      showStatus();
      break;
    case '--list':
      listStaged();
      break;
    case '--list-review':
      listStaged(true);
      break;
    case '--list-ready':
      listStaged(false);
      break;
    case '--merge-ready':
      mergeIncidents(true);
      break;
    case '--merge-all':
      mergeIncidents(false);
      break;
    case '--approve':
      if (!args[1]) {
        console.error('Please provide an incident ID');
        process.exit(1);
      }
      approveIncident(args[1]);
      break;
    case '--reject':
      if (!args[1]) {
        console.error('Please provide an incident ID');
        process.exit(1);
      }
      rejectIncident(args[1]);
      break;
    default:
      console.error(`Unknown command: ${args[0]}`);
      process.exit(1);
  }
}

main();
