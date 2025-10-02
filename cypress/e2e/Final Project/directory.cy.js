import LoginPage from '../../support/pages/loginPage';
import DirectoryPage from '../../support/pages/directoryPage';

describe('SC_003 - Directory Functionality', () => {
  const loginPage = new LoginPage();
  const directoryPage = new DirectoryPage();
  let users;

  before(() => {
    cy.fixture('loginData').then((data) => {
      users = data.users;
    });
  });

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    
    loginPage.visit();
    loginPage.login(users.valid.username, users.valid.password);
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });

  // TC-012: Navigate to Directory page
  it('TC-012: Navigate to Directory page', () => {
    cy.intercept('GET', '**/directory/viewDirectory').as('directoryPage');
    
    directoryPage.visit();
    
    cy.wait('@directoryPage');
    directoryPage.verifyPageLoaded();
  });

  // TC-013: View all employees in directory
  it('TC-013: View all employees in directory', () => {
    cy.intercept('GET', '**/directory/employees**').as('employeeData');
    
    directoryPage.visit();
    
    cy.wait('@employeeData');
    directoryPage.verifyEmployeeCards();
  });

  // TC-014: Search employee by name (using autocomplete)
  it('TC-014: Search employee by name using autocomplete', () => {
    cy.intercept('GET', '**/directory/employees**').as('searchResults');
    
    directoryPage.visit();
    
    // Type dan select dari autocomplete
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 100 });
    
    // Wait untuk autocomplete muncul
    cy.wait(2000);
    cy.get('.oxd-autocomplete-dropdown', { timeout: 10000 }).should('be.visible');
    
    // Pilih option pertama
    cy.get('.oxd-autocomplete-option').first().click();
    
    directoryPage.clickSearch();
    cy.wait('@searchResults');
  });

  // TC-015: Search with autocomplete - select specific employee
  it('TC-015: Search employee with autocomplete selection', () => {
    cy.intercept('GET', '**/directory/employees**').as('searchResults');
    
    directoryPage.visit();
    
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type('Paul', { delay: 100 });
    
    cy.wait(2000);
    cy.get('.oxd-autocomplete-dropdown', { timeout: 10000 }).should('be.visible');
    cy.get('.oxd-autocomplete-option').contains('Paul').click();
    
    directoryPage.clickSearch();
    cy.wait('@searchResults');
  });

  // TC-016: Search employee with non-existent name
  it('TC-016: Search employee with non-existent name', () => {
    directoryPage.visit();
    
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type('XYZ999NotExist', { delay: 100 });
    
    // Tunggu autocomplete response
    cy.wait(3000);
    
    // Verify autocomplete tidak ada atau menampilkan "No records found"
    cy.get('body').then(($body) => {
      if ($body.find('.oxd-autocomplete-dropdown').length > 0) {
        cy.get('.oxd-autocomplete-text').should('contain', 'No records found');
      } else {
        cy.get('.oxd-autocomplete-dropdown').should('not.exist');
      }
    });
  });

  // TC-017: Filter employees by job title
  it('TC-017: Filter employees by job title', () => {
    cy.intercept('GET', '**/directory/employees**').as('filterResults');
    
    directoryPage.visit();
    directoryPage.selectJobTitle(1);
    directoryPage.clickSearch();
    
    cy.wait('@filterResults');
  });

  // TC-018: Filter employees by location
  it('TC-018: Filter employees by location', () => {
    cy.intercept('GET', '**/directory/employees**').as('locationFilter');
    
    directoryPage.visit();
    directoryPage.selectLocation(1);
    directoryPage.clickSearch();
    
    cy.wait('@locationFilter');
  });

  // TC-019: Filter with multiple criteria (name + job title)
  it('TC-019: Filter with multiple criteria (name + job title)', () => {
    cy.intercept('GET', '**/directory/employees**').as('combinedFilter');
    
    directoryPage.visit();
    
    // Select name from autocomplete
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 100 });
    
    cy.wait(2000);
    cy.get('.oxd-autocomplete-dropdown', { timeout: 10000 }).should('be.visible');
    cy.get('.oxd-autocomplete-option').first().click();
    
    // Select job title
    directoryPage.selectJobTitle(1);
    directoryPage.clickSearch();
    
    cy.wait('@combinedFilter');
  });

  // TC-020: Filter with all criteria (name + job + location)
  it('TC-020: Filter with all criteria (name + job + location)', () => {
    cy.intercept('GET', '**/directory/employees**').as('fullFilter');
    
    directoryPage.visit();
    
    // Select name from autocomplete
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type('Linda', { delay: 100 });
    
    cy.wait(2000);
    cy.get('.oxd-autocomplete-dropdown', { timeout: 10000 }).should('be.visible');
    cy.get('.oxd-autocomplete-option').first().click();
    
    // Select job and location
    directoryPage.selectJobTitle(1);
    directoryPage.selectLocation(1);
    directoryPage.clickSearch();
    
    cy.wait('@fullFilter');
  });

  // TC-021: Reset search filters
  it('TC-021: Reset search filters', () => {
    directoryPage.visit();
    
    // Set some filters
    directoryPage.selectJobTitle(1);
    
    // Click reset
    directoryPage.clickReset();
    
    // Verify input cleared
    cy.get('input[placeholder="Type for hints..."]').should('have.value', '');
  });

  // TC-022: Verify employee card information
  it('TC-022: Verify employee card information', () => {
    directoryPage.visit();
    cy.wait(2000);
    
    cy.get('.oxd-sheet', { timeout: 15000 })
      .first()
      .within(() => {
        cy.get('.orangehrm-directory-card-header').should('be.visible');
      });
  });

  // TC-023: Verify employee count display
  it('TC-023: Verify employee count display', () => {
    directoryPage.visit();
    cy.wait(2000);
    
    cy.get('.oxd-sheet', { timeout: 15000 }).then(($cards) => {
      expect($cards.length).to.be.greaterThan(0);
      cy.log(`✅ Found ${$cards.length} employees in directory`);
    });
  });

  // TC-024: Search with empty fields
  it('TC-024: Search with empty fields', () => {
    cy.intercept('GET', '**/directory/employees**').as('emptySearch');
    
    directoryPage.visit();
    directoryPage.clickSearch();
    
    cy.wait('@emptySearch');
    directoryPage.verifyEmployeeCards();
  });
});