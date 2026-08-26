---
status: done
pr: 401
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
side-by-side compare view fed by the preview endpoint, the decision actions
(merge either direction, dismiss, defer), and the follow-up actions queue
(pending external work, execute-in-place where available, manual outcome
logging). Out of scope: any server behavior — this plan consumes the APIs as
shipped.

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
- Follow-up actions queue: pending actions grid (type, connector, linked
  merge, executability), an execute button where an executor exists (confirm
  dialog restating the action), and manual complete/skip with required notes;
  completed/failed history visible per merge.
- Cypress spec covering the queue → compare → decide loop against fixtures.

## Validation

- [ ] Queue lists open candidates and filters by status
- [ ] Compare view shows both records, impact counts, and conflicts from
      preview
- [ ] A merge with a conflict cannot be submitted until a resolution is picked
- [ ] Dismiss/defer require notes and update the row without a reload
- [ ] Follow-up queue lists pending actions; execute appears only for
      executor-backed types; manual outcomes require notes
- [ ] Cypress spec for the full loop passes in CI

## Risks / unknowns

- **Preview payload size** — records with heavy data histories make the
  compare view dense; lead with identity + counts, expand detail on demand.

## Notes

Intended for execution by the agent already working the SlateAdmin cleanup
campaign — conventions here follow that campaign's post-rework patterns.

Implemented in PR #401. None of the Validation boxes above are checked:
implementation is code-complete and ESLint-clean (0 errors against the
required-check command, confirmed via `--format json` severity check), but
this session had no way to run the live app or the docker/hologit e2e
harness, so none of the runtime behaviors were actually observed — only
traced through code review against the API/behavior specs. See PR #401's
description for the exact per-requirement mapping and the Cypress spec's
header comment (`cypress/integration/SlateAdmin/merge-queue.js`, left
`describe.skip`) for what a reviewer with harness access should confirm
before checking these boxes.

## Follow-ups

- Run the real e2e harness against this branch, un-skip
  `cypress/integration/SlateAdmin/merge-queue.js`, and check off the
  Validation boxes above once each is actually observed passing.
- Consider progressive disclosure in the compare view (impact/conflicts/
  follow-ups sections currently all render up front) if real preview
  payloads turn out dense enough to warrant it — see Risks/unknowns above.
- Detection stays operator-triggered (Run Detection button ->
  POST /people/merge/candidates/detect). When a scheduled cadence is
  wanted, the intended seam is in-container named cron events
  (daily/hourly/weekly) fired to event-handlers -- the tree-layer-
  composable pattern precedented in the menunet codebase -- so scheduled
  activities are introduced purely through tree layers with no external
  plumbing per activity.
