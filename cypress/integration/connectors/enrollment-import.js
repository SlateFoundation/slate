/**
 * Connectors: spreadsheet enrollment import
 *
 * An enrollment import never lowers a participant's role. The fixture
 * `student` is raised by hand to Assistant in MATH-001 and MATH-002, then a
 * sheet lists them as a student in both. They must stay Assistant, while
 * `student3` (listed, not yet enrolled) is still imported as a Student and
 * `student2` (enrolled, not listed) is still pruned from both sections.
 * MATH-001 lists only the kept Assistant, so it also shows that a section
 * listed by the kept role alone is still pruned.
 *
 * Drives the Google Sheets connector's synchronize endpoint, the same
 * AbstractSpreadsheetConnector::pullEnrollments path every spreadsheet
 * connector uses, with a CSV staged inside the site container. Setup and
 * checks go through the site container's MySQL, as the harness's own
 * resetDatabase does, so this spec needs SITE_CONTAINER mode.
 *
 * Passes whether or not a fixture term contains today: the import never
 * consults the current term, and the master term handle is read from the
 * loaded fixtures rather than named.
 *
 * Stock Slate maps no enrollment date columns, so the rule that a kept role
 * still takes the row's dates is covered by
 * phpunit-tests/slate.read-write/Connectors/EnrollmentImportRolesTest.php.
 *
 * @see specs/behaviors/section-enrollment-import.md
 */

const csvPath = '/tmp/enrollment-import-e2e.csv';

const siteDb = () => Cypress.env('SITE_DB') || 'emergence-site';

// run SQL in the site container; yields its output as rows of columns
function sql(query) {
    const mysql = `docker exec -i ${Cypress.env('SITE_CONTAINER')} mysql --socket=/run/mysqld/mysqld.sock -uroot --batch --skip-column-names '${siteDb()}'`;

    return cy.exec(`echo '${btoa(query)}' | base64 -d | ${mysql}`)
        .then(({ stdout }) => {
            const output = stdout.trim();
            return output ? output.split('\n').map(line => line.split('\t')) : [];
        });
}

// write the sheet to a file the connector can open inside the site container
function stageSheet(rows) {
    const csv = rows.map(row => row.join(',')).join('\n') + '\n';

    return cy.exec(`echo '${btoa(csv)}' | base64 -d | docker exec -i ${Cypress.env('SITE_CONTAINER')} sh -c 'cat > ${csvPath} && chmod 644 ${csvPath}'`);
}

// raise `student` to Assistant in both sections by hand, map both sections
// for the connector under the first master term, and yield that term's handle
function seed() {
    return sql(`
        SET @master = (SELECT Handle FROM terms WHERE ParentID IS NULL ORDER BY ID LIMIT 1);

        UPDATE course_section_participants
           SET Role = 'Assistant'
         WHERE PersonID = (SELECT ID FROM people WHERE Username = 'student')
           AND CourseSectionID IN (SELECT ID FROM course_sections WHERE Code IN ('MATH-001', 'MATH-002'));

        INSERT INTO connector_mappings (Class, ContextClass, ContextID, Source, Connector, ExternalKey, ExternalIdentifier)
        SELECT 'Emergence\\\\Connectors\\\\Mapping', 'Slate\\\\Courses\\\\Section', ID, 'creation', 'google-sheets', 'section[foreign_key]', CONCAT(@master, ':E2E-', Code)
          FROM course_sections
         WHERE Code IN ('MATH-001', 'MATH-002');

        SELECT @master;
    `).then(rows => rows[0][0]);
}

// yields "<section code> <username> <role>" for every participant in both sections
function participants() {
    return sql(`
        SELECT CONCAT(s.Code, ' ', p.Username, ' ', sp.Role)
          FROM course_section_participants sp
          JOIN course_sections s ON s.ID = sp.CourseSectionID
          JOIN people p ON p.ID = sp.PersonID
         WHERE s.Code IN ('MATH-001', 'MATH-002')
         ORDER BY s.Code, p.Username
    `).then(rows => rows.map(([line]) => line));
}

// POST the staged sheet to the connector; json mode yields the job record,
// html mode the job log page an operator sees
function runImport(masterTerm, { pretend = false, mode = 'json' } = {}) {
    const body = {
        enrollmentsCsv: csvPath,
        masterTerm
    };

    if (pretend) {
        body.pretend = 1;
    }

    return cy.request({
        method: 'POST',
        url: `/connectors/google-sheets/synchronize${mode === 'json' ? '/json' : ''}`,
        form: true,
        body
    });
}

function enrollmentResults(response) {
    expect(response.body.success, 'job succeeded').to.equal(true);
    return response.body.data.Results['pull-enrollments'];
}

const sheet = [
    ['Username', 'Section 1', 'Section 2'],
    ['student', 'E2E-MATH-002', 'E2E-MATH-001'],
    ['student3', 'E2E-MATH-002', '']
];

describe('Connectors: enrollment import', () => {

    // reset before every attempt: each test imports into the fixture
    // sections, and Cypress re-runs beforeEach (but NOT before) on a retry
    beforeEach(() => {
        cy.resetDatabase();
        cy.loginAs('admin', 'admin');
        stageSheet(sheet);
    });

    it('Keeps a raised role while importing and pruning plain students', () => {
        seed().then((masterTerm) => {
            runImport(masterTerm).then((response) => {
                const results = enrollmentResults(response);

                expect(results['rows-analyzed']).to.equal(2);
                expect(results['enrollments-analyzed']).to.equal(3);
                expect(results['enrollments-created'], 'student3 added').to.equal(1);
                expect(results['enrollments-updated'], 'nothing else changed').to.be.undefined;
                expect(results['enrollments-role-kept'], 'student kept in both sections').to.equal(2);
                expect(results['enrollments-removed'], 'student2 pruned from both sections').to.equal(2);
            });

            participants().then((lines) => {
                expect(lines).to.include('MATH-001 student Assistant');
                expect(lines).to.include('MATH-002 student Assistant');
                expect(lines).to.include('MATH-002 student3 Student');
                expect(lines.filter(line => line.includes(' student2 ')), 'student2 pruned').to.be.empty;

                // participants who are not students are never pruned
                expect(lines).to.include('MATH-001 teacher Teacher');
                expect(lines).to.include('MATH-001 teacher2 Teacher');
                expect(lines).to.include('MATH-001 admin Observer');
                expect(lines).to.have.length(6);
            });
        });
    });

    it('Changes nothing on a second import of the same sheet', () => {
        seed().then((masterTerm) => {
            runImport(masterTerm);

            participants().then((afterFirst) => {
                runImport(masterTerm).then((response) => {
                    const results = enrollmentResults(response);

                    expect(results['enrollments-created']).to.be.undefined;
                    expect(results['enrollments-updated']).to.be.undefined;
                    expect(results['enrollments-removed']).to.be.undefined;
                    expect(results['enrollments-role-kept']).to.equal(2);
                });

                participants().then(lines => expect(lines).to.deep.equal(afterFirst));
            });
        });
    });

    it('Reports the same in pretend mode as a real run, and logs each kept role', () => {
        seed().then((masterTerm) => {
            participants().then((beforeImport) => {
                runImport(masterTerm, { pretend: true }).then((pretendResponse) => {
                    const pretendResults = enrollmentResults(pretendResponse);

                    expect(pretendResponse.body.pretend).to.equal(true);
                    participants().then(lines => expect(lines, 'pretend saved nothing').to.deep.equal(beforeImport));

                    // the job page an operator reads names each kept role
                    runImport(masterTerm, { pretend: true, mode: 'html' }).then(({ body }) => {
                        const keptLines = body.match(/Kept existing role Assistant for user [^<]+ in section [^<]+ instead of lowering it to Student/g);
                        expect(keptLines, 'one log line per section').to.have.length(2);
                    });

                    participants().then(lines => expect(lines, 'pretend saved nothing').to.deep.equal(beforeImport));

                    runImport(masterTerm).then((realResponse) => {
                        expect(enrollmentResults(realResponse)).to.deep.equal(pretendResults);
                    });
                });
            });
        });
    });
});
