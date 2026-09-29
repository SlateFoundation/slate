---
status: done
depends: [canvas-merge-executor]
specs:
  - specs/behaviors/person-merge.md
pr: 407
---

# Plan: Canvas merge executor login convergence

## Scope

Rework `Slate\Connectors\Canvas\UserMergeExecutor` to implement the
[Canvas user-merge executor](../specs/behaviors/person-merge.md#canvas-user-merge-executor)
rules: plan the post-merge login state before the irreversible
`merge_into`, converge the survivor's logins to the login convergence
contract, resume a run that failed after the merge, and verify what sign-in
actually depends on.

Found live at a school whose Canvas user had been merged: the executor
assumed the survivor's "home" login had the Slate username as its login ID,
but Canvas login IDs are email addresses (the connector provisions
`login[unique_id]` = primary email, and SAML sign-in presents the primary
email). The normalization step threw *after* `merge_into`, a retry could
never get past the "source already merged" precondition, and the SIS-ID
verification had passed while the person was locked out.

In scope: the executor, the `CanvasClientInterface`/`CanvasClient` calls it
needs, the fake Canvas client and executor tests.

Out of scope:

- The Canvas connector's launch-time user sync tolerating multiple logins
  per user -- lives in the separately distributed connector package, being
  changed in parallel against the same contract.
- Executor registration and the execute endpoint -- unchanged (explicit
  `POST /people/merge/actions/<id>/execute` only, registered from the
  registry classes' `config.d`).
- A dry-run/preview of an executor's plan before execution -- the follow-up
  action model has no preview surface; see Follow-ups.

## Implements

- `specs/behaviors/person-merge.md` -- Canvas user-merge executor: the login
  convergence contract, plan-before-merge, fail-before-merge on an
  unreachable end state, plan recorded in the outcome note, resumption and
  idempotence, and the sign-in verification rule (including the optional
  read-only connector sync).

## Approach

- `LoginConvergencePlan` (new, uniquely named so it cannot shadow a file of
  the real connector package): a pure value object built from a list of
  Canvas login objects plus the survivor's username and primary email.
  Picks the sign-in login (active, login ID == primary email,
  case-insensitive/trimmed; falls back to renaming a login that carries the
  username as SIS ID or login ID), lists the other logins whose SIS ID must
  be cleared, and whether the sign-in login needs the username stamped.
  Throws an administrator-actionable exception when no end state is
  reachable. Renders itself as a one-line description for outcome notes.
- `UserMergeExecutor::execute()` resolves payload + surviving person, then
  `converge()`:
  1. read both Canvas users; detect an already-merged source via
     `merged_into_user_id` (resume) or a source merged elsewhere (fail);
  2. read logins (survivor's, plus the source's when not yet merged) and
     build the plan; check no *other* Canvas user holds the username as an
     SIS ID, or the primary email as a login ID when a rename is planned;
  3. `merge_into` only when not already merged;
  4. re-read the survivor's logins, rebuild the plan from live state and
     apply it: clear SIS IDs, then rename, then stamp;
  5. verify: SIS-ID lookup resolves to the survivor, an active login has
     the primary email as login ID, exactly one login carries the username
     as SIS ID; then, when `Slate\Connectors\Canvas\Connector::pushUser()`
     exists with a `$pretend` parameter, run it in pretend mode for the
     surviving person and fail verification on any exception.
  Failures after the merge are rethrown with the plan, the failed step, and
  a note that re-executing resumes.
- `CanvasClientInterface`/`CanvasClient`: add `getUserByLoginID()`
  (`GET /users/sis_login_id:<escaped>`); escape `.` in SIS-ID and login-ID
  lookups as `%2E`, per Canvas's documented URI escaping, so usernames and
  emails containing `.` resolve.
- `FakeCanvasClient` becomes a small stateful Canvas simulation: `merge_into`
  moves logins and sets `merged_into_user_id`, a merged user's logins 404,
  SIS IDs and login IDs are unique across the tenant (a claim before a free
  is rejected, as Canvas does), and failures can be injected per call.

## Validation

- [x] Happy path with email login IDs: survivor ends with the source's and
      its own login, username stamped on exactly the sign-in login,
      verified, outcome note records the plan
- [x] Sign-in login that came from the source user is chosen and stamped
- [x] A stale SIS ID on a non-sign-in login is cleared before the username
      is stamped (the fake rejects the reverse order)
- [x] Unreachable end states (no primary email; no email login and no
      rename target; username held by another Canvas user) fail with no
      `merge_into` call recorded
- [ ] A failure after `merge_into` leaves the action retryable, and
      re-executing skips the merge and completes
- [x] Re-executing a completed action makes no writes and succeeds
- [x] A source already merged into a different Canvas user fails without
      writes
- [x] Primary-email comparison is case-insensitive and trims whitespace
- [x] The connector dry-run hook runs in pretend mode when present, and an
      exception from it fails verification
- [x] `php -l`, rector (dry-run), phpstan, psalm (taint) and php-cs-fixer
      pass with no baseline changes

## Risks / unknowns

- **SIS-ID and login-ID lookups by escaped path** -- not exercised against
  a real tenant. A lookup Canvas rejects fails the pre-merge check before
  anything is written; one that wrongly finds nothing would fail
  verification after the merge (resumable, not destructive).
- **Reserved SIS IDs on deleted logins** are invisible to the API: stamping
  the username can still be rejected by Canvas post-merge. The failure is
  recorded with the step, and re-execution resumes once support frees it.
- **Connector sync signature** -- the dry-run hook is guarded by
  reflection on `pushUser`'s `$pretend` parameter so a changed signature is
  skipped rather than called in a writing mode.

## Notes

- **What was executed.** `UserMergeConvergenceTest` (17 cases, DB-free, it
  drives `UserMergeExecutor::converge()` directly) ran locally under
  PHPUnit 10.5 / PHP 8.3 through a scratch bootstrap that autoloads
  `php-classes/` plus `.analysis-context/` and aliases the legacy
  `PHPUnit_Framework_TestCase`: 17/17 pass. Swapping the stamp ahead of
  the clears makes the three ordering-sensitive cases fail, so the fake's
  uniqueness enforcement does gate the write order. The quality gate
  (`php -l`, rector dry-run, phpstan, psalm taint, php-cs-fixer) passed
  clean in a PHP 8.3 container matching `quality.yml`, with no baseline
  changes.
- **What was not executed.** `UserMergeExecutorTest` (the DB-backed
  `execute()` + action-lifecycle cases) needs a composed site with MySQL
  and was only linted. That's why the "failure after `merge_into` leaves
  the action retryable" box stays unchecked: the resume half is covered by
  the DB-free `testResumesAfterAFailureFollowingTheMerge`, but the
  action-status half only runs in the DB-backed class. No CI job runs
  `phpunit-tests/` at all.
- **Resumption is detected from Canvas, not from Slate.** The executor
  keeps no progress record of its own. It reads `merged_into_user_id` on the
  source and re-plans from the survivor's live logins, so a run that died
  at any point converges on the next execute, including a run that
  died after Canvas finished a `merge_into` whose response was lost.
- **The plan is recorded in outcome notes, not as structured data.** The
  follow-up action model has no preview/dry-run surface. The pre-merge plan
  appears in every failure note and the applied plan in the success note.
- **Connector dry-run hook.** `UserMergeExecutor::$connectorClass` names the
  real connector class as a string. `pushUser()` is only invoked when
  reflection shows a public static method whose third parameter is
  `$pretend`, and it's always called with `true` and a `NullLogger`.
  In pretend mode the connector only issues GETs.

## Follow-ups

- Tracked as: an executor preview/dry-run, so an operator can read the
  Canvas plan before triggering the irreversible merge. Needs a new
  surface on the follow-up action model (e.g. `GET
  /people/merge/actions/<id>/plan` backed by an optional executor
  interface method), specced first.
- Tracked as: `FollowUpActionsRequestHandler::handleExecuteActionRequest`
  on a `completed` action. The executor re-run is a verified no-op, but
  `recordOutcome()` rejects any transition out of `completed` and the
  handler's failure path then throws uncaught. The UI only offers execute
  on `pending` actions, so this only affects direct API calls.
- Tracked as: no CI job runs the `phpunit-tests/` suites, and they still
  extend the PHPUnit 5-era `PHPUnit_Framework_TestCase`.
