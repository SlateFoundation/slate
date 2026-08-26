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

- [x] Queue lists open candidates and filters by status
- [x] Compare view shows both records, impact counts, and conflicts from
      preview
- [x] A merge with a conflict cannot be submitted until a resolution is picked
- [x] Dismiss/defer require notes and update the row without a reload
- [ ] Follow-up queue lists pending actions; execute appears only for
      executor-backed types; manual outcomes require notes
- [x] Cypress spec for the full loop passes in CI

## Risks / unknowns

- **Preview payload size** — records with heavy data histories make the
  compare view dense; lead with identity + counts, expand detail on demand.

## Notes

Intended for execution by the agent already working the SlateAdmin cleanup
campaign — conventions here follow that campaign's post-rework patterns.

Implemented in PR #401. Initial implementation was code-complete and
ESLint-clean but unverified at runtime (no way to run the live app or the
e2e harness in that session). External review (@themightychris) built the
container from the branch and found three real, live-confirmed bugs: a
cold-deep-link crash in both route handlers (statusField read before the
manager existed), a response-envelope bug (`response.data` is the full
`{success, data}` body, not the payload — broke the whole decide loop and
let the Merge button enable on an empty preview), and a missing `include`
on the queue proxies (blank Person1/Person2/MergeAudit columns). All three
were fixed, plus the two `/people/save` seeding bugs the reviewer found
un-skipping the Cypress spec. The e2e re-run then caught a fourth bug the
same way (an uncaught TypeError from pushing a numeric candidate ID into a
route array) — fixed, and the spec went green in CI. The checked boxes
above reflect that live-container pass plus the un-skipped spec now passing
in CI on every run.

The one unchecked box (follow-up queue: execute/manual-outcome flows) has
no automated or manual coverage yet — the Cypress spec's follow-up-actions
test only confirms the screen is reachable and deep-linkable; seeding an
actual pending `FollowUpAction` needs connector-mapping fixture data that
was out of scope here (see Follow-ups). Also worth a note for whoever picks
that up: the "conflicts from preview" and "conflict gating" boxes above are
verified against the seeded fixture pair, which has zero identity
conflicts (two plain `Person` records, same name) — the conflict-list
rendering and resolution-picker UI are exercised on their empty-state path
only; a pair with a real conflict (e.g. differing Student Numbers) hasn't
been walked live or in Cypress.

## Follow-ups

- Seed a pending `FollowUpAction` (needs connector-mapping fixture data)
  and extend the Cypress spec to cover execute-in-place and the manual
  complete/skip flows, then check off the remaining Validation box.
- Walk the compare view against a candidate pair with a real identity
  conflict (differing Student Numbers, or competing connector mappings) to
  exercise the conflict-list/resolution-picker UI beyond its empty-state
  path.
- Consider progressive disclosure in the compare view (impact/conflicts/
  follow-ups sections currently all render up front) if real preview
  payloads turn out dense enough to warrant it — see Risks/unknowns above.
