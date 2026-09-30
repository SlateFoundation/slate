describe('SlateAdmin: Course sections', () => {

    // reset database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Section select syncs URL; lookup route loads; tab switch syncs URL', () => {
        cy.loginAs();

        // enter through an explicit search: the bare #course-sections landing
        // applies a current-term filter whenever the date-relative fixture
        // terms provide a current term, rewriting the URL and re-running the
        // route — a selection made in that window gets cleared
        cy.visit('/manage#course-sections/search/MATH');

        cy.get('.x-grid-item', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null).should(() => {
                expect(extQuerySelector('courses-sections-manager grid').getStore().getCount(), 'sections').to.be.greaterThan(0);
            }).then(() => {
                extQuerySelector('courses-sections-manager grid').getSelectionModel().select(0);
            });
        });

        cy.location('hash', { timeout: 10000 }).should('match', /^#course-sections\/search\/MATH\/[^/]+\/profile$/);

        // enter through the lookup route, tab included: a route without its
        // tab redirects to add it and then re-dispatches asynchronously,
        // re-asserting the profile tab — a tab click in that window gets
        // clobbered back. A hash-only visit doesn't load the page, so reload:
        // a fresh load of the full route runs the route choreography exactly
        // once, and waiting for the profile load below guarantees a settled
        // tab panel
        cy.visit('/manage#course-sections/lookup/MATH-001/profile');
        cy.reload();
        cy.get('.x-grid-item', { timeout: 20000 });

        cy.withExt().then(({ extQuerySelector }) => {
            cy.wrap(null, { timeout: 15000 }).should(() => {
                expect(extQuerySelector('courses-sections-details-profile').getLoadedSection(), 'profile loaded').to.be.ok;
            });
        });

        cy.location('hash', { timeout: 10000 }).should('match', /^#course-sections\/lookup\/MATH-001\/profile$/);

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
