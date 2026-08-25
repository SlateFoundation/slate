---
status: done
depends: [person-merge-engine]
specs:
  - specs/behaviors/person-merge.md
  - specs/api/person-merge.md
pr: 398
---

# Plan: duplicate detection + candidate queue

## Scope

The persistent candidate-pair store, the initial detector set, and the
candidates API (`GET`/`PATCH /people/merge/candidates`). Out of scope: the
SlateAdmin UI (`slateadmin-merge-queue`).

## Implements

- `specs/behaviors/person-merge.md` — candidate lifecycle, detector
  idempotency, initial detectors.
- `specs/api/person-merge.md` — candidates list + decision endpoints.

## Approach

- **Candidate record class** (ordered unique pair, detector slug, score,
  evidence JSON, status, decision metadata) + migration.
- **Detectors** as small classes behind a common interface, run via a script/
  cron-able task: identical name; shared contact point; identical Student
  Number; mapping-anomaly (mapping pointing at a disabled or effectively-empty
  record while a richer same-name record exists). Upsert semantics: never
  touch `dismissed`/`merged` pairs.
- **API**: list with status filter; PATCH for dismiss/defer/re-open with
  required notes; `merged` transitions happen only via the merge engine's
  `candidateID` linkage (depends on person-merge-engine).

## Validation

- [ ] Each detector finds its planted fixture pair and scores it
- [ ] Re-running detection does not resurrect a dismissed pair or duplicate an
      open one
- [ ] Executing a merge with `candidateID` transitions the pair to `merged`
      with the audit link
- [ ] PATCH enforces the lifecycle (no leaving `merged`; notes required)

All four criteria have a corresponding PHPUnit test in
`phpunit-tests/slate.read-write/People/Merge/` (`CandidateTest`,
`CandidateMergeIntegrationTest`, `Detectors/DetectorsTest`), but — same
constraint as `person-merge-engine` — the suite has no runner in CI or this
implementation sandbox (no PHP runtime, MySQL, or composed site available
here; confirmed pre-existing, not introduced by this plan). Unlike
`person-merge-engine`, no separate end-to-end harness run was available at
implementation time to verify these for real, so all four boxes stay
unchecked pending an actual PHPUnit run against a composed site with live
MySQL. What *was* verified locally, matching `.github/workflows/quality.yml`
exactly (PHP 8.3 + Composer + `script/fetch-analysis-context`): `php -l`
across the repo, `rector process --dry-run`, `phpstan analyse`, `psalm
--taint-analysis`, and `php-cs-fixer check --diff` all pass clean with
**zero changes to phpstan-baseline.neon or psalm-baseline.xml**.

## Risks / unknowns

- **Detector noise** — name-match on common names will over-generate; the
  score plus dismissal persistence is the mitigation, but thresholds may need
  tuning against real data before the queue is useful.

## Notes

- **StudentNumber carries a real DB-level UNIQUE KEY**
  (`Slate\People\Student::$fields`), not just an application-level
  validator — confirmed via `.analysis-context`'s `SQL.class.php`, which
  turns a field's `unique => true` into an actual `UNIQUE KEY` in the
  generated DDL. A live duplicate can therefore only exist as
  pre-constraint/legacy drift, which is exactly `IdenticalStudentNumberDetector`'s
  reason to exist (documented in its class docblock). Its positive-match
  PHPUnit fixture has to drop and restore that unique key around just the one
  test to plant a genuine duplicate row — flagged for review as the one
  non-obvious/invasive bit of test setup in this plan.
- **Candidate carries its own `MergeAuditID`** (mirroring
  `MergeAudit.CandidateID`, added in `person-merge-engine`) so either side of
  the merged-pair relationship is a direct field read, no join needed.
  `Merge::execute()` gained a `linkCandidate()` helper (the only caller of
  `Candidate::markMerged()`) invoked on both the main transactional path and
  the repeated-execute early-return path — the latter matters because a
  `candidateID` might be supplied only on a *second* execute request for an
  already-merged source/target pair (e.g. a manual merge happened first,
  then an operator worked the same pair from the candidate queue); without
  handling that path the candidate would stay `open` forever even though the
  people are already merged.
- **No `php-migrations/` entry**, matching `person-merge-engine`'s documented
  precedent: `merge_candidates` is a brand-new table with nothing to
  migrate from, created from `Candidate::$fields` on first use.
- **No CLI/console-command framework exists in this codebase** to run
  detectors from (`script/` holds only shell scripts; no PHP command
  runner). `site-root/powertools/duplicate-detection.php` fills the
  "script/console-command" role the plan called for, following the existing
  `user-data-report.php` admin-powertools idiom instead.
- Detector scores (0.4 identical-name / 0.7 mapping-anomaly / 0.8-0.95
  shared-contact-point / 0.95 identical-student-number) are a first-pass
  ordinal ranking, not calibrated against real data — see Risks / unknowns.

## Follow-ups

- Issue — `.github/workflows/quality.yml` still does not invoke
  `phpunit-tests/` (same pre-existing gap `person-merge-engine` already
  flagged; not re-filed separately here). This plan's Validation checklist
  stays unverified until that exists.
- None — the SlateAdmin UI is already tracked by the existing
  `plans/slateadmin-merge-queue.md` (`depends: [person-merge-engine,
  duplicate-candidates]`), which needs no edit: this plan completed its full
  declared Scope with nothing pushed downstream beyond what was already
  out of scope.
