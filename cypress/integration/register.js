describe('Registration', () => {

     /**
      * The registration test is temporarily disabled for Slate because
      * registration is disabled by default in Slate installations.
      *
      * In the future, we could create a pathway for the cypress test to
      * execute writing a file into the php-config tree through some
      * reliable API into the studio
      **/

     it('Register is disabled', () => {
            cy.visit('/register');

            cy.get('.content')
                  .contains('Sorry, self-registration is not currently available. Please contact an administrator.');
      });
});