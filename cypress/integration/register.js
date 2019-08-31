describe('Admin login test', () => {

    // reset database before tests
    before(() => {
        const studioContainer = Cypress.env('STUDIO_CONTAINER');

        if (studioContainer) {
            cy.exec(`echo 'DROP DATABASE IF EXISTS \`default\`;' | docker exec -i ${studioContainer} hab pkg exec core/mysql mysql -u root -h 127.0.0.1`);
        }
    });

    it('Register and set up profile', () => {
        cy.visit('/');

        cy.contains('Register').click();
        cy.location('pathname').should('eq', '/register');

        cy.focused()
            .should('have.attr', 'name', 'FirstName')
            .type('Fname')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'LastName')
            .type('Lname')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'Email')
            .type('email@example.org')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'Username')
            .type('zerocool')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'Password')
            .type('password123')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'PasswordConfirm')
            .type('password1234{enter}')
        ;

        cy.location('pathname').should('eq', '/register');

        cy.get('.error');

        cy.focused()
            .should('have.attr', 'name', 'FirstName')
            .tab()
            .tab()
            .tab()
            .tab()
            .tab()
            .type('password123{enter}')
        ;

        cy.contains('Fill out your profile').click();

        // upload same photo twice
        cy.upload_file('photo.jpg', 'image/jpeg', 'input[type=file]');
        cy.contains('Upload New Photo').click();
        cy.upload_file('photo.jpg', 'image/jpeg', 'input[type=file]');
        cy.contains('Upload New Photo').click();

        cy.get('.photosGallery .photo:first-child')
            .should('have.class', 'highlight')
            .should('not.contain', 'Make Default')
            .next('.photo')
                .should('not.have.class', 'highlight')
                .contains('Make Default')
                .click()
        ;

        cy.get('.photosGallery .photo:first-child')
            .should('not.have.class', 'highlight')
            .should('contain', 'Make Default')
            .next('.photo')
                .should('have.class', 'highlight')
                .should('not.contain', 'Make Default')
                .find('img')
                    .should('have.attr', 'src', '/thumbnail/2/100x100')
                    .should('have.prop', 'width', 100)
                    .should('have.prop', 'height', 75)
        ;

        // edit profile
        cy.get('input[name=Location]')
            .type('Philadelphia, PA')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'About')
            .type('Meow')
            .tab()
        ;

        cy.focused()
            .should('contain', 'Markdown codes')
            .should('have.attr', 'target', '_blank')
            .tab()
        ;

        cy.focused()
            .should('contain', 'Save profile')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'Email')
            .type('email@example.com')
            .tab()
        ;

        cy.focused()
            .should('have.attr', 'name', 'Phone')
            .type('(123) 456-7890{enter}')
        ;

        cy.location('pathname').should('eq', '/profile');
        cy.location('search').should('eq', '?status=saved');

        // verify profile display page
        cy.visit('/profile/view');
        cy.location('pathname').should('eq', '/people/zerocool');
        cy.get('.header-title').should('contain', 'Fname Lname');
        cy.get('a[href^="http://maps.google.com/"]').should('contain', 'Philadelphia, PA');
        cy.get('#display-photo-link').should('have.attr', 'href', '/media/open/2');
        cy.get('.photo-thumb').should('have.length', 2);
        cy.get('#info .about').should('contain', 'Meow');

        // verify profile API data
        cy.request('/profile?format=json').its('body.data').then(data => {
            expect(data).to.have.property('ID', 1);
            expect(data).to.have.property('Class', 'User');
            expect(data).to.have.property('FirstName', 'Fname');
            expect(data).to.have.property('LastName', 'Lname');
            expect(data).to.have.property('Email', 'email@example.com');
            expect(data).to.have.property('Phone', 1234567890);
            expect(data).to.have.property('Location', 'Philadelphia, PA');
            expect(data).to.have.property('About', 'Meow');
            expect(data).to.have.property('PrimaryPhotoID', 2);
            expect(data).to.have.property('Username', 'zerocool');
            expect(data).to.have.property('AccountLevel', 'User');
        });
    });
});