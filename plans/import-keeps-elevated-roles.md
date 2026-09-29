---
status: planned
depends: []
specs:
  - specs/behaviors/section-enrollment-import.md
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

- [ ] Unit test of `ParticipantRole` covers every ordered pair of roles, plus
      unknown and missing roles, and the enum/rank link
- [ ] E2E: a participant raised to Assistant stays Assistant after an import
      that lists them as a student; a second import changes nothing; a plain
      student in the same section is still imported and still pruned when
      absent; pretend mode reports the same counts; passes with or without a
      current term
- [ ] Integration test: the row's start and end dates are applied to a
      participant whose higher role is kept
- [ ] CI's static analysis (lint, Rector, PHPStan, Psalm, PHP-CS-Fixer) passes
      locally exactly as `quality.yml` runs it
- [ ] `test-e2e` and `quality` checks green on the PR

## Risks / unknowns

- **Downstream overrides.** A deployment layer that overrides
  `_getOrCreateParticipant` bypasses the rule. None exist in this repo;
  others cannot be audited from here.
- **Deliberate demotion by sheet.** A school that relied on the import to
  demote someone must now change the role by hand. That is the intended
  behavior.
