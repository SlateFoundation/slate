---
status: planned
depends: []
specs: []
---

# Plan: Make e2e specs pass whether or not the fixtures have a current term

## Scope

The fixture terms are computed from `CURRENT_TIMESTAMP` when the database is
loaded, so the suite runs in one of two states depending on the date: from
September through April one fixture term contains today (a *current term*
exists), and from May through August none does (the summer gap). Two specs
were written during the summer gap and only pass in it; since 1 September
they fail on every pull request, and `test-e2e` is a required check.

Fix `SlateAdmin/course-sections.js` and `SlateAdmin/progress.js` so they pass
in both states.

Out of scope: changing how the screens pick a default term, which is correct
behavior in both states; making the fixture terms fixed rather than
date-relative; and updating the shared `jarvus-extjs` testing reference (see
Follow-ups).

## Implements

No specs — CI/test hygiene.

## Approach

Each failure is a spec depending on what the screen does by default, which
differs by state:

- **`course-sections.js`** — the bare `#course-sections` landing applies a
  `term:<handle>` filter when a current term exists. That rewrites the URL,
  which re-runs the route, and a selection made in that window is cleared;
  the URL a selection produces is also `search/<query>/<code>` rather than
  `lookup/<code>`. Enter through an explicit search instead, so the route is
  the same in both states, and cover the lookup route by entering through it
  directly (tab included, so the fresh load runs the route once).
- **`progress.js`** — when a current or reporting term exists the manager
  selects it and loads its sections unprompted. Selecting another term while
  that load is in flight lets it land on top of the later steps and reset the
  form. Wait for the initial load to settle before selecting a term, wait
  for the sections, students and reports loads by their own loading state
  rather than by row count alone, and ask the server-side check for the term
  the report was written under, since the list defaults to the current term.

## Validation

- [ ] Both specs pass with retries off while a current term exists
- [ ] Both specs pass with retries off in the summer gap (fixture years
      forced so that no term contains today)
- [ ] Full composed suite passes locally against a container built from
      this branch
- [ ] `test-e2e` CI check green on the PR

## Risks / unknowns

- **Other date-relative assumptions** may exist in specs that happen to pass
  in both states today; only the two failing specs were changed.

## Notes

(at closeout)

## Follow-ups

(at closeout)
