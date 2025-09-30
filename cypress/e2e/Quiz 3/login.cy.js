describe('OrangeHRM - Login Feature (Quiz 3)', () => {
  const users = {
    valid: { username: 'Admin', password: 'admin123' },
    wrongPassword: { username: 'Admin', password: '12345678' },
    wrongUser: { username: 'jane', password: 'admin123' },
    emptyUser: { username: '', password: 'admin123' },
    emptyPass: { username: 'Admin', password: '' },
  };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    cy.get('input[name="username"]').should('be.visible');
  });

  //Test Case 1: Login with valid username and password
  it('Login with valid username and password', () => {
    cy.intercept('POST', '**/web/index.php/auth/validate').as('loginRequest');

    cy.get('input[name="username"]').clear().type(users.valid.username);
    cy.get('input[name="password"]').clear().type(users.valid.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest', { timeout: 10000 }).then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 302]);
    });

    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.contains('h6', 'Dashboard', { timeout: 10000 }).should('be.visible');
  });

  //Test Case 2: Login with valid username and wrong password
  it('Login with valid username and wrong password', () => {
    cy.intercept('GET', '**/web/index.php/core/i18n/messages').as('errorMessages');

    cy.get('input[name="username"]').clear().type(users.wrongPassword.username);
    cy.get('input[name="password"]').clear().type(users.wrongPassword.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@errorMessages', { timeout: 10000 }).then(() => {
      cy.get('.oxd-alert-content-text', { timeout: 10000 })
        .should('be.visible')
        .and('contain.text', 'Invalid credentials');
    });
  });

  //Test Case 3: Login with wrong username and valid password
  it('Login with wrong username and valid password', () => {
    cy.intercept('POST', '**/auth/validate').as('authValidation');

    cy.get('input[name="username"]').clear().type(users.wrongUser.username);
    cy.get('input[name="password"]').clear().type(users.wrongUser.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@authValidation', { timeout: 10000 }).its('response.statusCode').should('eq', 302);
    
    cy.get('.oxd-alert-content-text', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  });

  //Test Case 4: Login with empty username and password
  it('Login with empty username and password', () => {
    cy.intercept('POST', '**/auth/**').as('authRequest');

    cy.wait(100);
    
    cy.get('button[type="submit"]').click();
    
    cy.contains('.oxd-input-group__message', 'Required', { timeout: 5000 })
      .should('be.visible');

    cy.wait(1000);
    cy.get('@authRequest.all').should('have.length', 0);
  });

  //Test Case 5: Login with empty username only
  it('Login with empty username only', () => {
    cy.intercept('GET', '**/api/**').as('apiCalls');

    cy.get('input[name="password"]').clear().type(users.emptyUser.password);
    
    cy.wait(100);
    cy.get('button[type="submit"]').click();

    cy.contains('.oxd-input-group__message', 'Required', { timeout: 5000 })
      .should('be.visible');
    
    cy.url().should('include', '/auth/login');
  });

  //Test Case 6: Login with empty password only
  it('Login with empty password only', () => {
    cy.intercept('GET', '**/pim/viewPhoto/**').as('profilePhoto');

    cy.get('input[name="username"]').clear().type(users.emptyPass.username);
    
    cy.wait(100);
    cy.get('button[type="submit"]').click();
    
    cy.contains('.oxd-input-group__message', 'Required', { timeout: 5000 })
      .should('be.visible');

    cy.wait(1000);
    cy.get('@profilePhoto.all').should('have.length', 0);
  });

  // Test Case 7: Forgot your password?
  it('Click Forgot your password link', () => {
    cy.intercept('GET', '**/web/index.php/auth/requestPasswordResetCode').as('resetPasswordPage');

    cy.contains('p.orangehrm-login-forgot-header', /Forgot your password\??/i, { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.wait('@resetPasswordPage', { timeout: 10000 }).its('response.statusCode').should('eq', 200);

    cy.location('pathname', { timeout: 10000 })
      .should('eq', '/web/index.php/auth/requestPasswordResetCode');
    
    cy.contains('h6, .oxd-text--h6', 'Reset Password', { matchCase: false, timeout: 10000 })
      .should('be.visible');
  });
});