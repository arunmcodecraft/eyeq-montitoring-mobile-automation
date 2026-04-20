module.exports = [
  {
    platformName: 'iOS',
    'appium:automationName': process.env.IOS_AUTOMATION_NAME || 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE_NAME || 'iPhone Simulator',
    'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || 'PLACEHOLDER_IOS_VERSION',
    'appium:app': process.env.IOS_APP_PATH || 'PLACEHOLDER_IOS_APP_PATH',
    'appium:bundleId': process.env.IOS_BUNDLE_ID || 'PLACEHOLDER_BUNDLE_ID',
    'appium:noReset': (process.env.IOS_NO_RESET || 'false') === 'true',
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT || 180),
  },
];
