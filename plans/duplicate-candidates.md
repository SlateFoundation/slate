---
status: planned
depends: [person-merge-engine]
specs:
  - specs/behaviors/person-merge.md
  - specs/api/person-merge.md
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

## Risks / unknowns

- **Detector noise** — name-match on common names will over-generate; the
  score plus dismissal persistence is the mitigation, but thresholds may need
  tuning against real data before the queue is useful.

## Notes

## Follow-ups
