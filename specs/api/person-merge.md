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
- `followupActions` — the follow-up actions the merge would spawn, each with
  its type, owning connector, payload, and whether an executor is available.

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
username, timestamps) plus the spawned follow-up action records.

### `GET /people/merge/candidates?status=<open|merged|dismissed|deferred>`

List candidate pairs (default `open`), each with both person summaries,
detector, score, evidence, status, and decision metadata.

### `PATCH /people/merge/candidates/<id>`

Record a decision without merging: set status to `dismissed` or `deferred`
with a required `notes` string. Transitioning out of `merged` is not allowed;
re-opening a `dismissed`/`deferred` pair back to `open` is (with notes).

### `GET /people/merge/actions?status=<pending|completed|skipped|failed>`

List follow-up actions (default `pending`), each with its merge audit link,
type, owning connector, payload, whether an executor is available, status,
and outcome log.

### `POST /people/merge/actions/<id>/execute`

Run the owning connector's executor for the action. 404 when the action's
type has no executor. Response: the action with its new status and outcome
note. A failure marks the action `failed` with the error recorded;
re-invoking retries.

### `PATCH /people/merge/actions/<id>`

Record a manual outcome: set `completed` or `skipped` with a required `notes`
string (e.g. performed by hand in the external admin console, or not
applicable). Re-opening a `failed`/`skipped` action to `pending` is allowed
(with notes); `completed` is terminal.

## Notes

- Preview is the UI's side-by-side compare data source — it must be complete
  enough that the operator needs no other query to decide.
- Execute is idempotent-hostile by nature (the source stops existing as an
  active record); a repeated execute for the same pair returns the prior
  audit record rather than failing opaquely.
