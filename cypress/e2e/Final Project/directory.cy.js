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
      .type('Russel', { delay: 100 });
    
    cy.wait(2000);
    cy.get('.oxd-autocomplete-dropdown', { timeout: 10000 }).should('be.visible');
    cy.get('.oxd-autocomplete-option').contains('Russel').click();
    
    directoryPage.clickSearch();
    cy.wait('@searchResults');
  });

  //TC-016: Search employee with non-existent name
  it('TC-016: Search employee with non-existent name', () => {
    directoryPage.visit();

    // input nama yang tidak ada
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('XYZ999NotExist', { delay: 100 });

    // tunggu kemungkinan dropdown muncul
    cy.get('body').then(($body) => {
      if ($body.find('.oxd-autocomplete-dropdown').length > 0) {
        // jika dropdown muncul → harus ada teks "No Records Found"
        cy.get('.oxd-autocomplete-dropdown')
          .should('be.visible')
          .within(() => {
            cy.contains('No Records Found').should('be.visible');
          });
      } else {
        // jika dropdown tidak muncul → dianggap valid (tidak ada hasil)
        cy.get('.oxd-autocomplete-dropdown').should('not.exist');
      }
    });
  });

  // TC-017: Filter employees by job title
  it('TC-017: Filter employees by job title', () => {
    cy.intercept('GET', '**/directory/employees**').as('filterResults');
    
    directoryPage.visit();
    directoryPage.selectJobTitle(4);
    directoryPage.clickSearch();
    
    cy.wait('@filterResults');
  });

  // TC-018: Filter employees by location
  it('TC-018: Filter employees by location', () => {
    cy.intercept('GET', '**/directory/employees**').as('locationFilter');
    
    directoryPage.visit();
    directoryPage.selectLocation(4);
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
    directoryPage.selectJobTitle(4);
    directoryPage.clickSearch();
    
    cy.wait('@combinedFilter');
  });

  // TC-020: Filter with all criteria (name + job + location)
  it('TC-020: Filter with all criteria (name + job + location)', () => {
    cy.intercept('GET', '**/directory/employees**').as('fullFilter');

    directoryPage.visit();

    // Pilih NAME via autocomplete
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 50 });

    cy.get('.oxd-autocomplete-dropdown', { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.contains('.oxd-autocomplete-option', /peter mac anderson/i)
          .then($opt => {
            if ($opt.length) cy.wrap($opt).click();
            else cy.get('.oxd-autocomplete-option').first().click();
          });
      });

    // Pilih job & location (pakai POM)
    directoryPage.selectJobTitle(4);
    directoryPage.selectLocation(3);

    directoryPage.clickSearch();

    cy.wait('@fullFilter').then(({ request, response }) => {
      const url = new URL(request.url);
      const q = url.searchParams;

      // --- NAME: guarded check ---
      const nameParam =
        q.get('name') ||
        q.get('empName') ||
        q.get('employeeName') ||
        q.get('empNumber') ||
        q.get('employeeId');

      if (nameParam) {
        // Jika yang terkirim teks nama → boleh cek mengandung "peter"
        // Jika yang terkirim ID/number → minimal pastikan tidak kosong
        const decoded = decodeURIComponent(nameParam);
        // Soft check: kalau bukan angka murni, cek mengandung "peter"
        if (!/^\d+$/.test(decoded)) {
          expect(decoded).to.match(/peter/i);
        } else {
          expect(decoded, 'empNumber/employeeId is present').to.not.be.empty;
        }
      } else {
        cy.log('ℹ️ Name filter tidak ada di query (kemungkinan pakai empNumber hidden). Lanjut verifikasi via response/UI.');
      }

      // --- JOB & LOCATION: presence check (longgar ke berbagai key) ---
      const jobParam = q.get('jobTitleId') || q.get('jobTitle');
      const locParam = q.get('locationId') || q.get('location');
      if (!jobParam && !locParam) {
        cy.log('ℹ️ job/location param tidak terlihat di query. Bisa jadi field name berbeda—akan diverifikasi via UI.');
      }

      // --- Response sanity ---
      expect(response?.statusCode).to.eq(200);
      expect(response?.body, 'response body exists').to.exist;
    });

    // Verifikasi tidak ada "No Records Found"
    cy.get('body').then($b => {
      const $msg = $b.find('.orangehrm-horizontal-padding span');
      if ($msg.length) {
        cy.get('.orangehrm-horizontal-padding span')
          .should('not.contain', 'No Records Found');
      }
    });

    // Verifikasi kartu hasil mengandung "Peter"
    cy.get('.oxd-sheet', { timeout: 10000 })
      .should('exist')
      .within(() => {
        cy.get('.orangehrm-directory-card-header')
          .first()
          .invoke('text')
          .then(t => t.trim())
          .should('match', /peter/i);
      });
  });


  // TC-021: Reset search filters
  it('TC-021: Reset search filters', () => {
    directoryPage.visit();

    // Isi semua filter dulu
    cy.get('input[placeholder="Type for hints..."]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 50 });

    directoryPage.selectJobTitle(1);     // pilih job index 1
    directoryPage.selectLocation(2);     // pilih location index 2

    // Klik Reset
    directoryPage.clickReset();

    // Verifikasi semua field kembali default
    cy.get('input[placeholder="Type for hints..."]').should('have.value', '');

    // Job & location kembali kosong (OrangeHRM default menampilkan "-- Select --")
    cy.get(directoryPage.locators.jobDropdown)
      .should('contain.text', '-- Select --');
      
    cy.get(directoryPage.locators.locationDropdown)
      .should('contain.text', '-- Select --');
  });

  // TC-022: Verify employee card information
  it('TC-022: Open Peter card after search', () => {
    directoryPage.visit();

    // ketik "Peter" dan pilih dari autocomplete (prioritaskan Peter Mac Anderson)
    cy.get(directoryPage.locators.nameInput, { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 40 });

    cy.get(directoryPage.locators.autocompleteDropdown, { timeout: 10000 })
      .should('be.visible')
      .within(() => {
        cy.contains(directoryPage.locators.autocompleteOption, /peter mac anderson/i)
          .then($opt => {
            if ($opt.length) cy.wrap($opt).click();
            else cy.get(directoryPage.locators.autocompleteOption).first().click();
          });
      });

    // klik Search
    directoryPage.clickSearch();

    // temukan kartu hasil untuk Peter lalu klik
    cy.contains(directoryPage.locators.employeeCards, /peter mac anderson/i, { timeout: 15000 })
      .should('be.visible')
      .click();
  });

  // TC-023: Verify telephone icon is visible on Peter's card
  it('TC-023: Verify telephone icon', () => {
    directoryPage.visit();

    // Search Peter
    cy.get(directoryPage.locators.nameInput)
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 40 });
    cy.get(directoryPage.locators.autocompleteDropdown)
      .should('be.visible')
      .within(() => {
        cy.contains(directoryPage.locators.autocompleteOption, /peter mac anderson/i).click();
      });
    directoryPage.clickSearch();

    // Buka card Peter
    cy.contains(directoryPage.locators.employeeCards, /peter mac anderson/i, { timeout: 15000 })
      .should('be.visible')
      .click();

    // Pastikan icon telephone ada
    cy.get('.orangehrm-directory-card-rounded-body > :nth-child(1) > .oxd-icon-button')
      .should('be.visible');
  });

  // TC-024: Verify email icon is visible on Peter's card
  it('TC-024: Verify email icon', () => {
    directoryPage.visit();

    cy.get(directoryPage.locators.nameInput)
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 40 });
    cy.get(directoryPage.locators.autocompleteDropdown)
      .should('be.visible')
      .within(() => {
        cy.contains(directoryPage.locators.autocompleteOption, /peter mac anderson/i).click();
      });
    directoryPage.clickSearch();

    cy.contains(directoryPage.locators.employeeCards, /peter mac anderson/i, { timeout: 15000 })
      .should('be.visible')
      .click();

    // Pastikan icon email ada
    cy.get('.orangehrm-directory-card-rounded-body > :nth-child(2) > .oxd-icon-button')
      .should('be.visible');
  });

  // TC-025: Verify QR code is visible on Peter's card
  it('TC-025: Verify QR code', () => {
    directoryPage.visit();

    // Search Peter
    cy.get(directoryPage.locators.nameInput)
      .should('be.visible')
      .clear()
      .type('Peter', { delay: 40 });
    cy.get(directoryPage.locators.autocompleteDropdown)
      .should('be.visible')
      .within(() => {
        cy.contains(directoryPage.locators.autocompleteOption, /peter mac anderson/i).click();
      });
    directoryPage.clickSearch();

    // Buka card Peter
    cy.contains(directoryPage.locators.employeeCards, /peter mac anderson/i, { timeout: 15000 })
      .should('be.visible')
      .click();

    // Pastikan QR code muncul
    cy.get('.orangehrm-qr-code')
      .should('be.visible');
  });


  // TC-026: Verify employee count display
  it('TC-026: Verify employee count display', () => {
    directoryPage.visit();
    cy.wait(2000);
    
    cy.get('.oxd-sheet', { timeout: 15000 }).then(($cards) => {
      expect($cards.length).to.be.greaterThan(0);
      cy.log(`✅ Found ${$cards.length} employees in directory`);
    });
  });

  // TC-027: Search with empty fields
  it('TC-027: Search with empty fields', () => {
    cy.intercept('GET', '**/directory/employees**').as('emptySearch');
    
    directoryPage.visit();
    directoryPage.clickSearch();
    
    cy.wait('@emptySearch');
    directoryPage.verifyEmployeeCards();
  });
});