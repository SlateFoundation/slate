/**
 * SlateAdmin: Merge queue
 *
 * SKIPPED for now -- see plans/slateadmin-merge-queue.md. This spec was
 * written and reviewed for correctness against the house Cypress
 * conventions (see .agents/skills/jarvus-extjs/references/testing.md) but
 * could not be executed against the real docker/hologit e2e harness in the
 * session that authored it, and depends on a few things that session could
 * only partially verify:
 *
 * - `cy.loginAs('admin', 'admin')`: the merge endpoints are Administrator-
 *   gated (unlike the rest of this suite, which runs as TEST_USER=teacher,
 *   a Staff account). The fixture `admin` user's password was confirmed
 *   independently (bcrypt-verified against fixtures/people.sql) to be
 *   'admin', but cy.loginAs() posting that credential end-to-end against
 *   the live container was not exercised here.
 * - `merge_candidates`/`merge_audits`/`merge_followup_actions` have no
 *   migration or fixture SQL (see fixtures/*.sql) -- Emergence's
 *   ActiveRecord auto-creates a class's table on first live query, which
 *   should make the tables appear the first time these tests hit the
 *   candidates endpoint. That auto-create path was not observed running.
 * - `/powertools/duplicate-detection.php` is assumed web-reachable the
 *   same way other `site-root/powertools/*.php` scripts are (an
 *   established Emergence convention), invoked here as a stand-in "seed a
 *   candidate pair" step since there's no other API for it (candidates are
 *   only ever written by detectors or Merge::execute() -- see Candidate.php).
 *
 * To un-skip: run the real e2e harness locally (see testing.md), confirm
 * the seeding block below actually produces an open candidate pair, adjust
 * selectors/URLs as needed, then flip `describe.skip` back to `describe`.
 *
 * @see specs/behaviors/person-merge.md
 * @see specs/api/person-merge.md
 */
describe.skip('SlateAdmin: Merge queue', () => {
    let candidateId;

    // reset database, then seed one open duplicate-candidate pair -- there
    // is no direct create-candidate API, so this drives the real detector
    // path an operator would use (site-root/powertools/duplicate-detection.php)
    before(() => {
        cy.resetDatabase();
        cy.loginAs('admin', 'admin');

        cy.request({
            method: 'POST',
            url: '/people/save',
            form: true,
            body: {
                'Class': 'Emergence\\People\\Person',
                'FirstName': 'MergeQueueE2E',
                'LastName': 'DuplicatePerson'
            }
        });
        cy.request({
            method: 'POST',
            url: '/people/save',
            form: true,
            body: {
                'Class': 'Emergence\\People\\Person',
                'FirstName': 'MergeQueueE2E',
                'LastName': 'DuplicatePerson'
            }
        });

        cy.request({
            method: 'POST',
            url: '/powertools/duplicate-detection.php',
            form: true,
            body: {
                run: 1
            }
        });

        cy.request('/people/merge/candidates?status=open&format=json')
            .its('body.data')
            .then((candidates) => {
                const match = candidates.find((candidate) =>
                    (candidate.Person1 && candidate.Person1.LastName === 'DuplicatePerson') ||
                    (candidate.Person2 && candidate.Person2.LastName === 'DuplicatePerson'));

                expect(match, 'seeded candidate pair').to.exist;
                candidateId = match.ID;
            });
    });

    it('Queue lists the seeded open candidate and filters by status', () => {
        cy.loginAs('admin', 'admin');
        cy.visit('/manage#merge-queue');

        cy.get('.x-grid-item', { timeout: 20000 });
        cy.contains('.x-grid-item', 'DuplicatePerson');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                const record = extQuerySelector('mergequeue-candidates-grid').getStore().getById(candidateId);

                expect(record, 'seeded row visible in open queue').to.be.ok;
            });
        });

        // switching the status filter reloads under a different URL --
        // fire the real 'select' event a user's combo pick would fire,
        // rather than reaching for a native <select> (this is a picker
        // field, not a native select element)
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                const statusField = extQuerySelector('mergequeue-candidates-grid #statusField');

                statusField.fireEvent('select', statusField, [statusField.getStore().findRecord('value', 'all')]);
            });
        });

        cy.location('hash', { timeout: 10000 }).should('eq', '#merge-queue/candidates/all');
    });

    it('Selecting a pair loads the compare view fed by the preview endpoint', () => {
        cy.loginAs('admin', 'admin');
        cy.visit(`/manage#merge-queue/candidates/open/${candidateId}`);

        cy.contains('.mergequeue-person-panel', 'DuplicatePerson', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                const compareCt = extQuerySelector('mergequeue-compare');

                expect(compareCt.getPreviewData(), 'preview loaded').to.be.ok;
                expect(compareCt.getPreviewData().impact, 'impact counts present').to.be.an('array');
            });
        });
    });

    it('Dismiss requires notes and updates the row in place, without a reload', () => {
        cy.loginAs('admin', 'admin');
        cy.visit(`/manage#merge-queue/candidates/open/${candidateId}`);

        cy.contains('.mergequeue-person-panel', 'DuplicatePerson', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                extQuerySelector('mergequeue-compare button[action=dismiss-candidate]').el.dom.click();
            });
        });

        // notes are required -- submitting blank closes the prompt and
        // surfaces a "notes required" alert rather than saving
        cy.contains('.x-message-box .x-btn', 'OK').click();
        cy.contains('.x-message-box', 'Notes required');
        cy.contains('.x-message-box .x-btn', 'OK').click();

        // try again, this time with a note
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                extQuerySelector('mergequeue-compare button[action=dismiss-candidate]').el.dom.click();
            });
        });

        cy.get('.x-message-box textarea, .x-message-box input[type=text]')
            .filter(':visible')
            .type('Not the same person -- verified against the SIS roster');
        cy.contains('.x-message-box .x-btn', 'OK').click();

        // row drops out of the open-status queue locally, no store reload
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                const record = extQuerySelector('mergequeue-candidates-grid').getStore().getById(candidateId);

                expect(record, 'dismissed row removed from the open queue').to.be.null;
            });
        });

        // server-side truth
        cy.request(`/people/merge/candidates/${candidateId}?format=json`)
            .its('body.data.Status')
            .should('eq', 'dismissed');
    });

    it('Follow-up actions queue is reachable and deep-linkable by status', () => {
        cy.loginAs('admin', 'admin');
        cy.visit('/manage#merge-queue/actions/all');

        cy.get('.x-grid', { timeout: 20000 });
        cy.title().should('contain', 'Follow-up Actions');
    });
});
