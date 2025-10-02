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
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
      timeout: 30000
    });
    
    cy.url().should('include', '/auth/login');
    cy.get(this.locators.usernameInput, { timeout: 15000 }).should('be.visible');
    cy.wait(1000);
  }

  fillUsername(username) {
    if (username) {
      cy.get(this.locators.usernameInput).clear().type(username);
    }
    return this;
  }

  fillPassword(password) {
    if (password) {
      cy.get(this.locators.passwordInput).clear().type(password);
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
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.contains(this.locators.dashboardTitle, 'Dashboard', { timeout: 15000 })
      .should('be.visible');
  }

  verifyInvalidCredentialsMessage() {
    cy.get(this.locators.alertMessage, { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  }

  verifyRequiredFieldMessage() {
    cy.contains(this.locators.requiredMessage, 'Required', { timeout: 10000 })
      .should('be.visible');
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