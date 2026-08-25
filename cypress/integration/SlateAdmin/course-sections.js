describe('SlateAdmin: Course sections', () => {

    // reset database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Section select routes to lookup; tab switch syncs URL', () => {
        cy.loginAs();
        cy.visit('/manage#course-sections');

        cy.get('.x-grid-item', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                expect(extQuerySelector('courses-sections-manager grid').getStore().getCount(), 'sections').to.be.greaterThan(0);
            }).then(() => {
                extQuerySelector('courses-sections-manager grid').getSelectionModel().select(0);
            });
        });

        cy.location('hash', { timeout: 10000 }).should('match', /^#course-sections\/lookup\/[^/]+\/profile$/);

        // re-enter through the URL: selection redirects and the route then
        // re-dispatches asynchronously, re-asserting the profile tab — a
        // tab click in that window gets clobbered back. A fresh load runs
        // the route choreography exactly once, so waiting for the profile
        // load below guarantees a settled tab panel
        cy.reload();
        cy.get('.x-grid-item', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null, { timeout: 15000 }).should(() => {
                expect(extQuerySelector('courses-sections-details-profile').getLoadedSection(), 'profile loaded').to.be.ok;
            });
        });

        // tab switch through the UI -> URL enriches
        cy.contains('.x-tab', 'Participants').find('.x-tab-inner').click();
        cy.location('hash', { timeout: 10000 }).should('match', /\/participants$/);

        // participants grid renders for the section
        cy.get('.x-grid-item', { timeout: 10000 });

        // back returns to the profile tab route
        cy.go('back');
        cy.location('hash', { timeout: 10000 }).should('match', /\/profile$/);
    });
});
