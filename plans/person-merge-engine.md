---
status: done
depends: []
specs:
  - specs/behaviors/person-merge.md
  - specs/api/person-merge.md
pr: 396
---

# Plan: person merge engine + preview/execute API

## Scope

The server side of person merging: the merge registry, the transactional merge
operation with audit, the follow-up action store + executor framework, and the
`/people/merge/*` endpoints (preview, execute, actions list/execute/patch).
Out of scope: candidate detection/queue (`duplicate-candidates`), concrete
executors (`canvas-merge-executor`), and the SlateAdmin UI
(`slateadmin-merge-queue`).

## Implements

- `specs/behaviors/person-merge.md` — merge semantics, registry, tombstone,
  audit, external-actions enumeration.
- `specs/api/person-merge.md` — preview and execute endpoints.

## Approach

- **Registry**: a static registry class mapping table → person-key column(s) +
  move strategy (reassign / dedupe-then-reassign / union), seeded from the
  data inventory `site-root/powertools/user-data-report.php` already encodes
  (enrollments, comments, contact points, content, groups, invitations, media,
  messages, relationships — both directions, interim/term reports, tags), plus
  sessions and `connector_mappings`. Expose a registration hook so connectors
  and modules add their tables.
- **Completeness check**: an information_schema scan for person-keyed columns
  not present in the registry, runnable as a test so CI fails when a new
  person-linked table lands unregistered.
- **Merge operation**: a `Slate\People\Merge` (naming per surrounding code)
  operation object: validate → detect conflicts → walk registry in a
  transaction → contact-point dedupe → mapping move/dedupe → tombstone the
  source (Disabled + username suffixed) → write the audit record → derive
  external actions from the mappings touched.
- **Audit table**: new record class for merge audits (per-table counts JSON,
  source snapshot JSON, executor, linked candidate ID).
- **Follow-up actions**: record class per the behavior spec (audit link, type,
  connector, payload JSON, status, outcome log), spawned inside the merge
  transaction from the mappings touched; executor interface connectors
  implement per action type, dispatched by the execute endpoint (404 when no
  executor).
- **Endpoints**: request handlers for the routes per the API spec — preview,
  execute, and the actions list / execute / manual-outcome PATCH.
- Migration(s) under `php-migrations/` for the audit and action tables.

## Validation

- [ ] Fixture merge moves every registered table's rows; zero rows remain
      keyed to the source
- [ ] Registry completeness check passes and runs in CI
- [ ] Preview reports impact counts matching what execute then moves
- [ ] Identity conflict (differing Student Numbers) halts execute without
      `resolutions`; succeeds with them
- [ ] Forced mid-merge failure rolls back — both records unchanged
- [ ] Audit record written with per-table counts and source snapshot
- [ ] Repeated execute for an already-merged pair returns the prior audit
      record
- [ ] A merge involving mappings spawns follow-up actions atomically; a rolled-
      back merge spawns none
- [ ] Manual outcome PATCH enforces the lifecycle (notes required; `completed`
      terminal); execute on an executor-less action type 404s

All nine criteria above are implemented and have a corresponding PHPUnit
test in `phpunit-tests/slate.read-write/People/Merge/` (`MergeTest`,
`FollowUpActionTest`, `RegistryCompletenessTest`), but none could be
*executed* — see Notes — so every box stays unchecked rather than claiming
verification the environment couldn't produce.

## Risks / unknowns

- **Registry completeness** — legacy person-keyed tables with unconventional
  column names may evade the schema scan; the scan's matching rules need a
  review pass against the full schema.
- **Large-record merges** — a source with tens of thousands of rows (blog
  posts, messages) must stay within transaction limits; chunked updates inside
  the transaction if needed.

## Notes

- **PHPUnit could not run.** The implementation agent's sandbox had no PHP
  runtime, MySQL, or hologit-composed site at all -- these tests need the
  full composed Emergence/Slate runtime plus a live MySQL connection (see
  `handlers/phpunit.php` in `emergence/php-core`), which only exists inside
  a Habitat studio or the CI container build. What *was* verified locally,
  matching `.github/workflows/quality.yml` exactly (PHP 8.3 + Composer +
  `script/fetch-analysis-context`): `php -l` across the repo, `rector
  process --dry-run`, `phpstan analyse`, `psalm --taint-analysis`, and
  `php-cs-fixer check --diff` all pass clean with **zero changes to
  phpstan-baseline.neon or psalm-baseline.xml**.
- **No `php-migrations/` entries were added**, despite the Approach calling
  for them. Per `specs/architecture.md` the framework creates tables from a
  class's `$fields` on first load; every existing migration in
  `php-migrations/` only evolves a table that already carries data (several
  explicitly skip when the table doesn't exist yet), and `merge_audits` /
  `merge_followup_actions` are brand new tables with nothing to migrate
  from. Flagged in the PR for the team to override if the real deploy
  process expects a migration file regardless.
- **Registry-completeness scan is deliberately narrower than "every
  person-keyed column"**: it matches a fixed allowlist of column names and
  explicitly excludes the universal ActiveRecord `CreatorID`/`ModifierID`
  attribution columns and bare `ContextID`, or the registry would have to
  cover the entire schema. Exactly the scan-accuracy risk called out below;
  documented in `RegistryCompletenessCheck`'s docblock.
- Mapping-identity conflicts (same `Connector`+`ExternalKey`, differing
  `ExternalIdentifier` on both sides) are gated through the same
  conflict/resolution mechanism as Student Number conflicts, as a direct
  reading of the behavior spec's "district/SSO mappings" language --
  `resolutions` key format `mapping:<connector>:<externalKey>`.

## Follow-ups

- Issue — `.github/workflows/quality.yml` does not invoke `phpunit-tests/`
  at all (confirmed pre-existing; not introduced by this plan). None of the
  new tests here (or the existing `ContactPoint` suites) are an enforced CI
  gate until a PHPUnit job exists. No issue filed (no issue tracker access
  from the implementation sandbox) -- worth filing before relying on this
  suite for regression coverage.
- Deferred to `duplicate-candidates` — `MergeAudit.CandidateID` and the
  `POST /people/merge` `candidateID` parameter are wired and accepted, but
  nothing sets a candidate pair to `merged` yet (no candidate record class
  exists in this plan's scope).
- Deferred to `canvas-merge-executor` — no connector registers a
  `MappingActionDeriverRegistry` deriver or `ActionExecutorRegistry`
  executor yet, so in the shipped state no merge spawns a follow-up action
  and no action type is executable in place. The extension points exist and
  are exercised by fixture registrations in `MergeTest`.
