const path = require('path');
const fs = require('fs');
const { Given, When, Then } = require('@cucumber/cucumber');

const LoginPage = require('../../pages/login.page');
const cryptoUtil = require('../../utils/encryption/crypto.util');
const stepLogger = require('../../utils/logger/stepLogger');
const dataReader = require('../../utils/helpers/dataReader.util');

const testDataPath = path.resolve(__dirname, '../../data/testData.json');
const encryptedCredentialsPath = path.resolve(__dirname, '../../data/credentials.enc.json');

function getValueByPath(source, pathExpression) {
  if (!pathExpression) {
    return source;
  }

  return pathExpression.split('.').reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    return current[key];
  }, source);
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function getLoginData() {
  const testData = loadJson(testDataPath);
  const encryptedPayload = loadJson(encryptedCredentialsPath);

  const username = cryptoUtil.decryptValue(encryptedPayload.email) || testData.validUser.username;
  const password = cryptoUtil.decryptValue(encryptedPayload.password) || testData.validUser.password;

  return {
    email: username,
    password,
    expectedDashboardIdentifier: testData.dashboard.expectedIdentifier,
  };
}

function resolveStepValue(world, input) {
  if (input && typeof input === 'object' && input.type === 'tdRef') {
    const resolvedValue = getValueByPath(world.testData, input.path);

    if (resolvedValue === undefined) {
      throw new Error(`Scenario data path not found: td.${input.path}`);
    }

    return resolvedValue;
  }

  return input;
}

Given('the user is on the login screen', async function () {
  stepLogger.log('Validating login screen availability');
  await LoginPage.waitForScreen();
});

Given('Navigate to the application', async function () {
  stepLogger.log('Navigating to the application login screen');
  await LoginPage.waitForScreen();
});

When('the user logs in with valid credentials', async function () {
  const credentials = this.testData
    ? {
        email: this.testData.email || this.testData.username,
        password: this.testData.password,
        expectedDashboardIdentifier:
          this.testData.expectedDashboardIdentifier
          || dataReader.readJsonReference('json:testData.dashboard.expectedIdentifier'),
      }
    : getLoginData();

  if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
    throw new Error('Scenario data must provide string username/email and password values.');
  }

  stepLogger.log('Performing login with configured test credentials');
  await LoginPage.login(credentials.email, credentials.password);
  this.lastLogin = credentials;
});

When('Login with username {dataValue} and password {dataValue}', async function (usernameInput, passwordInput) {
  const username = resolveStepValue(this, usernameInput);
  const password = resolveStepValue(this, passwordInput);
  const expectedDashboardIdentifier = this.testData?.expectedDashboardIdentifier
    || dataReader.readJsonReference('json:testData.dashboard.expectedIdentifier');

  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new Error('Resolved username and password values must both be strings.');
  }

  stepLogger.log(`Performing login with explicit parameters for user: ${username}`);
  await LoginPage.login(username, password);
  this.lastLogin = {
    email: username,
    password,
    expectedDashboardIdentifier,
  };
});

Then('the user should land on the dashboard', async function () {
  const expected = this.lastLogin?.expectedDashboardIdentifier || 'Dashboard';

  stepLogger.log(`Validating dashboard state using identifier: ${expected}`);
  const isDisplayed = await LoginPage.isDashboardDisplayed(expected);

  this.assert.hardTrue(
    isDisplayed,
    `Dashboard identifier "${expected}" was not displayed after login.`,
  );
});
