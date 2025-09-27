describe('OrangeHRM - Login Feature (Quiz 3)', () => {
  const users = {
    valid: { username: 'Admin', password: 'admin123' },
    wrongPassword: { username: 'Admin', password: '12345678' },
    wrongUser: { username: 'jane', password: 'admin123' },
    emptyUser: { username: '', password: 'admin123' },
    emptyPass: { username: 'Admin', password: '' },
  };

  beforeEach(() => {
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    cy.get('input[name="username"]').should('be.visible');
  });

  //Test Case 1: Login with valid username and password
  it('Login with valid username and password', () => {
    cy.get('input[name="username"]').type(users.valid.username);
    cy.get('input[name="password"]').type(users.valid.password);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('h6', 'Dashboard').should('be.visible');
  });

  //Test Case 2: Login with valid username and wrong password
  it('Login with valid username and wrong password', () => {
    cy.get('input[name="username"]').type(users.wrongPassword.username);
    cy.get('input[name="password"]').type(users.wrongPassword.password);
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-alert-content-text').should('contain.text', 'Invalid credentials');
  });

  //Test Case 3: Login with wrong username and valid password
  it('Login with wrong username and valid password', () => {
    cy.get('input[name="username"]').type(users.wrongUser.username);
    cy.get('input[name="password"]').type(users.wrongUser.password);
    cy.get('button[type="submit"]').click();

    cy.get('.oxd-alert-content-text').should('contain.text', 'Invalid credentials');
  });

  //Test Case 4: Login with empty username and password
  it('Login with empty username and password', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('.oxd-input-group__message', 'Required').should('be.visible');
  });

  //Test Case 5: Login with empty username only
  it('Login with empty username only', () => {
    cy.get('input[name="password"]').type(users.emptyUser.password);
    cy.get('button[type="submit"]').click();
    cy.contains('.oxd-input-group__message', 'Required').should('be.visible');
  });

  //Test Case 6: Login with empty password only
  it('Login with empty password only', () => {
    cy.get('input[name="username"]').type(users.emptyPass.username);
    cy.get('button[type="submit"]').click();
    cy.contains('.oxd-input-group__message', 'Required').should('be.visible');
  });
});
