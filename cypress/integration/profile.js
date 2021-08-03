describe('Profile', () => {

    // reset database before tests
    before(() => {
        cy.resetDatabase();
    });

    it('Upload profile photos', () => {
        cy.readFile('cypress/integration/profile.json').then(({ selectors, values }) => {
            cy.loginAs();
            cy.visit('/profile');

            // upload same photo twice
            cy.upload_file('photo.jpg', 'image/jpeg', 'input[type=file]');
            cy.contains('Upload New Photo').click();
            cy.upload_file('photo.jpg', 'image/jpeg', 'input[type=file]');
            cy.contains('Upload New Photo').click();

            cy.get(selectors['gallery-photo-first'])
                .should('have.class', values['gallery-photo-selected-class'])
                .within(() => {
                    cy.get(selectors['gallery-default-link'])
                        .should('not.exist');
                })
                .next(selectors['gallery-photo'])
                    .should('not.have.class', values['gallery-photo-selected-class'])
                    .find(selectors['gallery-default-link'])
                        .should('exist')
                        .click();

            cy.get(selectors['gallery-photo-first'])
                .should('not.have.class', values['gallery-photo-selected-class'])
                .within(() => {
                    cy.get(selectors['gallery-default-link'])
                        .should('exist');
                })
                .next(selectors['gallery-photo'])
                    .should('have.class', values['gallery-photo-selected-class'])
                    .within(() => {
                        cy.get(selectors['gallery-default-link'])
                            .should('not.exist');
                    })
                .find('img')
                    .should(($img) => {
                        expect($img).to.have.attr('src').to.match(/^\/thumbnail\/2\/\d+x\d+(\/cropped)?$/);
                        expect($img).to.have.prop('width').to.be.a('number')
                        expect($img).to.have.prop('height').to.be.a('number')
                    });
        });
    });

    it('Fill out profile', () => {
        cy.readFile('cypress/integration/profile.json').then(({ selectors, values }) => {
            cy.loginAs();
            cy.visit('/profile');

            cy.get('input[name=Location]')
                .type('Philadelphia, PA')
                .tab();

            cy.focused()
                .should('have.attr', 'name', 'About')
                .type('Meow')
                .tab();

            cy.focused()
                .should('contain', values['profile-markdown-link-text'])
                .should('have.attr', 'href', values['profile-markdown-link-href'])
                .tab();

            cy.focused()
                .should('contain', values['profile-save-button-text'])
                .tab();

            cy.focused()
                .should('have.attr', 'name', 'Email')
                .type('email@example.com')
                .tab();

            cy.focused()
                .should('have.attr', 'name', 'Phone')
                .type('(123) 456-7890{enter}');

            cy.location('pathname').should('eq', '/profile');
            cy.location('search').should('eq', '?status=saved');

            // verify profile API data
            cy.request('/profile?format=json&include=PrimaryEmail,PrimaryPhone').its('body.data').then(data => {
                expect(data).to.have.property('Class', values['profile-data'].Class);
                expect(data).to.have.property('FirstName', values['profile-data'].FirstName);
                expect(data).to.have.property('LastName', values['profile-data'].LastName);
                expect(data).to.have.property('Location', 'Philadelphia, PA');
                expect(data).to.have.property('About', 'Meow');
                expect(data).to.have.property('PrimaryPhotoID', 2);
                expect(data).to.have.property('Username', values['profile-data'].Username);
                expect(data).to.have.property('AccountLevel', values['profile-data'].AccountLevel);

                if (data.Email) {
                    expect(data).to.have.property('Email', 'email@example.com');
                } else {
                    expect(data).to.have.nested.property('PrimaryEmail.Data', 'email@example.com');
                }

                if (data.Phone) {
                    expect(data).to.have.property('Phone', 1234567890);
                } else {
                    expect(data).to.have.nested.property('PrimaryPhone.Data', '1234567890');
                }
            });
        });
    });

    it('View profile', () => {
        cy.readFile('cypress/integration/profile.json').then(({ selectors, values, features }) => {
            cy.loginAs();
            cy.visit('/profile');

            // verify profile display page
            cy.visit('/profile/view');
            cy.location('pathname').should('eq', `/people/${values['profile-data'].Username}`);
            cy.get('.header-title').should('contain', `${values['profile-data'].FirstName} ${values['profile-data'].LastName}`);
            cy.get(selectors['about-content']).should('contain', 'Meow');

            if (features['location']) {
                cy.get('a[href^="http://maps.google.com/"]').should('contain', 'Philadelphia, PA');
            }

            if (features['gallery']) {
                cy.get('.photo-thumb')
                    .should('have.length', 2)
                    .last()
                        .should('have.attr', 'href')
                        .and('match', /^\/thumbnail\/2\/\d+x\d+(\/cropped)?$/);
            }
        });
    });
});
