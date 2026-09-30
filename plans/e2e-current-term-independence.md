---
status: done
depends: []
specs: []
pr: 408
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

- [x] Both specs pass with retries off while a current term exists
- [x] Both specs pass with retries off in the summer gap (fixture years
      forced so that no term contains today)
- [x] Full composed suite passes locally against a container built from
      this branch
- [x] `test-e2e` CI check green on the PR

## Risks / unknowns

- **Other date-relative assumptions** may exist in specs that happen to pass
  in both states today; only the two failing specs were changed.

## Notes

- **What was run.** Against a container built the way `test-e2e.yml` builds
  it: both specs failed before the change with the same errors as CI; after
  it they passed 5 of 5 runs with a current term and 3 of 3 in the summer
  gap, retries off. The full composed suite passed 10 specs, 25 of 25 tests.
  The site image was built from a branch carrying unrelated PHP changes;
  the specs and fixtures were this branch's.
- **Producing the summer gap.** The fixture loader projects the working
  tree, so forcing `@year_curr` in an uncommitted edit of
  `fixtures/terms.2_data.sql` is enough to put every term in the past. The
  loaded database confirmed no term contained today.
- **The progress spec had three date assumptions, not one.** Settling the
  load race exposed the last: the server-side check listed reports without
  naming a term, and that list defaults to the current term.
- **Both default-term behaviors re-enter their own handlers.** The sections
  manager rewrites the URL to add the term filter, which dispatches the
  route again; the progress manager selects the term, which fires the
  change that loads the sections. A spec that acts as soon as rows appear
  can land inside either.

## Follow-ups

- Tracked as: the shared `jarvus-extjs` testing reference notes that fixture
  terms are date-relative but not that a spec must pass both with and
  without a current term, nor how to produce the summer gap locally.
- None needed for the screens: the default-term behavior is correct, and a
  person cannot act inside the windows these specs were landing in.
