---
status: done
depends: [report-emails-record-each-send]
specs:
  - specs/architecture.md
upstream-specs:
  - skeleton-v3:php-classes/Emergence/Mailer/IMailer.php
pr: 413
---

# Plan: Type the mailer facade for analysis and stop baselining fatal kinds

## Scope

`Emergence\Mailer\Mailer` is a `__callStatic` facade, so PHPStan saw every
`Mailer::send`, `sendFromTemplate` and `renderTemplate` call as an undefined
static method returning `mixed`. All of those calls were baselined. That is
why the `int + array` in #410 was invisible to analysis.

In:

- a PHPStan stub declaring the forwarded methods with their `IMailer`
  return types
- removing the baseline entries it makes obsolete
- keeping the baseline from ignoring any kind of finding that fails at run
  time on PHP 8, and fixing the code those entries hid

Out: raising the PHPStan level, and other baselined findings that are not
among the fatal kinds (see Follow-ups).

## Implements

- `specs/architecture.md`, "Static analysis baseline": the baseline only
  shrinks, fatal kinds are never baselined (enforced in CI), and framework
  facades are typed for analysis by a stub under `phpstan-stubs/`.

## Approach

- **Stub.** `phpstan-stubs/Mailer.stub` redeclares `Emergence\Mailer\Mailer`
  with `@method static bool send(...)`,
  `@method static bool sendFromTemplate(...)` and
  `@method static array{...} renderTemplate(...)`. The signatures come from
  skeleton-v3's `IMailer`, which returns `: bool` since its #33. `send()`
  also takes the `$options` array that every implementation accepts and that
  callers pass. `phpstan.neon` lists it under `stubFiles`, so it is used for
  analysis only and never at run time.
- **Baseline.** Delete the five `staticMethod.notFound` entries for the
  facade (one in `Message.php`, two in `InvitationsRequestHandler.php`, one
  in `RegistrationRequestHandler.php`, one in
  `AbstractSectionTermReportsRequestHandler.php`).
- **Fatal kinds.** `script/check-phpstan-baseline` fails if the baseline
  carries `class.notFound` (including a caught class),
  `binaryOp.invalid`, `unaryOp.invalid`, `assignOp.invalid`, any strict-rules
  `*NonNumeric` / `*.nonNumeric`, or `argument.sprintf`. `quality.yml` runs
  it before PHPStan. The only such entry today is `argument.sprintf` in
  `Slate\Progress\Note::getAllByTerm`, whose `"%S"` placeholder is a
  `ValueError` on PHP 8. Fix it to `"%s"` and drop the entry.

## Validation

- [x] The baseline has five fewer facade entries and one fewer
      `argument.sprintf` entry, and gains none
- [x] `script/check-phpstan-baseline` passes on the new baseline and fails on
      the old one
- [x] With the baseline removed, PHPStan reports no fatal kinds anywhere in
      `php-classes/`
- [x] CI's static analysis (lint, the baseline check, Rector, PHPStan, Psalm,
      PHP-CS-Fixer) passes locally exactly as `quality.yml` runs it, at the
      same PHPStan level
- [x] `quality` and `test-e2e` checks green on the PR

## Risks / unknowns

- **Stub drift.** If `IMailer` changes upstream, the stub has to follow by
  hand. It is small and says where it comes from.
- **Guard coverage.** The guard matches identifiers, so a fatal finding that
  PHPStan files under another identifier would get past it.

## Notes

- **A stub, not an override.** The facade lives in skeleton-v3. Copying it
  into Slate's `php-classes/` would replace the framework's file at run time
  through hologit composition, so the annotations go in an analysis-only
  PHPStan stub instead. `renderTemplate` is declared too, which removed a
  fifth entry.
- **Typing the facade surfaced nothing new.** With `bool` returns, PHPStan at
  level 5 reports no new findings, including on the `(bool)` cast #410 kept
  in the report emails handler.
- **Fatal kinds confirmed by probe.** A throwaway file checked against
  PHPStan 2.2.5 gave the identifiers the guard matches: `class.notFound`
  (for a caught class too), `binaryOp.invalid` (including `12 - string`),
  `assignOp.invalid`, `unaryOp.invalid` and `argument.sprintf`. The
  strict-rules non-numeric identifiers come from its source.
- **Baseline**: 326 entries down to 320, with 36 lines removed and none
  added. A PHPStan run with no baseline at all reports no fatal kind in
  `php-classes/`.
- **Other findings a full run shows** that fail at run time but are not
  among the kinds this plan covers (each still baselined):
  - calls to static methods that do not exist:
    `RegistrationRequestHandler::throwNotFoundException`,
    `Emergence\Logger::general_warning` and `Section::getFromHandle`
  - undefined variables, e.g. `$filename` in `NotesRequestHandler::respond`
- **Static analysis**: run locally in a PHP 8.3 container. Lint, the
  baseline check, Rector, PHPStan, Psalm and PHP-CS-Fixer all exit 0. The
  baseline check exits 1 on `develop`'s baseline. On PR #413, `quality`,
  `test-e2e`, `ESLint` and the preview deploy all pass.

## Follow-ups

- Tracked as: extend `script/check-phpstan-baseline` with
  `staticMethod.notFound` and `method.notFound` once the undefined static
  calls listed in Notes are fixed and calls through interfaces that do not
  declare the method (e.g. `IJob::logException`) are typed.
