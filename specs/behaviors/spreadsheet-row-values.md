# Behavior: spreadsheet import row values

## Rule

A spreadsheet import fails a row whose value it cannot use, and goes on to
the next row. One bad cell never stops the whole job.

## Applies To

The person imports (students, alumni and staff) of the spreadsheet
connectors built on `Slate\Connectors\AbstractSpreadsheetConnector` (Google
Sheets and any deployment connector extending it).

## Details

### Numbers the import computes with

A column the import does arithmetic on must hold a number. Today that is
`Grade`, from which a student's graduation year is computed when the row has
no `Graduation Year`.

- **Blank is absent.** A blank cell is treated as if the column were not
  there, as it always has been.
- **Anything else must be numeric.** A value that is not a number (`K`,
  `10th`) fails the row under `grade-not-numeric`, keyed by the value, and
  the job log names the row's value. The row changes nothing.
- **Other rows go on.** The rest of the sheet is imported as usual and the
  job completes.
