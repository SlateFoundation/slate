---
status: planned
depends: []
specs:
  - specs/behaviors/progress-report-emails.md
---

# Plan: Report emails record each send, whatever the mailer returns

## Scope

Stop the report `*emails` endpoint from dying after its first email. On the
PHP 8 runtime, a deployment sending through the Postmark mailer gets the
decoded API response (an array) back from `Mailer::sendFromTemplate`, and
`$emailsCount += $sent` throws `TypeError: Unsupported operand types: int +
array`. The throw lands after the first email has gone out and before its
recipient status rows are written, so that email stays `proposed` and the
next attempt sends it again.

In: treating the mailer result as a success flag, making sure nothing
between the send and the status rows can throw, and an E2E check. Out: the
mailer's own return type (fixed upstream in skeleton-v3 so every `IMailer`
returns `bool`; this plan does not depend on that landing), server-side
refusal to resend rows already `sent` (the endpoint trusts the client's
list, as before), and the `$recipientsCount === 0` skip test, which compares
the running total rather than this email's recipients.

## Implements

- `specs/behaviors/progress-report-emails.md` — mailer result read as
  success or failure; each email's status rows written straight after its
  send; `emailsCount` counts accepted emails.

## Approach

- **Result as a flag.** `$sent = (bool) Mailer::sendFromTemplate(...)`. A
  `true` from `PHPMailer`, a non-empty response array from an older API
  mailer, and a `true` from a fixed one all read as success; `false` reads
  as failure.
- **Rows first.** The status rows were already written inside the per-email
  loop, straight after the send; only the counter sat in between. Write the
  rows, then count (`if ($sent) { $emailsCount++; }`), so the only work
  between the send and the rows is building the row data.
- **E2E.** In `cypress/integration/SlateAdmin/progress.js`, publish an
  interim report for a fixture student over HTTP, POST it to `*emails` with
  the student as recipient, and check the response and the preview's status
  for that student agree (`sent` with a count of 1, or `failed` with 0). The
  CI image has no sendmail, so there it exercises the `failed` branch.

## Validation

- [ ] `*emails` returns 200 and a count equal to the number of emails the
      mailer accepted when the mailer returns an array, `true` or `false`
- [ ] After a POST, each emailed recipient's status in the `*emails` preview
      is `sent` or `failed`, never still `proposed`, and agrees with
      `emailsCount`
- [ ] CI's static analysis (lint, Rector, PHPStan, Psalm, PHP-CS-Fixer)
      passes locally exactly as `quality.yml` runs it
- [ ] `test-e2e` and `quality` checks green on the PR

## Risks / unknowns

- **Crash inside the send.** If the process dies after the transport
  accepted an email but before its rows are written (a DB error, a killed
  worker), that one email can still be resent. The window is now the row
  writes alone.
- **Stale screens.** The endpoint sends whatever it is POSTed; a second
  browser tab opened before the first send can resend. Unchanged here.
