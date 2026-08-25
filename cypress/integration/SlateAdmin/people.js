describe('SlateAdmin: People', () => {

    // reset database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Search deep link syncs results, field, and title', () => {
        cy.loginAs();
        cy.visit('/manage#people/search/teacher');

        // grid rows render for the query results
        cy.get('.x-grid-item', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                expect(extQuerySelector('people-grid').getStore().getCount()).to.be.greaterThan(0);
                expect(extQuerySelector('people-navpanel jarvus-searchfield').getValue()).to.eq('teacher');
            });
        });

        cy.title().should('contain', '“teacher”');
    });

    it('Lookup deep link activates tab; tab switch syncs URL; back returns', () => {
        cy.loginAs();
        cy.visit('/manage#people/lookup/student/contacts');

        cy.contains('.x-tab.x-tab-active', 'Contacts', { timeout: 20000 });
        cy.title().should('contain', 'Contacts');
        cy.title().should('contain', 'Student Slate');

        // switch tab through the UI -> URL enriches
        cy.contains('.x-tab', 'Profile').click();
        cy.location('hash', { timeout: 10000 }).should('eq', '#people/lookup/student/profile');
        cy.title().should('contain', 'Profile');

        // back through tab history
        cy.go('back');
        cy.location('hash', { timeout: 10000 }).should('eq', '#people/lookup/student/contacts');
    });

    it('Create person selects a phantom and disables other tabs', () => {
        cy.loginAs();
        cy.visit('/manage#people/create');

        cy.contains('.x-tab.x-tab-active', 'Profile', { timeout: 20000 });
        cy.title().should('contain', 'Create Person');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                const person = extQuerySelector('people-manager').getSelectedPerson();

                expect(person, 'selected person').to.be.ok;
                expect(person.phantom, 'phantom').to.be.true;
            });
        });

        // non-active tabs disabled while record is phantom
        cy.contains('.x-tab', 'Contacts').should('have.class', 'x-item-disabled');
    });

    it('Advanced search round-trips through the URL', () => {
        cy.loginAs();
        cy.visit('/manage#people');

        cy.get('.x-grid-item, .x-grid', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            // wait for the nav panel surfaces to exist, then drive the form
            cy.wrap(null).should(() => {
                expect(extQuerySelector('people-advancedsearchform'), 'advanced search form').to.be.ok;
            });

            cy.wrap(null).then(() => {
                extQuerySelector('people-advancedsearchform').getForm().findField('firstname').setValue('Teacher');
                extQuerySelector('people-navpanel button[action=search]').el.dom.click();
            });
        });

        cy.location('hash', { timeout: 10000 }).should('eq', '#people/search/firstname:Teacher');

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                expect(extQuerySelector('people-navpanel jarvus-searchfield').getValue()).to.eq('firstname:Teacher');
            });
        });
    });
});
