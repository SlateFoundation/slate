---
status: planned
depends: [person-merge-engine]
specs:
  - specs/behaviors/person-merge.md
  - specs/api/person-merge.md
---

# Plan: Canvas user-merge follow-up executor

## Scope

The first concrete follow-up-action executor: the Canvas connector's
user-merge action. Out of scope: the executor framework itself
(`person-merge-engine`) and any other connector's executors.

## Implements

- `specs/behaviors/person-merge.md` — the LMS user-merge executor (direction
  derivation, external merge, SIS-identity normalization, verification).
- `specs/api/person-merge.md` — as the executor behind
  `POST /people/merge/actions/<id>/execute` for this action type.

## Approach

- Register the action type from the Canvas connector: a merge touching Canvas
  mappings on both records spawns a `canvas-user-merge` action whose payload
  carries both external user IDs and the derived direction (survivor = the
  Canvas user the surviving Slate record maps to / whose SIS ID matches its
  username).
- Executor procedure, in order: precondition checks (both Canvas users exist;
  direction still derivable; not already merged) → `PUT
  /api/v1/users/:id/merge_into/:destination` → normalize SIS identity (clear a
  stale `sis_user_id` the moved login drags onto the survivor; ensure the
  survivor's SIS lookup key matches the surviving Slate username) →
  verify `GET /api/v1/users/sis_user_id:<username>` resolves to the survivor →
  record outcome and mark `completed`.
- Any step failing marks the action `failed` with the Canvas error captured in
  the outcome note; the action stays retryable.
- Tests against a mocked Canvas API covering direction derivation, the
  stale-SIS-ID cleanup, verification, and failure capture.

## Validation

- [ ] A merge of two Canvas-mapped fixtures spawns a `canvas-user-merge`
      action with the correct direction in its payload
- [ ] Executor runs the full procedure in order and marks `completed` only
      after verification passes (mocked API)
- [ ] Stale `sis_user_id` on the moved login is cleared during execution
- [ ] A Canvas-side failure marks the action `failed` with the error recorded,
      and re-execute retries
- [ ] An action whose preconditions no longer hold (user already merged) is
      marked with an explanatory outcome instead of blindly calling merge

## Risks / unknowns

- **Irreversibility** — Canvas's user merge cannot be fully undone; the
  precondition checks and the explicit-trigger-only rule are the guardrails.
  Never auto-execute this action type.
- **Split-brain SIS IDs** — Canvas keeps SIS IDs per login; the normalization
  step needs to handle multiple logins on the survivor without clobbering the
  canonical one.

## Notes

## Follow-ups
