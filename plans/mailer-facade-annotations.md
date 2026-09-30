---
status: in-progress
depends: [report-emails-record-each-send]
specs:
  - specs/architecture.md
upstream-specs:
  - skeleton-v3:php-classes/Emergence/Mailer/IMailer.php
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

- [ ] The baseline has five fewer facade entries and one fewer
      `argument.sprintf` entry, and gains none
- [ ] `script/check-phpstan-baseline` passes on the new baseline and fails on
      the old one
- [ ] With the baseline removed, PHPStan reports no fatal kinds anywhere in
      `php-classes/`
- [ ] CI's static analysis (lint, the baseline check, Rector, PHPStan, Psalm,
      PHP-CS-Fixer) passes locally exactly as `quality.yml` runs it, at the
      same PHPStan level
- [ ] `quality` and `test-e2e` checks green on the PR

## Risks / unknowns

- **Stub drift.** If `IMailer` changes upstream, the stub has to follow by
  hand. It is small and says where it comes from.
- **Guard coverage.** The guard matches identifiers, so a fatal finding that
  PHPStan files under another identifier would get past it.
