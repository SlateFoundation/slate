---
status: done
depends: [person-merge-engine]
specs:
  - specs/behaviors/person-merge.md
  - specs/api/person-merge.md
pr: 399
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

No Canvas connector existed in this repo to extend -- it was extracted into
a standalone `slate-connector-canvas` repo in 2017 (see `be0569d4`/
`f50a092c` in git history). This plan rebuilds just the request plumbing the
executor needs (`RemoteSystems\Canvas`) under the same static-config/
`executeRequest` convention as the sibling `GoogleApps` client, rather than a
general-purpose Canvas SDK -- a deviation from the "reuse the existing Canvas
integration" framing in the task brief, since there was nothing to reuse.

A `canvas` connector mapping's `ExternalKey` is defined as the Canvas user ID
(not a fixed constant like `'id'`), with `ExternalIdentifier` carrying the
Canvas login's SIS ID. This is load-bearing, not incidental:
`Merge::getIdentityConflicts()` treats two mappings sharing the same
`(Connector, ExternalKey)` with differing `ExternalIdentifier` as a conflict
requiring operator resolution, and resolving it discards the losing side's
mapping *before* follow-up actions are derived (confirmed by
`person-merge-engine`'s own note that mapping-identity conflicts are
intentionally gated through that same mechanism). With a shared constant key,
two independent Canvas accounts on both sides of a merge would always trigger
that conflict path and the `canvas-user-merge` action could never spawn.
Keying on the Canvas user ID avoids the collision.

All five Validation checklist items have a corresponding PHPUnit test in
`phpunit-tests/slate.read-write/Connectors/Canvas/`
(`UserMergeActionDeriverTest`, `UserMergeExecutorTest`), but -- like
`person-merge-engine` before it -- PHPUnit has no runner in this sandbox: the
suite needs the full composed Emergence/Slate runtime plus a live MySQL
connection (`handlers/phpunit.php` in `emergence/php-core`), available only
inside a Habitat studio or the CI container build. The boxes below are left
unchecked because no test was actually *executed*; what was verified,
matching `.github/workflows/quality.yml` exactly (PHP 8.3 + Composer +
`script/fetch-analysis-context`, via Docker): `php -l`, `rector process
--dry-run`, `phpstan analyse`, `psalm --taint-analysis`, and `php-cs-fixer
check --diff` all pass clean with zero changes to `phpstan-baseline.neon` or
`psalm-baseline.xml`. A reviewer with access to a composed live image + MySQL
(as `person-merge-engine`'s review pass had) should run the suite and check
off what passes.

## Follow-ups
