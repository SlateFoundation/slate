# Behavior: progress report emails

## Rule

Sending progress report emails records the outcome of each email as soon as
that email has been handed to the mailer, before the next one is sent. A
request that fails part-way through never leaves an email that went out
without a record saying so, which would let the next attempt send it again.
The same holds for a progress note sent to its recipients.

## Applies To

- The `*emails` endpoint of the section term and interim report handlers
  (`Slate\Progress\AbstractSectionTermReportsRequestHandler` and its
  subclasses): `POST /progress/section-interim-reports/*emails` and
  `POST /progress/section-term-reports/*emails`, as SlateAdmin's report email
  screens use them.
- Progress notes (`Slate\Progress\Note`, sent through
  `Emergence\CRM\Message::send`): `POST /notes/{id}/recipients`, as
  SlateAdmin's progress note editor uses it.

## Details

### What one email is

The POSTed body is a list of emails. Each names a set of reports (one
student's) and a set of recipient people. The email is rendered from those
of its reports that are published and sent once, to every one of its
recipients who has a primary email address.

An email none of whose recipients has a primary email address is not sent at
all, not even to the archive address, and writes no status rows. Whether an
email is skipped depends only on its own recipients, never on the emails
before it in the list.

### The mailer's result

The mailer reports success or failure for each email. The endpoint treats
that result only as success or failure, whatever the configured mailer
returns (a transport's response body is success, not a number to add).

### Recording each email

- **Straight after the send.** Once the mailer returns for an email, a
  recipient status row is written for each of that email's recipient people,
  for each student and term the email covers, before the next email is
  rendered.
- **Status says what happened.** The row's status is `sent` when the mailer
  reported success and `failed` when it did not. A later send to the same
  student, term and address overwrites the row.
- **Resending is driven by the rows.** SlateAdmin only offers recipients
  whose status is `proposed` (no row), `failed` or `bounced`, so an email
  recorded as `sent` is not sent again by a retry from that screen.

### Response

The response reports `emailsCount`, the number of emails the mailer
accepted, and `recipientsCount`, the number of recipient addresses the
emails were addressed to (not counting the archive address).

### Progress notes

Adding recipients to a note sends it once, to every recipient whose status
is `pending`: those the request added and any left over from a failed
attempt. Recipients already `sent` are not mailed again.

- **Recorded before anything else.** When the mailer reports success, each of
  those recipients is saved as `sent` straight after the send, before the
  note itself is marked `sent` or saved. Nothing that can fail runs between
  the send and those saves.
- **Failure leaves them pending.** When the mailer reports failure, the
  request fails with the mailer's error message, and the recipients stay
  `pending` so the note can be sent again.
- **The request does not change error handling.** Sending a note does not
  raise the request's error reporting level, so a notice or deprecation
  later in the request cannot turn into a failure after the mail went out.
