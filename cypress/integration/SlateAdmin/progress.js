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
            // when the fixture terms do provide a current/reporting term the
            // manager selects it and loads its sections on its own — let
            // that load settle first, or it lands on top of the steps below
            cy.wrap(null).should(() => {
                expect(Ext.getStore('Terms').isLoaded(), 'terms loaded').to.be.true;
                expect(extQuerySelector('progress-interims-sectionsgrid').getStore().isLoading(), 'initial sections load settled').to.be.false;
            }).then(() => {
                // select the 1st-Quarter term (stable across fixture years)
                const termSelector = extQuerySelector('progress-interims-sectionsgrid #termSelector'),
                    term = Ext.getStore('Terms').findBy((record) => (/1st Quarter$/).test(record.get('Title')));

                termSelector.setSelection(Ext.getStore('Terms').getAt(term));
            });

            // section list loads for the selected term
            cy.wrap(null).should(() => {
                const sectionsStore = extQuerySelector('progress-interims-sectionsgrid').getStore(),
                    termSelector = extQuerySelector('progress-interims-sectionsgrid #termSelector');

                expect(sectionsStore.isLoading(), 'sections loading').to.be.false;
                expect(sectionsStore.getProxy().getExtraParams().term, 'sections term').to.eq(termSelector.getValue());
                expect(sectionsStore.getCount(), 'sections').to.be.greaterThan(0);
            }).then(() => {
                const sectionsGrid = extQuerySelector('progress-interims-sectionsgrid');

                sectionsGrid.getSelectionModel().select(0);
            });

            // students and their reports load; select the first student
            cy.wrap(null).should(() => {
                const studentsStore = extQuerySelector('progress-interims-studentsgrid').getStore();

                expect(studentsStore.isLoading(), 'students loading').to.be.false;
                expect(Ext.getStore('progress.interims.Reports').isLoading(), 'reports loading').to.be.false;
                expect(studentsStore.getCount(), 'students').to.be.greaterThan(0);
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

        // verify the draft persisted server-side, asking for the term it was
        // written under — without one the list defaults to the current term
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => extQuerySelector('progress-interims-sectionsgrid #termSelector').getValue()).then((termHandle) => {
                cy.request({
                    url: '/progress/section-interim-reports',
                    qs: { format: 'json', term: termHandle }
                }).its('body.data').should((reports) => {
                    expect(reports.length).to.be.greaterThan(0);
                    expect(reports[0].Status).to.eq('draft');
                    expect(reports[0].Notes).to.contain('E2E interim note');
                });
            });
        });
    });

    // Sending report emails records each email's outcome as it goes, and the
    // count in the response agrees with it. The CI image has no sendmail, so
    // there the mailer reports failure and the row must say `failed`; with a
    // working transport it must say `sent`. Either way it must not be left
    // `proposed`, which is what let a failed request resend its first email.
    // @see specs/behaviors/progress-report-emails.md
    it('Sending report emails records each recipient status', () => {
        const studentId = 4; // fixture `student`, primary email slate+student@example.org

        // this test creates a report and recipient rows that a retry would
        // trip over, so each attempt starts from the fixtures (a reset in
        // the test body re-runs on retry; the file's before() does not)
        cy.resetDatabase();
        cy.loginAs();

        cy.request('/sections/MATH-001?format=json').its('body.data').then((section) => {
            cy.request('/terms?format=json').its('body.data').then((terms) => {
                const term = terms.find(candidate => candidate.ID === section.TermID);

                expect(term, 'section term').to.be.ok;

                // publish an interim report for the student in that section
                cy.request({
                    method: 'POST',
                    url: '/progress/section-interim-reports/save?format=json',
                    body: {
                        data: [{
                            StudentID: studentId,
                            SectionID: section.ID,
                            TermID: term.ID,
                            Status: 'published',
                            Notes: 'E2E emailed interim note'
                        }]
                    }
                }).then(({ body }) => {
                    expect(body.success, 'report saved').to.be.true;

                    const reportId = body.data[0].ID;

                    // before sending, the student is only a proposed recipient
                    cy.request({
                        url: '/progress/section-interim-reports/*emails',
                        qs: { format: 'json', term: term.Handle, recipients: 'student' }
                    }).its('body.data').then((emails) => {
                        const email = emails.find(candidate => candidate.student.ID === studentId);

                        expect(email.recipients[0].status, 'status before sending').to.eq('proposed');
                    });

                    cy.request({
                        method: 'POST',
                        url: '/progress/section-interim-reports/*emails?format=json',
                        body: [{ reports: [reportId], recipients: [studentId] }]
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.success).to.be.true;
                        expect(response.body.recipientsCount, 'recipients').to.eq(1);
                        expect(response.body.emailsCount, 'emails accepted').to.be.oneOf([0, 1]);

                        const expectedStatus = response.body.emailsCount === 1 ? 'sent' : 'failed';

                        cy.request({
                            url: '/progress/section-interim-reports/*emails',
                            qs: { format: 'json', term: term.Handle, recipients: 'student' }
                        }).its('body.data').then((emails) => {
                            const email = emails.find(candidate => candidate.student.ID === studentId);

                            expect(email.recipients[0].status, 'status after sending').to.eq(expectedStatus);
                        });
                    });
                });
            });
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
