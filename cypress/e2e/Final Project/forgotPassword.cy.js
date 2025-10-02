import LoginPage from '../../support/pages/loginPage';
import ForgotPasswordPage from '../../support/pages/forgotPasswordPage';

describe('SC_002 - Forgot Password Functionality', () => {
  const loginPage = new LoginPage();
  const forgotPage = new ForgotPasswordPage();

  beforeEach(() => {
    forgotPage.visit();
  });

  // TC-008: Reset password with valid username
  it('TC-008: Reset password with valid username', () => {
    cy.intercept('POST', '**/auth/requestResetPassword').as('resetRequest');
    
    forgotPage.fillUsername('Admin').clickReset();
    
    cy.wait('@resetRequest');
    forgotPage.verifySuccessMessage();
  });

  // TC-009: Reset password with invalid username
  it('TC-009: Reset password with invalid username', () => {
    cy.intercept('POST', '**/auth/requestResetPassword').as('resetRequest');
    
    forgotPage.fillUsername('InvalidUser123').clickReset();
    
    cy.wait('@resetRequest');
    forgotPage.verifySuccessMessage();
  });

  // TC-010: Reset password with empty username
  it('TC-010: Reset password with empty username', () => {
    forgotPage.clickReset();
    
    cy.contains('.oxd-input-group__message', 'Required').should('be.visible');
  });

  // TC-011: Cancel reset password process
  it('TC-011: Cancel reset password process', () => {
    forgotPage.clickCancel();
    
    cy.url().should('include', '/auth/login');
    cy.get('input[name="username"]').should('be.visible');
  });
});