// Simple validation tests for data loader utilities
import {
  getStates,
  getArticles,
  getEras,
  getPrecedents,
  getGovernors,
  getIncidents,
  getStateByCode,
  getArticleByNumber,
  getEraById,
  getPrecedentById,
  getStatesByUT,
  getIncidentCountByState,
  getIncidentCountByGovernor,
  getAverageSeverityByState,
} from './data';

function assertEqual<T>(actual: T, expected: T, testName: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${testName} failed: expected ${expectedStr}, got ${actualStr}`);
  }
  console.log(`✓ ${testName}`);
}

function assertExists<T>(value: T | undefined, testName: string): void {
  if (value === undefined) {
    throw new Error(`${testName} failed: value is undefined`);
  }
  console.log(`✓ ${testName}`);
}

function assertArrayLength(array: readonly any[], expectedLength: number, testName: string): void {
  if (array.length !== expectedLength) {
    throw new Error(`${testName} failed: expected length ${expectedLength}, got ${array.length}`);
  }
  console.log(`✓ ${testName}`);
}

// Run tests
console.log('Running data loader validation tests...\n');

// Test metadata loaders
const states = getStates();
assertArrayLength(states, 36, 'getStates returns 36 states/UTs');

const articles = getArticles();
assertArrayLength(articles, 5, 'getArticles returns 5 articles');

const eras = getEras();
assertArrayLength(eras, 5, 'getEras returns 5 eras');

const precedents = getPrecedents();
assertArrayLength(precedents, 3, 'getPrecedents returns 3 precedents');

const governors = getGovernors();
assertArrayLength(governors, 0, 'getGovernors returns empty array (seed data)');

const incidents = getIncidents();
assertArrayLength(incidents, 0, 'getIncidents returns empty array (seed data)');

// Test lookup functions
const maharashtra = getStateByCode('MH');
assertExists(maharashtra, 'getStateByCode finds Maharashtra');
assertEqual(maharashtra?.name, 'Maharashtra', 'Maharashtra state name is correct');
assertEqual(maharashtra?.ut, false, 'Maharashtra is not a UT');

const delhi = getStateByCode('DL');
assertExists(delhi, 'getStateByCode finds Delhi');
assertEqual(delhi?.ut, true, 'Delhi is a UT');

const article163 = getArticleByNumber(163);
assertExists(article163, 'getArticleByNumber finds Article 163');
assertEqual(article163?.title, 'Council of Ministers to aid and advise Governor', 'Article 163 title is correct');

const emergency = getEraById('emergency');
assertExists(emergency, 'getEraById finds Emergency era');
assertEqual(emergency?.name, 'Emergency', 'Emergency era name is correct');

const bommai = getPrecedentById('sr_bommai_1994');
assertExists(bommai, 'getPrecedentById finds S.R. Bommai');
assertEqual(bommai?.year, 1994, 'S.R. Bommai year is correct');

// Test filtering functions
const actualStates = getStatesByUT(false);
const actualUTs = getStatesByUT(true);
assertArrayLength(actualStates, 28, 'getStatesByUT(false) returns 28 states');
assertArrayLength(actualUTs, 8, 'getStatesByUT(true) returns 8 UTs');

// Test aggregation functions with empty data
const incidentsByState = getIncidentCountByState();
assertEqual(incidentsByState.size, 0, 'getIncidentCountByState returns empty map for seed data');

const incidentsByGovernor = getIncidentCountByGovernor();
assertEqual(incidentsByGovernor.size, 0, 'getIncidentCountByGovernor returns empty map for seed data');

const avgSeverityByState = getAverageSeverityByState();
assertEqual(avgSeverityByState.size, 0, 'getAverageSeverityByState returns empty map for seed data');

console.log('\n✅ All validation tests passed!');
console.log(`\nSummary:
- States/UTs: ${states.length}
- Articles: ${articles.length}
- Eras: ${eras.length}
- Precedents: ${precedents.length}
- Governors: ${governors.length} (seed data - empty)
- Incidents: ${incidents.length} (seed data - empty)
`);
