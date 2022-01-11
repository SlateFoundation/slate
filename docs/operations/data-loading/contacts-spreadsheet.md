# Contacts Spreadsheet

## Initialize git branch

Initialize a new git repository if needed, or just `cd` into an existing one:

```bash
git init myschool-slate
cd myschool-slate
```

Then check out a fresh branch to track content import content:

```bash
git checkout --orphan gitsheets/imports/contacts
```

Declare a new gitsheet to store contact data by creating this file:

=== ".gitsheets/student-contacts.toml"

    ```toml
    [gitsheet]
    root = "student-contacts"
    path = "${{ '{{' }} student.username }}"

    [gitsheet.fields.student]
    default = {}
    ```

Finally, stage and commit the gitsheet declaration:

```bash
git add .gitsheets/student-contacts.toml
git commit -m "feat: define student-contacts gitsheet"
```

## Spreadsheet template

Populate this template with student and relationship contact details:

```csv
student.name,student.username,student.number,student.email.personal,student.phone.home,student.phone.mobile,guardian1.name,guardian1.relationship,guardian1.email.personal,guardian1.phone.home,guardian1.phone.mobile,guardian1.phone.work,guardian2.name,guardian2.relationship,guardian2.email.personal,guardian2.phone.home,guardian2.phone.mobile,guardian2.phone.work
John Doe,johndoe7,,johndoe7@gmail.com,,267-111-1234,Michael Doe,Father,michaeldoe7@gmail.com,,267-222-1234,394-231-3245,Jane Doe,Mother,janedoe7@gmail.com,,267-384-2835,325-234-3818
```

## Load spreadsheet into gitsheet

Use the `git sheet upsert` command to load the filled CSV from the previous template:

```bash
git sheet upsert \
    --delete-missing \
    "student-contacts" \
    ~/Downloads/myschool_contacts.csv
```

And then commit the resulting staged records:

```bash
git commit -m "data: load student contacts from spreadsheet"
```

## Review relationship labels

Use this command to analyze all the relationship labels used in this dataset:

```bash
git sheet query student-contacts \
    | jq '[ .[].guardian1.relationship, .[].guardian2.relationship ] | unique'
```

If any strange values or abbreviations are present, consider using find/replace on the original spreadsheet to normalize this with some more standard values, and then repeat the load step above to add a commit with your changes.

## Extract data from Slate instance into gitsheet

Install the `slate-gitsheets` command if needed:

```bash
npm install -g slate-gitsheets
```

Download users from Slate into another branch:

```bash
slate-gitsheets extract-slate \
    --ref=gitsheets/slate \
    --host=https://myschool.org/ \
    --host-name=myschool
```

## Merge spreadsheet data into Slate data

Merge data from the `student-contacts` gitsheet into the Slate `users` gitsheet:

```bash
slate-gitsheets merge-contacts \
    --contacts-ref=gitsheets/imports/contacts \
    --slate-ref=gitsheets/slate
```

## Load data from gitsheets into Slate instance

```bash
slate-gitsheets load-slate \
    --ref=gitsheets/slate \
    --host=https://myschool.org/ \
    --host-name=myschool
```
