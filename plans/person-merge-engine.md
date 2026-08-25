---
status: planned
depends: []
specs:
  - specs/behaviors/person-merge.md
  - specs/api/person-merge.md
---

# Plan: person merge engine + preview/execute API

## Scope

The server side of person merging: the merge registry, the transactional merge
operation with audit, and the `GET /people/merge/preview` + `POST /people/merge`
endpoints. Out of scope: candidate detection/queue (`duplicate-candidates`) and
the SlateAdmin UI (`slateadmin-merge-queue`).

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
- **Endpoints**: request handler for the two routes per the API spec.
- Migration(s) under `php-migrations/` for the audit table.

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

## Risks / unknowns

- **Registry completeness** — legacy person-keyed tables with unconventional
  column names may evade the schema scan; the scan's matching rules need a
  review pass against the full schema.
- **Large-record merges** — a source with tens of thousands of rows (blog
  posts, messages) must stay within transaction limits; chunked updates inside
  the transaction if needed.

## Notes

## Follow-ups
