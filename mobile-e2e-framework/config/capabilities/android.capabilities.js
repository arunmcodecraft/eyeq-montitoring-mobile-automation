const path = require('path');

module.exports = [
  {
    platformName: 'Android',
    'appium:automationName': process.env.ANDROID_AUTOMATION_NAME || 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || 'PLACEHOLDER_ANDROID_VERSION',
    'appium:app': process.env.ANDROID_APP_PATH || 'C:\\Users\\ArunMadhusudhanan\\Downloads\\EyeQMonitoring.apk',
    'appium:appPackage': process.env.ANDROID_APP_PACKAGE || 'PLACEHOLDER_APP_PACKAGE',
    'appium:appActivity': process.env.ANDROID_APP_ACTIVITY || 'PLACEHOLDER_APP_ACTIVITY',
    'appium:noReset': (process.env.ANDROID_NO_RESET || 'false') === 'true',
    'appium:newCommandTimeout': Number(process.env.NEW_COMMAND_TIMEOUT || 180),
    'appium:autoGrantPermissions': true,
  },
];
