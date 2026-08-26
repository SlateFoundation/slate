/**
 * SlateAdmin: Merge queue
 *
 * Covers the queue -> compare -> decide loop, seeded through the real
 * detector path an operator would use (there's no direct create-candidate
 * API -- candidates are only ever written by detectors or
 * Merge::execute(), see Candidate.php).
 *
 * Verified end-to-end against a live container built from this branch
 * (see PR #401's review): `admin`/`admin` login works against the merge
 * endpoints' Administrator gate (unlike the rest of this suite, which runs
 * as TEST_USER=teacher, a Staff account); the merge_candidates/
 * merge_audits/merge_followup_actions tables have no migration or fixture
 * SQL but Emergence's ActiveRecord auto-creates them on first live query,
 * confirmed working; and `/powertools/duplicate-detection.php` is
 * web-reachable and idempotent as described. The seeding block below
 * reflects the fixes that verification surfaced -- see the `before()`
 * comments.
 *
 * @see specs/behaviors/person-merge.md
 * @see specs/api/person-merge.md
 */
describe('SlateAdmin: Merge queue', () => {
    let candidateId;

    // reset database, then seed one open duplicate-candidate pair by
    // driving the real detector path an operator would use
    // (site-root/powertools/duplicate-detection.php)
    before(() => {
        cy.resetDatabase();
        cy.loginAs('admin', 'admin');

        // /people/save expects the records-proxy write envelope (an array
        // of record deltas under `data`), not flat fields -- and needs
        // ?format=json or the server 500s trying to render a
        // peopleSaved.tpl that doesn't exist in the composed site
        const duplicatePersonPayload = {
            data: [{
                Class: 'Emergence\\People\\Person',
                FirstName: 'MergeQueueE2E',
                LastName: 'DuplicatePerson'
            }]
        };

        cy.request({
            method: 'POST',
            url: '/people/save?format=json',
            form: true,
            body: duplicatePersonPayload
        });
        cy.request({
            method: 'POST',
            url: '/people/save?format=json',
            form: true,
            body: duplicatePersonPayload
        });

        cy.request({
            method: 'POST',
            url: '/powertools/duplicate-detection.php',
            form: true,
            body: {
                run: 1
            }
        });

        cy.request('/people/merge/candidates?status=open&include=Person1,Person2&format=json')
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
