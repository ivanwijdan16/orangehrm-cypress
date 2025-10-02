class ForgotPasswordPage {
  locators = {
    usernameInput: 'input[name="username"]',
    resetButton: 'button[type="submit"]',
    cancelButton: 'button.oxd-button--ghost',
    resetTitle: 'h6',
    successMessage: '.orangehrm-card-container h6',
    requiredMessage: '.oxd-input-group__message'
  };

  visit() {
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/requestPasswordResetCode', {
      timeout: 30000
    });
    cy.url().should('include', '/auth/requestPasswordResetCode');
    cy.get(this.locators.resetTitle, { timeout: 15000 }).should('be.visible');
    cy.wait(500);
  }

  fillUsername(username) {
    if (username) {
      cy.get(this.locators.usernameInput, { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(username);
    }
    return this;
  }

  clickReset() {
    cy.get(this.locators.resetButton, { timeout: 10000 })
      .should('be.visible')
      .click();
    return this;
  }

  clickCancel() {
    cy.get(this.locators.cancelButton, { timeout: 10000 })
      .should('be.visible')
      .click();
    return this;
  }

  verifyResetPage() {
    cy.url({ timeout: 10000 }).should('include', '/auth/requestPasswordResetCode');
    cy.contains(this.locators.resetTitle, 'Reset Password', { timeout: 10000 }).should('be.visible');
  }

  verifySuccessMessage() {
    cy.url({ timeout: 15000 }).should('include', '/auth/sendPasswordReset');
    cy.get(this.locators.successMessage, { timeout: 15000 }).should('be.visible');
  }

  verifyRequiredMessage() {
    cy.contains(this.locators.requiredMessage, 'Required', { timeout: 10000 }).should('be.visible');
  }
}

export default ForgotPasswordPage;