const BasePage = require('./base.page');

const androidLocators = require('../locators/android/login.locators');
const iosLocators = require('../locators/ios/login.locators');

class LoginPage extends BasePage {
  get locators() {
    return driver.isAndroid ? androidLocators : iosLocators;
  }

  async resolveSelector(selectorCandidates) {
    for (const selector of selectorCandidates) {
      const exists = await this.isVisible(selector, 3000, `Resolved selector candidate: ${selector}`);
      if (exists) {
        return selector;
      }
    }

    throw new Error(`No selector matched from candidates: ${JSON.stringify(selectorCandidates)}`);
  }

  async waitForScreen() {
    const emailSelector = await this.resolveSelector(this.locators.emailField);
    await this.waitForVisible(emailSelector, undefined, 'Login email field');
  }

  async login(email, password) {
    const emailSelector = await this.resolveSelector(this.locators.emailField);
    const passwordSelector = await this.resolveSelector(this.locators.passwordField);
    const loginButtonSelector = await this.resolveSelector(this.locators.loginButton);

    await this.typeText(emailSelector, email, 'Login email field');
    await this.typeText(passwordSelector, password, 'Login password field');
    await this.hideKeyboard();
    await this.tap(loginButtonSelector, 'Login button');
  }

  async isDashboardDisplayed(expectedIdentifier) {
    const dashboardCandidates = this.locators.dashboardIdentifier(expectedIdentifier);

    for (const selector of dashboardCandidates) {
      if (await this.isVisible(selector, 7000, `Dashboard identifier: ${expectedIdentifier}`)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = new LoginPage();
