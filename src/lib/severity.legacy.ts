import { calculateSeverity, getBeardCategory } from './severity';

function assertEqual<T>(actual: T, expected: T, testName: string): void {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${testName} failed: expected ${expectedStr}, got ${actualStr}`);
  }
  console.log(`✓ ${testName}`);
}

console.log('Running severity calculation validation tests...\n');

const testCases = [
  {
    input: { escalation_level: 1, duration_impact: 1, media_visibility: 1, recency_multiplier: 1 },
    expected: {
      constitutional: 1,
      salience: 1,
      unified: 1
    },
    description: 'All 1s'
  },
  {
    input: { escalation_level: 4, duration_impact: 10, media_visibility: 5, recency_multiplier: 2 },
    expected: {
      constitutional: Number(((4 * 0.6) + (10 * 0.4)).toFixed(2)),
      salience: Number(((5 * 0.5) + (2 * 0.5)).toFixed(2)),
      unified: Number(((((4 * 0.6) + (10 * 0.4)) * 0.7) + (((5 * 0.5) + (2 * 0.5)) * 0.3)).toFixed(2))
    },
    description: 'Mixed values'
  },
  {
    input: { escalation_level: 0, duration_impact: 0, media_visibility: 0, recency_multiplier: 0 },
    expected: {
      constitutional: 0,
      salience: 0,
      unified: 0
    },
    description: 'All 0s'
  }
];

testCases.forEach((tc) => {
  const result = calculateSeverity(tc.input);
  assertEqual(result, tc.expected, tc.description);
});

console.log('\nRunning Beard Category mapping tests...\n');

const categoryTestCases = [
  { score: 0.0, expected: 'Clean Chin' },
  { score: 2.0, expected: 'Clean Chin' },
  { score: 2.1, expected: 'Wisp' },
  { score: 4.0, expected: 'Wisp' },
  { score: 4.1, expected: 'Tuft' },
  { score: 6.0, expected: 'Tuft' },
  { score: 6.1, expected: 'Billy Beard' },
  { score: 8.0, expected: 'Billy Beard' },
  { score: 8.1, expected: 'Knee-Dragger' },
  { score: 10.0, expected: 'Knee-Dragger' }
];

categoryTestCases.forEach((tc) => {
  const result = getBeardCategory(tc.score);
  assertEqual(result, tc.expected, `Score ${tc.score} -> ${tc.expected}`);
});

console.log('\n✅ All severity validation tests passed!');
