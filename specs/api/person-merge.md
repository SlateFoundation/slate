# API: person merge & duplicate candidates

## Endpoints

All endpoints require an authenticated administrator account and follow the
records-API JSON envelope. Implements
[`specs/behaviors/person-merge.md`](../behaviors/person-merge.md).

### `GET /people/merge/preview?source=<personID>&target=<personID>`

Dry-run report for a prospective merge. Response `data`:

- `source`, `target` — both person records with identity fields, account
  level, created date, contact points, group memberships, and connector
  mappings.
- `impact` — per-registered-table counts of rows that would move from source
  to target (zero-count tables included, so the reviewer sees the full
  registry walked).
- `conflicts` — list of identity conflicts that would halt an execute
  (field, source value, target value), each with the resolution key an
  execute request must supply.
- `externalActions` — the implied external-system actions the merge would
  enumerate.

Preview never writes. Either ID may be any person class; requesting a person
that doesn't exist is a 404; `source == target` is a 400.

### `POST /people/merge`

Execute a merge. Request body:

- `sourceID`, `targetID` — required.
- `resolutions` — map of conflict keys (from preview) to the chosen winning
  value. Required exactly when preview reports conflicts; an execute with
  unresolved conflicts fails with the conflict list and writes nothing.
- `candidateID` — optional; when the merge resolves a queued candidate pair,
  links it so the candidate transitions to `merged`.

Response `data`: the merge audit record (per-table moved counts, tombstone
username, timestamps) plus `externalActions`.

### `GET /people/merge/candidates?status=<open|merged|dismissed|deferred>`

List candidate pairs (default `open`), each with both person summaries,
detector, score, evidence, status, and decision metadata.

### `PATCH /people/merge/candidates/<id>`

Record a decision without merging: set status to `dismissed` or `deferred`
with a required `notes` string. Transitioning out of `merged` is not allowed;
re-opening a `dismissed`/`deferred` pair back to `open` is (with notes).

## Notes

- Preview is the UI's side-by-side compare data source — it must be complete
  enough that the operator needs no other query to decide.
- Execute is idempotent-hostile by nature (the source stops existing as an
  active record); a repeated execute for the same pair returns the prior
  audit record rather than failing opaquely.
