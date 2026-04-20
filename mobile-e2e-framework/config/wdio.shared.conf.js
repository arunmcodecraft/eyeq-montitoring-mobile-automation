const path = require('path');
const dotenv = require('dotenv');

const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.resolve(projectRoot, '.env') });

const globalHooks = require(path.resolve(projectRoot, 'src/tests/hooks/global.hooks'));
const stepHooks = require(path.resolve(projectRoot, 'src/tests/hooks/step.hooks'));

exports.config = {
  runner: 'local',
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT || 4723),
  path: process.env.APPIUM_PATH || '/',
  maxInstances: 1,
  logLevel: process.env.WDIO_LOG_LEVEL || 'info',
  bail: 0,
  waitforTimeout: Number(process.env.DEFAULT_WAIT_TIMEOUT || 15000),
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,
  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: path.resolve(projectRoot, 'reports/allure-results'),
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],
  services: process.env.START_APPIUM_SERVICE === 'true'
    ? [
        [
          'appium',
          {
            command: 'appium',
          },
        ],
      ]
    : [],
  cucumberOpts: {
    require: [
      path.resolve(projectRoot, 'src/cucumber/parameterTypes.js'),
      path.resolve(projectRoot, 'src/cucumber/world.js'),
      path.resolve(projectRoot, 'src/tests/step-definitions/**/*.js'),
    ],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    profile: [],
    strict: true,
    tagExpression: process.env.TAGS || '',
    timeout: 120000,
    ignoreUndefinedDefinitions: false,
  },
  beforeSession: globalHooks.beforeSession,
  before: globalHooks.before,
  beforeScenario: stepHooks.beforeScenario,
  beforeStep: stepHooks.beforeStep,
  afterStep: stepHooks.afterStep,
  afterScenario: stepHooks.afterScenario,
  after: globalHooks.after,
  onComplete: globalHooks.onComplete,
};
