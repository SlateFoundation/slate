# Behavior: person record merge & duplicate reconciliation

## Rule

Long-lived deployments accumulate duplicate person records — re-imports, SSO
auto-provisioning, and manual creation each minting a new record for the same
human. Slate provides a first-class merge operation that consolidates all data
onto one surviving record, retires the duplicate in place, and records an audit
trail — plus a persistent queue of detected duplicate candidates so
reconciliation is tracked work, not tribal knowledge.

## Applies To

Person records of every class (students, staff, contacts). Surfaced through
the merge API (`specs/api/person-merge.md`) and the SlateAdmin merge queue.

## Details

### Merge semantics

A merge has a **source** (retired) and a **target** (survives), chosen
explicitly by the operator. On execute:

- **Data moves to the target.** Every table holding rows keyed to the source
  person is reassigned to the target. The set of tables comes from a **merge
  registry** the operation walks — core tables are registered by Slate, and
  modules/connectors register their own. The registry is the contract: a
  person-keyed table absent from it is a bug (see Verification).
- **Contact points dedupe.** A source contact point identical to one on the
  target (same class + normalized data) is dropped rather than moved; the
  target's primary designations are kept.
- **Group memberships union**, dropping exact duplicates.
- **Connector mappings move** to the target, except a mapping whose
  (connector, external identifier) already exists on the target — that
  duplicate is deleted, not moved.
- **The source becomes a tombstone**: account level Disabled, username renamed
  aside (suffixed so the original username is freed for the target or future
  use), no data rows left pointing at it. It is never deleted.
- **Identity conflicts halt the merge** unless explicitly resolved in the
  request: both records carrying different Student Numbers, or both carrying
  district/SSO mappings for different external identities, requires the
  operator to state which value wins. Absent a conflict, the target's values
  win and missing target fields are filled from the source.
- **Atomicity**: the merge runs in a single transaction — a failure part-way
  leaves both records untouched.
- **Audit**: every merge writes an audit record — source and target IDs, a
  snapshot of the source's identity fields, per-table counts of rows moved,
  the executing user, and timestamp. The audit record is sufficient to answer
  "where did this record's data come from" indefinitely.
- **External systems are not touched.** The merge result enumerates implied
  external actions (e.g. "merge the two LMS users", "retire the duplicate
  email account") derived from the connector mappings involved. Slate never
  executes those itself — see principles.

### Duplicate candidates

Detected duplicates persist as **candidate pairs** with a lifecycle, so a
decision made once is never re-litigated:

- A candidate pair records: the two person IDs (ordered, unique as a pair),
  which detector found it, a confidence score, the evidence (what matched),
  and a status.
- **Status lifecycle**: `open` → one of `merged` (with a reference to the
  merge audit record), `dismissed` (recorded reason — e.g. "two different
  people"), or `deferred` (needs external input; free-text note of what's
  awaited).
- **Detectors are idempotent.** Re-running detection upserts new pairs and
  re-scores open ones, but never resurrects a `dismissed` or `merged` pair.
- Initial detectors: identical name; shared contact point; identical Student
  Number; a connector mapping pointing at a disabled or effectively-empty
  record while a richer record of the same name exists.

## Verification

- Merging a fixture pair moves every registered table's rows and leaves zero
  rows keyed to the source.
- A registry-completeness check (schema scan for person-keyed columns vs. the
  registry) reports no unregistered tables; the check runs in CI.
- A mid-merge failure (forced in a test) leaves both records unchanged.
- A dismissed candidate pair stays dismissed across a detector re-run.

## Principles

**Inherited** — from [`principles.md`](../principles.md):

- [Never destroy identity data](../principles.md#never-destroy-identity-data)
  — the source record is disabled and renamed, never deleted; the audit trail
  is mandatory, not optional.
- [Slate owns its rows; external systems get explicit actions](../principles.md#slate-owns-its-rows-external-systems-get-explicit-actions)
  — the merge reports LMS/IdP implications; it never performs them.

**Local:**

- **A decision is data.** "Not a duplicate" is as valuable as "merged" —
  dismissals persist with a reason so no future detector run or operator
  re-opens a settled question.
