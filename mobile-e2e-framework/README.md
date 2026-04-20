# Mobile E2E Framework

WebdriverIO JavaScript mobile automation framework using Appium and Cucumber for Android and iOS.

## Scope

- Android execution is pre-wired for `C:\Users\ArunMadhusudhanan\Downloads\EyeQMonitoring.apk`
- iOS support is included as a placeholder structure
- Login flow is implemented with feature, step definition, page object, locators, hooks, utilities, and test data

## Project Structure

```text
mobile-e2e-framework/
|-- config/
|   |-- wdio.shared.conf.js
|   |-- wdio.android.conf.js
|   |-- wdio.ios.conf.js
|   `-- capabilities/
|       |-- android.capabilities.js
|       `-- ios.capabilities.js
|-- src/
|   |-- tests/
|   |   |-- features/
|   |   |   |-- login.feature
|   |   |   `-- dashboard.feature
|   |   |-- step-definitions/
|   |   |   `-- login.steps.js
|   |   `-- hooks/
|   |       |-- global.hooks.js
|   |       `-- step.hooks.js
|   |-- pages/
|   |   |-- base.page.js
|   |   `-- login.page.js
|   |-- locators/
|   |   |-- android/
|   |   `-- ios/
|   |-- utils/
|   |   |-- assertions/
|   |   |   `-- assert.util.js
|   |   |-- logger/
|   |   |   |-- logger.js
|   |   |   `-- stepLogger.js
|   |   |-- encryption/
|   |   |   `-- crypto.util.js
|   |   `-- helpers/
|   |       |-- dataReader.util.js
|   |       |-- wait.util.js
|   |       `-- gesture.util.js
|   |-- data/
|   |   |-- testData.json
|   |   |-- loginData.csv
|   |   `-- credentials.enc.json
|   `-- cucumber/
|       |-- parameterTypes.js
|       `-- world.js
|-- reports/
|   |-- allure-results/
|   `-- html-report/
|-- logs/
|-- .env
`-- package.json
```

## Prerequisites

- Node.js 18 or later
- Java installed and available in `PATH`
- Android SDK installed and configured
- Appium 2 compatible environment
- An Android emulator or real device connected

## Installation

```bash
npm install
```

## Configuration

Update the values in [.env](D:\Project\EyeQAutomation\mobile-e2e-framework\.env):

- `APPIUM_HOST`
- `APPIUM_PORT`
- `APPIUM_PATH`
- `START_APPIUM_SERVICE`
- `WDIO_LOG_LEVEL`
- `DEFAULT_WAIT_TIMEOUT`
- `NEW_COMMAND_TIMEOUT`
- `ANDROID_AUTOMATION_NAME`
- `ANDROID_DEVICE_NAME`
- `ANDROID_PLATFORM_VERSION`
- `ANDROID_APP_PATH`
- `ANDROID_APP_PACKAGE`
- `ANDROID_APP_ACTIVITY`
- `ANDROID_NO_RESET`
- `IOS_AUTOMATION_NAME`
- `IOS_DEVICE_NAME`
- `IOS_PLATFORM_VERSION`
- `IOS_APP_PATH`
- `IOS_BUNDLE_ID`
- `IOS_NO_RESET`
- `CREDENTIAL_SECRET`
- `TAGS`

The Android APK path is already set to:

```text
C:\Users\ArunMadhusudhanan\Downloads\EyeQMonitoring.apk
```

If you want WebdriverIO to start Appium automatically, set:

```env
START_APPIUM_SERVICE=true
```

Otherwise, start Appium manually before running tests.

For iOS placeholder execution, update:

- `IOS_DEVICE_NAME`
- `IOS_PLATFORM_VERSION`
- `IOS_APP_PATH`
- `IOS_BUNDLE_ID`

## Test Data

- Default credentials are stored in [testData.json](D:\Project\EyeQAutomation\mobile-e2e-framework\src\data\testData.json)
- CSV-based credentials can be stored in [loginData.csv](D:\Project\EyeQAutomation\mobile-e2e-framework\src\data\loginData.csv)
- Encrypted credential placeholders are stored in [credentials.enc.json](D:\Project\EyeQAutomation\mobile-e2e-framework\src\data\credentials.enc.json)
- The framework first tries encrypted credentials and falls back to plain test data if placeholders are still present

To generate an encrypted value:

```bash
npm run encrypt:credential -- "your-value"
```

Copy the generated output into `src/data/credentials.enc.json`.

### Hook-Based Data Loading

The framework supports loading scenario data in `beforeScenario` based on scenario tags. No `Examples` table is required.

Use JSON tags:

```gherkin
@DataFile:src/data/testData.json
@DataPath:validUser
Scenario: Successful login with JSON hook data
  Given the user is on the login screen
  When Login with username "td.username" and password "td.password"
  Then the user should land on the dashboard
```

Use CSV tags:

```gherkin
@DataFile:src/data/loginData.csv
@Key:Login_02
@Env:STG
Scenario: Successful login with CSV hook data
  Given the user is on the login screen
  When Login with username "td.username" and password "td.password"
  Then the user should land on the dashboard
```

Supported hook tags:

- `@DataFile:<relative-or-data-path>`
- `@DataPath:<jsonPath>`
- `@Key:<rowKey>`
- `@Env:<env>`
- `@DataSelector:<selector>`

Also supported for backward compatibility:

- `@dataSource_json`
- `@dataSource_csv`
- `@dataFile_<fileName>`
- `@dataPath_<jsonPath>`
- `@dataKey_<rowKey>`
- `@dataEnv_<env>`
- `@dataSelector_<selector>`

Resolution rules:

- If `@DataFile` ends with `.json`, JSON loading is used automatically
- Otherwise CSV loading is used automatically
- JSON uses `@DataPath:<path>`
- CSV uses `@Key:<key>` and optional `@Env:<env>`
- Or `@DataSelector:<selector>`

Examples:

- `@Key:Login_02 @Env:STG` resolves row `Login_02@STG`
- `@DataSelector:Key=Login_02@Env=STG` can be used when you need explicit matching

Loaded data is stored in the Cucumber world as `this.testData`, and the login step reads:

- `username`
- `password`

from that object automatically.

The step can reference hook-loaded data directly using `td.<path>`:

```gherkin
When Login with username "td.username" and password "td.password"
```

Supported custom cucumber parameter types:

- `{tdRef}` for `td.<path>` values
- `{jObj}` for inline object payloads like `{'name':'Group A'}`
- `{list}` for inline lists like `[one, two, three]`

## Assertions

A reusable assertion utility is available on the Cucumber world as `this.assert`.

Location:

- [assert.util.js](D:\Project\EyeQAutomation\mobile-e2e-framework\src\utils\assertions\assert.util.js)

Available methods:

- `this.assert.hardEqual(actual, expected, message)`
- `this.assert.softEqual(actual, expected, message)`
- `this.assert.hardTrue(value, message)`
- `this.assert.softTrue(value, message)`
- `this.assert.hardContains(container, expected, message)`
- `this.assert.softContains(container, expected, message)`
- `this.assert.assertAll()`

Behavior:

- Hard assertions fail immediately
- Soft assertions log the failure and continue execution
- Soft assertion failures are aggregated automatically at the end of the scenario in `afterScenario`

Example usage in a step:

```js
Then('the user should see the dashboard', async function () {
  const isDisplayed = await LoginPage.isDashboardDisplayed('Dashboard');
  this.assert.hardTrue(isDisplayed, 'Dashboard was not displayed');
});

Then('the user should see summary details', async function () {
  this.assert.softEqual(this.testData.username, 'uie41876', 'Username did not match expected test data');
  this.assert.softContains(['Admin', 'Editor'], 'Admin', 'Expected Admin role to be present');
});
```

## Base Page

Reusable page actions are centralized in:

- [base.page.js](D:\Project\EyeQAutomation\mobile-e2e-framework\src\pages\base.page.js)

Page objects should extend `BasePage` and use its methods instead of duplicating wait and element handling logic.

Available methods include:

- `getElement(selector, elementName)`
- `getElements(selector, elementName)`
- `waitForExist(selector, timeout, elementName)`
- `waitForVisible(selector, timeout, elementName)`
- `waitForClickable(selector, timeout, elementName)`
- `waitForEnabled(selector, timeout, elementName)`
- `typeText(selector, value, elementName)`
- `tap(selector, elementName)`
- `clearText(selector, elementName)`
- `getText(selector, elementName)`
- `getAttribute(selector, attributeName, elementName)`
- `isVisible(selector, timeout, elementName)`
- `isExisting(selector, timeout, elementName)`
- `pause(milliseconds)`
- `waitUntil(condition, options)`
- `hideKeyboard()`

Each method writes structured logs through the framework logger so element actions are traceable in `logs/framework.log`.

Example:

```js
const BasePage = require('./base.page');

class LoginPage extends BasePage {
  async login(username, password) {
    await this.typeText('~username', username, 'Username field');
    await this.typeText('~password', password, 'Password field');
    await this.tap('~login', 'Login button');
  }
}
```

## Execution

Run Android tests:

```bash
npm run test:android
```

Run only smoke-tagged Android tests:

```bash
npm run test:android:smoke
```

Run iOS placeholder suite:

```bash
npm run test:ios
```

Generate Allure HTML report:

```bash
npm run report:allure
```

## Current Implementation Notes

- The login scenario is implemented in [login.feature](D:\Project\EyeQAutomation\mobile-e2e-framework\src\tests\features\login.feature)
- The step bindings are in [login.steps.js](D:\Project\EyeQAutomation\mobile-e2e-framework\src\tests\step-definitions\login.steps.js)
- The selectors in [login.locators.js](D:\Project\EyeQAutomation\mobile-e2e-framework\src\locators\android\login.locators.js) use fallback candidates because the exact app resource IDs were not provided
- Dashboard validation is a placeholder and should be updated once the post-login element is confirmed

## Recommended Next Changes

- Replace placeholder Android package and activity values
- Replace fallback locators with exact resource IDs or accessibility IDs
- Add more page objects and features as new screens are automated
- Add CI integration when the local flow is stable
