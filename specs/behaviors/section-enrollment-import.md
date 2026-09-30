# Behavior: section enrollment import

## Rule

A spreadsheet import of section enrollments never lowers a person's role in a
section. Staff raise roles by hand (a student made an assistant, say) and an
import that ran afterwards must not undo that.

## Applies To

The spreadsheet connectors built on
`Slate\Connectors\AbstractSpreadsheetConnector` (Google Sheets and any
deployment connector extending it): the enrollments import, which sets role
Student, and the sections import, which sets role Teacher for each section's
teachers.

## Details

### Role rank

Section participant roles rank, lowest to highest: Observer, Student,
Assistant, Teacher. The rank is declared once, with the role list itself
(`Slate\Courses\ParticipantRole`), and the participant record's Role enum is
built from it. A role outside that list is unranked: it neither outranks nor
is outranked, so an import handles it as it always has.

### Import onto an existing participant

- **Higher existing role is kept.** When the person is already a participant
  in the section with a role that ranks above the one the row would set, the
  role is left as it is. The row's other participant fields (start and end
  dates, where a deployment maps them) are still applied.
- **Otherwise the row's role applies.** A person not yet in the section is
  added with the row's role; a participant whose role ranks the same as or
  below the row's is set to the row's role.
- **The job log says so.** Each kept role writes a notice-level line naming
  the person, the section, the role kept and the role the row carried.
- **Results stay truthful.** A row that changed nothing is not counted as
  created or updated. A kept role is counted under `enrollments-role-kept`;
  if the row's dates changed the participant, it is also an update.
- **Pretend mode reports the same.** A pretend run makes the same decisions,
  writes the same log lines and returns the same counts as a real run; it
  only skips saving.

### Pruning

After reading the sheet, the enrollments import removes, from each section the
sheet lists, every participant with role Student who is absent from the
sheet's rows for that section. A participant whose higher role was kept is
not a Student, so pruning never removes or changes them. Their row still
counts as listing the section, so a section whose only listed person holds a
kept role is still pruned of absent students.
