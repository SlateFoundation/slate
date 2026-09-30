---
status: done
depends: [report-emails-record-each-send]
specs:
  - specs/behaviors/progress-report-emails.md
  - specs/behaviors/spreadsheet-row-values.md
pr: 412
---

# Plan: Progress notes record each send; report emails and imports skip only what is bad

## Scope

Three defects found by an audit after
[`report-emails-record-each-send`](report-emails-record-each-send.md):

1. **Note sends.** `Emergence\CRM\Message::send`, which progress notes use,
   calls `error_reporting(E_ALL)` just before `Mailer::send`. Under the
   framework's error handler every warning or deprecation inside the
   reporting level throws, so after that call any later notice in the
   request becomes a failure. A throw after the mailer accepted the note and
   before `save()` leaves its recipients `pending`, and the next attempt
   mails them again. On failure the exception message concatenates
   `error_get_last()`, an array, so the real error reads as `Array`.
2. **Report email skip.** `handleEmailsRequest` skips an email when
   `$recipientsCount === 0`, the running total. Once an earlier email had
   recipients, a later one whose recipients all lack an address is still
   sent: to the archive address alone, or with an empty To.
3. **Import grade.** `_applyUserChanges` computes
   `12 - $row['Grade']` on the raw cell. A non-numeric grade is a
   `TypeError` on PHP 8 (a leading-numeric one like `10th` is a warning),
   which the per-row `RemoteRecordInvalid` catch does not handle, so the
   whole job dies.

Out: the mailer facade's static analysis (the `mailer-facade-annotations`
plan, its own PR),
server-side refusal to resend report rows already `sent`, and
`MessagesRequestHandler`'s handling of a recipient posted without an email.

## Implements

- `specs/behaviors/progress-report-emails.md`: progress notes (recorded
  straight after the send, pending on failure with the mailer's message, no
  change to error reporting); an email with no addressable recipients is
  skipped on its own recipients.
- `specs/behaviors/spreadsheet-row-values.md`: a non-numeric `Grade` fails
  its row under `grade-not-numeric` and the job goes on.

## Approach

- **`Message::send`.** Drop `error_reporting(E_ALL)`. Collect the pending
  recipients without touching their status, send, and on success set each
  one to `sent` and save it shallowly (`save(false)`, so a related person
  record is not re-validated and saved in that window) before the note's own
  status and save. On failure throw with `error_get_last()['message'] ?? ''`.
  The mailer's result is read as a truthy flag, as before, which is correct
  for a `bool` and for an older mailer's response array.
- **`handleEmailsRequest`.** Skip on `count($recipientEmails) === 0`; keep
  adding to `$recipientsCount` for the response.
- **Grade.** Before the arithmetic, `is_numeric($row['Grade'])` or throw
  `RemoteRecordInvalid('grade-not-numeric', ..., $row, $row['Grade'])`. No
  other arithmetic in the connectors base reads a `$row` value;
  counters keyed by row values (`$results['failed'][...][$row[...]]++`) do
  arithmetic on the counter, not the value.
- **E2E.**
  - `cypress/integration/SlateAdmin/progress.js`: create a note for the
    fixture student over HTTP, POST a recipient to `/notes/{id}/recipients`,
    and check the stored recipient status and note status agree with the
    response (`sent` on success, `pending` and an error naming no `Array` on
    failure). The CI image has no sendmail, so there it exercises failure.
  - `cypress/integration/SlateAdmin/progress.js`: POST two emails to
    `*emails`, the first to the student, the second to a person with no
    email; the second must write no rows and not be counted.
  - `cypress/integration/connectors/student-import.js`: a pretend students
    import with grades `K`, `10th` and `10`; the job completes, and the two
    bad rows fail under `grade-not-numeric`.

## Validation

- [x] `Message::send` no longer changes `error_reporting`, saves each
      recipient straight after a successful send, and reports the mailer's
      error message on failure
- [x] After a note send, the stored recipient status and note status agree
      with the response (E2E)
- [x] A report email whose recipients have no address is skipped even after
      an email that had recipients (E2E)
- [x] A students import with a non-numeric grade completes and fails only
      those rows under `grade-not-numeric` (E2E)
- [x] CI's static analysis (lint, Rector, PHPStan, Psalm, PHP-CS-Fixer)
      passes locally exactly as `quality.yml` runs it
- [x] `test-e2e` and `quality` checks green on the PR

## Risks / unknowns

- **Success path unexercised in CI.** The CI image has no sendmail, so the
  note E2E only reaches the failure branch; the success branch rests on
  review.
- **Crash inside the save.** A process killed between the mailer accepting
  a note and the recipient saves can still resend. The window is now those
  saves alone.

## Notes

- **Both branches of a note send ran in CI.** The runtime image has no
  sendmail, so the new E2E suite stands one in (inside the site container,
  SITE_CONTAINER mode only) that either accepts and keeps each message or
  refuses it. That made the success path testable: on PR #412 the note is
  recorded `sent` and mailed exactly once, a second add of the same recipient
  mails nobody, and a refused send leaves the recipient `pending`. The
  report email skip test sees `emailsCount` 1 and exactly one message sent.
- **Not run against the old code.** The new tests were written to fail on
  the old behavior (a second email counted and mailed; a non-numeric grade
  ending the job with a `TypeError`), but were only run against the fixed
  code.
- **No PHPUnit test.** The row check is covered by the E2E student import.
  `phpunit-tests/` suites need the live runtime and no CI job runs them
  (existing gap, see earlier plans).
- **The `error_get_last()` concatenation was not a PHPStan finding.** The
  function returns `array|null`, and PHPStan reports a binary operation only
  when every member of the union fails, so it passed analysis. No baseline
  entry changed in this PR.
- **Real API mailers not exercised.** The Postmark and Mailgun paths return
  `bool` upstream now. `Message::send` still reads the result as truthy, so
  an older mailer's response array also counts as success.
- **Static analysis**: run locally in a PHP 8.3 container against the
  context that `script/fetch-analysis-context` builds. Lint, Rector,
  PHPStan, Psalm and PHP-CS-Fixer all exit 0. On PR #412, `test-e2e`,
  `Static analysis`, `ESLint` and the preview deploy all pass.

## Follow-ups

- Tracked as: `Message::send` passes its `Reply-To` and `X-MessageID`
  headers as the mailer's `$options` list, and `PHPMailer` reads headers
  only from `$options['Headers']`, so those headers are dropped (existing
  behavior, untouched here).
- Tracked as: `MessagesRequestHandler::handleMessageRecipientsRequest`
  leaves `$EmailContactPoint` undefined for a recipient posted with a
  `PersonID` and no `Email`, and `addRecipient` then fails with a
  `TypeError` (SlateAdmin always sends `Email`).
- Tracked as: the report `*emails` endpoint still does not refuse
  recipients already `sent`, carried over from
  [`report-emails-record-each-send`](report-emails-record-each-send.md).
