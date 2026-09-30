---
status: in-progress
depends: [report-emails-record-each-send]
specs:
  - specs/behaviors/progress-report-emails.md
  - specs/behaviors/spreadsheet-row-values.md
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

- [ ] `Message::send` no longer changes `error_reporting`, saves each
      recipient straight after a successful send, and reports the mailer's
      error message on failure
- [ ] After a note send, the stored recipient status and note status agree
      with the response (E2E)
- [ ] A report email whose recipients have no address is skipped even after
      an email that had recipients (E2E)
- [ ] A students import with a non-numeric grade completes and fails only
      those rows under `grade-not-numeric` (E2E)
- [ ] CI's static analysis (lint, Rector, PHPStan, Psalm, PHP-CS-Fixer)
      passes locally exactly as `quality.yml` runs it
- [ ] `test-e2e` and `quality` checks green on the PR

## Risks / unknowns

- **Success path unexercised in CI.** The CI image has no sendmail, so the
  note E2E only reaches the failure branch; the success branch rests on
  review.
- **Crash inside the save.** A process killed between the mailer accepting
  a note and the recipient saves can still resend. The window is now those
  saves alone.
