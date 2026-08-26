---
status: in-progress
depends: []
specs: []
---

# Plan: Make e2e specs safe under Cypress test retries

## Scope

Audit every spec in `cypress/integration/**` for how it behaves when CI's
`retries=2` re-runs a test after a transient failure, and fix the hazardous
ones. Cypress re-runs `beforeEach`/`afterEach` hooks on each retry attempt
but NOT `before`/`after` — so a spec that resets the database in `before()`
and then mutates server state non-convergently hands every retry the failed
attempt's mutated state, compounding it into garbage errors that hide the
real failure (observed live on `SlateAdmin/contacts.js`: "Found 6, expected
3", one extra postal-row batch per retry).

Out of scope: `SlateAdmin/merge-queue.js` (already made retry-convergent on
its own line of work), any restructuring of test logic beyond hook
placement, and the skeleton-v3-side specs (`blog.js`, `profile.js`,
`register.js`) — those chains are fixed in EmergencePlatform/skeleton-v3
and reach this suite through the composed cypress workspace.

## Implements

No specs — CI/test hygiene. Also updates
`.agents/skills/jarvus-extjs/references/testing.md`, whose "reset per spec
file in a `before()`" guidance produced exactly this hazard, with the
retry-aware placement rules.

## Approach

Classify each spec:

- **Read-only or convergent** (`login.js`, `register.js`,
  `SlateAdmin/course-sections.js`, `SlateAdmin/people.js`,
  `SlateAdmin/progress.js`): retries are already safe — leave `before()`.
- **Non-convergent mutators** (`SlateAdmin/contacts.js`,
  `SlateAdmin/settings.js`): move the `cy.resetDatabase()` to
  `beforeEach()` with an explanatory comment, so every retry attempt starts
  from fixture state. This keeps retry protection (unlike `retries: 0`)
  while making attempts hermetic; the happy-path cost is unchanged for the
  single-test contacts spec and one extra ~seconds reset for settings.

## Validation checklist

- [ ] Full composed suite passes locally against a container built from
      this branch (all specs, 0 failures)
- [ ] `test-e2e` CI check green on the PR
- [ ] Testing reference documents the retry-aware reset placement rules

## Notes

- Cypress hook-retry semantics are the crux: `beforeEach` re-runs per
  attempt, `before` does not. A `before()` reset is only safe when the
  spec's tests are read-only or convergent under re-run.
