# Behavior: progress report emails

## Rule

Sending progress report emails records the outcome of each email as soon as
that email has been handed to the mailer, before the next one is sent. A
request that fails part-way through never leaves an email that went out
without a record saying so, which would let the next attempt send it again.

## Applies To

The `*emails` endpoint of the section term and interim report handlers
(`Slate\Progress\AbstractSectionTermReportsRequestHandler` and its
subclasses): `POST /progress/section-interim-reports/*emails` and
`POST /progress/section-term-reports/*emails`, as SlateAdmin's report email
screens use them.

## Details

### What one email is

The POSTed body is a list of emails. Each names a set of reports (one
student's) and a set of recipient people. The email is rendered from those
of its reports that are published and sent once, to every one of its
recipients who has a primary email address.

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
