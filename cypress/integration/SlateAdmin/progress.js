describe('SlateAdmin: Progress reports', () => {

    // reset database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Author and save an interim report draft', () => {
        cy.loginAs();
        cy.visit('/manage#progress/interims/report');

        // the fixture terms are date-relative and may leave no current/
        // reporting term (summer gap) — dismiss the pick-a-term alert if shown
        cy.get('.x-panel', { timeout: 20000 });
        cy.get('body').then(($body) => {
            if ($body.find('.x-message-box:visible').length) {
                cy.contains('.x-message-box .x-btn', 'OK').click();
            }
        });

        cy.withExt().then(({ Ext, extQuerySelector }) => {
            // select the 1st-Quarter term (stable across fixture years)
            cy.wrap(null).should(() => {
                expect(Ext.getStore('Terms').isLoaded(), 'terms loaded').to.be.true;
            }).then(() => {
                const termSelector = extQuerySelector('progress-interims-sectionsgrid #termSelector'),
                    term = Ext.getStore('Terms').findBy((record) => (/1st Quarter$/).test(record.get('Title')));

                termSelector.setSelection(Ext.getStore('Terms').getAt(term));
            });

            // section list loads for the term
            cy.wrap(null).should(() => {
                expect(extQuerySelector('progress-interims-sectionsgrid').getStore().getCount(), 'sections').to.be.greaterThan(0);
            }).then(() => {
                const sectionsGrid = extQuerySelector('progress-interims-sectionsgrid');

                sectionsGrid.getSelectionModel().select(0);
            });

            // students load; select the first
            cy.wrap(null).should(() => {
                expect(extQuerySelector('progress-interims-studentsgrid').getStore().getCount(), 'students').to.be.greaterThan(0);
            }).then(() => {
                extQuerySelector('progress-interims-studentsgrid').getSelectionModel().select(0);
            });

            // editor form enables with a report record loaded
            cy.wrap(null).should(() => {
                const editorForm = extQuerySelector('progress-interims-editorform');

                expect(editorForm.disabled, 'editor enabled').to.be.false;
                expect(editorForm.getRecord(), 'report record').to.be.ok;
            });
        });

        // author notes and save a draft
        cy.intercept('POST', '/progress/section-interim-reports/save*').as('saveReport');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                extQuerySelector('progress-interims-editorform').getForm().findField('Notes').setValue('E2E interim note');
            });

            cy.wrap(null).should(() => {
                expect(extQuerySelector('progress-interims-editorform button#saveDraftBtn').disabled, 'save enabled').to.be.false;
            }).then(() => {
                extQuerySelector('progress-interims-editorform button#saveDraftBtn').el.dom.click();
            });
        });

        cy.wait('@saveReport').its('response.statusCode').should('eq', 200);

        // verify the draft persisted server-side
        cy.request('/progress/section-interim-reports?format=json').its('body.data').should((reports) => {
            expect(reports.length).to.be.greaterThan(0);
            expect(reports[0].Status).to.eq('draft');
            expect(reports[0].Notes).to.contain('E2E interim note');
        });
    });

    it('Print container loads a printout', () => {
        cy.loginAs();
        cy.visit('/manage#progress/interims/print');

        cy.get('.x-panel', { timeout: 20000 });
        cy.title().should('contain', 'Manage Slate');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                expect(extQuerySelector('progress-interims-print-container button[action=load-printout]'), 'load button').to.be.ok;
            }).then(() => {
                extQuerySelector('progress-interims-print-container button[action=load-printout]').el.dom.click();
            });

            cy.wrap(null).should(() => {
                const preview = extQuerySelector('progress-interims-print-container slate-printpreview');

                expect(preview.iframeEl.dom.src, 'printout URL').to.contain('section-interim-reports');
            });
        });
    });
});
