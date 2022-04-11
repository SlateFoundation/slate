describe('Admin login test', () => {

    // load sample database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Should toggle login modal display', () => {
        cy.visit('/');

        // should be visible after Log In click
        cy.get('#login-modal').should('not.be.visible');
        cy.get('.slate-omnibar.mobile-hidden').contains('Log In').click();
        cy.get('#login-modal').should('be.visible');

        // Should be hidden after cancel click
        cy.get('#login-modal').contains('Cancel').click();
        cy.get('#login-modal').should('not.be.visible');

        // Should be hidden after X click
        cy.get('.slate-omnibar.mobile-hidden').contains('Log In').click();
        cy.get('#login-modal').should('be.visible');
        cy.get('.modal-close-button').click();
        cy.get('#login-modal').should('not.be.visible');
    });

    it('Should show login error notification', () => {
        cy.visit('/');

        cy.get('#login-modal').should('not.be.visible');
        cy.get('.slate-omnibar.mobile-hidden').contains('Log In').click();

        cy.focused()
            .should('have.attr', 'name', '_LOGIN[username]')
            .type('admin')
            .tab();

        cy.focused()
            .should('have.attr', 'name', '_LOGIN[password]')
            .type('incorrectpassword{enter}');

        cy.contains('Sorry!')
            .parents('div')
            .should('have.attr', 'class', 'notify error');
    });

    it('Should login via Modal', () => {
        cy.visit('/');

        cy.get('#login-modal').should('not.be.visible');
        cy.get('.slate-omnibar.mobile-hidden').contains('Log In').click();

        cy.get('#login-modal').should('not.have.attr', 'display');
        cy.focused()
            .should('have.attr', 'name', '_LOGIN[username]')
            .type('admin')
            .tab();

        cy.focused()
            .should('have.attr', 'name', '_LOGIN[password]')
            .type('admin{enter}');

        cy.location('pathname').should('eq', '/');
    });
});