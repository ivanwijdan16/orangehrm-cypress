// pages/loginPage.js

class LoginPage {
  // Locators
  locators = {
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    dashboardTitle: 'h6',
    alertMessage: '.oxd-alert-content-text',
    requiredMessage: '.oxd-input-group__message',
    forgotPasswordLink: 'p.orangehrm-login-forgot-header',
    forgotPasswordContainer: '.orangehrm-login-forgot',
    resetPasswordTitle: 'h6, .oxd-text--h6'
  };

  // Actions
  visit() {
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    cy.get(this.locators.usernameInput).should('be.visible');
  }

  fillUsername(username) {
    if (username) {
      cy.get(this.locators.usernameInput).type(username);
    }
    return this;
  }

  fillPassword(password) {
    if (password) {
      cy.get(this.locators.passwordInput).type(password);
    }
    return this;
  }

  clickSubmit() {
    cy.get(this.locators.submitButton).click();
    return this;
  }

  login(username, password) {
    this.fillUsername(username)
        .fillPassword(password)
        .clickSubmit();
  }

  clickForgotPassword() {
    cy.contains(this.locators.forgotPasswordLink, /Forgot your password\??/i, { timeout: 10000 })
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });

    cy.location('pathname').then((path) => {
      if (path.includes('/auth/login')) {
        cy.get(this.locators.forgotPasswordContainer)
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
      }
    });
  }

  // Assertions
  verifyDashboardVisible() {
    cy.url().should('include', '/dashboard');
    cy.contains(this.locators.dashboardTitle, 'Dashboard').should('be.visible');
  }

  verifyInvalidCredentialsMessage() {
    cy.get(this.locators.alertMessage).should('contain.text', 'Invalid credentials');
  }

  verifyRequiredFieldMessage() {
    cy.contains(this.locators.requiredMessage, 'Required').should('be.visible');
  }

  verifyResetPasswordPage() {
    cy.location('pathname', { timeout: 10000 })
      .should('eq', '/web/index.php/auth/requestPasswordResetCode');
    cy.contains(this.locators.resetPasswordTitle, 'Reset Password', { 
      matchCase: false, 
      timeout: 10000 
    }).should('be.visible');
  }
}

export default LoginPage;