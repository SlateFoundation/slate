describe('SlateAdmin: Settings managers', () => {

    // reset database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Terms tree manager: create root and child (inherited dates), then delete', () => {
        cy.loginAs();
        cy.visit('/manage#settings/terms');

        cy.get('.x-grid-item', { timeout: 20000 });
        cy.title().should('contain', 'Terms — Settings');

        // create a root term via the bottom-bar button; only Title is
        // entered, so the record stays phantom until dates are set
        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).then(() => {
                extQuerySelector('terms-manager button[action=create-term]').el.dom.click();
            });

            cy.focused().type('E2E Term{enter}');

            // set the required dates and re-trigger the save path
            cy.wrap(null).should(() => {
                const manager = extQuerySelector('terms-manager'),
                    record = manager.getStore().findRecord('Title', 'E2E Term');

                expect(record, 'created row').to.be.ok;
            }).then(() => {
                const manager = extQuerySelector('terms-manager'),
                    record = manager.getStore().findRecord('Title', 'E2E Term'),
                    editor = manager.getPlugin('cellediting');

                // date values as Y-m-d strings — a Date constructed in the
                // spec frame fails Ext's cross-frame instanceof check and
                // converts to null, leaving the record invalid
                record.set({
                    StartDate: '2030-09-01',
                    EndDate: '2030-12-20'
                });
                // re-trigger the save path through the grid's edit contract
                // (the date cells are date-picker edits in real usage)
                manager.fireEvent('edit', editor, { record: record });
            });

            // root term persists
            cy.wrap(null).should(() => {
                const record = extQuerySelector('terms-manager').getStore().findRecord('Title', 'E2E Term');

                expect(record.phantom, 'root saved').to.be.false;
            });

            // create a child — dates inherit from the parent, so it saves
            // as soon as it has a title
            cy.wrap(null).then(() => {
                const manager = extQuerySelector('terms-manager');

                manager.fireEvent('createtermclick', manager, manager.getStore().findRecord('Title', 'E2E Term'));
            });

            // the child editor starts after the parent node expands plus a
            // deferred startEdit — wait for it before typing
            cy.wrap(null).should(() => {
                expect(extQuerySelector('terms-manager').getPlugin('cellediting').getActiveEditor(), 'child editor active').to.be.ok;
            });

            cy.focused().type('E2E Child Term{enter}');

            cy.wrap(null).should(() => {
                const record = extQuerySelector('terms-manager').getStore().findRecord('Title', 'E2E Child Term');

                expect(record, 'child row').to.be.ok;
                expect(record.phantom, 'child saved').to.be.false;
                expect(record.get('StartDate'), 'inherited start date').to.be.ok;
            });

            // delete child then root through the confirm flow
            ['E2E Child Term', 'E2E Term'].forEach((title) => {
                cy.wrap(null).then(() => {
                    const manager = extQuerySelector('terms-manager');

                    manager.fireEvent('deletetermclick', manager, manager.getStore().findRecord('Title', title));
                });

                cy.contains('.x-message-box .x-btn', 'Yes').click();

                cy.wrap(null).should(() => {
                    expect(extQuerySelector('terms-manager').getStore().findRecord('Title', title), title + ' removed').to.be.null;
                });
            });
        });
    });

    it('Departments manager: prompt-create and delete', () => {
        cy.loginAs();
        cy.visit('/manage#settings/departments');

        cy.get('.x-grid', { timeout: 20000 });
        cy.title().should('contain', 'Departments — Settings');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                expect(extQuerySelector('departments-manager button[action=create-department]'), 'create button').to.be.ok;
            }).then(() => {
                extQuerySelector('departments-manager button[action=create-department]').el.dom.click();
            });

            cy.get('.x-message-box input[type=text]').filter(':visible').type('E2E Dept');
            cy.contains('.x-message-box .x-btn', 'OK').click();

            cy.wrap(null).should(() => {
                const record = extQuerySelector('departments-manager').getStore().findRecord('Title', 'E2E Dept');

                expect(record, 'created').to.be.ok;
                expect(record.phantom, 'saved').to.be.false;
            });

            cy.wrap(null).then(() => {
                const manager = extQuerySelector('departments-manager');

                manager.fireEvent('deletedepartmentclick', manager, manager.getStore().findRecord('Title', 'E2E Dept'));
            });

            cy.contains('.x-message-box .x-btn', 'Yes').click();

            cy.wrap(null).should(() => {
                expect(extQuerySelector('departments-manager').getStore().findRecord('Title', 'E2E Dept'), 'removed').to.be.null;
            });
        });
    });
});
