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

        // seed candidates through the JSON detection endpoint the admin
        // console's Run Detection button uses (the powertool page remains
        // as the browser-facing alternative over the same runner)
        cy.request({
            method: 'POST',
            url: '/people/merge/candidates/detect?format=json'
        }).its('body.data.totalMatches').should('be.greaterThan', 0);

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

        // before any selection the compare side shows the placeholder,
        // not a skeleton of empty surfaces
        cy.contains('.slate-placeholder', 'Select a candidate pair').should('be.visible');
        cy.get('.mergequeue-persons-row').should('not.be.visible');

        // the Run Detection button locks, re-runs the detectors, and
        // refreshes the queue in place (idempotent -- same rows return)
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                extQuerySelector('mergequeue-candidates-grid button[action=run-detection]').el.dom.click();
            });

            cy.wrap(null, { timeout: 15000 }).should(() => {
                const btn = extQuerySelector('mergequeue-candidates-grid button[action=run-detection]');

                expect(btn.isDisabled(), 'button re-enabled after run').to.be.false;
                expect(extQuerySelector('mergequeue-candidates-grid').getStore().getCount(), 'queue refreshed').to.be.greaterThan(0);
            });
        });

        cy.contains('.x-toast', 'duplicate match');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                const record = extQuerySelector('mergequeue-candidates-grid').getStore().getById(candidateId);

                expect(record, 'seeded row visible in open queue').to.be.ok;
            });
        });

        // switching the status filter reloads under a different URL --
        // fire the real 'select' event a user's combo pick would fire: in
        // Ext 6.2 classic a single-select combo passes ONE record, not an
        // array (an array-shaped test event here once validated a handler
        // the real UI never reached)
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                const statusField = extQuerySelector('mergequeue-candidates-grid #statusField');

                statusField.fireEvent('select', statusField, statusField.getStore().findRecord('value', 'all'));
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

            // selecting replaced the placeholder with the compare surfaces
            cy.get('.slate-placeholder').should('not.be.visible');
            cy.get('.mergequeue-persons-row').should('be.visible');

            // flipping the direction swaps source/target and re-fetches the
            // preview for the new direction
            cy.wrap(null).then(() => {
                const compareCt = extQuerySelector('mergequeue-compare');

                cy.wrap(compareCt.getPreviewData().source.ID).as('originalSourceID');
                cy.wrap(compareCt.getPreviewData().target.ID).as('originalTargetID');

                extQuerySelector('mergequeue-compare button[action=flip-direction]').el.dom.click();
            });

            cy.get('@originalSourceID').then((originalSourceID) => {
                cy.get('@originalTargetID').then((originalTargetID) => {
                    cy.wrap(null, { timeout: 10000 }).should(() => {
                        const previewData = extQuerySelector('mergequeue-compare').getPreviewData();

                        expect(previewData, 'flipped preview loaded').to.be.ok;
                        expect(previewData.source.ID, 'source is the old target').to.eq(originalTargetID);
                        expect(previewData.target.ID, 'target is the old source').to.eq(originalSourceID);
                    });
                });
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

        // the decided pair must be surfaceable again through the status
        // filter -- the roundtrip an operator relies on to revisit decisions
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                const statusField = extQuerySelector('mergequeue-candidates-grid #statusField');

                statusField.fireEvent('select', statusField, statusField.getStore().findRecord('value', 'dismissed'));
            });
        });

        cy.location('hash', { timeout: 10000 }).should('eq', '#merge-queue/candidates/dismissed');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null, { timeout: 10000 }).should(() => {
                expect(extQuerySelector('mergequeue-candidates-grid').getStore().getById(candidateId), 'dismissed row surfaced under its filter').to.be.ok;
            });
        });
    });

    it('Fixture cast produces a candidate from every detector', () => {
        cy.loginAs('admin', 'admin');

        cy.request('/people/merge/candidates?status=open&format=json').its('body.data').should((candidates) => {
            const detectors = candidates.map((candidate) => candidate.Detector);

            ['identical-name', 'shared-contact-point', 'identical-student-number', 'mapping-anomaly'].forEach((slug) => {
                expect(detectors, slug + ' candidate present').to.include(slug);
            });
        });
    });

    it('Merge with conflict resolution: resolve StudentNumber, merge, audit recorded', () => {
        cy.loginAs('admin', 'admin');

        // the Dana Okafor pair (fixture people 42/43): identical names,
        // differing StudentNumbers -- the compare view must demand a
        // resolution before enabling merge
        cy.request('/people/merge/candidates?status=open&format=json').its('body.data').then((candidates) => {
            const pair = candidates.find((candidate) => candidate.Person1ID === 42 && candidate.Person2ID === 43);

            expect(pair, 'Dana Okafor candidate').to.exist;

            cy.visit(`/manage#merge-queue/candidates/open/${pair.ID}`);

            cy.contains('.mergequeue-person-panel', 'Dana Okafor', { timeout: 20000 });

            // exactly one conflict rendered, merge gated on it
            cy.get('.mergequeue-conflict-row').should('have.length', 1);
            cy.withExt().then(({ extQuerySelector }) => {
                cy.wrap(null).should(() => {
                    expect(extQuerySelector('mergequeue-compare button[action=merge-candidate]').isDisabled(), 'merge gated on conflict').to.be.true;
                });
            });

            // pick the target's number through the real delegated-click path
            cy.get('.mergequeue-conflict-row button.conflict-option').last().click();

            cy.withExt().then(({ extQuerySelector }) => {
                cy.wrap(null).should(() => {
                    expect(extQuerySelector('mergequeue-compare button[action=merge-candidate]').isDisabled(), 'merge enabled after resolution').to.be.false;
                }).then(() => {
                    extQuerySelector('mergequeue-compare button[action=merge-candidate]').el.dom.click();
                });
            });

            cy.contains('.x-message-box .x-btn', 'Yes').click();

            // row leaves the open queue in place, no reload
            cy.withExt().then(({ extQuerySelector }) => {
                cy.wrap(null, { timeout: 15000 }).should(() => {
                    expect(extQuerySelector('mergequeue-candidates-grid').getStore().getById(pair.ID), 'merged row removed from open queue').to.be.null;
                });
            });

            // server-side truth: candidate merged with an audit attached
            cy.request(`/people/merge/candidates/${pair.ID}?format=json`).its('body.data').should((candidate) => {
                expect(candidate.Status).to.eq('merged');
                expect(candidate.MergeAuditID, 'audit recorded').to.be.a('number');
            });
        });
    });

    it('Merging a canvas-mapped pair spawns an executable follow-up action', () => {
        cy.loginAs('admin', 'admin');

        // merge the Avery Kim pair (fixture people 50/51, both canvas-mapped)
        // through the API -- the UI merge path is covered above; this test
        // targets the deriver -> follow-up-action -> actions-queue pipeline
        // status=all + the Status guard keep this test convergent under
        // Cypress retries: if a prior attempt's merge landed but a later
        // assertion failed, the retry proceeds to the assertions instead of
        // failing to find the already-merged pair in the open queue
        cy.request('/people/merge/candidates?status=all&format=json').its('body.data').then((candidates) => {
            const pair = candidates.find((candidate) => candidate.Person1ID === 50 && candidate.Person2ID === 51);

            expect(pair, 'Avery Kim candidate').to.exist;

            if (pair.Status === 'open') {
                cy.request({
                    method: 'POST',
                    url: '/people/merge?format=json',
                    body: {
                        sourceID: 51,
                        targetID: 50,
                        resolutions: {},
                        candidateID: pair.ID
                    }
                });
            }
        });

        cy.visit('/manage#merge-queue/actions');

        cy.get('.x-grid-item', { timeout: 20000 });
        cy.title().should('contain', 'Follow-up Actions');

        // the spawned canvas-user-merge action renders with its executor
        // flag and the linked merge's person names
        cy.contains('.x-grid-item', 'canvas');
        cy.contains('.x-grid-item', 'Executor');
        cy.contains('.x-grid-item', 'Avery Kim');
    });
});
