---
status: done
depends: []
specs:
  - specs/behaviors/section-enrollment-import.md
pr: 409
---

# Plan: Enrollment imports keep a participant's higher role

## Scope

Stop the spreadsheet enrollments import from lowering a section participant's
role. Today `pullEnrollments` imports every row with role Student and
`_getOrCreateParticipant` applies that to an existing participant, so a person
staff raised to Assistant (or Teacher) in a section is set back to Student by
every import. The need came from a school whose student assistants are enrolled
by its student information system as students in the sections they assist.

In: the role rank, the rule in `_getOrCreateParticipant`, the job log line,
the result counter, and tests. Out: mapping start/end date columns in stock
Slate (deployments map them today; unchanged), any UI.

## Implements

- `specs/behaviors/section-enrollment-import.md` — role rank; higher existing
  role kept with other fields still applied; log line; truthful results;
  pretend parity; pruning unaffected.

## Approach

- **Rank.** Nothing in the codebase ranks participant roles yet. Add
  `Slate\Courses\ParticipantRole`, a plain class with the four role constants,
  `RANKED` (lowest to highest), `getRank()`, `outranks()` and
  `resolveImported($existingRole, $importedRole)`. Build
  `SectionParticipant::$fields['Role']['values']` from `RANKED` so the enum
  and the rank cannot drift. Unknown roles are unranked, so the old behavior
  holds for them.
- **Rule.** In `_getOrCreateParticipant`, for an existing participant, pass
  the row's role through `resolveImported()` before `setFields()`. Both import
  paths (Student rows, section Teachers) share this method. Teacher is the top
  rank, so the Teacher path can never lower anything; it needs no other
  change.
- **Log and results.** In `pullEnrollments`, when the participant's role
  differs from the row's after that call, log a notice ("Kept existing role
  … instead of lowering it to …") and count `enrollments-role-kept`. Created /
  updated counts keep coming from `logRecordDelta`, which returns nothing for
  an unchanged record.
- **Pruning.** Keep recording the person in the per-section list. The prune
  query only reads Student rows, so a kept Assistant is never touched, and the
  row still marks the section as listed by the sheet.
- **Connectors in this repo.** `GoogleSheets\Connector` is the only subclass
  and overrides neither `pullEnrollments` nor `_getOrCreateParticipant`.

## Validation

- [x] Unit test of `ParticipantRole` covers every ordered pair of roles, plus
      unknown and missing roles, and the enum/rank link
- [ ] E2E: a participant raised to Assistant stays Assistant after an import
      that lists them as a student; a second import changes nothing; a plain
      student in the same section is still imported and still pruned when
      absent; pretend mode reports the same counts; passes with or without a
      current term
- [ ] Integration test: the row's start and end dates are applied to a
      participant whose higher role is kept
- [x] CI's static analysis (lint, Rector, PHPStan, Psalm, PHP-CS-Fixer) passes
      locally exactly as `quality.yml` runs it
- [ ] `test-e2e` and `quality` checks green on the PR

## Risks / unknowns

- **Downstream overrides.** A deployment layer that overrides
  `_getOrCreateParticipant` bypasses the rule. None exist in this repo;
  others cannot be audited from here.
- **Deliberate demotion by sheet.** A school that relied on the import to
  demote someone must now change the role by hand. That is the intended
  behavior.

## Notes

- **Unit test**: run locally with PHPUnit 11 on PHP 8.3 in a throwaway
  container, using a local bootstrap that aliases `PHPUnit_Framework_TestCase`
  and autoloads over `.analysis-context/`: 8 tests, 66 assertions, OK.
  Changing `>` to `>=` in `outranks()` makes it fail.
- **E2E box left unchecked** for one clause only. On PR #409 the spec passed
  3 of 3 on its first attempt in CI, but that was during term time. It hasn't
  run in the summer gap. It never reads the current term (the master term
  handle comes from the loaded fixtures), so it should pass there too.
- **Integration test box left unchecked**: `EnrollmentImportRolesTest` is
  written but has not run. No CI workflow runs `phpunit-tests/`, and building
  the site image locally needs a GitHub token for Composer, which this work
  didn't use.
- **CI box left unchecked**: `Static analysis` and `ESLint` pass.
  `test-e2e` fails only in `SlateAdmin/course-sections.js` and
  `SlateAdmin/progress.js`, the current-term failures #408 fixes. Every other
  spec passes, this plan's included.
- **Pruning decision**: a person whose higher role was kept is still recorded
  in the per-section list. The prune query only reads Student rows, so this
  never exposes them. It keeps the section counted as listed by the sheet, so
  absent students are still pruned from a section the sheet lists only
  through a kept role, as they were before.
- **Dates**: stock `$enrollmentColumns` maps no start/end date columns, so
  over HTTP the dates half of the rule can only be exercised by a deployment
  that maps them. The integration test does this with a subclass.

## Follow-ups

- Tracked as: the unchecked E2E and CI boxes close when #408 merges and
  `test-e2e` is re-run on this branch.
- Tracked as: `phpunit-tests/` has no runner in CI (existing gap, shared with
  the person-merge plans).
