import LoginPage from '../../support/pages/loginPage';

describe('OrangeHRM - Login Feature with POM', () => {
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

  // Test Case 1: Login with valid username and password
  it('Should login successfully with valid credentials', () => {
    loginPage.login(users.valid.username, users.valid.password);
    loginPage.verifyDashboardVisible();
  });

  // Test Case 2: Login with valid username and wrong password
  it('Should show error message with wrong password', () => {
    loginPage.login(users.wrongPassword.username, users.wrongPassword.password);
    loginPage.verifyInvalidCredentialsMessage();
  });

  // Test Case 3: Login with wrong username and valid password
  it('Should show error message with wrong username', () => {
    loginPage.login(users.wrongUser.username, users.wrongUser.password);
    loginPage.verifyInvalidCredentialsMessage();
  });

  // Test Case 4: Login with empty username and password
  it('Should show required field error when both fields are empty', () => {
    loginPage.clickSubmit();
    loginPage.verifyRequiredFieldMessage();
  });

  // Test Case 5: Login with empty username only
  it('Should show required field error when username is empty', () => {
    loginPage.fillPassword(users.emptyUser.password)
             .clickSubmit();
    loginPage.verifyRequiredFieldMessage();
  });

  // Test Case 6: Login with empty password only
  it('Should show required field error when password is empty', () => {
    loginPage.fillUsername(users.emptyPass.username)
             .clickSubmit();
    loginPage.verifyRequiredFieldMessage();
  });

  // Test Case 7: Forgot password functionality
  it('Should navigate to reset password page when clicking forgot password', () => {
    loginPage.clickForgotPassword();
    loginPage.verifyResetPasswordPage();
  });
});