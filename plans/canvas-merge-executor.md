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

No Canvas connector exists in *this repo* -- it was extracted into a
standalone `slate-connector-canvas` repo in 2017 (see `be0569d4`/`f50a092c`
in git history), so this codebase has no local example of it to grep. The
package still exists and is very much alive, though: real composed Slate
deployments carry it as a full-fledged connector layer, `Slate/Connectors/`
sitting *above* this repo's own `Slate/Connectors/` in composition order --
this took two review passes against a real composed deployment image to
get right (see the two corrections below).

**Correction #1 (mapping convention) from review against production data:**
review against a real production deployment's `connector_mappings` table
found that `canvas` mappings actually use `ExternalKey = 'user[id]'` -- a
**constant**, matching the sibling `gsuite` connector's own convention --
with `ExternalIdentifier` carrying the numeric Canvas user id. The first
pass had these flipped (`ExternalKey` = the Canvas user id,
`ExternalIdentifier` = a SIS-matched value), reasoning that a constant key
would always collide with `Merge::getIdentityConflicts()`'s mapping-conflict
path (same `(Connector, ExternalKey)`, differing `ExternalIdentifier` →
conflict requiring operator resolution, which discards the losing side's
mapping before follow-up actions are derived). That reasoning was right
about the mechanism and wrong about the fix: against real data, a constant
`ExternalKey` is exactly what always happens for two Canvas-mapped people,
so the engine itself needed to change rather than the mapping convention.

`Merge.php` now special-cases a connector with a registered
`MappingActionDeriverRegistry` deriver in both places that convention
touches:

- `getIdentityConflicts()` skips emitting a mapping conflict for such a
  connector entirely -- the divergence is the deriver's to resolve via a
  follow-up action, not the operator's to resolve by destroying a mapping.
- `mergeConnectorMappings()` retires (destroys, counted as deduped) rather
  than moves a source mapping whose `(Connector, ExternalKey)` exists on the
  target with a different identifier, when that connector has a registered
  deriver -- moving it would leave the target with two `user[id]`-style
  mappings for one connector. `deriveMappingActions()` still runs against
  the pre-mutation mapping arrays, so it captures both original identifiers
  regardless of this retirement.

A connector with no registered deriver is untouched by either change and
keeps the exact original conflict/resolution behavior -- covered by
`UserMergeActionDeriverTest::testConnectorWithoutARegisteredDeriverStillGetsTheConflictResolutionPath`.

**Correction #2 (file-path collisions with the real Canvas connector
package), verified against a real composed deployment image:** Slate
deployments compose slate core *under* the full Canvas connector package
extracted in 2017. A real composed site tree carries
`php-classes/Slate/Connectors/Canvas/Connector.php` (the real connector,
plus `API.php`, `Commands/`, `Repositories/`, `Strategies/` siblings) and
`php-classes/RemoteSystems/Canvas.php` (the real, leaf-configured API
wrapper). Emergence layer composition merges directories but shadows
same-path *files* wholesale -- this plan's first two passes shipped files
at both of those exact paths, so in a composed site one layer's file
silently replaced the other's. Verified failure: with this plan's
`Connector.php` winning, a real leaf's own Canvas config fatals with
"Access to undeclared static property Connector::$sectionSkipper"; with the
real one winning, this plan's `register()` never exists at all -- either
way, broken, and silently so (no error at compose time, only at whichever
code path runs first).

Fixed by treating slate core as a co-tenant of that directory, never an
owner of any path within it that the real package also uses:

- `Slate/Connectors/Canvas/Connector.php` → renamed to the uniquely-named
  `Slate/Connectors/Canvas/MergeSupport.php` (class `MergeSupport`, same
  `CONNECTOR_KEY`/`ACTION_TYPE_USER_MERGE`/`register()`). A new,
  uniquely-named file inside a directory two layers both contribute to is
  safe -- only same-name files collide.
- `RemoteSystems/Canvas.php` (this plan's API wrapper) deleted outright,
  along with its sibling exception class and
  `php-config/RemoteSystems/Canvas.config.php` (the credentials config for
  a class this plan no longer owns). `CanvasClient` now builds its REST
  calls directly, reading the real, already-leaf-configured
  `\RemoteSystems\Canvas::$canvasHost`/`::$apiToken` off that class
  dynamically (`class_exists()` guard, then a variable-class-name static
  property read -- never a literal type reference, so this file has no
  hard dependency on that class existing and needs nothing from
  `.analysis-context` to stay clean under phpstan/psalm). A site with no
  Canvas connector composed at all gets a clear `CanvasApiException`
  instead of a class-not-found fatal. The exception class moved with it,
  to `Slate\Connectors\Canvas\CanvasApiException` -- its own
  uniquely-named file, same reasoning as `MergeSupport`.

**The standing rule this leaves for future connector work in this repo:**
slate core must never ship a file at a path a real, separately distributed
connector package owns (`Slate/Connectors/<Name>/Connector.php` and
whatever `RemoteSystems/<Name>.php` wrapper it carries, at minimum -- check
the package's own repo, not just this one, before naming a file). A new
capability file inside a directory a connector package also populates is
safe as long as its filename doesn't collide with anything that package
ships; when in doubt, a distinctive/compound name (`MergeSupport`, not
`Support` or `Helper`) costs nothing and rules out ever colliding by
coincidence with a future file the real package adds.

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
