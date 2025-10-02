import LoginPage from '../../support/pages/loginPage';

describe('SC_001 - Login Functionality', () => {
  const loginPage = new LoginPage();
  let users;

  before(() => {
    // Load test data from fixtures
    cy.fixture('loginData').then((data) => {
      users = data.users;
    });
  });

  beforeEach(() => {
    loginPage.visit();
  });

  // TC-001: Login with valid username and password
  it('TC-001: Should login successfully with valid credentials', () => {
    cy.intercept('POST', '**/auth/validate').as('loginRequest');
    cy.intercept('GET', '**/dashboard/index').as('dashboardPage');
    
    loginPage.login(users.valid.username, users.valid.password);
    
    cy.wait('@loginRequest').its('response.statusCode').should('be.oneOf', [200, 302]);
    cy.wait('@dashboardPage');
    loginPage.verifyDashboardVisible();
  });

  // TC-002: Login with valid username and wrong password
  it('TC-002: Should show error message with wrong password', () => {
    cy.intercept('POST', '**/auth/validate').as('loginAttempt');
    cy.intercept('GET', '**/core/i18n/messages').as('errorMessages');
    
    loginPage.login(users.wrongPassword.username, users.wrongPassword.password);
    
    cy.wait('@loginAttempt');
    cy.wait('@errorMessages');
    loginPage.verifyInvalidCredentialsMessage();
  });

  // TC-003: Login with wrong username and valid password
  it('TC-003: Should show error message with wrong username', () => {
    cy.intercept('POST', '**/auth/validate').as('authValidation');
    cy.intercept('GET', '**/core/i18n/messages').as('errorMessages');
    
    loginPage.login(users.wrongUser.username, users.wrongUser.password);
    
    cy.wait('@authValidation').its('response.statusCode').should('eq', 302);
    cy.wait('@errorMessages');
    loginPage.verifyInvalidCredentialsMessage();
  });

  // TC-004: Login with empty username and password
  it('TC-004: Should show required field error when both fields are empty', () => {
    cy.intercept('POST', '**/auth/**').as('authRequest');
    
    loginPage.clickSubmit();
    
    loginPage.verifyRequiredFieldMessage();
    cy.get('@authRequest.all').should('have.length', 0);
  });

  // TC-005: Login with empty username only
  it('TC-005: Should show required field error when username is empty', () => {
    cy.intercept('POST', '**/auth/**').as('authRequest');
    
    loginPage.fillPassword(users.emptyUser.password)
             .clickSubmit();
    
    loginPage.verifyRequiredFieldMessage();
    cy.get('@authRequest.all').should('have.length', 0);
  });

  // TC-006: Login with empty password only
  it('TC-006: Should show required field error when password is empty', () => {
    cy.intercept('POST', '**/auth/**').as('authRequest');
    
    loginPage.fillUsername(users.emptyPass.username)
             .clickSubmit();
    
    loginPage.verifyRequiredFieldMessage();
    cy.get('@authRequest.all').should('have.length', 0);
  });

  // TC-007: Forgot password functionality
  it('TC-007: Should navigate to reset password page when clicking forgot password', () => {
    cy.intercept('GET', '**/auth/requestPasswordResetCode').as('resetPasswordPage');
    
    loginPage.clickForgotPassword();
    
    cy.wait('@resetPasswordPage').its('response.statusCode').should('eq', 200);
    loginPage.verifyResetPasswordPage();
  });
});