# Verification Summary — 01-requirements

- Run ID: `20260312T175912Z`
- Timestamp (UTC): `2026-03-12T17:59:12Z`
- Project: `/Users/b2sell/claude-projects/projects/goat-beard`
- Security Scope: `/Users/b2sell/claude-projects/projects/goat-beard`

## Gate 1 — Build vs Plan
- Status: **PASS**
- Reason: Plan tasks are present in execution results and all completed successfully.
- Plan: `/Users/b2sell/claude-projects/projects/goat-beard/.planning/phases/01-requirements/planning/versions/v001/PLAN.md`
- Execution Manifest: `/Users/b2sell/claude-projects/projects/goat-beard/.planning/phases/01-requirements/execution/runs/20260311T174011Z/execution-manifest.json`

## Gate 2 — Test Suite
- Status: **FAIL**
- Reason: ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/lib/__tests__/data.test.ts > data loader validation > loads metadata collections correctly
AssertionError: expected [ { id: 'gov-amk-kl', …(8) }, …(6) ] to have a length of +0 but got 7

- Expected
+ Received

- 0
+ 7

 ❯ src/lib/__tests__/data.test.ts:25:28
     23|     expect(getEras()).toHaveLength(5);
     24|     expect(getPrecedents()).toHaveLength(3);
     25|     expect(getGovernors()).toHaveLength(0);
       |                            ^
     26|     expect(getIncidents()).toHaveLength(0);
     27|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/lib/__tests__/data.test.ts > data loader validation > aggregation functions (empty data) > returns empty collections for empty seed data
AssertionError: expected 6 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 6

 ❯ src/lib/__tests__/data.test.ts:69:46
     67|   describe('aggregation functions (empty data)', () => {
     68|     it('returns empty collections for empty seed data', () => {
     69|       expect(getIncidentCountByState().size).toBe(0);
       |                                              ^
     70|       expect(getIncidentCountByGovernor().size).toBe(0);
     71|       expect(getAverageSeverityByState().size).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯
- Results: passed=0 failed=0 skipped=0 total=0

## Gate 3 — Ghost Security
- Status: **FAIL**
- Reason: 

## Gate 4 — Secret Scan
- Status: **FAIL**
- Reason: 

## Gate 5 — Coverage Audit
- Status: **FAIL**
- Reason: 

## Gate 6 — React Quality
- Status: **FAIL**
- Reason: 

## Gate 7 — Dependency Freshness
- Status: **FAIL**
- Reason: 

## Gate 8 — Manual Testing Confirmation
- Status: **FAIL**
- Reason: 

## Gate 9 — Repository Stability
- Status: **FAIL**
- Reason: 

## Final Verdict
- Overall: **ERROR**
- Stopped at: `tests`
- Next action: Fix test failures and rerun /nalan:verify.
