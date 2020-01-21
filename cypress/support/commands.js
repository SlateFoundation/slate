// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// from https://github.com/javieraviles/cypress-upload-file-post-form
Cypress.Commands.add('upload_file', (fileName, fileType = ' ', selector) => {
    cy.get(selector).then(subject => {
      cy.fixture(fileName, 'base64')
        .then(Cypress.Blob.base64StringToBlob)
        .then(blob => {
          const el = subject[0]
          const testFile = new File([blob], fileName, { type: fileType })
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(testFile)
          el.files = dataTransfer.files
        })
    })
  });

// Login command
Cypress.Commands.add('loginAs', (user) => {
  cy.visit('/');
  cy.request({
      method: 'POST',
      url: '/login/?format=json',
      form: true,
      body: {
          '_LOGIN[username]': user,
          '_LOGIN[password]': user,
          '_LOGIN[returnMethod]': 'POST'
      }
  });
});

// Drop and load database in one step
Cypress.Commands.add('resetDatabase', () => {
  cy.dropDatabase();
  cy.loadDatabase();
});

// Drops the entire
Cypress.Commands.add('dropDatabase', () => {
  cy.exec(`echo 'DROP DATABASE IF EXISTS \`default\`; CREATE DATABASE \`default\`;' | ${_buildHabExec('core/mysql', 'mysql')} -u root -h 127.0.0.1`);
});

// Reload the original data fixtures
Cypress.Commands.add('loadDatabase', () => {
  cy.exec(`cat cypress/fixtures/database/*.sql | ${_buildHabExec('core/mysql', 'mysql')} -u root -h 127.0.0.1 default`);
});

// Ext command getter
Cypress.Commands.add('withExt', () => {
  cy.window().then((win) => {
    const Ext = win.Ext;
    return {
      Ext: win.Ext,
      extQuerySelector: query => Ext.ComponentQuery.query(query)[0],
      extQuerySelectorAll: query => Ext.ComponentQuery.query(query)
    };
  });
});

// private method
function _buildHabExec(pkg, pkgCmd) {
  const studioContainer = Cypress.env('STUDIO_CONTAINER') || null;
  const studioSSH = Cypress.env('STUDIO_SSH') || null;

  let cmd = `hab pkg exec ${pkg} ${pkgCmd}`;

  if (studioContainer) {
    cmd = `${studioSSH ? `ssh ${studioSSH}` : ''} docker exec -i ${studioContainer} ${cmd}`;
  }

  return cmd;
}
