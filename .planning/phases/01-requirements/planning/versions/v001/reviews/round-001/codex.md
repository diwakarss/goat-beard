# Codex Review (round-001)

## Verdict
NEEDS_WORK

## Prioritized Findings

### F1: Filter contract drift between PLAN and UI artifacts
**Severity**: Blocking  
**Evidence**:
- `PLAN.md` requires all FR-5 filters including **Governor** and **Constitutional era** (`PLAN.md:214-218`).
- `UI-SPEC.md` only specifies State, Type, Verification, Severity, Date (`UI-SPEC.md:181-188`) and URL params also omit governor/era (`UI-SPEC.md:751-759`).
- `UI-PLAYGROUND.html` renders only State/Type/Status/Severity/Year controls (`UI-PLAYGROUND.html:579-610`).

**Impact**: Implementers following UI artifacts will ship an incomplete filter surface and fail AC-6 intent in the plan.

**Required change**: Add Governor (searchable) and Constitutional era controls to `UI-SPEC.md` and `UI-PLAYGROUND.html`, and include URL/deep-link parameter mapping for both.

### F2: Official response behavior exists in PLAN but is missing from UI-SPEC and playground
**Severity**: Blocking  
**Evidence**:
- `PLAN.md` explicitly requires rendering a collapsed **Official Response** section when `raj_bhavan_response` or `legislative_pushback` are present (`PLAN.md:206`).
- `UI-SPEC.md` evidence drawer sections do not include this behavior (`UI-SPEC.md:288-325`).
- `UI-PLAYGROUND.html` drawer renderer has no branch for these fields and no corresponding section (`UI-PLAYGROUND.html:712-847`).

**Impact**: FR-1 fields become effectively orphaned in UI behavior, creating likely implementation omission and data-model/UI drift.

**Required change**: Add explicit section/state rules for Official Response in `UI-SPEC.md` and a visible example state in `UI-PLAYGROUND.html`.

### F3: Severity domain is inconsistent across artifacts and prototype showcases unreachable values
**Severity**: Blocking  
**Evidence**:
- `PLAN.md` documents unified severity range as **[0.42, 2.26]** (`PLAN.md:122-123`).
- `UI-SPEC.md` defines a “Critical” bucket at **>3.0** and slider max **4.0** (`UI-SPEC.md:71-73`, `UI-SPEC.md:186`).
- `UI-PLAYGROUND.html` generates mock severities up to 4.00 (`UI-PLAYGROUND.html:491`) and beard-level mapping is score-only (`UI-PLAYGROUND.html:466-471`).

**Impact**: Stakeholder validation in playground does not match achievable production outputs, risking incorrect QA baselines and threshold decisions.

**Required change**: Choose one canonical severity domain (formula or thresholds), then align heat-scale buckets, slider range, and playground data generation to that domain.

## Non-Blocking Findings

### N1: Typography minimum differs between spec and playground
- `UI-SPEC.md` sets no text below 12px (`UI-SPEC.md:43`), but playground uses 10px/11px in multiple controls (`UI-PLAYGROUND.html:146`, `UI-PLAYGROUND.html:166`, `UI-PLAYGROUND.html:313`, `UI-PLAYGROUND.html:701`).

### N2: Tablet validation surface is missing from playground
- `UI-SPEC.md` defines distinct tablet behavior (`UI-SPEC.md:466-475`, `UI-SPEC.md:483-486`), but playground exposes only desktop and mobile frames (`UI-PLAYGROUND.html:386-389`, `UI-PLAYGROUND.html:407-416`).

## Decision
NEEDS_WORK until F1-F3 are resolved.
