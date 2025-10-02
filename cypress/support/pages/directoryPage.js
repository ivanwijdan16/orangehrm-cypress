class DirectoryPage {
  locators = {
    directoryMenu: 'a[href="/web/index.php/directory/viewDirectory"]',
    pageTitle: '.oxd-topbar-header-breadcrumb h6',
    nameInput: 'input[placeholder="Type for hints..."]',
    jobDropdown: '.oxd-select-text-input',
    locationDropdown: '.oxd-select-text',
    searchButton: 'button[type="submit"]',
    resetButton: '.oxd-form-actions button',
    employeeCards: '.oxd-sheet',
    employeeName: '.orangehrm-directory-card-header',
    noRecordsMessage: '.orangehrm-horizontal-padding span',
    autocompleteDropdown: '.oxd-autocomplete-dropdown',
    autocompleteOption: '.oxd-autocomplete-option'
  };

  visit() {
    cy.get(this.locators.directoryMenu, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.url({ timeout: 15000 }).should('include', '/directory/viewDirectory');
    cy.wait(1000);
  }

  // New method for autocomplete name search
  searchEmployeeByAutocomplete(name) {
    cy.get(this.locators.nameInput, { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type(name);
    
    // Wait for autocomplete
    cy.wait(1500);
    
    // Select first option from autocomplete
    cy.get(this.locators.autocompleteDropdown, { timeout: 10000 }).should('be.visible');
    cy.get(this.locators.autocompleteOption).first().click();
    
    return this;
  }

  fillEmployeeName(name) {
    if (name) {
      cy.get(this.locators.nameInput, { timeout: 10000 })
        .first()
        .should('be.visible')
        .clear()
        .type(name);
      
      cy.wait(1500);
      cy.get('body').type('{esc}');
    }
    return this;
  }

  selectJobTitle(index = 0) {
    cy.get(this.locators.jobDropdown, { timeout: 10000 })
      .first()
      .should('be.visible')
      .click();
    
    cy.get('.oxd-select-dropdown', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    
    cy.get('.oxd-select-option')
      .eq(index)
      .should('be.visible')
      .click();
    
    cy.wait(500);
    return this;
  }

  selectLocation(index = 0) {
    cy.get(this.locators.locationDropdown, { timeout: 10000 })
      .eq(1)
      .should('be.visible')
      .click();
    
    cy.get('.oxd-select-dropdown', { timeout: 10000 }).should('be.visible');
    cy.wait(500);
    
    cy.get('.oxd-select-option')
      .eq(index)
      .should('be.visible')
      .click();
    
    cy.wait(500);
    return this;
  }

  clickSearch() {
    cy.get(this.locators.searchButton, { timeout: 10000 })
      .should('be.visible')
      .click();
    
    cy.wait(2000);
    return this;
  }

  clickReset() {
  cy.contains(this.locators.resetButton, 'Reset', { timeout: 10000 })
    .should('be.visible')
    .click();
  return this;
}


  verifyPageLoaded() {
    cy.url({ timeout: 15000 }).should('include', '/directory/viewDirectory');
    cy.contains(this.locators.pageTitle, 'Directory', { timeout: 15000 })
      .should('be.visible');
  }

  verifyEmployeeCards() {
    cy.get(this.locators.employeeCards, { timeout: 15000 })
      .should('be.visible')
      .and('have.length.greaterThan', 0);
  }

  verifyNoRecords() {
    cy.contains(this.locators.noRecordsMessage, 'No Records Found', { timeout: 15000 })
      .should('be.visible');
  }
}

export default DirectoryPage;