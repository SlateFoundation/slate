/**
 * Connectors: spreadsheet student import
 *
 * A row whose Grade is not a number fails on its own, under
 * `grade-not-numeric`, and the rest of the sheet imports. Before, the
 * graduation year arithmetic on such a cell threw a TypeError that stopped
 * the whole job.
 *
 * Drives the Google Sheets connector's synchronize endpoint in pretend mode,
 * the same AbstractSpreadsheetConnector::pullStudents path every
 * spreadsheet connector uses, with a CSV staged inside the site container,
 * so this spec needs SITE_CONTAINER mode. Pretend mode saves nothing.
 *
 * Passes whether or not a fixture term contains today: the master term
 * handle is read from the loaded fixtures rather than named.
 *
 * @see specs/behaviors/spreadsheet-row-values.md
 */

const csvPath = '/tmp/student-import-e2e.csv';

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

const sheet = [
    ['Student ID', 'First Name', 'Last Name', 'Grade'],
    ['E2E-9001', 'Import', 'Kindergarten', 'K'],
    ['E2E-9002', 'Import', 'Ordinal', '10th'],
    ['E2E-9003', 'Import', 'Numeric', '10']
];

describe('Connectors: student import', () => {

    beforeEach(() => {
        cy.resetDatabase();
        cy.loginAs('admin', 'admin');
        stageSheet(sheet);
    });

    it('Fails only the rows whose grade is not a number', () => {
        sql('SELECT Handle FROM terms WHERE ParentID IS NULL ORDER BY ID LIMIT 1').then((rows) => {
            cy.request({
                method: 'POST',
                url: '/connectors/google-sheets/synchronize/json',
                form: true,
                body: {
                    studentsCsv: csvPath,
                    masterTerm: rows[0][0],
                    pretend: 1
                }
            }).then((response) => {
                expect(response.body.success, 'job succeeded').to.equal(true);

                const results = response.body.data.Results['pull-students'];

                expect(results.analyzed).to.equal(3);
                expect(results.failed).to.deep.equal({
                    'grade-not-numeric': { 'K': 1, '10th': 1 }
                });
                expect(results.created, 'the numeric row').to.equal(1);
            });
        });
    });
});
