---
status: planned
depends: [person-merge-engine, duplicate-candidates]
specs:
  - specs/behaviors/person-merge.md
  - specs/api/person-merge.md
upstream-specs:
  - agent-skills:skills/jarvus-extjs/references/architecture.md
  - agent-skills:skills/jarvus-extjs/references/data-layer.md
---

# Plan: SlateAdmin duplicate-reconciliation work queue

## Scope

The SlateAdmin surface for the merge system: a candidates queue grid, a
side-by-side compare view fed by the preview endpoint, and the decision
actions (merge either direction, dismiss, defer). Out of scope: any server
behavior — this plan consumes the two APIs as shipped.

## Implements

- `specs/behaviors/person-merge.md` — the operator workflow over the candidate
  lifecycle.
- `specs/api/person-merge.md` — as consumer.

## Approach

- New SlateAdmin section following current conventions (post-rework People
  module patterns): route-driven state, model/proxy statics for the two APIs,
  `requireLoaded` barriers.
- Queue grid: status filter (default open), detector + score columns,
  row-select drives the compare view.
- Compare view renders the preview payload: both identities side by side,
  per-table impact counts, conflicts inline with resolution pickers, external
  actions called out.
- Actions: merge A→B / B→A (confirm dialog restating impact), dismiss and
  defer with required notes; queue refreshes and advances to the next open
  pair.
- Cypress spec covering the queue → compare → decide loop against fixtures.

## Validation

- [ ] Queue lists open candidates and filters by status
- [ ] Compare view shows both records, impact counts, and conflicts from
      preview
- [ ] A merge with a conflict cannot be submitted until a resolution is picked
- [ ] Dismiss/defer require notes and update the row without a reload
- [ ] Cypress spec for the full loop passes in CI

## Risks / unknowns

- **Preview payload size** — records with heavy data histories make the
  compare view dense; lead with identity + counts, expand detail on demand.

## Notes

Intended for execution by the agent already working the SlateAdmin cleanup
campaign — conventions here follow that campaign's post-rework patterns.

## Follow-ups
