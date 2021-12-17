describe('SlateAdmin: Contacts', () => {

    // reset database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Add and edit postal contact point', () => {
        // login and open contact panel
        cy.loginAs();
        cy.visit('/manage#people/lookup/student/contacts');


        // set up intercept for contact point save operations
        cy.intercept('POST', '/contact-points/save?*').as('saveContactPoint');


        // add and save a work address via composite string
        cy.get('.contact-postal.slate-grid-phantom')
            .scrollIntoView()
            .contains('Add new')
                .click();

        cy.contains('.x-boundlist-item', 'Work Address')
            .click();

        cy.get('.contact-postal').last()
            .should('have.class', 'slate-grid-phantom')
            .find('.x-grid-cell:first-child')
                .should('have.class', 'x-grid-dirty-cell');

        cy.focused()
            .type('908 N 3rd St, Suite B, Philadelphia, PA 19123{enter}');

        cy.wait('@saveContactPoint');
        cy.get('@saveContactPoint.all').should('have.length', 1);

        cy.get('.contact-postal').should('have.length', 3);

        cy.get('.contact-postal').eq(-2)
            .should('have.class', 'contact-primary')
            .find('.x-grid-cell:first-child')
                .should('not.have.class', 'x-grid-dirty-cell');


        // edit and save address via form
        cy.get('.contact-postal').eq(-2)
            .find('.contact-cell-value .x-grid-cell-inner')
                .should('have.text', '908 N 3rd St, Suite B, Philadelphia, PA 19123')
                .click();

        cy.focused()
            .closest('.x-form-trigger-wrap')
            .find('.x-form-trigger')
                .click();

        cy.get('.contact-postal-picker-form').within(() => {
            cy.get('input[name=name]')
                .click()
                .type('Localhost');

            cy.get('input[name=unit]')
                .click()
                .type('{selectall}{backspace}Suite A');

            cy.contains('.x-btn-button', 'Save')
                .click();
        });

        cy.wait('@saveContactPoint');
        cy.get('@saveContactPoint.all').should('have.length', 2);


        // edit and save address via composite string
        cy.get('.contact-postal').eq(-2)
            .find('.contact-cell-value .x-grid-cell-inner')
                .should('have.text', 'Localhost, 908 N 3rd St, Suite A, Philadelphia, PA 19123')
                .click();

        cy.focused()
            .type('{backspace}'.repeat(22))
            .type('Philly{enter}');

        cy.wait('@saveContactPoint');
        cy.get('@saveContactPoint.all').should('have.length', 3);

        cy.get('.contact-postal').eq(-2)
            .find('.contact-cell-value')
            .within(() => {
                cy.get('.x-grid-cell-inner')
                    .should('have.text', 'Localhost, 908 N 3rd St, Suite A, Philly');

                cy.root()
                    .should('have.class', 'x-grid-dirty-cell')
                    .trigger('mouseover')
                    .should('have.attr', 'data-errorqtip')
                        .and('match', /Postal code or city\+state is required/i);

                cy.root()
                    .click();

                cy.focused()
                    .type(', PA{enter}');
            });

        cy.wait('@saveContactPoint');
        cy.get('@saveContactPoint.all').should('have.length', 4);

        cy.get('.contact-postal').eq(-2)
            .find('.contact-cell-value .x-grid-cell-inner')
                .should('have.text', 'Localhost, 908 N 3rd St, Suite A, Philly, PA');


        // add a second address via form
        cy.get('.contact-postal.slate-grid-phantom').scrollIntoView()
            .contains('Add new')
                .click();

        cy.contains('.x-boundlist-item', 'Home Address')
            .click();

        cy.focused()
            .closest('.x-form-trigger-wrap')
            .find('.x-form-trigger')
                .click();

        cy.get('.contact-postal-picker-form').within(() => {
            cy.get('input[name=name]')
                .click()
                .type('The White House');

            cy.get('input[name=number]')
                .click()
                .type('1600');

            cy.get('input[name=street]')
                .click()
                .type('Pennsylvania Avenue NW');

            cy.get('input[name=city]')
                .click()
                .type('Washington');

            cy.get('input[name=state]')
                .click()
                .type('DC');

            cy.get('input[name=postal]')
                .click()
                .type('20500');

            cy.contains('.x-btn-button', 'Save')
                .click();

            cy.wait('@saveContactPoint');
            cy.get('@saveContactPoint.all').should('have.length', 5);
        });

        cy.get('.contact-postal').should('have.length', 4);


        // verify new address and toggle primary
        cy.get('.contact-postal').eq(-2)
            .within(() => {
                cy.root().should('not.have.class', 'slate-grid-phantom');
                cy.root().should('not.have.class', 'contact-primary');

                cy.get('.x-grid-cell').eq(0)
                    .should('not.have.class', 'x-grid-dirty-cell');

                cy.get('.x-grid-cell').eq(1)
                    .should('not.have.class', 'x-grid-dirty-cell');

                cy.get('.contact-cell-value .x-grid-cell-inner')
                    .should('have.text', 'The White House, 1600 Pennsylvania Avenue NW, Washington, DC 20500');

                cy.intercept('POST', '/people/save?*').as('savePerson');

                cy.get('.x-action-col-glyph.glyph-star')
                    .should('have.class', 'glyph-inactive')
                    .click();

                cy.wait('@savePerson');
                cy.get('@savePerson.all').should('have.length', 1);

                cy.root().should('have.class', 'contact-primary');
            });

        cy.get('.contact-postal').eq(1)
            .should('not.have.class', 'contact-primary');


        // type in text field and then finish edit with form
        cy.get('.contact-postal').eq(-2)
            .find('.contact-cell-value')
                .click();

        cy.focused()
            .clear()
            .type('Hello world')
            .closest('.x-form-trigger-wrap')
            .find('.x-form-trigger')
                .click();

        cy.get('.contact-postal-picker-form').within(() => {
            cy.get('input[name=unit]')
                .click()
                .type('{selectall}{backspace}Suite 123');

            cy.contains('.x-btn-button', 'Save')
                .click();
        });

        cy.wait('@saveContactPoint');
        cy.get('@saveContactPoint.all').should('have.length', 6);

        cy.get('.contact-postal').eq(-2)
            .find('.contact-cell-value .x-grid-cell-inner')
                .should('have.text', 'The White House, 1600 Pennsylvania Avenue NW, Suite 123, Washington, DC 20500');


        // save invalid via text field and then overwrite with form
        cy.get('.contact-postal').eq(-3)
            .find('.contact-cell-value')
                .click();

        cy.focused()
            .clear()
            .type('Hello world{enter}');

        cy.wait('@saveContactPoint');
        cy.get('@saveContactPoint.all').should('have.length', 7);

        cy.get('.contact-postal').eq(-3)
            .find('.contact-cell-value')
                .within(() => {
                    cy.get('.x-grid-cell-inner')
                        .should('have.text', 'Hello world');

                    cy.root()
                        .should('have.class', 'x-grid-dirty-cell')
                        .trigger('mouseover')
                        .should('have.attr', 'data-errorqtip')
                            .and('match', /Street number is required/i)
                            .and('match', /Street name is required/i)
                            .and('match', /Postal code or city\+state is required/i);

                    cy.root()
                        .click();

                    cy.focused()
                        .closest('.x-form-trigger-wrap')
                        .find('.x-form-trigger')
                            .click();
                });

        cy.get('.contact-postal-picker-form').within(() => {
            cy.get('input[name=city]')
                .click()
                .type('{selectall}{backspace}Philadelphia');

            cy.get('input[name=postal]')
                .click()
                .type('19123');

            cy.contains('.x-btn-button', 'Save')
                .click();
        });

        cy.wait('@saveContactPoint');
        cy.get('@saveContactPoint.all').should('have.length', 8);

        cy.get('.contact-postal').eq(-3)
            .find('.contact-cell-value')
                .within(() => {
                    cy.get('.x-grid-cell-inner')
                        .should('have.text', 'Localhost, 908 N 3rd St, Suite A, Philadelphia, PA 19123');

                    cy.root()
                        .should('not.have.class', 'x-grid-dirty-cell')
                        .trigger('mouseover')
                        .should('have.attr', 'data-errorqtip', '');
                });
    });

});